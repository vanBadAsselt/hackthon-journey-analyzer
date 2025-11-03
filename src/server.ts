import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import journeyAnalyzerRoutes from './journey-analyzer-routes';

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Journey Analyzer endpoints
app.use('/api/journey-analyzer', journeyAnalyzerRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'journey-analyzer-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Journey Analyzer API',
    version: '1.0.0',
    description: 'User Journey Risk Analysis API - Analyzes user journeys based on GitHub repositories',
    endpoints: {
      health: 'GET /health',
      analyze: 'POST /api/journey-analyzer/analyze',
      analyzerHealth: 'GET /api/journey-analyzer/health'
    },
    documentation: 'See README.md for full documentation'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Journey Analyzer API Ready!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔹 Server:       http://localhost:${PORT}`);
  console.log(`🔹 Health Check: http://localhost:${PORT}/health`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`📝 API Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/api/journey-analyzer/analyze`);
  console.log(`   GET  http://localhost:${PORT}/api/journey-analyzer/health\n`);
});
