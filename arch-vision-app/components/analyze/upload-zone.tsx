'use client'

import { useCallback, useState } from 'react'
import { Upload, X, Image } from 'lucide-react'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX_SIZE = 10 * 1024 * 1024

export function UploadZone({ onFileSelect, selectedFile, onClear }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null)
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Formato inválido. Aceitos: PNG, JPG, SVG')
        return
      }
      if (file.size > MAX_SIZE) {
        setError('Arquivo muito grande. Máximo: 10MB')
        return
      }
      const url = URL.createObjectURL(file)
      setPreview(url)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSet(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
  }

  function handleClear() {
    setPreview(null)
    setError(null)
    onClear()
  }

  if (selectedFile && preview) {
    return (
      <div className="relative rounded-xl border border-border bg-surface-secondary p-4">
        <button
          onClick={handleClear}
          className="absolute right-3 top-3 rounded-full bg-surface p-1.5 shadow-sm hover:bg-surface-tertiary"
          aria-label="Remover arquivo"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4">
          <img
            src={preview}
            alt="Preview do diagrama"
            className="h-24 w-24 rounded-lg object-cover border border-border"
          />
          <div>
            <p className="text-sm font-medium text-text">{selectedFile.name}</p>
            <p className="text-xs text-text-muted">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
          dragActive
            ? 'border-primary bg-primary-light/30'
            : 'border-border hover:border-border-hover hover:bg-surface-secondary'
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            document.getElementById('file-input')?.click()
          }
        }}
      >
        <div className="rounded-full bg-surface-secondary p-3 mb-3">
          {dragActive ? (
            <Image className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-text-muted" />
          )}
        </div>
        <p className="text-sm font-medium text-text">
          Arraste seu diagrama aqui ou clique para selecionar
        </p>
        <p className="mt-1 text-xs text-text-muted">PNG, JPG ou SVG (máx. 10MB)</p>
        <input
          id="file-input"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  )
}
