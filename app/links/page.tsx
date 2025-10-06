// app/links/page.tsx
'use client'

import { toast } from 'react-hot-toast'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { fetchLinks, updateLinks, createLink, deleteLink, saveLinksBatch } from '@/lib/links'

export default function LinksPage() {
  const [links, setLinks] = useState<{ id: string; name: string; url: string; created_at: string }[]>([])

  useEffect(() => {
    fetchLinks().then(setLinks)
  }, [])

  const handleChange = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...links]
    updated[index][field] = value
    setLinks(updated)
  }

  const handleDelete = async (index: number) => {
    const linkToDelete = links[index]
    if (linkToDelete.id) {
      await deleteLink(linkToDelete.id)
    }
    const updated = links.filter((_, i) => i !== index)
    setLinks(updated)
  }

  const handleSave = async () => {
    const startTime = performance.now()
    console.log('🚀 Starting optimized save operation...')
    
    // Filter out empty entries and save valid ones
    const validLinks = links.filter(link => link.name.trim() && link.url.trim())
    console.log(`📝 Processing ${validLinks.length} valid links`)
    
    if (validLinks.length === 0) {
      toast.success('No links to save!')
      return
    }
    
    // Show loading toast to indicate operation started
    toast.loading('Saving links...', { id: 'save-links' })
    console.log('🍞 Loading toast shown at start of operation')
    
    try {
      // Use batch save for optimal performance
      const { created, updated } = await saveLinksBatch(validLinks)
      
      const saveEndTime = performance.now()
      console.log(`💾 Batch save completed in ${(saveEndTime - startTime).toFixed(2)}ms`)
      console.log(`✅ Created ${created.length} links, updated ${updated.length} links`)
      
      // Show success toast (dismiss the loading toast)
      toast.success(`Links saved! Created ${created.length}, updated ${updated.length}`, { id: 'save-links' })
      console.log('🍞 Success toast shown after batch save')
      
      // Do state update in next tick to not block toast
      Promise.resolve().then(() => {
        const stateUpdateStartTime = performance.now()
        const allSavedLinks = [...created, ...updated]
        const existingLinks = links.filter(link => link.id && !validLinks.some(vl => vl.id === link.id))
        const newLinksList = [...existingLinks, ...allSavedLinks]
        
        console.log(`📊 State update: ${existingLinks.length} existing + ${allSavedLinks.length} saved = ${newLinksList.length} total`)
        setLinks(newLinksList)
        const stateUpdateEndTime = performance.now()
        console.log(`🔄 State update completed in ${(stateUpdateEndTime - stateUpdateStartTime).toFixed(2)}ms`)
      })
      
      const totalTime = performance.now()
      console.log(`🎉 Total operation took ${(totalTime - startTime).toFixed(2)}ms`)
      
    } catch (error) {
      console.error('❌ Error saving links:', error)
      toast.error('Failed to save links', { id: 'save-links' })
    }
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
          onClick={() => setLinks([...links, { id: '', name: '', url: '', created_at: new Date().toISOString() }])}
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