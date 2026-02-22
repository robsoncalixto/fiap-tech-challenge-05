'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { MessageSquare, PanelRightClose, PanelRightOpen, AlertCircle, RotateCcw } from 'lucide-react'
import { getConversation } from '@/app/actions/chat'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface ChatPanelProps {
  reportId: string
  reportMarkdown: string
  severitySummary: { critical: number; high: number; medium: number; low: number } | null
}

export function ChatPanel({ reportId, reportMarkdown, severitySummary }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat-panel-collapsed') === 'true'
    }
    return false
  })
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)
  const toggleCollapse = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed)
    localStorage.setItem('chat-panel-collapsed', String(collapsed))
  }, [])
  const initRef = useRef(false)
  const loadedRef = useRef(false)

  const parseSSEStream = useCallback(async (
    response: Response,
    onToken: (token: string) => void,
    onDone: (fullContent: string) => void,
    onError: (error: string) => void,
  ) => {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              const content = data.choices?.[0]?.delta?.content
              if (content) {
                fullContent += content
                onToken(fullContent)
              }
            } catch { /* skip non-JSON lines */ }
          }
        }
      }
      onDone(fullContent)
    } catch {
      onError('Erro ao receber resposta do consultor.')
    }
  }, [])

  const loadConversation = useCallback(async () => {
    const { conversation, messages: existingMessages } = await getConversation(reportId)

    if (conversation && existingMessages.length > 0) {
      setMessages(existingMessages as Message[])
      return true
    }
    return false
  }, [reportId])

  const initializeChat = useCallback(async () => {
    if (initRef.current) return
    initRef.current = true
    setIsInitializing(true)
    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      })

      if (response.status === 409) {
        await loadConversation()
        setIsStreaming(false)
        setIsInitializing(false)
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao inicializar consultor.')
        setIsStreaming(false)
        setIsInitializing(false)
        initRef.current = false
        return
      }

      const tempId = `init-${Date.now()}`
      setMessages([{ id: tempId, role: 'assistant', content: '', created_at: new Date().toISOString() }])

      await parseSSEStream(
        response,
        (content) => {
          setMessages([{ id: tempId, role: 'assistant', content, created_at: new Date().toISOString() }])
        },
        async () => {
          setIsStreaming(false)
          setIsInitializing(false)
          await loadConversation()
        },
        (err) => {
          setError(err)
          setIsStreaming(false)
          setIsInitializing(false)
          initRef.current = false
        },
      )
    } catch {
      setError('Erro ao inicializar consultor.')
      setIsStreaming(false)
      setIsInitializing(false)
      initRef.current = false
    }
  }, [reportId, loadConversation, parseSSEStream])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    const init = async () => {
      const hasExisting = await loadConversation()
      if (!hasExisting) {
        await initializeChat()
      }
    }
    init()
  }, [loadConversation, initializeChat])

  const handleSend = useCallback(async (message: string) => {
    setError(null)
    setLastUserMessage(message)
    setIsStreaming(true)

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, message }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao gerar resposta do consultor.')
        setIsStreaming(false)
        return
      }

      const assistantId = `assistant-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', created_at: new Date().toISOString() },
      ])

      await parseSSEStream(
        response,
        (content) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content } : m)),
          )
        },
        async () => {
          setIsStreaming(false)
          await loadConversation()
        },
        (err) => {
          setError(err)
          setIsStreaming(false)
        },
      )
    } catch {
      setError('Erro ao gerar resposta do consultor. Tente novamente.')
      setIsStreaming(false)
    }
  }, [reportId, loadConversation, parseSSEStream])

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      setMessages((prev) => {
        const lastIdx = prev.length - 1
        if (prev[lastIdx]?.role === 'assistant' && prev[lastIdx]?.content === '') {
          return prev.slice(0, -1)
        }
        return prev
      })
      handleSend(lastUserMessage)
    }
  }, [lastUserMessage, handleSend])

  if (isCollapsed) {
    return (
      <button
        onClick={() => toggleCollapse(false)}
        className="fixed right-4 bottom-4 lg:relative lg:right-auto lg:bottom-auto flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl shadow-lg hover:bg-surface-secondary transition-colors"
        title="Abrir consultor"
      >
        <PanelRightOpen size={20} className="text-primary" />
        <span className="text-sm font-medium hidden lg:inline">Consultor</span>
        {messages.length > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
            {messages.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col w-full lg:w-[400px] lg:min-w-[400px] h-[500px] lg:h-[calc(100vh-8rem)] border border-border rounded-xl bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-secondary">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" />
          <h3 className="text-sm font-semibold font-heading">Consultor de Segurança</h3>
        </div>
        <button
          onClick={() => toggleCollapse(true)}
          className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
          title="Minimizar"
        >
          <PanelRightClose size={18} className="text-text-secondary" />
        </button>
      </div>

      <ChatMessages messages={messages} isStreaming={isStreaming && !error} />

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-feedback-error-bg text-feedback-error text-sm">
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <RotateCcw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      {!isInitializing && (
        <ChatInput onSend={handleSend} isLoading={isStreaming} />
      )}
    </div>
  )
}
