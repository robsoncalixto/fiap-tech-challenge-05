'use client'

import { MessageSquare } from 'lucide-react'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatReadonlyBanner } from '@/components/chat/chat-readonly-banner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface SharedChatSectionProps {
  messages: Message[]
}

export function SharedChatSection({ messages }: SharedChatSectionProps) {
  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-secondary">
        <MessageSquare size={18} className="text-primary" />
        <h3 className="text-sm font-semibold font-heading">Consultor de Segurança</h3>
      </div>
      <ChatReadonlyBanner />
      <div className="max-h-[600px] overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>
    </div>
  )
}
