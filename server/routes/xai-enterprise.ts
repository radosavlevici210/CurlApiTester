
import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { xaiEnterpriseService } from '../services/xai-enterprise';

const router = Router();

// Enterprise content generation
router.post('/generate-content', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { template, context } = req.body;
    if (!template) {
      return res.status(400).json({ error: 'Template is required' });
    }

    const result = await xaiEnterpriseService.generateEnterpriseContent(template, context);
    res.json(result);
  } catch (error: any) {
    console.error('Enterprise content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Advanced code security analysis
router.post('/analyze-code-security', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const analysis = await xaiEnterpriseService.analyzeCodeSecurity(code, language);
    res.json(analysis);
  } catch (error: any) {
    console.error('Code security analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze code security' });
  }
});

// Business intelligence analysis
router.post('/business-analysis', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { data, analysisType } = req.body;
    if (!data || !analysisType) {
      return res.status(400).json({ error: 'Data and analysis type are required' });
    }

    const analysis = await xaiEnterpriseService.performBusinessAnalysis(data, analysisType);
    res.json(analysis);
  } catch (error: any) {
    console.error('Business analysis error:', error);
    res.status(500).json({ error: 'Failed to perform business analysis' });
  }
});

// Compliant document generation
router.post('/generate-document', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { documentType, requirements } = req.body;
    if (!documentType || !requirements) {
      return res.status(400).json({ error: 'Document type and requirements are required' });
    }

    const document = await xaiEnterpriseService.generateCompliantDocument(documentType, requirements);
    res.json(document);
  } catch (error: any) {
    console.error('Document generation error:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

// Enhanced analytics endpoint
router.get('/analytics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const analytics = xaiEnterpriseService.getAnalytics();
    res.json(analytics);
  } catch (error: any) {
    console.error('Analytics retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// Enhanced connection test
router.get('/test-connection', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await xaiEnterpriseService.testConnection();
    res.json(result);
  } catch (error: any) {
    console.error('Connection test error:', error);
    res.status(500).json({ error: 'Connection test failed' });
  }
});

export default router;
