// app/api/search-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BRAVE_API_KEY = 'BSA1FVDAGO20JAKJqz0fL5b8fDBZt6e' // replace directly

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query')

  if (!query || !BRAVE_API_KEY) {
    return NextResponse.json({ error: 'Missing query or API key' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
      }
    )

    const data = await response.json()

    const results =
      data.web?.results?.map((r) => ({
        title: r.title,
        url: r.url,
      })) ?? []

    return NextResponse.json(results)
  } catch (err) {
    console.error('Brave Search API error:', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}