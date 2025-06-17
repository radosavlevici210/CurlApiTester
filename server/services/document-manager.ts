import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Document {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  templateId?: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: any;
}

export class DocumentManager extends EventEmitter {
  private documents = new Map<string, Document>();
  private templates = new Map<string, DocumentTemplate>();
  private aiService: any; // Reference to AI service

  constructor() {
    super();
    this.initializeTemplates();
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  private async initializeTemplates(): Promise<void> {
    // Initialize default templates
    const defaultTemplates = [
      {
        id: 'business-plan',
        name: 'Business Plan',
        description: 'Comprehensive business plan template',
        category: 'business',
        structure: {
          sections: ['Executive Summary', 'Market Analysis', 'Financial Projections']
        }
      },
      {
        id: 'technical-spec',
        name: 'Technical Specification',
        description: 'Technical specification document',
        category: 'technical',
        structure: {
          sections: ['Overview', 'Requirements', 'Architecture', 'Implementation']
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

// Export document manager instance
export const documentManager = new DocumentManager();