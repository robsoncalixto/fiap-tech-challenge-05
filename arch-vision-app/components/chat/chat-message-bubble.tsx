'use client'

import ReactMarkdown from 'react-markdown'
import { User, Shield } from 'lucide-react'

interface ChatMessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export function ChatMessageBubble({ role, content, createdAt }: ChatMessageBubbleProps) {
  const isUser = role === 'user'

  const formattedTime = new Date(createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
          isUser
            ? 'bg-surface-secondary text-text-secondary'
            : 'bg-primary-light text-primary'
        }`}
      >
        {isUser ? <User size={16} /> : <Shield size={16} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-light text-text rounded-br-sm'
              : 'bg-surface-secondary text-text rounded-bl-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        <span className="text-xs text-text-muted px-1">{formattedTime}</span>
      </div>
    </div>
  )
}
