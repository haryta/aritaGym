import { EJERCICIOS, ejercicioPorId } from '../data/ejercicios'
import {
  CARDIO,
  FULL_BODY_A,
  FULL_BODY_B,
  FULL_BODY_C,
  LEGS,
  PIERNA,
  PIERNA_B,
  PULL,
  PUSH,
  TORSO,
  TORSO_B,
  dosisPorObjetivo,
  type PlantillaSesion,
  type Slot,
} from '../data/plantillas'
import { categoriaImc, imc } from './calculos'
import type { Dia, Ejercicio, EjercicioPlanificado, Nivel, Perfil, PlanSemanal, Sesion, TipoPlan } from './types'
import { DIAS } from './types'

const ORDEN_NIVEL: Record<Nivel, number> = { principiante: 0, intermedio: 1, avanzado: 2 }

export interface OpcionesPlan {
  /** Ejercicios que el usuario no quiere/no puede hacer. */
  excluidos?: string[]
}

/** Devuelve el tipo de plan según cuántos días se entrena. */
export function tipoPlanPorDias(n: number): TipoPlan {
  if (n <= 3) return 'full_body'
  if (n === 4) return 'upper_lower'
  if (n === 5) return 'ppl_ul'
  return 'ppl'
}

export const NOMBRE_PLAN: Record<TipoPlan, { nombre: string; descripcion: string }> = {
  full_body: {
    nombre: 'Cuerpo completo',
    descripcion: 'Trabajas todo el cuerpo en cada sesión. Ideal para 2 o 3 días: máxima frecuencia por músculo.',
  },
  upper_lower: {
    nombre: 'Torso / Pierna',
    descripcion: 'Alternas días de torso y pierna. Con 4 días cada músculo se entrena dos veces por semana.',
  },
  ppl_ul: {
    nombre: 'Empuje / Jalón / Pierna + Torso / Pierna',
    descripcion: 'Cinco días: tres de división por movimiento y dos de torso/pierna para repetir frecuencia.',
  },
  ppl: {
    nombre: 'Empuje / Jalón / Pierna ×2',
    descripcion: 'Seis días: el clásico Push/Pull/Legs dos veces por semana. Para nivel intermedio o avanzado.',
  },
}

function plantillasPara(tipo: TipoPlan, n: number): PlantillaSesion[] {
  switch (tipo) {
    case 'full_body':
      return n === 2 ? [FULL_BODY_A, FULL_BODY_B] : [FULL_BODY_A, FULL_BODY_B, FULL_BODY_C]
    case 'upper_lower':
      return [TORSO, PIERNA, TORSO_B, PIERNA_B]
    case 'ppl_ul':
      return [PUSH, PULL, LEGS, TORSO, PIERNA]
    case 'ppl':
      return [PUSH, PULL, LEGS, PUSH, PULL, LEGS]
  }
}

/** ¿Un ejercicio es apto para este perfil? */
function apto(e: Ejercicio, perfil: Perfil, bajoImpacto: boolean, excluidos: Set<string>): boolean {
  if (excluidos.has(e.id)) return false
  if (ORDEN_NIVEL[e.nivelMinimo] > ORDEN_NIVEL[perfil.nivel]) return false
  if (bajoImpacto && ['peso-muerto', 'sentadilla-barra', 'dominadas', 'fondos-paralelas'].includes(e.id)) return false
  return true
}

function elegirEjercicio(slot: Slot, perfil: Perfil, bajoImpacto: boolean, excluidos: Set<string>, usados: Set<string>): Ejercicio | undefined {
  const preferidos = slot.preferidos[perfil.nivel] ?? slot.preferidos.principiante ?? []
  for (const id of preferidos) {
    const e = ejercicioPorId(id)
    if (e && !usados.has(id) && apto(e, perfil, bajoImpacto, excluidos)) return e
  }
  // Respaldo: cualquier ejercicio del mismo patrón y grupo.
  return EJERCICIOS.find(
    (e) =>
      e.patron === slot.patron &&
      (!slot.grupo || e.grupoPrincipal === slot.grupo) &&
      !usados.has(e.id) &&
      apto(e, perfil, bajoImpacto, excluidos),
  )
}

