import { Link } from 'react-router-dom'
import { useApp, diaDeHoy } from '../store/app'
import { DIAS, NOMBRE_DIA, type Dia } from '../domain/types'
import { ejercicioPorId } from '../data/ejercicios'
import { Boton, Etiqueta, Pagina, Tarjeta } from '../components/ui'

export function PlanPage() {
  const plan = useApp((s) => s.plan)
  const perfil = useApp((s) => s.perfil)
  const dias = useApp((s) => s.dias)
  const regenerar = useApp((s) => s.regenerarPlan)
  const excluidos = useApp((s) => s.excluidos)
  const restaurar = useApp((s) => s.restaurarEjercicio)
  const hoy = diaDeHoy()

  if (!perfil) {
    return (
      <Pagina titulo="Mi plan">
        <Tarjeta>
          <p className="text-sm text-slate-300">Aún no tienes perfil.</p>
          <Link to="/perfil" className="mt-3 block text-emerald-400">Crear mi perfil →</Link>
        </Tarjeta>
      </Pagina>
    )
  }
  if (!plan) {
    return (
      <Pagina titulo="Mi plan">
        <Tarjeta>
          <p className="text-sm text-slate-300">Elige al menos 2 días para generar tu plan.</p>
          <Link to="/dias" className="mt-3 block text-emerald-400">Elegir días →</Link>
        </Tarjeta>
      </Pagina>
    )
  }

  const diasOrdenados = DIAS.filter((d) => dias.includes(d))

  return (
    <Pagina
      titulo={plan.nombre}
      subtitulo={plan.descripcion}
      accion={
        <Boton variante="secundario" onClick={regenerar}>
          Regenerar
        </Boton>
      }
    >
      {plan.avisos.length > 0 && (
        <Tarjeta className="mb-4 border-l-4 border-amber-400">
          <ul className="space-y-1 text-sm text-amber-100">
            {plan.avisos.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <div className="space-y-3">
        {diasOrdenados.map((d) => (
          <DiaCard key={d} dia={d} esHoy={d === hoy} />
        ))}
      </div>

      {excluidos.length > 0 && (
        <Tarjeta className="mt-4">
          <p className="mb-2 text-sm font-semibold">Ejercicios que excluiste</p>
          <div className="flex flex-wrap gap-2">
            {excluidos.map((id) => (
              <button key={id} type="button" onClick={() => restaurar(id)} className="rounded-full bg-slate-700 px-3 py-1 text-xs">
                {ejercicioPorId(id)?.nombre ?? id} ✕
              </button>
            ))}
          </div>
        </Tarjeta>
      )}
    </Pagina>
  )
}

function DiaCard({ dia, esHoy }: { dia: Dia; esHoy: boolean }) {
  const sesion = useApp((s) => s.plan?.asignacion[dia])
  if (!sesion) return null
  return (
    <Link to={`/sesion/${dia}`} className="block">
      <Tarjeta className={esHoy ? 'ring-emerald-500' : ''}>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg font-bold">{NOMBRE_DIA[dia]}</span>
          {esHoy && <Etiqueta>Hoy</Etiqueta>}
          <span className="ml-auto text-sm text-emerald-400">{sesion.nombre}</span>
        </div>
        <ul className="space-y-1 text-sm text-slate-300">
          {sesion.ejercicios.map((e, i) => {
            const ej = ejercicioPorId(e.ejercicioId)
            return (
              <li key={i} className="flex justify-between gap-2">
                <span className="truncate">{ej?.nombre ?? e.ejercicioId}</span>
                <span className="shrink-0 text-slate-500">{e.minutos ? `${e.minutos} min` : `${e.series}×${e.repsMin}-${e.repsMax}`}</span>
              </li>
            )
          })}
        </ul>
      </Tarjeta>
    </Link>
  )
}
