import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generarPlan } from '../domain/recomendador'
import type { Dia, Perfil, PlanSemanal, RegistroPeso, RegistroSesion } from '../domain/types'

interface AppState {
  perfil: Perfil | null
  dias: Dia[]
  excluidos: string[]
  plan: PlanSemanal | null
  historial: RegistroSesion[]
  pesos: RegistroPeso[]

  guardarPerfil: (p: Perfil) => void
  toggleDia: (d: Dia) => void
  setDias: (dias: Dia[]) => void
  regenerarPlan: () => void
  excluirEjercicio: (id: string) => void
  restaurarEjercicio: (id: string) => void
  sustituirEjercicio: (dia: Dia, indice: number, nuevoId: string) => void
  guardarRegistro: (r: RegistroSesion) => void
  borrarRegistro: (id: string) => void
  registrarPeso: (pesoKg: number) => void
  importar: (data: Partial<AppState>) => void
  reiniciar: () => void
}

const hoyIso = () => new Date().toISOString().slice(0, 10)

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      perfil: null,
      dias: [],
      excluidos: [],
      plan: null,
      historial: [],
      pesos: [],

      guardarPerfil: (p) => {
        const { pesos } = get()
        const ultimo = pesos.at(-1)
        const nuevosPesos =
          ultimo && ultimo.pesoKg === p.pesoKg ? pesos : [...pesos.filter((x) => x.fecha !== hoyIso()), { fecha: hoyIso(), pesoKg: p.pesoKg }]
        set({ perfil: p, pesos: nuevosPesos })
        get().regenerarPlan()
      },
      toggleDia: (d) => {
        const { dias } = get()
        const nuevos = dias.includes(d) ? dias.filter((x) => x !== d) : [...dias, d]
        set({ dias: nuevos })
        get().regenerarPlan()
      },
      setDias: (dias) => {
        set({ dias })
        get().regenerarPlan()
      },
      regenerarPlan: () => {
        const { perfil, dias, excluidos } = get()
        if (!perfil || dias.length < 2) {
          set({ plan: null })
          return
        }
        set({ plan: generarPlan(perfil, dias, { excluidos }) })
      },
      excluirEjercicio: (id) => {
        set({ excluidos: [...new Set([...get().excluidos, id])] })
        get().regenerarPlan()
      },
      restaurarEjercicio: (id) => {
        set({ excluidos: get().excluidos.filter((x) => x !== id) })
        get().regenerarPlan()
      },
      sustituirEjercicio: (dia, indice, nuevoId) => {
        const { plan } = get()
        const sesion = plan?.asignacion[dia]
        if (!plan || !sesion) return
        const ejercicios = sesion.ejercicios.map((e, i) => (i === indice ? { ...e, ejercicioId: nuevoId } : e))
        set({ plan: { ...plan, asignacion: { ...plan.asignacion, [dia]: { ...sesion, ejercicios } } } })
      },
      guardarRegistro: (r) => set({ historial: [r, ...get().historial] }),
      borrarRegistro: (id) => set({ historial: get().historial.filter((r) => r.id !== id) }),
      registrarPeso: (pesoKg) => {
        const { perfil, pesos } = get()
        set({
          pesos: [...pesos.filter((x) => x.fecha !== hoyIso()), { fecha: hoyIso(), pesoKg }],
          perfil: perfil ? { ...perfil, pesoKg } : perfil,
        })
      },
      importar: (data) => {
        set({
          perfil: data.perfil ?? null,
          dias: data.dias ?? [],
          excluidos: data.excluidos ?? [],
          historial: data.historial ?? [],
          pesos: data.pesos ?? [],
        })
        get().regenerarPlan()
      },
      reiniciar: () => set({ perfil: null, dias: [], excluidos: [], plan: null, historial: [], pesos: [] }),
    }),
    { name: 'coach-gym-v1' },
  ),
)

/** Día de la semana actual como clave Dia. */
export function diaDeHoy(): Dia {
  const map: Dia[] = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
  return map[new Date().getDay()]
}
