import { useState } from 'react'
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
    } catch (error) {
      console.error('Error analyzing code:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-gray-100">
      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">OmniOps AI</h1>
            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-success/10 border border-success/30 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs text-success font-medium">Engine Status: Active</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="GPT-4o">GPT-4o</option>
              <option value="Groq Llama 3">Groq Llama 3</option>
            </select>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Editor de Código</span>
              </div>
              <button 
                onClick={analyzeCode}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm transition-colors"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {loading ? 'Analisando...' : 'Analisar'}
              </button>
            </div>
            <div className="p-4 border-b border-border">
              <div className="flex gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      selectedPreset.id === preset.id
                        ? 'bg-primary text-white'
                        : 'bg-background hover:bg-border'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                <code>{selectedPreset.code}</code>
              </pre>
            </div>
          </div>

          <div className="flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/50">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Diagnóstico em Tempo Real</span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : diagnostic ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                    <span className="text-sm text-gray-400">Nível de Risco</span>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-danger" />
                      <span className="text-sm font-semibold text-danger">{diagnostic.riskLevel}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-border">
                    <span className="text-sm text-gray-400 block mb-1">Tag OWASP</span>
                    <span className="text-sm font-medium text-warning">{diagnostic.owaspTag}</span>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-border">
                    <span className="text-sm text-gray-400 block mb-2">Causa Raiz</span>
                    <span className="text-sm text-gray-300">{diagnostic.rootCause}</span>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-border">
                    <span className="text-sm text-gray-400 block mb-2">Diff de Correção</span>
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      <code>
                        <span className="text-danger">{'- ' + diagnostic.diff.original}</span>
                        {'\n'}
                        <span className="text-success">{'+ ' + diagnostic.diff.corrected.split('\n')[0]}</span>
                        {diagnostic.diff.corrected.split('\n').slice(1).map((line, i) => (
                          <div key={i}><span className="text-success">{'+ ' + line}</span></div>
                        ))}
                      </code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">Clique em "Analisar" para obter diagnóstico</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-surface">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-400">Latência da API</p>
              <p className="text-lg font-semibold">245 ms</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-surface">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-400">Consumo de Tokens</p>
              <p className="text-lg font-semibold">1,847</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-surface">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-gray-400">Estado da Fila</p>
              <p className="text-lg font-semibold text-success">Idle (BullMQ)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-surface">
            <Zap className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xs text-gray-400">Scans Realizados</p>
              <p className="text-lg font-semibold">1,293</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
