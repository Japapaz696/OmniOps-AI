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

    // Primary: ElevenLabs cinematic TTS
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    const elevenVoice = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
    if (elevenKey) {
      try {
        const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        });
        if (elRes.ok) {
          const arrayBuffer = await elRes.arrayBuffer();
          res.setHeader('Content-Type', 'audio/mpeg');
          return res.send(Buffer.from(arrayBuffer));
        }
        console.error('ElevenLabs TTS failed:', elRes.status, await elRes.text());
      } catch (elErr) {
        console.error('ElevenLabs TTS error:', elErr);
      }
    }

    // Fallback: OpenAI TTS
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const speech = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'onyx',
          input: text,
        });
        const buffer = Buffer.from(await speech.arrayBuffer());
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(buffer);
      } catch (oaiErr) {
        console.error('OpenAI TTS error:', oaiErr);
      }
    }

    return res.status(503).json({ error: 'No TTS provider configured' });
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
