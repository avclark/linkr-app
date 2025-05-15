// app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [format, setFormat] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('linkr_format') || '- {name}: {url}'
    setFormat(saved)
  }, [])

  const handleSave = () => {
    localStorage.setItem('linkr_format', format)
    alert('Saved!')
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Output Format</h2>
      <p className="mb-2 text-gray-600">Use <code>{'{name}'}</code> and <code>{'{url}'}</code> as placeholders.</p>
      <input
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Save Format
      </button>
    </div>
  )
}