export function chunkTranscript(text: unknown, maxChunkSize = 3500): string[] {
  if (typeof text !== 'string') {
    console.error('❌ chunkTranscript expected a string but received:', typeof text, text);
    return [];
  }

  if (maxChunkSize === 0) {
    return [text.trim()];
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}