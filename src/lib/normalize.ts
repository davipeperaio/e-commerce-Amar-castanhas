// Simple PT-BR display normalizer for known data issues
export function normalizePtBrLabel(text: string): string {
  if (!text) return text;
  let s = text;
  // Fix common typos seen in dataset/UI
  s = s.replace(/\bCARAMELI3ZADA\b/gi, (m) =>
    m === m.toUpperCase() ? "CARAMELIZADA" : "Caramelizada"
  );
  s = s.replace(/\bC\/SAL\b/gi, (m) => (m === m.toUpperCase() ? "COM SAL" : "com sal"));
  s = s.replace(/\bS\/SAL\b/gi, (m) => (m === m.toUpperCase() ? "SEM SAL" : "sem sal"));
  return s;
}
