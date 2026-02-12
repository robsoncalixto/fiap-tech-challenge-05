import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-8xl font-bold font-heading text-text">404</h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading">
            Página não encontrada
          </h2>
          <p className="text-text-secondary">
            A página que você procura não existe ou foi movida.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-4 py-2 text-sm bg-primary text-white hover:bg-primary-hover"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
