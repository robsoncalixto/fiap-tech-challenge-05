'use client'

import { useEffect, useRef } from 'react'
import { ChatMessageBubble } from './chat-message-bubble'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface ChatMessagesProps {
  messages: Message[]
  isStreaming?: boolean
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 flex-row">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary-light text-primary">
        <span className="text-xs font-bold">AI</span>
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-surface-secondary">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full bg-text-muted animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-text-muted animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-text-muted animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}

export function ChatMessages({ messages, isStreaming = false }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
          createdAt={message.created_at}
        />
      ))}

      {isStreaming && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  )
}
