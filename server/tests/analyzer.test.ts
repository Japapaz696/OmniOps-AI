import { describe, it, expect } from 'vitest';
import { analyzeCodeHeuristically } from '../services/analyzer';

describe('Heuristic Analyzer', () => {
  it('deve detectar SQL Injection por concatenação com req.query', () => {
    const code = `app.get('/user', (req, res) => {
      const query = "SELECT * FROM users WHERE id = " + req.query.id;
      db.query(query, (err, result) => { res.json(result); });
    });`;
    
    const result = analyzeCodeHeuristically(code);
    expect(result.riskLevel).toBe('CRÍTICO');
    expect(result.owaspTag).toContain('Injection');
    expect(result.rootCause.toLowerCase()).toContain('concatenação');
    expect(result.diff.corrected).toContain('?');
  });

  it('deve detectar credenciais expostas hardcoded', () => {
    const code = `const config = {
      apiKey: "sk-live-abc123def456",
      dbPassword: "P@ssw0rd123!"
    };`;
    
    const result = analyzeCodeHeuristically(code);
    expect(result.riskLevel).toBe('CRÍTICO');
    expect(result.owaspTag).toContain('Cryptographic');
    expect(result.diff.corrected).toContain('process.env');
  });

  it('deve detectar ausência de testes', () => {
    const code = `function calculateDiscount(price, coupon) {
      if (coupon === 'SAVE10') return price * 0.9;
      if (coupon === 'SAVE20') return price * 0.8;
      return price;
    }
    module.exports = { calculateDiscount };`;
    
    const result = analyzeCodeHeuristically(code);
    expect(result.riskLevel).toBe('MÉDIO');
    expect(result.owaspTag).toContain('Insecure Design');
    expect(result.rootCause.toLowerCase()).toContain('teste');
  });

  it('deve retornar BAIXO risco para código seguro sem problemas óbvios', () => {
    const code = `const express = require('express');
    const app = express();
    app.get('/health', (req, res) => res.json({ ok: true }));
    module.exports = app;`;
    
    const result = analyzeCodeHeuristically(code);
    expect(['BAIXO', 'MÉDIO']).toContain(result.riskLevel);
    expect(result.diff).toHaveProperty('original');
    expect(result.diff).toHaveProperty('corrected');
  });
});
