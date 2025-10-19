// app/api/extract-mentions/route.ts

import { extractMentionsFromTranscript } from '@/lib/extractMentions'
import { chunkTranscript } from '@/lib/chunkTranscript'

export async function POST(req: Request) {
  const body = await req.json()
  const transcript = body.transcript // ✅ match front‑end

  if (typeof transcript !== 'string') {
    return new Response('Invalid input: transcript must be a string.', {
      status: 400,
    })
  }

  const chunks = chunkTranscript(transcript)
  const allMentions: string[] = []

  for (const chunk of chunks) {
    const mentions = await extractMentionsFromTranscript(chunk)
    allMentions.push(...mentions.split('\n'))
  }

  // remove duplicates but keep chronological order
  const seen = new Set<string>()
  const uniqueMentions: string[] = []

  for (const mention of allMentions) {
    if (!seen.has(mention)) {
      seen.add(mention)
      uniqueMentions.push(mention)
    }
  }

  return new Response(uniqueMentions.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  })
}