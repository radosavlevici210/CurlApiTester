
import { Router, Request, Response } from "express";
import { documentManager } from "../services/document-manager.js";
import { isAuthenticated } from "../replitAuth.js";

const router = Router();

// Create document
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { title, content, workspaceId, templateId, tags, isPrivate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await documentManager.createDocument({
      title,
      content,
      workspaceId,
      createdBy: userId,
      templateId,
      tags,
      isPrivate,
    });

    res.json(document);
  } catch (error: any) {
    console.error('Document creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get document
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;

    const document = await documentManager.getDocument(documentId, userId);
    res.json(document);
  } catch (error: any) {
    console.error('Document retrieval error:', error);
    res.status(error.message === 'Access denied' ? 403 : 404).json({ error: error.message });
  }
});

// Update document
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await documentManager.updateDocument(documentId, updates, userId);
    res.json(document);
  } catch (error: any) {
    console.error('Document update error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Get document versions
router.get('/:id/versions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const versions = await documentManager.getDocumentVersions(documentId, userId);
    res.json(versions);
  } catch (error: any) {
    console.error('Document versions error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Restore version
router.post('/:id/versions/:versionId/restore', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const versionId = parseInt(req.params.versionId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const version = await documentManager.restoreVersion(documentId, versionId, userId);
    res.json(version);
  } catch (error: any) {
    console.error('Version restore error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Share document
router.post('/:id/share', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const { targetUserId, permission } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await documentManager.shareDocument(documentId, userId, targetUserId, permission);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Document sharing error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Search documents
router.get('/search/:query', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const query = req.params.query;
    const userId = req.user?.id;
    const workspaceId = req.query.workspaceId ? parseInt(req.query.workspaceId as string) : undefined;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const documents = await documentManager.searchDocuments(query, userId, workspaceId);
    res.json(documents);
  } catch (error: any) {
    console.error('Document search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get collaborators
router.get('/:id/collaborators', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const collaborators = await documentManager.getDocumentCollaborators(documentId, userId);
    res.json(collaborators);
  } catch (error: any) {
    console.error('Collaborators retrieval error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Create collaboration room
router.post('/:id/collaborate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const room = await documentManager.createCollaborationRoom(documentId, userId);
    res.json(room);
  } catch (error: any) {
    console.error('Collaboration room creation error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Export document
router.get('/:id/export/:format', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const format = req.params.format as 'markdown' | 'pdf' | 'docx' | 'html';
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const exported = await documentManager.exportDocument(documentId, userId, format);
    
    res.setHeader('Content-Type', exported.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    res.send(exported.content);
  } catch (error: any) {
    console.error('Document export error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Get document analytics
router.get('/:id/analytics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const analytics = await documentManager.getDocumentAnalytics(documentId, userId);
    res.json(analytics);
  } catch (error: any) {
    console.error('Document analytics error:', error);
    res.status(error.message === 'Access denied' ? 403 : 500).json({ error: error.message });
  }
});

// Get templates
router.get('/templates/list', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const templates = documentManager.getTemplates();
    res.json(templates);
  } catch (error: any) {
    console.error('Templates retrieval error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific template
router.get('/templates/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id;
    const template = documentManager.getTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error: any) {
    console.error('Template retrieval error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
