export function createEulogyPreview(text: string, maxLength = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  const base = lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated;
  return `${base}...`;
}
