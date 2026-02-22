'use client'

import { useRef, useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
  }

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return

    onSend(trimmed)
    setValue('')

    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const MAX_LENGTH = 5000
  const trimmedLength = value.trim().length
  const isDisabled = !trimmedLength || isLoading || value.length > MAX_LENGTH

  return (
    <div className="border-t border-border">
      <div className="flex items-end gap-2 p-4">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            maxLength={MAX_LENGTH}
            onChange={(e) => {
              setValue(e.target.value)
              handleInput()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte ao consultor..."
            disabled={isLoading}
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
          />
          {value.length > MAX_LENGTH * 0.8 && (
            <span className={`absolute right-3 bottom-1 text-xs ${value.length > MAX_LENGTH ? 'text-feedback-error' : 'text-text-muted'}`}>
              {value.length}/{MAX_LENGTH}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`bg-primary hover:bg-primary-hover text-white rounded-full p-2.5 transition-colors ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
