import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AnalysisRequestSchema } from './schemas/analysis';
import { analyzeCodeWithAI } from './services/analyzer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OmniOps AI API' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const validation = AnalysisRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request', details: validation.error.issues });
    }
    
    const { code, model } = validation.data;
    const result = await analyzeCodeWithAI(code, model);
    
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/telemetry', (req, res) => {
  const latency = Math.floor(Math.random() * 100) + 200;
  res.json({
    latency,
    requestsProcessed: Math.floor(Math.random() * 500) + 1000,
    queueStatus: 'Idle',
    queueType: 'BullMQ',
    activeJobs: 0,
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 OmniOps AI API running on http://localhost:${PORT}`);
  });
}

export default app;
