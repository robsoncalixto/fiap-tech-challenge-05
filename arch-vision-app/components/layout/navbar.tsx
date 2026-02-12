import Link from 'next/link'
import { Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-heading text-xl font-bold">Arch Vision</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline">
            Funcionalidades
          </a>
          <a href="#pricing" className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline">
            Preços
          </a>
          <a href="#faq" className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline">
            FAQ
          </a>
          <Link href="/about" className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline">
            Sobre
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  )
}
