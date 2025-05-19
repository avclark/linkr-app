// lib/searchSuggestions.ts

export type SearchSuggestion = {
  title: string
  url: string
}

export async function fetchSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  try {
    const res = await fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)

    const data = await res.json()
    return data
  } catch (err) {
    console.error('Client fetchSearchSuggestions error:', err)
    return []
  }
}