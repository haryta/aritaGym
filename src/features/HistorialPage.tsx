import { useMemo, useState } from 'react'
import { useApp } from '../store/app'
import { ejercicioPorId } from '../data/ejercicios'
import { Boton, Pagina, Tarjeta, inputClase } from '../components/ui'

export function HistorialPage() {
  const historial = useApp((s) => s.historial)
  const pesos = useApp((s) => s.pesos)
  const perfil = useApp((s) => s.perfil)
  const registrarPeso = useApp((s) => s.registrarPeso)
  const borrarRegistro = useApp((s) => s.borrarRegistro)
  const [peso, setPeso] = useState('')

  const records = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of historial) for (const s of r.series) if (s.hecha && s.pesoKg > 0) m.set(s.ejercicioId, Math.max(m.get(s.ejercicioId) ?? 0, s.pesoKg))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [historial])

  return (
    <Pagina titulo="Historial" subtitulo={`${historial.length} sesiones registradas`}>
      <Tarjeta>
        <p className="mb-2 text-sm font-semibold">Peso corporal</p>
        <GraficaPeso datos={pesos} />
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const n = Number(peso)
            if (n > 30 && n < 250) {
              registrarPeso(n)
              setPeso('')
            }
          }}
        >
          <input className={inputClase} type="number" inputMode="decimal" step="0.1" placeholder={perfil ? `Hoy peso… (último ${perfil.pesoKg} kg)` : 'kg'} value={peso} onChange={(e) => setPeso(e.target.value)} />
          <Boton type="submit">Registrar</Boton>
        </form>
      </Tarjeta>

      {records.length > 0 && (
        <Tarjeta className="mt-3">
          <p className="mb-2 text-sm font-semibold">Tus récords (peso máximo)</p>
          <ul className="space-y-1 text-sm">
            {records.map(([id, kg]) => (
              <li key={id} className="flex justify-between">
                <span className="text-slate-300">{ejercicioPorId(id)?.nombre ?? id}</span>
                <span className="font-semibold text-emerald-400">{kg} kg</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <div className="mt-3 space-y-2">
        {historial.length === 0 && <p className="text-sm text-slate-400">Todavía no has guardado ninguna sesión. Al terminar tu entrenamiento toca "Terminar y guardar".</p>}
        {historial.map((r) => (
          <Tarjeta key={r.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.sesionNombre}</p>
                <p className="text-xs text-slate-400">
                  {new Date(r.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} · {r.series.length} series
                  {r.duracionMin ? ` · ${r.duracionMin} min` : ''}
                </p>
              </div>
              <button type="button" onClick={() => borrarRegistro(r.id)} className="text-xs text-slate-500 underline">
                Borrar
              </button>
            </div>
          </Tarjeta>
        ))}
      </div>
    </Pagina>
  )
}

function GraficaPeso({ datos }: { datos: { fecha: string; pesoKg: number }[] }) {
  if (datos.length < 2) {
    return <p className="text-xs text-slate-500">Registra tu peso varias veces para ver la tendencia.{datos[0] ? ` Último: ${datos[0].pesoKg} kg.` : ''}</p>
  }
  const w = 320
  const h = 90
  const pad = 6
  const ys = datos.map((d) => d.pesoKg)
  const min = Math.min(...ys) - 1
  const max = Math.max(...ys) + 1
  const pts = datos.map((d, i) => {
    const x = pad + (i / (datos.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (d.pesoKg - min) / (max - min)) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label="Gráfica de peso corporal">
        <polyline points={pts.join(' ')} fill="none" stroke="#22c55e" strokeWidth="2" />
        {pts.map((p, i) => {
          const [x, y] = p.split(',').map(Number)
          return <circle key={i} cx={x} cy={y} r="3" fill="#22c55e" />
        })}
      </svg>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{datos[0].fecha}</span>
        <span>{datos.at(-1)!.pesoKg} kg</span>
      </div>
    </div>
  )
}
