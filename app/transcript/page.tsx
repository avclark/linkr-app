// app/transcript/page.tsx
'use client'

import { useState } from 'react'
import CopyButton from '@/components/CopyButton'

export default function TranscriptPage() {
  const [transcript, setTranscript] = useState('')
  const [mentionsOutput, setMentionsOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleExtractMentions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/extract-mentions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })

      const text = await response.text()
      setMentionsOutput(text)
    } catch (error) {
      setMentionsOutput('Error extracting mentions.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste full transcript here..."
        className="w-full h-[400px] p-4 border rounded resize-none"
      />
      <div className="relative">
        <textarea
          value={mentionsOutput}
          readOnly
          placeholder="Extracted mentions will appear here..."
          className="w-full h-[400px] p-4 border rounded resize-none bg-gray-50"
        />
        <CopyButton text={mentionsOutput} />
      </div>
      <button
        onClick={handleExtractMentions}
        className="col-span-1 md:col-span-2 mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        disabled={isLoading}
      >
        {isLoading ? 'Extracting...' : 'Extract Mentions'}
      </button>
    </div>
  )
}