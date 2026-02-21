'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

const DROPDOWN_WIDTH = 160

const options = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const posRef = useRef({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      let left = rect.right - DROPDOWN_WIDTH
      if (left < 8) left = 8
      posRef.current = { top: rect.bottom + 8, left }
    }
    setOpen(!open)
  }

  if (!mounted) {
    return (
      <div>
        <button
          className="rounded-lg p-2 text-text-secondary hover:bg-surface-secondary hover:text-text transition-colors"
          aria-label="Alternar tema"
        >
          <Monitor className="h-5 w-5" />
        </button>
      </div>
    )
  }

  const ButtonIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <div ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="rounded-lg p-2 text-text-secondary hover:bg-surface-secondary hover:text-text transition-colors"
        aria-label="Alternar tema"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <ButtonIcon className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'fixed',
            top: posRef.current.top,
            left: posRef.current.left,
            width: DROPDOWN_WIDTH,
          }}
          className="rounded-lg border border-border bg-surface py-1 shadow-lg z-50"
        >
          {options.map((option) => {
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setTheme(option.value)
                  setOpen(false)
                  buttonRef.current?.focus()
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text transition-colors"
              >
                <option.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{option.label}</span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
