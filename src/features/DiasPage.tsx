import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/app'
import { DIAS, NOMBRE_DIA } from '../domain/types'
import { NOMBRE_PLAN, tipoPlanPorDias } from '../domain/recomendador'
import { Boton, Pagina, Tarjeta } from '../components/ui'

export function DiasPage() {
  const dias = useApp((s) => s.dias)
  const toggleDia = useApp((s) => s.toggleDia)
  const perfil = useApp((s) => s.perfil)
  const navigate = useNavigate()

  const n = dias.length
  const tipo = n >= 2 ? tipoPlanPorDias(Math.min(n, 6)) : null

  return (
    <Pagina titulo="¿Qué días vas al gym?" subtitulo="Elige entre 2 y 6 días. Puedes cambiarlos cuando quieras.">
      <div className="grid grid-cols-7 gap-1.5">
        {DIAS.map((d) => {
          const activo = dias.includes(d)
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggleDia(d)}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold ring-1 transition ${
                activo ? 'bg-emerald-500 text-slate-900 ring-emerald-400' : 'bg-slate-800 text-slate-300 ring-slate-700'
              }`}
              aria-pressed={activo}
            >
              {NOMBRE_DIA[d].slice(0, 3)}
            </button>
          )
        })}
      </div>

      <Tarjeta className="mt-4">
        {n < 2 && <p className="text-sm text-slate-400">Selecciona al menos 2 días para recomendarte un plan.</p>}
        {n > 6 && <p className="text-sm text-amber-400">Entrenar los 7 días no deja descanso. Te recomendamos máximo 6.</p>}
        {tipo && n <= 6 && (
          <>
            <p className="text-xs uppercase tracking-wide text-emerald-400">Con {n} días te recomiendo</p>
            <p className="text-xl font-bold">{NOMBRE_PLAN[tipo].nombre}</p>
            <p className="mt-1 text-sm text-slate-300">{NOMBRE_PLAN[tipo].descripcion}</p>
          </>
        )}
      </Tarjeta>

      {!perfil && (
        <p className="mt-4 text-sm text-amber-400">
          Primero completa tu perfil para que el plan se ajuste a tu nivel y objetivo.
        </p>
      )}

      <Boton className="mt-4 w-full" disabled={n < 2 || n > 6 || !perfil} onClick={() => navigate('/plan')}>
        Ver mi plan
      </Boton>
    </Pagina>
  )
}
