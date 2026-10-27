export function speakDiagnostic(riskLevel: string, summary: string): void {
  try {
    if (typeof window === 'undefined') return
    const synth = (window as any).speechSynthesis
    if (!synth || typeof synth.speak !== 'function') return

    const text = `Diagnóstico concluído. Nível de risco: ${riskLevel}. ${summary}`

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.05
    utterance.pitch = 0.85
    utterance.volume = 1

    // Prefer a pt-BR voice if available
    const voices = synth.getVoices?.() || []
    const ptVoice = voices.find((v: any) => v.lang && v.lang.toLowerCase().startsWith('pt-br'))
    if (ptVoice) utterance.voice = ptVoice

    synth.cancel()
    synth.speak(utterance)
  } catch {
    // Silent fallback
  }
}

export function isVoiceSupported(): boolean {
  try {
    return typeof window !== 'undefined' && !!(window as any).speechSynthesis
  } catch {
    return false
  }
}