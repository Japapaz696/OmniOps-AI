# OmniOps AI

[![Node.js](https://img.shields.io/badge/Node.js-20.x%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.x-6E9F18.svg)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/features/actions)

## Visão Geral & Proposta de Valor

**OmniOps AI** é uma plataforma SaaS de DevSecOps projetada para análise estática de código, detecção automatizada de vulnerabilidades do OWASP Top 10 e sugestão autônoma de patches de segurança. 

Combinando **LLMs** (Groq/OpenAI) com um motor heurístico robusto, o OmniOps AI oferece diagnóstico em tempo real, sugestões de correção com diffs visuais no estilo Git e telemetria completa para equipes de desenvolvimento e segurança.

## Arquitetura & Fluxo de Dados

```ascii
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Client     │───▶│  Express API │───▶│ Zod Validation│───▶│  Groq/OpenAI  │
│  (React/Vite)│    │  (TypeScript)│    │  (Schema)     │    │ LLM + Structured│
└─────────────┘    └──────────────┘    └─────────────┘    │   Outputs      │
       ▲                   │                                    └──────────────┘
       │                   │                                              │
       │                   ▼                                              │
       │            ┌──────────────┐                                      │
       │            │   Fallback    │◀─────────────────────────────────────┘
       │            │  Heurístico   │        (Timeout/Rate Limit/Falha)
       │            │   Local       │
       │            └──────────────┘
       │                   │
       └───────────────────┘
              Response (JSON)
```

**Fluxo:** `Client ➔ Express API ➔ Zod Validation ➔ Groq/OpenAI LLM ➔ Fallback Heurístico ➔ Response`

## Recursos Principais

- **🤖 Análise com IA**: Integração com Groq SDK e OpenAI com Structured Outputs validados por Zod
- **🛡️ Detecção OWASP Top 10**: Identificação automática de SQL Injection, credenciais expostas, falhas de design inseguro
- **🔄 Fallback Inteligente**: Motor heurístico local garante disponibilidade mesmo sem chaves de API
- **🎨 Split-Screen Playground**: Editor de código à esquerda com presets de vulnerabilidades, painel de diagnóstico à direita
- **📊 Diffs Visuais**: Sugestões de correção com formatação Git-style (linhas vermelhas/verde)
- **📈 Telemetria**: Latência da API, consumo de tokens, simulador de fila BullMQ
- **✅ Testes Automatizados**: 9 testes (4 unitários + 5 integração) com 100% de aprovação
- **🚀 CI/CD**: GitHub Actions com typecheck, testes e build em múltiplas versões Node.js

## Especificação da API

### `POST /api/analyze`
Analisa código em busca de vulnerabilidades e retorna diagnóstico estruturado.

**Request:**
```json
{
  "code": "app.get('/user', (req, res) => { const query = \"SELECT * FROM users WHERE id = \" + req.query.id; ... });",
  "model": "GPT-4o"
}
```

**Response:**
```json
{
  "riskLevel": "CRÍTICO",
  "owaspTag": "A03:2021 - Injection",
  "rootCause": "Concatenação direta de input do usuário na query SQL sem sanitização ou uso de prepared statements",
  "diff": {
    "original": "const query = \"SELECT * FROM users WHERE id = \" + req.query.id;",
    "corrected": "const query = \"SELECT * FROM users WHERE id = ?\";\ndb.query(query, [req.query.id], (err, result) => {"
  }
}
```

### `GET /api/telemetry`
Retorna métricas dinâmicas da plataforma.

**Response:**
```json
{
  "latency": 245,
  "requestsProcessed": 1293,
  "queueStatus": "Idle",
  "queueType": "BullMQ",
  "activeJobs": 0
}
```

### `GET /api/health`
Health check da API.

**Response:**
```json
{
  "status": "ok",
  "service": "OmniOps AI API"
}
```

## Guia de Instalação e Execução

### Pré-requisitos
- Node.js 20.x ou superior
- npm ou yarn

### Instalação
```bash
git clone https://github.com/Japapaz696/OmniOps-AI.git
cd OmniOps-AI
npm install
```

### Configuração (Opcional)
Crie um arquivo `.env` na raiz:
```env
PORT=3001
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```
*Sem chaves, o sistema utilizará o motor heurístico local automaticamente.*

### Execução

**Modo desenvolvimento (Fullstack):**
```bash
npm run dev
```
Roda frontend (Vite) e backend (Express + nodemon) simultaneamente com concurrently.

**Testes:**
```bash
npm test
```
Executa a suíte Vitest - **9/9 testes aprovados (100%)**

**TypeCheck:**
```bash
npm run typecheck
```
Verifica tipos TypeScript no frontend e backend

**Build:**
```bash
npm run build
```
Compila frontend (Vite) e backend para produção

**Preview:**
```bash
npm run preview
```
Visualiza build de produção

## Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express 5, TypeScript, Zod
- **IA:** Groq SDK, OpenAI SDK
- **Testes:** Vitest, Supertest
- **DevOps:** GitHub Actions, Concurrently, Nodemon

## Licença

MIT License - Veja [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com foco em segurança, performance e experiência do desenvolvedor.**
