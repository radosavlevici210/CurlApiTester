import { WebSocket } from "ws";
import { db } from "../db.js";
import { collaborationRooms, documents, users } from "../../shared/schema.js";
import { eq, and, inArray } from "drizzle-orm";

interface CollaborationClient {
  id: string;
  userId: string;
  username: string;
  ws: WebSocket;
  roomId: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
}

export class RealTimeCollaboration {
  private rooms: Map<string, CollaborationClient[]> = new Map();
  private clients: Map<string, CollaborationClient> = new Map();

  async createRoom(data: {
    name: string;
    workspaceId: number;
    ownerId: string;
    participants?: string[];
    settings?: any;
  }) {
    const [room] = await db.insert(collaborationRooms).values({
      ...data,
      isActive: true,
      lastActivity: new Date(),
    }).returning();

    this.rooms.set(room.id.toString(), []);
    return room;
  }

  async joinRoom(roomId: string, userId: string, ws: WebSocket) {
    const room = await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, parseInt(roomId))).limit(1);
    
    if (!room[0] || !room[0].isActive) {
      throw new Error("Room not found or inactive");
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      throw new Error("User not found");
    }

    const clientId = this.generateClientId();
    const client: CollaborationClient = {
      id: clientId,
      userId,
      username: `${user[0].firstName} ${user[0].lastName}`.trim() || user[0].email || userId,
      ws,
      roomId,
    };

    this.clients.set(clientId, client);
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    
    this.rooms.get(roomId)!.push(client);

    // Notify other participants
    this.broadcast(roomId, {
      type: "user_joined",
      data: {
        userId: client.userId,
        username: client.username,
        clientId: client.id,
      },
    }, clientId);

    // Send current room state to new participant
    const roomClients = this.rooms.get(roomId)!;
    ws.send(JSON.stringify({
      type: "room_state",
      data: {
        participants: roomClients.map(c => ({
          userId: c.userId,
          username: c.username,
          clientId: c.id,
          cursor: c.cursor,
          selection: c.selection,
        })),
      },
    }));

    // Handle WebSocket messages
    ws.on("message", (message) => {
      this.handleMessage(clientId, message.toString());
    });

    ws.on("close", () => {
      this.leaveRoom(clientId);
    });

    return clientId;
  }

  private handleMessage(clientId: string, message: string) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(clientId);
      
      if (!client) return;

      switch (data.type) {
        case "cursor_move":
          client.cursor = data.cursor;
          this.broadcast(client.roomId, {
            type: "cursor_update",
            data: {
              clientId,
              userId: client.userId,
              cursor: data.cursor,
            },
          }, clientId);
          break;

        case "text_change":
          this.broadcast(client.roomId, {
            type: "text_change",
            data: {
              clientId,
              userId: client.userId,
              changes: data.changes,
              version: data.version,
            },
          }, clientId);
          break;

        case "selection_change":
          client.selection = data.selection;
          this.broadcast(client.roomId, {
            type: "selection_update",
            data: {
              clientId,
              userId: client.userId,
              selection: data.selection,
            },
          }, clientId);
          break;

        case "document_save":
          this.handleDocumentSave(client, data);
          break;

        case "ai_suggestion":
          this.handleAISuggestion(client, data);
          break;

        case "comment_add":
          this.handleAddComment(client, data);
          break;

        case "voice_chat":
          this.handleVoiceChat(client, data);
          break;
      }
    } catch (error) {
      console.error("Error handling collaboration message:", error);
    }
  }

  private async handleDocumentSave(client: CollaborationClient, data: any) {
    try {
      if (data.documentId) {
        await db.update(documents)
          .set({
            content: data.content,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, data.documentId));

        this.broadcast(client.roomId, {
          type: "document_saved",
          data: {
            documentId: data.documentId,
            savedBy: client.userId,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      client.ws.send(JSON.stringify({
        type: "error",
        data: { message: "Failed to save document" },
      }));
    }
  }

  private async handleAISuggestion(client: CollaborationClient, data: any) {
    // Broadcast AI suggestion to all participants
    this.broadcast(client.roomId, {
      type: "ai_suggestion",
      data: {
        suggestion: data.suggestion,
        position: data.position,
        suggestedBy: client.userId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async handleAddComment(client: CollaborationClient, data: any) {
    this.broadcast(client.roomId, {
      type: "comment_added",
      data: {
        comment: data.comment,
        position: data.position,
        author: client.username,
        authorId: client.userId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async handleVoiceChat(client: CollaborationClient, data: any) {
    // Relay voice chat data to other participants
    this.broadcast(client.roomId, {
      type: "voice_chat",
      data: {
        audio: data.audio,
        from: client.userId,
        username: client.username,
      },
    }, client.id);
  }

  private leaveRoom(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const roomClients = this.rooms.get(client.roomId);
    if (roomClients) {
      const index = roomClients.findIndex(c => c.id === clientId);
      if (index !== -1) {
        roomClients.splice(index, 1);
      }
    }

    this.clients.delete(clientId);

    // Notify other participants
    this.broadcast(client.roomId, {
      type: "user_left",
      data: {
        userId: client.userId,
        username: client.username,
        clientId,
      },
    });
  }

  private broadcast(roomId: string, message: any, excludeClientId?: string) {
    const roomClients = this.rooms.get(roomId);
    if (!roomClients) return;

    const messageStr = JSON.stringify(message);
    
    roomClients.forEach(client => {
      if (client.id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getRoomById(id: number) {
    return await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, id)).limit(1);
  }

  async getRoomsByWorkspace(workspaceId: number) {
    return await db.select().from(collaborationRooms)
      .where(and(eq(collaborationRooms.workspaceId, workspaceId), eq(collaborationRooms.isActive, true)));
  }

  async updateRoom(id: number, updates: Partial<typeof collaborationRooms.$inferInsert>) {
    const [updated] = await db.update(collaborationRooms)
      .set({ ...updates, lastActivity: new Date() })
      .where(eq(collaborationRooms.id, id))
      .returning();
    return updated;
  }

  async deleteRoom(id: number) {
    // Close all connections in the room
    const roomClients = this.rooms.get(id.toString());
    if (roomClients) {
      roomClients.forEach(client => {
        client.ws.close();
      });
      this.rooms.delete(id.toString());
    }

    await db.update(collaborationRooms)
      .set({ isActive: false })
      .where(eq(collaborationRooms.id, id));
    
    return true;
  }

  getRoomStats(roomId: string) {
    const roomClients = this.rooms.get(roomId) || [];
    return {
      activeParticipants: roomClients.length,
      participants: roomClients.map(c => ({
        userId: c.userId,
        username: c.username,
        hasActiveCursor: !!c.cursor,
        hasSelection: !!c.selection,
      })),
    };
  }

  async getActiveRooms() {
    const activeRoomIds = Array.from(this.rooms.keys());
    if (activeRoomIds.length === 0) return [];

    return await db.select().from(collaborationRooms)
      .where(inArray(collaborationRooms.id, activeRoomIds.map(id => parseInt(id))));
  }
}

export const realTimeCollaboration = new RealTimeCollaboration();