import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { AnalysisRequestSchema } from './schemas/analysis';
import { analyzeCodeWithAI } from './services/analyzer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: clientOrigin
      ? clientOrigin.split(',').map((origin) => origin.trim())
      : true,
    credentials: true,
  })
);
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

app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI API key not configured' });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: text,
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 OmniOps AI API running on http://localhost:${PORT}`);
  });
}

export default app;
