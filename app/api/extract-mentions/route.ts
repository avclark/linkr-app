// app/api/extract-mentions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const { transcript } = await req.json()

  if (!transcript) {
    return new Response(result.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Extract a list of all names or entities mentioned in the transcript, such as people, libraries, companies, or products. Return them as a plain text list, one per line, without commentary or additional formatting.',
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
    })

    const result = response.choices[0]?.message?.content ?? ''
    return NextResponse.json({ mentions: result.trim() })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json({ error: 'Failed to extract mentions' }, { status: 500 })
  }
}