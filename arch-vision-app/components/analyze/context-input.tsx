interface ContextInputProps {
  value: string
  onChange: (value: string) => void
}

export function ContextInput({ value, onChange }: ContextInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="context" className="block text-sm font-medium text-text">
        Contexto do sistema <span className="text-text-muted">(opcional)</span>
      </label>
      <textarea
        id="context"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Descreva as tecnologias, protocolos e ambiente de deploy do seu sistema..."
        rows={4}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
      />
    </div>
  )
}
