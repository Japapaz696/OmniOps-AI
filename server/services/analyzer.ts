import { AnalysisResponse } from '../schemas/analysis';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

export function analyzeCodeHeuristically(code: string): AnalysisResponse {
  const lowerCode = code.toLowerCase();
  
  if ((lowerCode.includes('+ req.query') || (lowerCode.includes('req.query.') && lowerCode.includes('select')))) {
    return {
      riskLevel: 'CRÍTICO',
      owaspTag: 'A03:2021 - Injection',
      rootCause: 'Concatenação direta de input do usuário na query SQL sem sanitização ou uso de prepared statements',
      diff: {
        original: 'const query = "SELECT * FROM users WHERE id = " + req.query.id;',
        corrected: 'const query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [req.query.id], (err, result) => {',
      },
    };
  }
  
  if (lowerCode.includes('sk-live') || (lowerCode.includes('password') && lowerCode.includes('='))) {
    return {
      riskLevel: 'CRÍTICO',
      owaspTag: 'A02:2021 - Cryptographic Failures',
      rootCause: 'Credenciais e chaves de API hardcoded no código fonte',
      diff: {
        original: 'const config = {\n  apiKey: "sk-live-abc123...",\n  dbPassword: "P@ssw0rd123!"\n};',
        corrected: 'const config = {\n  apiKey: process.env.API_KEY,\n  dbPassword: process.env.DB_PASSWORD\n};',
      },
    };
  }
  
  if (!lowerCode.includes('test') && !lowerCode.includes('describe') && !lowerCode.includes('it(')) {
    return {
      riskLevel: 'MÉDIO',
      owaspTag: 'A04:2021 - Insecure Design',
      rootCause: 'Ausência de testes unitários para funções críticas',
      diff: {
        original: 'function calculateDiscount(price, coupon) {\n  // sem testes\n}',
        corrected: 'function calculateDiscount(price, coupon) {\n  // implementar com validação\n}\n\ndescribe("calculateDiscount", () => {\n  it("should apply SAVE10 discount", () => {...});\n});',
      },
    };
  }
  
  return {
    riskLevel: 'BAIXO',
    owaspTag: 'A05:2021 - Security Misconfiguration',
    rootCause: 'Possíveis melhorias de segurança e boas práticas',
    diff: {
      original: '// Código atual',
      corrected: '// Código com melhorias aplicadas seguindo boas práticas',
    },
  };
}

export async function analyzeCodeWithAI(code: string, model: string): Promise<AnalysisResponse> {
  try {
    const systemPrompt = `Você é um especialista em segurança de código e DevSecOps. 
Analise o código fornecido e retorne APENAS um JSON válido no seguinte formato:
{
  "riskLevel": "CRÍTICO" | "ALTO" | "MÉDIO" | "BAIXO",
  "owaspTag": "string",
  "rootCause": "string",
  "diff": {
    "original": "string",
    "corrected": "string"
  }
}
Seja preciso, técnico e prático.`;
    
    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: code }
        ],
        model: model.includes('llama') ? 'llama-3.1-70b-versatile' : 'llama-3.1-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      const content = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } else if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: code }
        ],
        model: 'gpt-4o',
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      const content = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('AI analysis failed, falling back to heuristic:', error);
  }
  
  return analyzeCodeHeuristically(code);
}
