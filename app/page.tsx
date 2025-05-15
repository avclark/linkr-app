// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Fuse from 'fuse.js'
import { fetchLinks, updateLinks } from '@/lib/jsonbin'

type LinkEntry = {
  name: string
  url: string
  aliases?: string[]
}

export default function Home() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [links, setLinks] = useState<LinkEntry[]>([])
  const [format, setFormat] = useState('- {name}: {url}')
    useEffect(() => {
      console.log('✅ ENV CHECK:', {
        apiKey: process.env.NEXT_PUBLIC_JSONBIN_API_KEY,
        binId: process.env.NEXT_PUBLIC_JSONBIN_BIN_ID,
        url: process.env.NEXT_PUBLIC_JSONBIN_URL,
      })
      const saved = localStorage.getItem('linkr_format')
      if (saved) setFormat(saved)
    }, [])

  useEffect(() => {
    fetchLinks().then(setLinks)
  }, [])

  const handleMatch = async () => {
    const mentions = input.split('\n').map((m) => m.trim()).filter(Boolean)
    const fuse = new Fuse(links, {
      keys: ['name', 'aliases'],
      threshold: 0.3,
    })

    const outputLines: string[] = []
    const newLinks: LinkEntry[] = [...links]

    for (const mention of mentions) {
      const result = fuse.search(mention)
      if (result.length > 0) {
        const { name, url } = result[0].item
        outputLines.push(format.replace('{name}', name).replace('{url}', url))
      } else {
        const url = prompt(`No match for "${mention}". Enter a URL:`)
        if (url) {
          newLinks.push({ name: mention, url, aliases: [] })
          outputLines.push(format.replace('{name}', mention).replace('{url}', url))
        }
      }
    }

    setOutput(outputLines.join('\n'))
    setLinks(newLinks)
    await updateLinks(newLinks)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste mentions here..."
        className="w-full h-[400px] p-4 border rounded resize-none"
      />
      <textarea
        value={output}
        readOnly
        placeholder="Formatted output..."
        className="w-full h-[400px] p-4 border rounded resize-none bg-gray-50"
      />
      <button
        onClick={handleMatch}
        className="col-span-1 md:col-span-2 mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Match and Format
      </button>
    </div>
  )
}