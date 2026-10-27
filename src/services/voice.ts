export async function speakDiagnostic(riskLevel: string, summary: string): Promise<void> {
  try {
    const text = `Diagnóstico concluído. Nível de risco: ${riskLevel}. ${summary}`;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) return;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(() => {
      // Silent fallback
    });
    audio.onended = () => URL.revokeObjectURL(url);
  } catch {
    // Silent fallback
  }
}

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}