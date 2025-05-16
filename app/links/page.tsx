// app/links/page.tsx
'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { fetchLinks, updateLinks } from '@/lib/jsonbin'

export default function LinksPage() {
  const [links, setLinks] = useState<{ name: string; url: string }[]>([])

  useEffect(() => {
    fetchLinks().then(setLinks)
  }, [])

  const handleChange = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...links]
    updated[index][field] = value
    setLinks(updated)
  }

  const handleDelete = (index: number) => {
    const updated = links.filter((_, i) => i !== index)
    setLinks(updated)
  }

  const handleSave = async () => {
    await updateLinks(links)
    alert('Saved!')
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Links</h2>
      <div className="space-y-4">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={link.name}
              onChange={(e) => handleChange(i, 'name', e.target.value)}
              className="border p-2 w-1/3"
            />
            <input
              value={link.url}
              onChange={(e) => handleChange(i, 'url', e.target.value)}
              className="border p-2 w-2/3"
            />
            <button
              onClick={() => handleDelete(i)}
              className="text-gray-300 hover:text-red-600 transition"
              title="Delete row"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setLinks([...links, { name: '', url: '' }])}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Add Row
        </button>
        <button
          onClick={handleSave}
          className="mt-4 ml-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Save All
        </button>
      </div>
    </div>
  )
}