// lib/extractMentions.ts

import OpenAI from 'openai'
import { chunkTranscript } from './chunkTranscript'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function extractMentionsFromTranscript(transcript: string) {
  // ⬇️ Pass 0 here to disable chunking
  const chunks = chunkTranscript(transcript, 0)
  const allMentions: Set<string> = new Set()

  for (const chunk of chunks) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // or swap dynamically if needed
      messages: [
        {
          role: 'system',
          content:
            'Extract a list of all names or entities mentioned in the transcript (people, companies, libraries, or products). Return them as plain text, one name per line. Do not include explanations or formatting.',
        },
        {
          role: 'user',
          content: chunk,
        },
      ],
      temperature: 0,
    })

    const mentions = response.choices[0]?.message?.content?.split('\n') || []
    mentions.map((m) => m.trim()).filter(Boolean).forEach((mention) => {
      allMentions.add(mention)
    })
  }

  return Array.from(allMentions).sort().join('\n')
}