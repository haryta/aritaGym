import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/app'
import { NOMBRE_DIA, type Dia, type SerieRegistrada } from '../domain/types'
import { ejercicioPorId } from '../data/ejercicios'
import { alternativas } from '../domain/recomendador'
import { VideoYoutube } from '../components/VideoYoutube'
import { Cronometro } from '../components/Cronometro'
import { Boton, Etiqueta, Pagina, Tarjeta, inputClase } from '../components/ui'

export function SesionPage() {
  const { dia } = useParams<{ dia: Dia }>()
  const sesion = useApp((s) => (dia ? s.plan?.asignacion[dia] : undefined))
  const perfil = useApp((s) => s.perfil)
  const historial = useApp((s) => s.historial)
  const guardarRegistro = useApp((s) => s.guardarRegistro)
  const sustituir = useApp((s) => s.sustituirEjercicio)
  const excluir = useApp((s) => s.excluirEjercicio)
  const navigate = useNavigate()

  const [inicio] = useState(() => Date.now())
  const minutos = useMinutosTranscurridos(inicio)
  const [descanso, setDescanso] = useState<{ seg: number; n: number } | null>(null)
  const iniciarDescanso = (seg: number) => setDescanso((d) => ({ seg, n: (d?.n ?? 0) + 1 }))
  const [series, setSeries] = useState<Record<string, SerieRegistrada>>({})
  const [abierto, setAbierto] = useState<number | null>(0)

  /** Último peso usado por ejercicio, para precargar. */
  const ultimoPeso = useMemo(() => {
    const m: Record<string, number> = {}
    for (const r of historial) for (const s of r.series) if (s.hecha && !(s.ejercicioId in m)) m[s.ejercicioId] = s.pesoKg
    return m
  }, [historial])

  if (!dia || !sesion || !perfil) {
    return (
      <Pagina titulo="Sesión">
        <Tarjeta>
          <p className="text-sm text-slate-300">No hay sesión para este día.</p>
          <Link to="/plan" className="mt-3 block text-emerald-400">Ir a mi plan →</Link>
        </Tarjeta>
      </Pagina>
    )
  }

  const clave = (ejId: string, i: number, n: number) => `${ejId}#${i}#${n}`
  const getSerie = (ejId: string, i: number, n: number): SerieRegistrada =>
    series[clave(ejId, i, n)] ?? { ejercicioId: ejId, serie: n, pesoKg: ultimoPeso[ejId] ?? 0, reps: 0, hecha: false }
  const setSerie = (ejId: string, i: number, n: number, patch: Partial<SerieRegistrada>) =>
    setSeries((s) => ({ ...s, [clave(ejId, i, n)]: { ...getSerie(ejId, i, n), ...patch } }))

  const totalSeries = sesion.ejercicios.reduce((a, e) => a + (e.minutos ? 1 : e.series), 0)
  const hechas = Object.values(series).filter((s) => s.hecha).length

  const terminar = () => {
    guardarRegistro({
      id: `${Date.now()}`,
      fecha: new Date().toISOString(),
      sesionId: sesion.id,
      sesionNombre: sesion.nombre,
      series: Object.values(series).filter((s) => s.hecha),
      duracionMin: Math.max(1, Math.round((Date.now() - inicio) / 60000)),
    })
    navigate('/historial')
  }

  return (
    <Pagina titulo={sesion.nombre} subtitulo={`${NOMBRE_DIA[dia]} · ${sesion.descripcion}`}>
      <div className="sticky top-0 z-10 -mx-4 mb-3 bg-slate-900/95 px-4 py-2 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>
            {hechas} / {totalSeries} series
          </span>
          <span>{minutos} min</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(hechas / Math.max(totalSeries, 1)) * 100}%` }} />
        </div>
        {descanso && (
          <div className="mt-2">
            <Cronometro key={descanso.n} segundos={descanso.seg} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sesion.ejercicios.map((ep, i) => {
          const ej = ejercicioPorId(ep.ejercicioId)
          if (!ej) return null
          const estaAbierto = abierto === i
          return (
            <Tarjeta key={`${ep.ejercicioId}-${i}`}>
              <button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => setAbierto(estaAbierto ? null : i)}>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{ej.nombre}</span>
                  <span className="block text-xs text-slate-400">
                    {ej.maquina} · <span className="italic">{ej.nombreEn}</span>
                  </span>
                </span>
                <span className="shrink-0 text-sm text-emerald-400">
                  {ep.minutos ? `${ep.minutos} min` : `${ep.series}×${ep.repsMin}-${ep.repsMax}`}
                </span>
              </button>

              {estaAbierto && (
                <div className="mt-3 space-y-3">
                  <VideoYoutube ejercicio={ej} />

                  <details className="rounded-xl bg-slate-900 p-3 text-sm">
                    <summary className="cursor-pointer font-semibold">Cómo se hace</summary>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-300">
                      {ej.pasos.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ol>
                    {ej.erroresComunes.length > 0 && (
                      <p className="mt-2 text-xs text-amber-300">Evita: {ej.erroresComunes.join(' · ')}</p>
                    )}
                  </details>

                  {ep.minutos ? (
                    <label className="flex items-center gap-3 rounded-xl bg-slate-900 p-3 text-sm">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-emerald-500"
                        checked={getSerie(ej.id, i, 1).hecha}
                        onChange={(e) => setSerie(ej.id, i, 1, { hecha: e.target.checked, reps: ep.minutos })}
                      />
                      Hice {ep.minutos} minutos de {ej.nombre.toLowerCase()}
                    </label>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 text-xs text-slate-400">
                        <span>#</span>
                        <span>Peso (kg)</span>
                        <span>Reps</span>
                        <span>✓</span>
                      </div>
                      {Array.from({ length: ep.series }, (_, k) => k + 1).map((n) => {
                        const s = getSerie(ej.id, i, n)
                        return (
                          <div key={n} className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2">
                            <span className="text-sm text-slate-400">{n}</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.5"
                              className={inputClase}
                              value={s.pesoKg || ''}
                              placeholder="0"
                              onChange={(e) => setSerie(ej.id, i, n, { pesoKg: Number(e.target.value) })}
                            />
                            <input
                              type="number"
                              inputMode="numeric"
                              className={inputClase}
                              value={s.reps || ''}
                              placeholder={`${ep.repsMin}-${ep.repsMax}`}
                              onChange={(e) => setSerie(ej.id, i, n, { reps: Number(e.target.value) })}
                            />
                            <input
                              type="checkbox"
                              className="h-6 w-6 accent-emerald-500"
                              checked={s.hecha}
                              onChange={(e) => {
                                setSerie(ej.id, i, n, { hecha: e.target.checked, reps: s.reps || ep.repsMax })
                                if (e.target.checked) iniciarDescanso(ep.descansoSeg)
                              }}
                            />
                          </div>
                        )
                      })}
                      <p className="text-xs text-slate-500">Descanso sugerido: {ep.descansoSeg} s</p>
                    </div>
                  )}

                  <Alternativas
                    ejercicioId={ej.id}
                    onElegir={(nuevo) => sustituir(dia, i, nuevo)}
                    onExcluir={() => excluir(ej.id)}
                  />
                </div>
              )}
            </Tarjeta>
          )
        })}
      </div>

      <Boton className="mt-5 w-full" onClick={terminar} disabled={hechas === 0}>
        Terminar y guardar sesión
      </Boton>
    </Pagina>
  )
}

function Alternativas({ ejercicioId, onElegir, onExcluir }: { ejercicioId: string; onElegir: (id: string) => void; onExcluir: () => void }) {
  const perfil = useApp((s) => s.perfil)!
  const [ver, setVer] = useState(false)
  const alts = alternativas(ejercicioId, perfil)
  return (
    <div className="rounded-xl bg-slate-900 p-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setVer((v) => !v)} className="text-emerald-400">
          {ver ? 'Ocultar alternativas' : '¿Máquina ocupada? Cambiar ejercicio'}
        </button>
        <button type="button" onClick={onExcluir} className="ml-auto text-xs text-slate-400 underline">
          No puedo hacer este
        </button>
      </div>
      {ver && (
        <div className="mt-2 flex flex-wrap gap-2">
          {alts.length === 0 && <span className="text-xs text-slate-500">Sin alternativas en el catálogo.</span>}
          {alts.map((a) => (
            <button key={a.id} type="button" onClick={() => onElegir(a.id)} className="rounded-full bg-slate-700 px-3 py-1 text-xs">
              {a.nombre} <Etiqueta>{a.maquina.split(' ')[0]}</Etiqueta>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Minutos transcurridos desde `inicio`, actualizados cada 30 s. */
function useMinutosTranscurridos(inicio: number): number {
  const [min, setMin] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setMin(Math.round((Date.now() - inicio) / 60000)), 30000)
    return () => window.clearInterval(id)
  }, [inicio])
  return min
}
