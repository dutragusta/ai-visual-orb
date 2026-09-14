// Provider-neutral AI adapter. Keep API keys on a server, never in this browser file.
export async function askAI(text) {
  const clean = text.trim();
  if (!clean) return 'Estou ouvindo.';

  // Local fallback keeps the visual prototype useful before an LLM backend is configured.
  const lower = clean.toLowerCase();
  if (lower.includes('olá') || lower.includes('oi')) return 'Olá. Eu estou aqui.';
  if (lower.includes('seu nome')) return 'Eu sou a Visual Orb.';
  if (lower.includes('three')) return 'Three.js cuida do meu universo visual em 3D.';
  if (lower.includes('tudo bem')) return 'Tudo funcionando por aqui.';

  return `Recebi: “${clean}”. A conexão com um modelo de linguagem ainda precisa ser configurada.`;
}
