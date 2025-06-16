import type { Message, Conversation } from "@shared/schema";

export interface VisualizationData {
  type: 'chart' | 'graph' | 'timeline' | 'heatmap' | 'network' | 'mindmap';
  data: any;
  config: {
    title: string;
    description?: string;
    interactive: boolean;
    realtime: boolean;
  };
}

export class VisualizationService {
  // Conversation analytics and patterns
  generateConversationAnalytics(conversations: Conversation[], messages: Message[]): VisualizationData[] {
    const analytics: VisualizationData[] = [];

    // Message frequency heatmap
    const messageHeatmap = this.createMessageHeatmap(messages);
    analytics.push({
      type: 'heatmap',
      data: messageHeatmap,
      config: {
        title: 'Message Activity Heatmap',
        description: 'Shows message frequency by time of day and day of week',
        interactive: true,
        realtime: true
      }
    });

    // Conversation topics timeline
    const topicsTimeline = this.createTopicsTimeline(conversations);
    analytics.push({
      type: 'timeline',
      data: topicsTimeline,
      config: {
        title: 'Conversation Topics Over Time',
        description: 'Timeline of conversation topics and their evolution',
        interactive: true,
        realtime: false
      }
    });

    // Model usage distribution
    const modelUsage = this.createModelUsageChart(conversations);
    analytics.push({
      type: 'chart',
      data: modelUsage,
      config: {
        title: 'AI Model Usage Distribution',
        description: 'Distribution of different AI models used in conversations',
        interactive: true,
        realtime: true
      }
    });

    return analytics;
  }

  // Real-time collaboration visualization
  generateCollaborationMap(userIds: string[], activities: any[]): VisualizationData {
    const collaborationNodes = userIds.map(userId => ({
      id: userId,
      label: `User ${userId.slice(-4)}`,
      size: activities.filter(a => a.userId === userId).length,
      color: this.getUserColor(userId)
    }));

    const collaborationEdges = this.calculateUserInteractions(activities);

    return {
      type: 'network',
      data: {
        nodes: collaborationNodes,
        edges: collaborationEdges
      },
      config: {
        title: 'Real-time Collaboration Network',
        description: 'Live visualization of user interactions and collaboration patterns',
        interactive: true,
        realtime: true
      }
    };
  }

  // Advanced conversation flow visualization
  generateConversationFlow(messages: Message[]): VisualizationData {
    const flowData = this.processConversationFlow(messages);
    
    return {
      type: 'graph',
      data: flowData,
      config: {
        title: 'Conversation Flow Analysis',
        description: 'Visual representation of conversation structure and flow patterns',
        interactive: true,
        realtime: false
      }
    };
  }

  // Content complexity and sentiment analysis
  generateContentAnalytics(messages: Message[]): VisualizationData[] {
    const analytics: VisualizationData[] = [];

    // Sentiment timeline
    const sentimentData = this.analyzeSentimentOverTime(messages);
    analytics.push({
      type: 'chart',
      data: sentimentData,
      config: {
        title: 'Sentiment Analysis Timeline',
        description: 'Track sentiment changes throughout conversations',
        interactive: true,
        realtime: true
      }
    });

    // Content complexity analysis
    const complexityData = this.analyzeContentComplexity(messages);
    analytics.push({
      type: 'chart',
      data: complexityData,
      config: {
        title: 'Content Complexity Analysis',
        description: 'Analysis of message complexity and readability scores',
        interactive: true,
        realtime: false
      }
    });

    return analytics;
  }

  // Knowledge mapping and concept relationships
  generateKnowledgeMap(conversations: Conversation[], messages: Message[]): VisualizationData {
    const concepts = this.extractConcepts(messages);
    const relationships = this.findConceptRelationships(concepts);

    return {
      type: 'mindmap',
      data: {
        concepts,
        relationships,
        clusters: this.clusterConcepts(concepts)
      },
      config: {
        title: 'Knowledge Map',
        description: 'Interactive map of concepts and their relationships across conversations',
        interactive: true,
        realtime: false
      }
    };
  }

