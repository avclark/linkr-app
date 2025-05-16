'use client'

import { useState } from 'react'
import { ClipboardIcon } from '@heroicons/react/24/outline'

interface CopyButtonProps {
  text: string
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="absolute top-2 right-2">
      <button
        onClick={handleCopy}
        className="relative text-gray-500 hover:text-gray-700 active:scale-90 transition transform duration-100"
        title="Copy to clipboard"
      >
        <ClipboardIcon className="h-5 w-5" />
        {copied && (
          <span className="absolute -top-8 right-1/2 translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow-md">
            Copied!
          </span>
        )}
      </button>
    </div>
  )
}