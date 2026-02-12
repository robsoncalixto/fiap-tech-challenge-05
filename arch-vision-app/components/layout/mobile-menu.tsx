'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Shield, LayoutDashboard, PlusCircle, CreditCard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MobileMenuProps {
  credits: number
  userName: string | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyze', label: 'Nova Análise', icon: PlusCircle },
  { href: '/upgrade', label: 'Planos', icon: CreditCard },
]

export function MobileMenu({ credits, userName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-text-secondary hover:text-text"
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-label="Fechar menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsOpen(false)
              }
            }}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-surface shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-heading text-lg font-bold">Arch Vision</span>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary'
                        : 'text-text-secondary hover:bg-surface-secondary'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-border px-3 py-4">
              <div className="flex items-center justify-between px-3 mb-3">
                <span className="text-sm text-text">{userName || 'Usuário'}</span>
                <span className="text-xs text-text-muted">{credits} crédito{credits !== 1 ? 's' : ''}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-secondary"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
