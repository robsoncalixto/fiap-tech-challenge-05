'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, PlusCircle, CreditCard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  credits: number
  userName: string | null
  avatarUrl: string | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyze', label: 'Nova Análise', icon: PlusCircle },
]

export function Sidebar({ credits, userName, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-heading text-lg font-bold">Arch Vision</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-3 py-4 space-y-3">
        <Link
          href="/upgrade"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text transition-colors"
        >
          <CreditCard className="h-5 w-5" />
          <span>{credits} crédito{credits !== 1 ? 's' : ''}</span>
        </Link>

        <div className="flex items-center gap-3 px-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`Foto de perfil de ${userName || 'usuário'}`} className="h-8 w-8 rounded-full" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-sm font-medium">
              {userName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <span className="text-sm text-text truncate flex-1">{userName || 'Usuário'}</span>
          <button onClick={handleSignOut} className="text-text-muted hover:text-text" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
