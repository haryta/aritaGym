import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useApp, diaDeHoy } from './store/app'
import { PerfilPage } from './features/PerfilPage'
import { DiasPage } from './features/DiasPage'
import { PlanPage } from './features/PlanPage'
import { SesionPage } from './features/SesionPage'
import { EjerciciosPage, EjercicioDetallePage } from './features/EjerciciosPage'
import { HistorialPage } from './features/HistorialPage'
import { AjustesPage } from './features/AjustesPage'

function Layout() {
  const tabs = [
    { to: '/plan', icono: '📅', t: 'Plan' },
    { to: '/hoy', icono: '🏋️', t: 'Hoy' },
    { to: '/ejercicios', icono: '📚', t: 'Ejercicios' },
    { to: '/historial', icono: '📈', t: 'Historial' },
    { to: '/perfil', icono: '👤', t: 'Perfil' },
  ]
  return (
    <div className="flex min-h-screen flex-col safe-top">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-900/95 backdrop-blur safe-bottom">
        <ul className="mx-auto flex max-w-2xl justify-around">
          {tabs.map((tab) => (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}
              >
                <span className="text-xl leading-none">{tab.icono}</span>
                {tab.t}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** "/hoy" redirige a la sesión de hoy, o al siguiente día con sesión. */
function Hoy() {
  const plan = useApp((s) => s.plan)
  const perfil = useApp((s) => s.perfil)
  if (!perfil) return <Navigate to="/perfil" replace />
  if (!plan) return <Navigate to="/dias" replace />
  const orden = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const
  const hoy = diaDeHoy()
  const i = orden.indexOf(hoy)
  for (let k = 0; k < 7; k++) {
    const d = orden[(i + k) % 7]
    if (plan.asignacion[d]) return <Navigate to={`/sesion/${d}`} replace />
  }
  return <Navigate to="/plan" replace />
}

function Inicio() {
  const perfil = useApp((s) => s.perfil)
  return <Navigate to={perfil ? '/plan' : '/perfil'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/dias" element={<DiasPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/hoy" element={<Hoy />} />
          <Route path="/sesion/:dia" element={<SesionPage />} />
          <Route path="/ejercicios" element={<EjerciciosPage />} />
          <Route path="/ejercicios/:id" element={<EjercicioDetallePage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/ajustes" element={<AjustesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
