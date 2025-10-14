// app/page.tsx
'use client'

import Image from 'next/image'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Fuse from 'fuse.js'
import { fetchLinks, updateLinks, createLink, saveLinksBatch } from '@/lib/links'
import { fetchSearchSuggestions, type SearchSuggestion } from '@/lib/searchSuggestions'
import { useEffect, useRef, useState, useCallback } from 'react'
import CopyButton from '@/components/CopyButton'

type LinkEntry = {
  id: string
  name: string
  url: string
  created_at: string
  aliases?: string[]
}

export default function Home() {
  const inputRefState = useRef('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [links, setLinks] = useState<LinkEntry[]>([])
  const [format, setFormat] = useState('- {name}: {url}')
  const [modalJustOpened, setModalJustOpened] = useState(false)
  const [pendingEntry, setPendingEntry] = useState<{ name: string; url: string; isOneOff: boolean } | null>(null)
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null)
  const [processingState, setProcessingState] = useState<{
    output: string[]
    links: LinkEntry[]
    remaining: string[]
  } | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pendingSearchQuery) {
      setLoadingSuggestions(true)
      fetchSearchSuggestions(pendingSearchQuery).then((results) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Suggestions returned from API route:', results)
        }
        setSuggestions(results)
        setLoadingSuggestions(false)
      })
    } else {
      setSuggestions([])
    }
  }, [pendingSearchQuery])

  // Set format from localStorage once on mount
  useEffect(() => {
    const saved = localStorage.getItem('linkr_format')
    if (saved) setFormat(saved)
  }, [])

  // Load link data from Supabase
  useEffect(() => {
    fetchLinks().then(setLinks)
  }, [])

  useEffect(() => {
    if (modalJustOpened && inputRef.current) {
      inputRef.current.focus()
      setModalJustOpened(false)
    }
  }, [modalJustOpened])

  // handleMatch
  const handleMatch = useCallback(async () => {
    const mentions = inputRefState.current.split('\n').map((m) => m.trim()).filter(Boolean)
    const fuse = new Fuse(links, {
      keys: ['name'],
      threshold: 0.3,
    })
  
    const tempOutput: string[] = []
    const tempLinks: LinkEntry[] = [...links]
  
    for (let i = 0; i < mentions.length; i++) {
      const mention = mentions[i]
      const result = fuse.search(mention)
  
      if (result.length > 0) {
        const { name, url } = result[0].item
        tempOutput.push(format.replaceAll('{name}', name).replaceAll('{url}', url))
      } else {
        setPendingEntry({ name: mention.trim(), url: '', isOneOff: false })
        setModalJustOpened(true)
        setPendingSearchQuery(mention.trim())
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
    return
  }, [links, format])

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

  // continueMatch
  const continueMatch = async ({
    output,
    links: tempLinks,
    remaining,
  }: {
    output: string[]
    links: LinkEntry[]
    remaining: string[]
  }) => {
    const tempOutput = [...output]
    const fuse = new Fuse(tempLinks, {
      keys: ['name'],
      threshold: 0.3,
    })

    while (remaining.length > 0) {
      const nextMention = remaining.shift()!
      const result = fuse.search(nextMention)

      if (result.length > 0) {
        const { name, url } = result[0].item
        tempOutput.push(format.replaceAll('{name}', name).replaceAll('{url}', url))
      } else {
        setPendingEntry({ name: nextMention.trim(), url: '', isOneOff: false })
        setModalJustOpened(true)
        setPendingSearchQuery(nextMention.trim())
        setProcessingState({
          output: tempOutput,
          links: tempLinks,
          remaining,
        })
        return
      }
    }

    setProcessingState(null)
    setLinks(tempLinks)
    setOutput(tempOutput.join('\n'))
    
    // Use optimized batch save instead of the old updateLinks function
    const { created, updated } = await saveLinksBatch(tempLinks)
    if (created.length > 0 || updated.length > 0) {
      console.log(`✅ Homepage batch save: Created ${created.length}, updated ${updated.length}`)
    }
  }

  // handleAddLink
  const handleAddLink = async () => {
    if (!pendingEntry?.name.trim() || !pendingEntry?.url.trim() || !processingState) return
  
    const newEntry = {
      id: '', // Will be set by Supabase (if saved)
      name: pendingEntry.name.trim(),
      url: pendingEntry.url.trim(),
      created_at: new Date().toISOString(),
      aliases: [],
    }
  
    let linkToUse: LinkEntry
    let updatedLinks: LinkEntry[]
    
    if (pendingEntry.isOneOff) {
      // For one-off links, don't save to database, just use the entry directly
      linkToUse = newEntry
      updatedLinks = processingState.links // Don't add to links array
      console.log('🔗 One-off link created (not saved to database):', newEntry.name)
    } else {
      // For regular links, save to database
      const createdLink = await createLink({ name: newEntry.name, url: newEntry.url })
      if (!createdLink) {
        console.error('Failed to create link')
        return
      }
      linkToUse = createdLink
      updatedLinks = [...processingState.links, createdLink]
      console.log('💾 Link saved to database:', createdLink.name)
    }
  
    const newLine = format
      .replaceAll('{name}', linkToUse.name)
      .replaceAll('{url}', linkToUse.url)
    const updatedOutput = [...processingState.output, newLine]
  
    // Update input and sync to ref
    const updatedInput = inputRefState.current
      .split('\n')
      .map((line) => (line.trim() === pendingSearchQuery ? linkToUse.name : line))
      .join('\n')
  
    setInput(updatedInput)
    inputRefState.current = updatedInput
  
    setOutput(updatedOutput.join('\n'))
  
    // Clear modal state
    setPendingEntry(null)
    setPendingSearchQuery(null)
    setSuggestions([])
    await continueMatch({
      output: updatedOutput,
      links: updatedLinks,
      remaining: processingState.remaining,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          inputRefState.current = e.target.value
        }}
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
        <CopyButton text={output} />
      </div>
      <button
        onClick={handleMatch}
        className="col-span-1 md:col-span-2 mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Match and Format
      </button>
      <Dialog open={!!pendingEntry} onClose={() => {}} className="relative z-10">
        <DialogBackdrop
          className="fixed inset-0 bg-gray-500/75 transition-opacity"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div className="text-center">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  No match for “{pendingEntry?.name}”
                </DialogTitle>
                <p className="mt-2 text-sm text-gray-600">Please enter a URL:</p>
                <input
                  value={pendingEntry?.name || ''}
                  onChange={(e) => setPendingEntry((prev) => prev && { ...prev, name: e.target.value })}
                  className="mt-3 w-full p-2 border rounded"
                  placeholder="Name"
                />

                <input
                  ref={inputRef}
                  value={pendingEntry?.url || ''}
                  onChange={(e) => setPendingEntry((prev) => prev && { ...prev, url: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddLink()
                    }
                  }}
                  className="mt-3 w-full p-2 border rounded"
                  placeholder="https://example.com"
                />

                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="one-off-checkbox"
                    checked={pendingEntry?.isOneOff || false}
                    onChange={(e) => setPendingEntry((prev) => prev && { ...prev, isOneOff: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="one-off-checkbox" className="ml-2 text-sm text-gray-700">
                    One-off (don&apos;t save to database)
                  </label>
                </div>

                {loadingSuggestions && (
                  <p className="mt-2 text-sm text-gray-500 italic">Searching suggestions...</p>
                )}

                {!loadingSuggestions && suggestions.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium text-gray-700 mb-2">Suggestions:</p>
                    <ul className="space-y-3">
                      {suggestions.map((sug, i) => (
                        <li
                          key={i}
                          onClick={() =>
                            setPendingEntry((prev) => prev && { ...prev, url: sug.url })
                          }
                          className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-2">
                          <Image
                            src={`https://www.google.com/s2/favicons?domain=${new URL(sug.url).hostname}&sz=32`}
                            alt=""
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                            <a
                              href={sug.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-indigo-600 hover:underline"
                              onClick={(e) => e.stopPropagation()} // prevent also filling input
                            >
                              {sug.title}
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 break-words">{sug.url}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  onClick={() => {
                    setPendingEntry(null)
                    setPendingSearchQuery(null)
                    setSuggestions([])
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