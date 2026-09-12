import { useEffect, useRef, useState } from 'react'

interface Props {
  segundos: number
  onTerminar?: () => void
}

/** Cronómetro de descanso entre series. Usa `key` en el padre para reiniciarlo. */
export function Cronometro({ segundos, onTerminar }: Props) {
  const [restante, setRestante] = useState(segundos)
  const [activo, setActivo] = useState(false)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (!activo) return
    ref.current = window.setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          setActivo(false)
          onTerminar?.()
          if ('vibrate' in navigator) navigator.vibrate?.(300)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (ref.current) window.clearInterval(ref.current)
    }
  }, [activo, onTerminar])

  const mm = Math.floor(restante / 60)
  const ss = String(restante % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3">
      <span className="font-mono text-2xl tabular-nums">{mm}:{ss}</span>
      <span className="text-xs text-slate-400">descanso</span>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={() => setActivo((a) => !a)}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-900"
        >
          {activo ? 'Pausar' : restante === 0 ? 'Listo' : 'Iniciar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setActivo(false)
            setRestante(segundos)
          }}
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm"
        >
          Reiniciar
        </button>
      </div>
    </div>
  )
}
