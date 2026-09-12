import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EJERCICIOS, NOMBRE_GRUPO, ejercicioPorId } from '../data/ejercicios'
import type { GrupoMuscular } from '../domain/types'
import { VideoYoutube } from '../components/VideoYoutube'
import { Etiqueta, Pagina, Tarjeta, inputClase } from '../components/ui'

const GRUPOS = Object.keys(NOMBRE_GRUPO) as GrupoMuscular[]

export function EjerciciosPage() {
  const [q, setQ] = useState('')
  const [grupo, setGrupo] = useState<GrupoMuscular | 'todos'>('todos')

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return EJERCICIOS.filter(
      (e) =>
        (grupo === 'todos' || e.grupoPrincipal === grupo) &&
        (!t || e.nombre.toLowerCase().includes(t) || e.nombreEn.toLowerCase().includes(t) || e.maquina.toLowerCase().includes(t)),
    )
  }, [q, grupo])

  return (
    <Pagina titulo="Ejercicios" subtitulo={`${EJERCICIOS.length} ejercicios con video en español`}>
      <input className={inputClase} placeholder="Buscar por nombre o máquina…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip activo={grupo === 'todos'} onClick={() => setGrupo('todos')}>
          Todos
        </Chip>
        {GRUPOS.map((g) => (
          <Chip key={g} activo={grupo === g} onClick={() => setGrupo(g)}>
            {NOMBRE_GRUPO[g]}
          </Chip>
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {lista.map((e) => (
          <li key={e.id}>
            <Link to={`/ejercicios/${e.id}`} className="block">
              <Tarjeta className="flex items-center gap-3 !p-3">
                {e.youtubeId ? (
                  <img src={`https://i.ytimg.com/vi/${e.youtubeId}/default.jpg`} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded-lg bg-slate-700" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{e.nombre}</p>
                  <p className="truncate text-xs text-slate-400">{e.maquina}</p>
                  <div className="mt-1 flex gap-1">
                    <Etiqueta>{NOMBRE_GRUPO[e.grupoPrincipal]}</Etiqueta>
                    <Etiqueta>{e.nivelMinimo}</Etiqueta>
                  </div>
                </div>
              </Tarjeta>
            </Link>
          </li>
        ))}
        {lista.length === 0 && <p className="text-sm text-slate-400">No encontré ejercicios con ese filtro.</p>}
      </ul>
    </Pagina>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${activo ? 'bg-emerald-500 text-slate-900 ring-emerald-400' : 'bg-slate-800 text-slate-300 ring-slate-700'}`}
    >
      {children}
    </button>
  )
}

export function EjercicioDetallePage() {
  const { id } = useParams<{ id: string }>()
  const e = id ? ejercicioPorId(id) : undefined
  if (!e) {
    return (
      <Pagina titulo="Ejercicio">
        <p className="text-sm text-slate-400">No existe ese ejercicio.</p>
        <Link to="/ejercicios" className="text-emerald-400">← Volver</Link>
      </Pagina>
    )
  }
  return (
    <Pagina titulo={e.nombre} subtitulo={`${e.nombreEn} · ${e.maquina}`}>
      <Link to="/ejercicios" className="mb-3 block text-sm text-emerald-400">← Todos los ejercicios</Link>
      <VideoYoutube ejercicio={e} autoAbrir />
      <Tarjeta className="mt-4">
        <div className="mb-3 flex flex-wrap gap-1">
          <Etiqueta>{NOMBRE_GRUPO[e.grupoPrincipal]}</Etiqueta>
          {e.gruposSecundarios.map((g) => (
            <Etiqueta key={g}>{NOMBRE_GRUPO[g]}</Etiqueta>
          ))}
          <Etiqueta>Nivel: {e.nivelMinimo}</Etiqueta>
        </div>
        <h2 className="font-semibold">Cómo se hace</h2>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-300">
          {e.pasos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        {e.erroresComunes.length > 0 && (
          <>
            <h2 className="mt-3 font-semibold">Errores comunes</h2>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-amber-200">
              {e.erroresComunes.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </>
        )}
      </Tarjeta>
    </Pagina>
  )
}
