'use client'

interface ModelSelectProps {
  value: string
  onChange: (value: string) => void
  tier: string
}

const models = [
  { id: 'google/gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', pro: false },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', pro: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o', pro: true },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', pro: true },
]

export function ModelSelect({ value, onChange, tier }: ModelSelectProps) {
  const isPro = tier === 'pro'

  return (
    <div className="space-y-1.5">
      <label htmlFor="model" className="block text-sm font-medium text-text">
        Modelo de IA
      </label>
      <select
        id="model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        {models.map((model) => (
          <option
            key={model.id}
            value={model.id}
            disabled={model.pro && !isPro}
          >
            {model.name} {model.pro && !isPro ? '(Pro)' : ''}
          </option>
        ))}
      </select>
      {!isPro && (
        <p className="text-xs text-text-muted">
          Modelos avançados disponíveis no plano Pro.{' '}
          <a href="/upgrade" className="text-primary hover:underline">
            Fazer upgrade
          </a>
        </p>
      )}
    </div>
  )
}
