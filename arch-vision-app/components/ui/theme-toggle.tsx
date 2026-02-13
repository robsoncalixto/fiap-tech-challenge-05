'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    console.log('[ThemeToggle] State:', { theme, resolvedTheme, open, mounted })
  }, [theme, resolvedTheme, open, mounted])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        console.log('[ThemeToggle] Click outside detected, closing dropdown')
        setOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        console.log('[ThemeToggle] Escape pressed, closing dropdown')
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

  // Avoid hydration mismatch: render placeholder until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="rounded-lg p-2 text-text-secondary hover:bg-surface-secondary hover:text-text transition-colors"
          aria-label="Alternar tema"
        >
          <Monitor className="h-5 w-5" />
        </button>
      </div>
    )
  }

  // Show icon matching the actual resolved appearance
  const ButtonIcon =
    resolvedTheme === 'dark'
      ? Moon
      : Sun

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          console.log('[ThemeToggle] Button clicked, toggling dropdown:', !open)
          setOpen(!open)
        }}
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
          className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-surface py-1 shadow-lg z-50"
        >
          {options.map((option) => {
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  console.log('[ThemeToggle] Theme selected:', option.value)
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
