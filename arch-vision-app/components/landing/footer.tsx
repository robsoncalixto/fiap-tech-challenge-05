import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo and Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold">Arch Vision</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Navegação</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline"
                >
                  Preços
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline"
                >
                  FAQ
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline"
                >
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Produto</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze"
                  className="text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus-visible:text-primary focus-visible:underline"
                >
                  Nova Análise
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-text-secondary">
            © 2026 Arch Vision. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
