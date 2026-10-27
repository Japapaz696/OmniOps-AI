import { useState } from 'react'
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
  Loader2
} from 'lucide-react'

const presets = [
  {
    id: 'sql-injection',
    name: 'Injeção SQL',
    code: `// Exemplo vulnerável
app.get('/user', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.query.id;
  db.query(query, (err, result) => {
    res.json(result);
  });
});`
  },
  {
    id: 'no-tests',
    name: 'Ausência de Testes',
    code: `function calculateDiscount(price, coupon) {
  if (coupon === 'SAVE10') return price * 0.9;
  if (coupon === 'SAVE20') return price * 0.8;
  return price;
}

// Sem testes unitários para casos edge
module.exports = { calculateDiscount };`
  },
  {
    id: 'exposed-cred',
    name: 'Credencial Exposta',
    code: `const config = {
  apiKey: "sk-live-abc123def456ghi789",
  dbPassword: "P@ssw0rd123!",
  awsSecret: "AKIAIOSFODNN7EXAMPLE"
};

module.exports = config;`
  },
  {
    id: 'xss',
    name: 'A03: XSS',
    code: `function Comment({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
}`
  },
  {
    id: 'cors',
    name: 'A05: CORS Inseguro',
    code: `app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});`
  },
  {
    id: 'no-rate-limit',
    name: 'A04: Sem Rate Limit',
    code: `app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // autenticação sem limitação de taxa
  res.json({ ok: true });
});`
  }
]

interface Diagnostic {
  riskLevel: string
  owaspTag: string
  rootCause: string
  diff: {
    original: string
    corrected: string
  }
}

