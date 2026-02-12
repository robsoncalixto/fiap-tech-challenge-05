'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const styles: Record<ToastType, string> = {
  success: 'border-success/20 bg-success-bg text-success',
  error: 'border-error/20 bg-error-bg text-error',
  info: 'border-info/20 bg-info-bg text-info',
}

let toastListeners: Array<(toast: Toast) => void> = []

export function toast(type: ToastType, message: string) {
  const t: Toast = { id: crypto.randomUUID(), type, message }
  toastListeners.forEach((listener) => listener(t))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== t.id))
    }, 4000)
  }, [])

  useEffect(() => {
    toastListeners.push(addToast)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast)
    }
  }, [addToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${styles[t.type]}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <p className="text-sm">{t.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="ml-auto shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
