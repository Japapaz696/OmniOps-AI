# 🛡️ OmniOps AI — DevSecOps Platform & J.A.R.V.I.S. HUD

> Plataforma tática de análise contínua de código, detecção de vulnerabilidades OWASP Top 10 e geração automática de patches com Inteligência Artificial.

![Build Pass](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)

---

## 🚀 Live Demo

- **Frontend (Vercel):** https://omniops-ai.vercel.app
- **Backend (Render):** https://omniops-backend.onrender.com

---

## ⚡ Destaques de Funcionalidades

- 🤖 **Análise OWASP em tempo real** — detecção de SQL Injection, credenciais expostas, XSS, CORS permissivo e ausência de rate limiting.
- 🔊 **Síntese de Voz (Web Speech API)** — feedback em áudio com voz futurista em `pt-BR`, com toggle ON/OFF no header.
- 🧬 **Diffs de código** — comparação visual entre código vulnerável e patch corrigido.
- 🧪 **Preset Heurístico** — regras determinísticas para análise offline sem dependência de LLM.
- 🎛️ **Interface Tática J.A.R.V.I.S.** — HUD sci-fi com scanlines, grid cibernético, painéis angulares e widgets de telemetria.

---

## 🏗️ Arquitetura

```
┌────────────────────────┐        ┌──────────────────────────┐
│  React + Vite (TSX)    │  HTTP  │  Express + ts-node (TS)  │
│  Tailwind CSS          │ ─────► │  Zod (validação)         │
│  Web Speech API        │        │  Heurística + LLM (opt)  │
└────────────────────────┘        └──────────────────────────┘
            │                              │
            │                              ├── Vitest + Supertest
            │                              └── CORS dinâmico (CLIENT_ORIGIN)
            └── VITE_API_URL (env)
```

- **Frontend:** React 19, Vite 7, Tailwind CSS 3, Lucide React.
- **Backend:** Node.js, Express 5, TypeScript, Zod.
- **Testes:** Vitest + Supertest (unitários e de integração).
- **Deploy:** Vercel (frontend) + Render (backend).

---

## 📦 Instalação e Execução Local

```bash
# Clone o repositório
git clone https://github.com/Japapaz696/OmniOps-AI.git
cd OmniOps-AI

# Instale as dependências
npm install

# Execute em modo desenvolvimento (frontend + backend)
npm run dev

# Ou apenas o backend
npm run dev:server

# Testes
npm test

# Typecheck
npm run typecheck

# Build de produção
npm run build
```

### Variáveis de Ambiente

**Backend (`server/.env` ou ambiente):**
- `PORT` — porta do servidor (padrão `3001`).
- `CLIENT_ORIGIN` — origens permitidas pelo CORS (separadas por vírgula).
- `GROQ_API_KEY` / `OPENAI_API_KEY` — opcionais, para análise via LLM.

**Frontend (`.env`):**
- `VITE_API_URL` — URL base da API (padrão `http://localhost:3001`).

---

## 📁 Estrutura do Projeto

```
OmniOps-AI/
├── server/
│   ├── index.ts
│   ├── services/analyzer.ts
│   ├── schemas/analysis.ts
│   └── tests/
├── src/
│   ├── App.tsx
│   ├── index.css
│   └── services/voice.ts
├── package.json
└── README.md
```

---

## 📄 Licença

Projeto de demonstração — uso educacional e tático.