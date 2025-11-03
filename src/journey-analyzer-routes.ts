import { Router, Request, Response } from 'express';
import { JourneyAnalyzerService } from './journey-analyzer-service';
import { AnalysisRequest } from './types';

const router = Router();
const analyzerService = new JourneyAnalyzerService();

/**
 * POST /api/journey-analyzer/analyze
 * Analyzes user journeys based on a GitHub repository
 *
 * Request body:
 * {
 *   "githubUrl": "https://github.com/user/repo",
 *   "userJourneys": [
 *     {
 *       "name": "User Checkout",
 *       "description": "Complete purchase flow",
 *       "steps": ["Add to cart", "Review order", "Enter payment", "Confirm"]
 *     }
 *   ]
 * }
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const request: AnalysisRequest = req.body;

    // Validate request
    if (!request.githubUrl || !request.userJourneys || request.userJourneys.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'githubUrl and userJourneys are required'
      });
    }

    // Validate GitHub URL format
    if (!request.githubUrl.match(/github\.com\/[^\/]+\/[^\/]+/)) {
      return res.status(400).json({
        error: 'Invalid GitHub URL',
        message: 'Please provide a valid GitHub repository URL'
      });
    }

    // Validate user journeys
    for (const journey of request.userJourneys) {
      if (!journey.name || !journey.description || !journey.steps || journey.steps.length === 0) {
        return res.status(400).json({
          error: 'Invalid user journey',
          message: 'Each journey must have name, description, and steps'
        });
      }
    }

    // Perform analysis
    console.log('Received analysis request:', {
      githubUrl: request.githubUrl,
      journeyCount: request.userJourneys.length
    });

    const result = await analyzerService.analyzeJourneys(request);

    res.json(result);
  } catch (error) {
    console.error('Error analyzing journeys:', error);

    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/journey-analyzer/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'journey-analyzer',
    timestamp: new Date().toISOString()
  });
});

export default router;
