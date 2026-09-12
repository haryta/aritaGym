import type { ReactNode } from 'react'

export function Pagina({ titulo, subtitulo, children, accion }: { titulo: string; subtitulo?: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-4">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{titulo}</h1>
          {subtitulo && <p className="text-sm text-slate-400">{subtitulo}</p>}
        </div>
        {accion}
      </header>
      {children}
    </div>
  )
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-slate-800/70 p-4 ring-1 ring-slate-700 ${className}`}>{children}</div>
}

export function Boton({
  children,
  onClick,
  variante = 'primario',
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variante?: 'primario' | 'secundario' | 'peligro'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  const estilos = {
    primario: 'bg-emerald-500 text-slate-900 hover:bg-emerald-400',
    secundario: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
    peligro: 'bg-red-600/80 text-white hover:bg-red-500',
  }[variante]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 ${estilos} ${className}`}
    >
      {children}
    </button>
  )
}

export function Etiqueta({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">{children}</span>
}

export function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-300">{label}</span>
      {children}
    </label>
  )
}

export const inputClase =
  'w-full rounded-xl bg-slate-900 px-3 py-2.5 text-base text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500'
