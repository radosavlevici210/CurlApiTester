import { WebSocket } from 'ws';
import { db } from '../db';
import { collaborationSessions, conversations, users } from '../../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

interface CollaborationSession {
  id: number;
  conversationId: number;
  sessionName: string;
  participants: string[];
  permissions: Record<string, string[]>;
  isActive: boolean;
}

interface SessionParticipant {
  userId: string;
  username: string;
  role: string;
  isActive: boolean;
  lastSeen: Date;
  cursor?: { position: number; selection: string };
}

interface RealTimeEvent {
  type: 'join' | 'leave' | 'message' | 'cursor' | 'typing' | 'edit';
  sessionId: number;
  userId: string;
  data: any;
  timestamp: Date;
}

export class CollaborationEngine {
  private sessions: Map<number, CollaborationSession> = new Map();
  private participants: Map<number, Map<string, SessionParticipant>> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  private userSessions: Map<string, Set<number>> = new Map();

  constructor() {
    this.loadActiveSessions();
  }

  async createSession(
    conversationId: number,
    createdBy: string,
    sessionName: string,
    initialParticipants: string[] = []
  ): Promise<number> {
    // Create collaboration session
    const [session] = await db.insert(collaborationSessions).values({
      conversationId,
      createdBy,
      sessionName,
      participants: [createdBy, ...initialParticipants],
      isActive: true,
      permissions: {
        [createdBy]: ['admin', 'read', 'write'],
        ...Object.fromEntries(initialParticipants.map(p => [p, ['read', 'write']]))
      }
    }).returning();

    // Initialize session in memory
    this.sessions.set(session.id, {
      id: session.id,
      conversationId: session.conversationId,
      sessionName: session.sessionName,
      participants: session.participants || [],
      permissions: session.permissions as Record<string, string[]>,
      isActive: true
    });

    this.participants.set(session.id, new Map());

    // Notify initial participants
    await this.notifyParticipants(session.id, {
      type: 'session_created',
      data: {
        sessionId: session.id,
        sessionName,
        createdBy,
        conversationId
      }
    });

    return session.id;
  }

