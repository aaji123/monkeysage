export function getQuoteIndex(
  days: number,
  quoteCount: number,
  userId?: string,
): number | null {
  if (!Number.isSafeInteger(quoteCount) || quoteCount <= 0) {
    return null;
  }

  const normalizedDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const cycle = Math.floor(normalizedDays / quoteCount);
  const position = normalizedDays % quoteCount;
  const sequenceSeed = userId
    ? `monkey-sage:${userId.toLowerCase()}:${cycle}`
    : `monkey-sage:${cycle}`;
  const start = hash32(`${sequenceSeed}:start`) % quoteCount;
  let stride = (hash32(`${sequenceSeed}:stride`) % quoteCount) || 1;

  while (greatestCommonDivisor(stride, quoteCount) !== 1) {
    stride = (stride + 1) % quoteCount || 1;
  }

  return (start + position * stride) % quoteCount;
}

function hash32(value: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function greatestCommonDivisor(left: number, right: number): number {
  let a = left;
  let b = right;

  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return a;
}