  // Private helper methods
  private createMessageHeatmap(messages: Message[]) {
    const heatmapData: { [key: string]: { [key: string]: number } } = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    messages.forEach(message => {
      if (message.createdAt) {
        const date = new Date(message.createdAt);
        const dayOfWeek = daysOfWeek[date.getDay()];
        const hour = date.getHours();
        
        if (!heatmapData[dayOfWeek]) {
          heatmapData[dayOfWeek] = {};
        }
        heatmapData[dayOfWeek][hour] = (heatmapData[dayOfWeek][hour] || 0) + 1;
      }
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: daysOfWeek.map(day => ({
        label: day,
        data: Array.from({ length: 24 }, (_, hour) => heatmapData[day]?.[hour] || 0)
      }))
    };
  }

  private createTopicsTimeline(conversations: Conversation[]) {
    return conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      timestamp: conv.createdAt,
      category: this.categorizeConversation(conv.title),
      model: conv.model
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private createModelUsageChart(conversations: Conversation[]) {
    const modelCounts: { [key: string]: number } = {};
    conversations.forEach(conv => {
      modelCounts[conv.model] = (modelCounts[conv.model] || 0) + 1;
    });

    return {
      labels: Object.keys(modelCounts),
      datasets: [{
        label: 'Usage Count',
        data: Object.values(modelCounts),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }]
    };
  }

  private getUserColor(userId: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  private calculateUserInteractions(activities: any[]) {
    const interactions: { [key: string]: number } = {};
    
    // Process activities to find user interactions
    activities.forEach(activity => {
      if (activity.type === 'message' && activity.replyTo) {
        const key = `${activity.userId}-${activity.replyTo}`;
        interactions[key] = (interactions[key] || 0) + 1;
      }
    });

    return Object.entries(interactions).map(([key, weight]) => {
      const [source, target] = key.split('-');
      return { source, target, weight };
    });
  }

  private processConversationFlow(messages: Message[]) {
    const nodes = messages.map((msg, index) => ({
      id: msg.id,
      label: `${msg.role}: ${msg.content.substring(0, 50)}...`,
      type: msg.role,
      position: index
    }));

    const edges = messages.slice(1).map((msg, index) => ({
      source: messages[index].id,
      target: msg.id,
      type: 'reply'
    }));

    return { nodes, edges };
  }

  private analyzeSentimentOverTime(messages: Message[]) {
    // Simplified sentiment analysis - in production, integrate with proper NLP service
    return messages.map((msg, index) => ({
      x: msg.createdAt,
      y: this.calculateSentimentScore(msg.content),
      message: msg.content.substring(0, 100)
    }));
  }

  private analyzeContentComplexity(messages: Message[]) {
    return messages.map(msg => ({
      length: msg.content.length,
      words: msg.content.split(' ').length,
      sentences: msg.content.split(/[.!?]+/).length,
      complexity: this.calculateComplexityScore(msg.content),
      timestamp: msg.createdAt
    }));
  }

  private extractConcepts(messages: Message[]): any[] {
    // Extract key concepts from message content
    const concepts: { [key: string]: number } = {};
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    messages.forEach(msg => {
      const words = msg.content.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 3 && !commonWords.has(word)) {
          concepts[word] = (concepts[word] || 0) + 1;
        }
      });
    });

    return Object.entries(concepts)
      .filter(([_, count]) => count >= 2)
      .map(([concept, count]) => ({ concept, count, id: concept }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  }

  private findConceptRelationships(concepts: any[]): any[] {
    // Find relationships between concepts based on co-occurrence
    const relationships: any[] = [];
    
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const strength = Math.random() * 0.5 + 0.1; // Simplified - use actual co-occurrence analysis
        if (strength > 0.3) {
          relationships.push({
            source: concepts[i].id,
            target: concepts[j].id,
            strength
          });
        }
      }
    }
    
    return relationships;
  }

  private clusterConcepts(concepts: any[]): any[] {
    // Group concepts into clusters
    const clusters = ['Technical', 'Business', 'Creative', 'Academic', 'Personal'];
    return concepts.map(concept => ({
      ...concept,
      cluster: clusters[Math.floor(Math.random() * clusters.length)]
    }));
  }

  private categorizeConversation(title: string): string {
    const categories = {
      'code': ['code', 'programming', 'development', 'bug', 'function'],
      'business': ['business', 'strategy', 'meeting', 'proposal', 'plan'],
      'creative': ['design', 'creative', 'art', 'writing', 'story'],
      'technical': ['technical', 'system', 'architecture', 'infrastructure'],
      'research': ['research', 'analysis', 'study', 'investigation']
    };

    const titleLower = title.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  private calculateSentimentScore(content: string): number {
    // Simplified sentiment calculation
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    
    let score = 0;
    const words = content.toLowerCase().split(/\W+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / Math.max(1, words.length / 10)));
  }

  private calculateComplexityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    const longWords = content.split(/\s+/).filter(word => word.length > 6).length;
    
    return (avgWordsPerSentence * 0.4) + (longWords / words * 100 * 0.6);
  }
}

export const visualizationService = new VisualizationService();