  async joinSession(sessionId: number, userId: string, ws: WebSocket): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return false;
    }

    // Check if user has permission to join
    if (!session.participants.includes(userId)) {
      return false;
    }

    // Get user details
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return false;

    // Add participant
    const participants = this.participants.get(sessionId) || new Map();
    participants.set(userId, {
      userId,
      username: user.firstName + ' ' + user.lastName || user.email || 'Anonymous',
      role: this.getUserRole(session, userId),
      isActive: true,
      lastSeen: new Date()
    });
    this.participants.set(sessionId, participants);

    // Store connection
    this.connections.set(`${sessionId}:${userId}`, ws);

    // Track user sessions
    const userSessionSet = this.userSessions.get(userId) || new Set();
    userSessionSet.add(sessionId);
    this.userSessions.set(userId, userSessionSet);

    // Setup WebSocket handlers
    this.setupWebSocketHandlers(ws, sessionId, userId);

    // Notify other participants
    await this.broadcastToSession(sessionId, {
      type: 'join',
      sessionId,
      userId,
      data: {
        participant: participants.get(userId),
        totalParticipants: participants.size
      },
      timestamp: new Date()
    }, userId);

    return true;
  }

  async leaveSession(sessionId: number, userId: string): Promise<void> {
    const participants = this.participants.get(sessionId);
    if (!participants) return;

    participants.delete(userId);
    this.connections.delete(`${sessionId}:${userId}`);

    // Update user sessions
    const userSessionSet = this.userSessions.get(userId);
    if (userSessionSet) {
      userSessionSet.delete(sessionId);
      if (userSessionSet.size === 0) {
        this.userSessions.delete(userId);
      }
    }

    // Notify other participants
    await this.broadcastToSession(sessionId, {
      type: 'leave',
      sessionId,
      userId,
      data: {
        totalParticipants: participants.size
      },
      timestamp: new Date()
    });
  }

  async addParticipant(sessionId: number, userId: string, newParticipantId: string, permissions: string[] = ['read']): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || !this.hasPermission(session, userId, 'admin')) {
      return false;
    }

    // Update session participants
    session.participants.push(newParticipantId);
    session.permissions[newParticipantId] = permissions;

    // Update database
    await db.update(collaborationSessions)
      .set({
        participants: session.participants,
        permissions: session.permissions
      })
      .where(eq(collaborationSessions.id, sessionId));

    // Notify participants
    await this.broadcastToSession(sessionId, {
      type: 'participant_added',
      sessionId,
      userId,
      data: {
        newParticipant: newParticipantId,
        permissions
      },
      timestamp: new Date()
    });

    return true;
  }

  async removeParticipant(sessionId: number, userId: string, targetParticipantId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || !this.hasPermission(session, userId, 'admin')) {
      return false;
    }

    // Remove from session
    session.participants = session.participants.filter(p => p !== targetParticipantId);
    delete session.permissions[targetParticipantId];

    // Force leave if currently active
    await this.leaveSession(sessionId, targetParticipantId);

    // Update database
    await db.update(collaborationSessions)
      .set({
        participants: session.participants,
        permissions: session.permissions
      })
      .where(eq(collaborationSessions.id, sessionId));

    return true;
  }

  async broadcastMessage(sessionId: number, userId: string, message: any): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !this.hasPermission(session, userId, 'write')) {
      return;
    }

    await this.broadcastToSession(sessionId, {
      type: 'message',
      sessionId,
      userId,
      data: message,
      timestamp: new Date()
    });
  }

  async updateCursor(sessionId: number, userId: string, cursor: { position: number; selection: string }): Promise<void> {
    const participants = this.participants.get(sessionId);
    if (!participants) return;

    const participant = participants.get(userId);
    if (participant) {
      participant.cursor = cursor;
      participant.lastSeen = new Date();
    }

    // Broadcast cursor update
    await this.broadcastToSession(sessionId, {
      type: 'cursor',
      sessionId,
      userId,
      data: { cursor },
      timestamp: new Date()
    }, userId);
  }

  async setTypingStatus(sessionId: number, userId: string, isTyping: boolean): Promise<void> {
    await this.broadcastToSession(sessionId, {
      type: 'typing',
      sessionId,
      userId,
      data: { isTyping },
      timestamp: new Date()
    }, userId);
  }

  async getSessionInfo(sessionId: number): Promise<{
    session: CollaborationSession;
    participants: SessionParticipant[];
    conversation: any;
  } | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participants = Array.from(this.participants.get(sessionId)?.values() || []);
    
    // Get conversation details
    const [conversation] = await db.select().from(conversations)
      .where(eq(conversations.id, session.conversationId));

    return {
      session,
      participants,
      conversation
    };
  }

  async getUserSessions(userId: string): Promise<CollaborationSession[]> {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds).map(id => this.sessions.get(id)).filter(Boolean) as CollaborationSession[];
  }

  private setupWebSocketHandlers(ws: WebSocket, sessionId: number, userId: string): void {
    ws.on('message', async (data) => {
      try {
        const event = JSON.parse(data.toString());
        await this.handleWebSocketEvent(sessionId, userId, event);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      this.leaveSession(sessionId, userId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.leaveSession(sessionId, userId);
    });
  }

  private async handleWebSocketEvent(sessionId: number, userId: string, event: any): Promise<void> {
    switch (event.type) {
      case 'cursor_update':
        await this.updateCursor(sessionId, userId, event.cursor);
        break;
      case 'typing':
        await this.setTypingStatus(sessionId, userId, event.isTyping);
        break;
      case 'message':
        await this.broadcastMessage(sessionId, userId, event.message);
        break;
      case 'edit':
        await this.handleCollaborativeEdit(sessionId, userId, event.edit);
        break;
    }
  }

  private async handleCollaborativeEdit(sessionId: number, userId: string, edit: any): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !this.hasPermission(session, userId, 'write')) {
      return;
    }

    // Broadcast edit to other participants
    await this.broadcastToSession(sessionId, {
      type: 'edit',
      sessionId,
      userId,
      data: edit,
      timestamp: new Date()
    }, userId);
  }

  private async broadcastToSession(sessionId: number, event: RealTimeEvent, excludeUserId?: string): Promise<void> {
    const participants = this.participants.get(sessionId);
    if (!participants) return;

    const message = JSON.stringify(event);

    for (const [participantId] of participants) {
      if (excludeUserId && participantId === excludeUserId) continue;

      const ws = this.connections.get(`${sessionId}:${participantId}`);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('Failed to send WebSocket message:', error);
          // Clean up dead connection
          this.leaveSession(sessionId, participantId);
        }
      }
    }
  }

  private async notifyParticipants(sessionId: number, notification: any): Promise<void> {
    // This would integrate with the notification system
    console.log('Notification:', notification);
  }

  private hasPermission(session: CollaborationSession, userId: string, permission: string): boolean {
    const userPermissions = session.permissions[userId] || [];
    return userPermissions.includes(permission);
  }

  private getUserRole(session: CollaborationSession, userId: string): string {
    const permissions = session.permissions[userId] || [];
    if (permissions.includes('admin')) return 'admin';
    if (permissions.includes('write')) return 'editor';
    return 'viewer';
  }

  private async loadActiveSessions(): Promise<void> {
    try {
      const sessions = await db.select().from(collaborationSessions)
        .where(eq(collaborationSessions.isActive, true));

      sessions.forEach(session => {
        this.sessions.set(session.id, {
          id: session.id,
          conversationId: session.conversationId,
          sessionName: session.sessionName,
          participants: session.participants || [],
          permissions: session.permissions as Record<string, string[]>,
          isActive: session.isActive
        });
        this.participants.set(session.id, new Map());
      });
    } catch (error) {
      console.error('Failed to load collaboration sessions:', error);
    }
  }

  async closeSession(sessionId: number, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || !this.hasPermission(session, userId, 'admin')) {
      return false;
    }

    // Notify all participants
    await this.broadcastToSession(sessionId, {
      type: 'session_closed',
      sessionId,
      userId,
      data: {},
      timestamp: new Date()
    });

    // Remove all participants
    const participants = this.participants.get(sessionId);
    if (participants) {
      for (const participantId of participants.keys()) {
        await this.leaveSession(sessionId, participantId);
      }
    }

    // Update database
    await db.update(collaborationSessions)
      .set({ isActive: false })
      .where(eq(collaborationSessions.id, sessionId));

    // Clean up memory
    this.sessions.delete(sessionId);
    this.participants.delete(sessionId);

    return true;
  }
}

export const collaborationEngine = new CollaborationEngine();