export function construirSesion(plantilla: PlantillaSesion, perfil: Perfil, opciones: OpcionesPlan = {}, bajoImpacto = false): Sesion {
  const excluidos = new Set(opciones.excluidos ?? [])
  const usados = new Set<string>()
  const ejercicios: EjercicioPlanificado[] = []

  let slots = plantilla.slots
  // Principiantes: menos volumen por sesión (máximo 5 ejercicios).
  if (perfil.nivel === 'principiante') slots = slots.slice(0, 5)

  for (const slot of slots) {
    const e = elegirEjercicio(slot, perfil, bajoImpacto, excluidos, usados)
    if (!e) continue
    usados.add(e.id)
    const d = dosisPorObjetivo(perfil.objetivo, slot.tipo, perfil.nivel)
    ejercicios.push({ ejercicioId: e.id, ...d })
  }

  if (perfil.objetivo === 'perder_grasa') {
    const cardio = elegirEjercicio(CARDIO, perfil, bajoImpacto, excluidos, usados)
    if (cardio) ejercicios.push({ ejercicioId: cardio.id, series: 1, repsMin: 0, repsMax: 0, descansoSeg: 0, minutos: 15 })
  }

  return { id: plantilla.id, nombre: plantilla.nombre, descripcion: plantilla.descripcion, ejercicios }
}

/**
 * Asigna sesiones a los días elegidos, intentando que dos sesiones de pierna
 * no caigan en días consecutivos.
 */
export function asignarSesiones(dias: Dia[], sesiones: Sesion[]): Partial<Record<Dia, Sesion>> {
  const ordenados = [...dias].sort((a, b) => DIAS.indexOf(a) - DIAS.indexOf(b))
  const esPierna = (s: Sesion) => /pierna|legs/i.test(s.nombre)
  const restantes = [...sesiones]
  const resultado: Partial<Record<Dia, Sesion>> = {}
  let anterior: Sesion | undefined
  let diaAnterior: Dia | undefined

  for (const dia of ordenados) {
    const consecutivo = diaAnterior !== undefined && DIAS.indexOf(dia) - DIAS.indexOf(diaAnterior) === 1
    let idx = 0
    if (consecutivo && anterior && esPierna(anterior)) {
      const alternativa = restantes.findIndex((s) => !esPierna(s))
      if (alternativa >= 0) idx = alternativa
    }
    const sesion = restantes.splice(idx, 1)[0]
    if (!sesion) break
    resultado[dia] = sesion
    anterior = sesion
    diaAnterior = dia
  }
  return resultado
}

export function generarPlan(perfil: Perfil, dias: Dia[], opciones: OpcionesPlan = {}): PlanSemanal {
  const n = Math.min(Math.max(dias.length, 2), 6)
  let tipo = tipoPlanPorDias(n)
  const avisos: string[] = []

  // Principiantes no deberían hacer PPL x2; se les baja a torso/pierna + full body.
  if (tipo === 'ppl' && perfil.nivel === 'principiante') {
    tipo = 'ppl_ul'
    avisos.push('Como estás empezando, con 6 días te sugerimos 5 sesiones y un día extra de descanso o cardio suave.')
  }

  const valorImc = imc(perfil.pesoKg, perfil.estaturaCm)
  const bajoImpacto = perfil.edad >= 50 || categoriaImc(valorImc) === 'obesidad'
  if (bajoImpacto) {
    avisos.push(
      'Se priorizaron máquinas y ejercicios de bajo impacto. Si tienes alguna condición médica, consulta a tu médico antes de empezar.',
    )
  }
  if (perfil.objetivo === 'perder_grasa') {
    avisos.push('Cada sesión termina con 15 minutos de cardio. Lo más importante para perder grasa es la constancia y la alimentación.')
  }

  const plantillas = plantillasPara(tipo, n)
  const sesiones = plantillas.map((p) => construirSesion(p, perfil, opciones, bajoImpacto))
  const asignacion = asignarSesiones(dias, sesiones)
  const meta = NOMBRE_PLAN[tipo]

  return { tipo, nombre: meta.nombre, descripcion: meta.descripcion, asignacion, avisos }
}

/** Alternativas para sustituir un ejercicio (mismo patrón y grupo). */
export function alternativas(ejercicioId: string, perfil: Perfil): Ejercicio[] {
  const base = ejercicioPorId(ejercicioId)
  if (!base) return []
  return EJERCICIOS.filter(
    (e) =>
      e.id !== base.id &&
      e.patron === base.patron &&
      (e.grupoPrincipal === base.grupoPrincipal || e.gruposSecundarios.includes(base.grupoPrincipal)) &&
      ORDEN_NIVEL[e.nivelMinimo] <= ORDEN_NIVEL[perfil.nivel] + 1,
  )
}
