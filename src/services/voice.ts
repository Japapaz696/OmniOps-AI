export async function speakDiagnostic(riskLevel: string, summary: string): Promise<void> {
  const text = `Diagnóstico concluído. Nível de risco: ${riskLevel}. ${summary}`;

  // Primary: OpenAI TTS (onyx) via backend
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
      return;
    }
  } catch {
    // Fall through to native Web Speech API
  }

  // Fallback: native Web Speech API
  try {
    if (typeof window === 'undefined') return;
    const synth = (window as any).speechSynthesis;
    if (!synth || typeof synth.speak !== 'function') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 0.85;
    utterance.volume = 1;

    const voices = synth.getVoices?.() || [];
    const ptVoice = voices.find((v: any) => v.lang && v.lang.toLowerCase().startsWith('pt-br'));
    if (ptVoice) utterance.voice = ptVoice;

    synth.cancel();
    synth.speak(utterance);
  } catch {
    // Silent fallback
  }
}

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}