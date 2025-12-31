'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'

interface CopyButtonProps {
  text: string
  className?: string
}

/**
 * Copy button with feedback animation
 * Shows "Copied!" status for 2 seconds after click
 */
export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      title={copied ? 'Скопировано!' : 'Копировать'}
    >
      {copied ? (
        <span className="text-green-400 text-xs">✓</span>
      ) : (
        <Copy size={14} className="text-gray-500 hover:text-gray-300" />
      )}
    </button>
  )
}
