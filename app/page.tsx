// app/page.tsx
'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import Fuse from 'fuse.js'
import { fetchLinks, updateLinks } from '@/lib/jsonbin'
import { useEffect, useState, useCallback } from 'react'

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
  const [pendingMention, setPendingMention] = useState<string | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const [processingState, setProcessingState] = useState<{
    output: string[]
    links: LinkEntry[]
    remaining: string[]
  } | null>(null)
  // Set format from localStorage once on mount
  useEffect(() => {
    console.log('✅ ENV CHECK:', {
      apiKey: process.env.NEXT_PUBLIC_JSONBIN_API_KEY,
      binId: process.env.NEXT_PUBLIC_JSONBIN_BIN_ID,
      url: process.env.NEXT_PUBLIC_JSONBIN_URL,
    })

    const saved = localStorage.getItem('linkr_format')
    if (saved) setFormat(saved)
  }, [])

  // Load link data from JSONBin
  useEffect(() => {
    fetchLinks().then(setLinks)
  }, [])

  // Register keyboard shortcut for copying output
  // useEffect(() => {
  //   const handleKeydown = (e: KeyboardEvent) => {
  //     const isMac = navigator.platform.includes('Mac')
  //     const copyShortcut =
  //     (isMac && e.ctrlKey && e.altKey && e.metaKey && e.key.toLowerCase() === 'c') ||
  //     (!isMac && e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === 'c')
    
  //     if (copyShortcut) {
  //       e.preventDefault()
  //       navigator.clipboard.writeText(output)
  //     }
  //   }

  //   window.addEventListener('keydown', handleKeydown)
  //   return () => window.removeEventListener('keydown', handleKeydown)
  // }, [output])

  const handleMatch = useCallback(async () => {
    const mentions = input.split('\n').map((m) => m.trim()).filter(Boolean)
    const fuse = new Fuse(links, {
      keys: ['name', 'aliases'],
      threshold: 0.3,
    })
  
    const tempOutput: string[] = []
    const tempLinks: LinkEntry[] = [...links]
    // const remaining: string[] = []
  
    for (let i = 0; i < mentions.length; i++) {
      const mention = mentions[i]
      const result = fuse.search(mention)
  
      if (result.length > 0) {
        const { name, url } = result[0].item
        tempOutput.push(format.replaceAll('{name}', name).replaceAll('{url}', url))
      } else {
        setPendingMention(mention)
        setProcessingState({
          output: tempOutput,
          links: tempLinks,
          remaining: mentions.slice(i + 1),
        })
        return
      }
    }
  
    setOutput(tempOutput.join('\n'))
    setLinks(tempLinks)
    await updateLinks(tempLinks)
  }, [input, links, format])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac')
      const isShortcut =
        (isMac && e.metaKey && e.key === 'Enter') ||
        (!isMac && e.ctrlKey && e.key === 'Enter')
      if (isShortcut) {
        e.preventDefault()
        handleMatch()
      }
    }
  
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMatch])

  const handleAddLink = async () => {
    if (!pendingMention || !newUrl.trim() || !processingState) return
  
    const newEntry = { name: pendingMention, url: newUrl.trim(), aliases: [] }
    const updatedLinks = [...processingState.links, newEntry]
    const newLine = format
      .replaceAll('{name}', pendingMention)
      .replaceAll('{url}', newUrl.trim())
    const updatedOutput = [...processingState.output, newLine]
    const remaining = [...processingState.remaining]
  
    // Process remaining mentions
    const fuse = new Fuse(updatedLinks, {
      keys: ['name', 'aliases'],
      threshold: 0.3,
    })
  
    while (remaining.length > 0) {
      const nextMention = remaining.shift()!
      const result = fuse.search(nextMention)
  
      if (result.length > 0) {
        const { name, url } = result[0].item
        updatedOutput.push(format.replaceAll('{name}', name).replaceAll('{url}', url))
      } else {
        setProcessingState({
          output: updatedOutput,
          links: updatedLinks,
          remaining,
        })
        setLinks(updatedLinks)
        setOutput(updatedOutput.join('\n'))
        setPendingMention(nextMention)
        setNewUrl('')
        return
      }
    }
  
    // All mentions processed
    setProcessingState(null)
    setLinks(updatedLinks)
    setOutput(updatedOutput.join('\n'))
    await updateLinks(updatedLinks)
    setPendingMention(null)
    setNewUrl('')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste mentions here..."
        className="w-full h-[400px] p-4 border rounded resize-none"
      />
      <div className="relative">
        <textarea
          value={output}
          readOnly
          placeholder="Formatted output..."
          className="w-full h-[400px] p-4 border rounded resize-none bg-gray-50"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(output)
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          title="Copy to clipboard"
        >
          <DocumentDuplicateIcon className="h-5 w-5" />
        </button>
      </div>
      <button
        onClick={handleMatch}
        className="col-span-1 md:col-span-2 mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Match and Format
      </button>
      <Dialog open={!!pendingMention} onClose={() => {}} className="relative z-10">
        <DialogBackdrop
          className="fixed inset-0 bg-gray-500/75 transition-opacity"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div className="text-center">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  No match for “{pendingMention}”
                </DialogTitle>
                <p className="mt-2 text-sm text-gray-600">Please enter a URL:</p>
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="mt-3 w-full p-2 border rounded"
                  placeholder="https://example.com"
                />
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  onClick={() => {
                    setPendingMention(null)
                    setNewUrl('')
                  }}
                  className="inline-flex justify-center rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLink}
                  className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Add Link
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}