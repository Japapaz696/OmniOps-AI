import { useState, useEffect } from 'react'
import { speakDiagnostic } from './services/voice'
import {
  Shield,
  Activity,
  AlertTriangle,
  Code,
  Play,
  BarChart3,
  Clock,
  Database,
  Zap,
  Loader2,
  Volume2,
  VolumeX,
  Download
} from 'lucide-react'

const presets = [
  {
    id: 'sql-injection',
    name: 'SQL Injection',
    code: `app.get('/user', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.query.id;
  db.query(query, (err, result) => { res.json(result); });
});`
  },
  {
    id: 'exposed-cred',
    name: 'Credenciais',
    code: `const config = {
  apiKey: "sk-live-abc123def456ghi789",
  dbPassword: "P@ssw0rd123!",
  awsSecret: "AKIAIOSFODNN7EXAMPLE"
};

module.exports = config;`
  },
  {
    id: 'xss',
    name: 'XSS',
    code: `function Comment({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
}`
  },
  {
    id: 'cors',
    name: 'CORS Inseguro',
    code: `app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});`
  },
  {
    id: 'no-rate-limit',
    name: 'Sem Rate Limit',
    code: `app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  res.json({ ok: true });
});`
  },
  {
    id: 'no-tests',
    name: 'Sem Testes',
    code: `function calculateDiscount(price, coupon) {
  if (coupon === 'SAVE10') return price * 0.9;
  if (coupon === 'SAVE20') return price * 0.8;
  return price;
}
module.exports = { calculateDiscount };`
  }
]

interface Diagnostic {
  riskLevel: string
  owaspTag: string
  rootCause: string
  diff: { original: string; corrected: string }
}

function severityTone(risk: string) {
  const r = risk.toUpperCase()
  if (r.includes('CRÍT') || r.includes('CRIT')) return 'text-rose-300 bg-rose-500/10 border-rose-500/30'
  if (r.includes('ALTO') || r.includes('HIGH')) return 'text-amber-300 bg-amber-500/10 border-amber-500/30'
  if (r.includes('MÉDIO') || r.includes('MEDIO') || r.includes('MEDIUM')) return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30'
  return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
}

function App() {
  const [selectedPreset, setSelectedPreset] = useState(presets[0])
  const [code, setCode] = useState(presets[0].code)
  const [selectedModel, setSelectedModel] = useState('GPT-4o')
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [loading, setLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => { setCode(selectedPreset.code) }, [selectedPreset])

  const analyzeCode = async () => {
    setLoading(true)
    setDiagnostic(null)
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'https://omniops-backend.onrender.com'
      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, model: selectedModel }),
      })
      const data = await response.json()
      setDiagnostic(data)
      if (voiceEnabled) {
        setSpeaking(true)
        speakDiagnostic(data?.riskLevel ?? '', data?.rootCause ?? '').finally(() => setSpeaking(false))
      }
    } catch (error) {
      console.error('Error analyzing code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!diagnostic) return
    const utc = new Date().toUTCString()
    const md = `# 🛡️ OmniOps AI — Relatório Tático de Auditoria

> J.A.R.V.I.S. SECURITY ENGINE

**Data/Hora (UTC):** ${utc}

## Classificação
- **Categoria OWASP:** ${diagnostic.owaspTag}
- **Grau de Risco:** ${diagnostic.riskLevel}

## Descrição da Falha
${diagnostic.rootCause}

## Causa Raiz
Padrão inseguro detectado pela análise heurística, violando boas práticas da categoria OWASP acima.

## Mitigação Recomendada
Aplicar o patch corrigido, validando entradas, restringindo origens e adicionando controles de taxa.

## Comparativo de Código

### Código Vulnerável
\`\`\`
${diagnostic.diff.original}
\`\`\`

### Patch Corrigido
\`\`\`
${diagnostic.diff.corrected}
\`\`\`

---
*Gerado automaticamente por OmniOps AI.*
`
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `omniops-audit-${Date.now()}.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const telemetry = [
    { label: 'LATÊNCIA', value: '245 ms', icon: Clock, color: 'text-cyan-400' },
    { label: 'TOKENS', value: '1,847', icon: BarChart3, color: 'text-violet-400' },
    { label: 'FILA', value: 'Idle', icon: Database, color: 'text-emerald-400' },
    { label: 'SCANS', value: '1,293', icon: Zap, color: 'text-amber-400' },
  ]

  const orbState = loading ? 'analyzing' : speaking ? 'speaking' : ''

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.10),transparent_60%)] pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-6 h-6 text-zinc-200" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100">OmniOps AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">J.A.R.V.I.S. Engine • Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900/60 border border-white/10 rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            >
              <option value="GPT-4o">GPT-4o</option>
              <option value="Groq Llama 3">Groq Llama 3</option>
            </select>
            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`p-2 rounded-lg border transition-all duration-300 ${voiceEnabled ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-white/10 bg-zinc-900/60 text-zinc-500'}`}
              aria-pressed={voiceEnabled}
              title="Voice feedback"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* ORB */}
        <div className="flex flex-col items-center mb-10">
          <div className={`orb ${orbState}`} />
          <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">
            {loading ? 'Analyzing protocol…' : speaking ? 'Speaking diagnosis…' : 'System idle'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EDITOR */}
          <section className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Code Editor</span>
              </div>
              <button
                onClick={analyzeCode}
                disabled={loading}
                className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-900/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{loading ? 'Analyzing…' : 'Analyze Protocol'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-300 ${
                    selectedPreset.id === preset.id
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                      : 'bg-zinc-800/60 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              spellCheck={false}
              className="relative z-10 flex-1 min-h-[260px] w-full bg-zinc-950/60 border border-white/10 rounded-xl p-4 text-sm font-mono text-zinc-200 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 transition-all"
            />
          </section>

          {/* DIAGNOSTIC */}
          <section className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Live Diagnosis</span>
              </div>
              {diagnostic && (
                <button
                  onClick={downloadReport}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-800/60 text-xs text-zinc-300 hover:border-white/20 hover:text-white transition-all duration-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Report
                </button>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <p className="text-xs uppercase tracking-widest">Scanning protocol…</p>
                </div>
              ) : diagnostic ? (
                <>
                  <div className={`rounded-xl border p-4 ${severityTone(diagnostic.riskLevel)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest opacity-70">Risk Level</span>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <p className="mt-1 text-lg font-semibold">{diagnostic.riskLevel}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">OWASP Tag</p>
                    <p className="text-sm text-zinc-200">{diagnostic.owaspTag}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Root Cause</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{diagnostic.rootCause}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Vulnerable</p>
                    <pre className="text-xs font-mono text-rose-300/90 whitespace-pre-wrap">{diagnostic.diff.original}</pre>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mt-3 mb-2">Patched</p>
                    <pre className="text-xs font-mono text-emerald-300/90 whitespace-pre-wrap">{diagnostic.diff.corrected}</pre>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600">
                  <p className="text-sm">Run an analysis to see diagnosis.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* TELEMETRY */}
      <footer className="relative z-10 border-t border-white/5 bg-zinc-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {telemetry.map((t) => {
            const Icon = t.icon
            return (
              <div key={t.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">{t.label}</p>
                  <p className={`text-sm font-semibold ${t.color}`}>{t.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </footer>
    </div>
  )
}

export default App