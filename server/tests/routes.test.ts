import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('API Routes', () => {
  describe('GET /api/health', () => {
    it('deve retornar status ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'OmniOps AI API');
    });
  });

  describe('GET /api/telemetry', () => {
    it('deve retornar dados de telemetria dinâmicos', async () => {
      const response = await request(app).get('/api/telemetry');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('latency');
      expect(response.body).toHaveProperty('requestsProcessed');
      expect(response.body).toHaveProperty('queueStatus');
      expect(response.body).toHaveProperty('queueType', 'BullMQ');
      expect(typeof response.body.latency).toBe('number');
      expect(response.body.latency).toBeGreaterThan(0);
    });
  });

  describe('POST /api/analyze', () => {
    it('deve analisar código com SQL injection e retornar diagnóstico', async () => {
      const code = `app.get('/user', (req, res) => {
        const query = "SELECT * FROM users WHERE id = " + req.query.id;
        db.query(query, (err, result) => { res.json(result); });
      });`;
      
      const response = await request(app)
        .post('/api/analyze')
        .send({ code, model: 'GPT-4o' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('riskLevel');
      expect(response.body).toHaveProperty('owaspTag');
      expect(response.body).toHaveProperty('rootCause');
      expect(response.body).toHaveProperty('diff');
      expect(response.body.diff).toHaveProperty('original');
      expect(response.body.diff).toHaveProperty('corrected');
      expect(['CRÍTICO', 'ALTO', 'MÉDIO', 'BAIXO']).toContain(response.body.riskLevel);
    });

    it('deve retornar erro 400 para requisição inválida sem código', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ model: 'GPT-4o' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve analisar credenciais expostas', async () => {
      const code = `const apiKey = "sk-live-test123456789";`;
      
      const response = await request(app)
        .post('/api/analyze')
        .send({ code, model: 'Groq Llama 3' });
      
      expect(response.status).toBe(200);
      expect(response.body.riskLevel).toBe('CRÍTICO');
    });
  });
});