function App() {
  const [selectedPreset, setSelectedPreset] = useState(presets[0])
  const [selectedModel, setSelectedModel] = useState('GPT-4o')
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [loading, setLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  const analyzeCode = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: selectedPreset.code,
          model: selectedModel,
        }),
      })
      const data = await response.json()
      setDiagnostic(data)
      if (voiceEnabled) {
        speakDiagnostic(data?.riskLevel ?? '', data?.rootCause ?? '')
      }
    } catch (error) {
      console.error('Error analyzing code:', error)
    } finally {
      setLoading(false)
    }
  }

  const telemetry = [
    { label: 'LATÊNCIA API', value: '245 ms', icon: Clock, color: 'text-cyan-400' },
    { label: 'TOKENS', value: '1,847', icon: BarChart3, color: 'text-cyan-400' },
    { label: 'FILA BULLMQ', value: 'Idle', icon: Database, color: 'text-emerald-400' },
    { label: 'SCANS', value: '1,293', icon: Zap, color: 'text-amber-400' },
  ]

  return (
    <div className="relative min-h-screen text-cyan-100 font-data overflow-hidden">
      <div className="hud-bg" />
      <div className="hud-grid" />
      <div className="scanlines" />

      <div className="relative z-10 flex flex-col h-screen">
        {/* HEADER */}
        <header className="border-b border-cyan-500/30 bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Shield className="w-7 h-7 text-cyan-400 neon-cyan" />
              <h1 className="text-lg md:text-xl font-bold tracking-widest neon-cyan flicker">
                O.M.N.I.O.P.S. // J.A.R.V.I.S. SECURITY ENGINE
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`px-3 py-1.5 border rounded-md text-xs font-semibold tracking-wider transition-colors ${
                  voiceEnabled
                    ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'border-cyan-500/20 bg-slate-950/40 text-cyan-400/60'
                }`}
                aria-pressed={voiceEnabled}
              >
                VOICE FEEDBACK: {voiceEnabled ? 'ON' : 'OFF'}
              </button>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 bg-slate-950/80 border border-cyan-500/40 rounded-md text-sm text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-data"
              >
                <option value="GPT-4o">GPT-4o</option>
                <option value="Groq Llama 3">Groq Llama 3</option>
              </select>
              <div className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500/40 rounded-full bg-emerald-500/10">
                <span className="pulse-dot w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-xs font-semibold tracking-wider text-emerald-400 neon-green">
                  SISTEMA TÁTICO ATIVO
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-full">
            {/* LEFT: Editor */}
            <section className="hud-panel flex flex-col overflow-hidden">
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-tr" />
              <div className="hud-corner hud-corner-bl" />
              <div className="hud-corner hud-corner-br" />

              <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/20 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold tracking-wider text-cyan-200">EDITOR DE CÓDIGO</span>
                </div>
                <button
                  onClick={analyzeCode}
                  disabled={loading}
                  className="btn-hud flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-400/60 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-semibold tracking-wider text-cyan-200 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                >
                  <span key="icon">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}</span>
                  <span key="label">{loading ? 'ANALISANDO...' : 'ANALISAR PROTOCOLO'}</span>
                </button>
              </div>

              <div className="p-3 border-b border-cyan-500/10">
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors font-semibold tracking-wide border ${
                        selectedPreset.id === preset.id
                          ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950/40 border-cyan-500/20 text-cyan-400/70 hover:border-cyan-400/40 hover:text-cyan-300'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto relative">
                {loading && <div className="scan-bar" />}
                <pre className="text-sm font-mono text-cyan-100/90 whitespace-pre-wrap leading-relaxed">
                  <code>{selectedPreset.code}</code>
                </pre>
              </div>
            </section>

            {/* RIGHT: Diagnostic */}
            <section className="hud-panel flex flex-col overflow-hidden relative">
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-tr" />
              <div className="hud-corner hud-corner-bl" />
              <div className="hud-corner hud-corner-br" />

              <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-500/20 bg-slate-950/40">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold tracking-wider text-cyan-200">DIAGNÓSTICO EM TEMPO REAL</span>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-auto relative">
                {loading && <div className="scan-bar" />}
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                    <p className="text-sm tracking-widest text-cyan-300 neon-cyan">ESCANEANDO PROTOCOLO...</p>
                  </div>
                ) : diagnostic ? (
                  <div className="space-y-3">
                    <div className="hud-panel-red p-3 flex items-center justify-between">
                      <span className="text-sm text-red-300/80 tracking-wide">NÍVEL DE RISCO</span>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-red-400 neon-red">{diagnostic.riskLevel}</span>
                      </div>
                    </div>
                    <div className="hud-panel-amber p-3">
                      <span className="text-sm text-amber-300/80 block mb-1 tracking-wide">TAG OWASP</span>
                      <span className="text-sm font-bold text-amber-400 neon-amber">{diagnostic.owaspTag}</span>
                    </div>
                    <div className="hud-panel p-3">
                      <span className="text-sm text-cyan-300/70 block mb-2 tracking-wide">CAUSA RAIZ</span>
                      <span className="text-sm text-cyan-100">{diagnostic.rootCause}</span>
                    </div>
                    <div className="hud-panel p-3">
                      <span className="text-sm text-cyan-300/70 block mb-2 tracking-wide">DIFF DE CORREÇÃO</span>
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        <code>
                          <span className="text-red-400">{'- ' + diagnostic.diff.original}</span>
                          {'\n'}
                          <span className="text-emerald-400">{'+ ' + diagnostic.diff.corrected.split('\n')[0]}</span>
                          {diagnostic.diff.corrected.split('\n').slice(1).map((line, i) => (
                            <div key={i}><span className="text-emerald-400">{'+ ' + line}</span></div>
                          ))}
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-cyan-500/50">
                    <p className="text-sm tracking-widest">CLIQUE EM "ANALISAR PROTOCOLO" PARA OBTER DIAGNÓSTICO</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        {/* TELEMETRY FOOTER */}
        <footer className="border-t border-cyan-500/30 bg-slate-950/60 backdrop-blur-md px-6 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {telemetry.map((t) => {
              const Icon = t.icon
              return (
                <div key={t.label} className="flex items-center gap-3">
                  <div className="telemetry-ring">
                    <Icon className={`w-6 h-6 ${t.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest text-cyan-400/70">{t.label}</p>
                    <p className={`text-lg font-bold ${t.color}`}>{t.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App