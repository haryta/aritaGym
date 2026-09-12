import type { Nivel, Objetivo, Patron } from '../domain/types'

/**
 * Una plantilla de sesión describe QUÉ patrones/grupos trabajar y en qué orden.
 * El recomendador convierte cada "slot" en un ejercicio concreto del catálogo
 * según el nivel del usuario (máquinas para principiantes, barra para avanzados).
 */
export interface Slot {
  /** Patrón de movimiento o grupo a cubrir. */
  patron: Patron
  /** Grupo principal deseado (afina la búsqueda dentro del patrón). */
  grupo?: string
  /** Prioridad: 'principal' (compuesto) o 'accesorio' (aislamiento). */
  tipo: 'principal' | 'accesorio'
  /** Preferencias por id, en orden, según nivel. Se toma el primero disponible. */
  preferidos: Partial<Record<Nivel, string[]>>
}

export interface PlantillaSesion {
  id: string
  nombre: string
  descripcion: string
  slots: Slot[]
}

const pref = (
  principiante: string[],
  intermedio: string[] = principiante,
  avanzado: string[] = intermedio,
): Slot['preferidos'] => ({ principiante, intermedio, avanzado })

// ---------- Slots reutilizables ----------
const EMPUJE_H_PRINCIPAL: Slot = {
  patron: 'empuje_h',
  grupo: 'pecho',
  tipo: 'principal',
  preferidos: pref(
    ['press-pecho-maquina', 'press-banca-mancuernas'],
    ['press-banca-mancuernas', 'press-banca-barra'],
    ['press-banca-barra', 'press-banca-mancuernas'],
  ),
}
const EMPUJE_H_SECUNDARIO: Slot = {
  patron: 'empuje_h',
  grupo: 'pecho',
  tipo: 'accesorio',
  preferidos: pref(
    ['aperturas-pec-deck', 'cruce-poleas'],
    ['press-inclinado-mancuernas', 'cruce-poleas'],
    ['press-inclinado-mancuernas', 'aperturas-pec-deck'],
  ),
}
const EMPUJE_V: Slot = {
  patron: 'empuje_v',
  grupo: 'hombro',
  tipo: 'principal',
  preferidos: pref(
    ['press-hombro-maquina', 'press-hombro-mancuernas'],
    ['press-hombro-mancuernas', 'press-militar-barra'],
    ['press-militar-barra', 'press-hombro-mancuernas'],
  ),
}
const JALON_V: Slot = {
  patron: 'jalon_v',
  grupo: 'espalda',
  tipo: 'principal',
  preferidos: pref(['jalon-polea-alta'], ['jalon-polea-alta', 'dominadas'], ['dominadas', 'jalon-polea-alta']),
}
const JALON_H: Slot = {
  patron: 'jalon_h',
  grupo: 'espalda',
  tipo: 'principal',
  preferidos: pref(
    ['remo-maquina', 'remo-sentado-polea'],
    ['remo-sentado-polea', 'remo-mancuerna'],
    ['remo-barra', 'remo-mancuerna'],
  ),
}
const SENTADILLA: Slot = {
  patron: 'sentadilla',
  grupo: 'cuadriceps',
  tipo: 'principal',
  preferidos: pref(
    ['prensa-pierna', 'sentadilla-goblet'],
    ['sentadilla-goblet', 'hack-squat', 'sentadilla-barra'],
    ['sentadilla-barra', 'hack-squat'],
  ),
}
const BISAGRA: Slot = {
  patron: 'bisagra',
  grupo: 'isquios',
  tipo: 'principal',
  preferidos: pref(
    ['hip-thrust', 'peso-muerto-rumano'],
    ['peso-muerto-rumano', 'hip-thrust'],
    ['peso-muerto', 'peso-muerto-rumano'],
  ),
}
const UNILATERAL: Slot = {
  patron: 'unilateral',
  grupo: 'gluteo',
  tipo: 'accesorio',
  preferidos: pref(['zancadas'], ['zancadas', 'sentadilla-bulgara'], ['sentadilla-bulgara', 'zancadas']),
}
const CUADRICEPS_AISLADO: Slot = {
  patron: 'aislamiento',
  grupo: 'cuadriceps',
  tipo: 'accesorio',
  preferidos: pref(['extension-cuadriceps']),
}
const ISQUIOS_AISLADO: Slot = {
  patron: 'aislamiento',
  grupo: 'isquios',
  tipo: 'accesorio',
  preferidos: pref(['curl-femoral-sentado', 'curl-femoral-tumbado'], ['curl-femoral-tumbado', 'curl-femoral-sentado']),
}
const GEMELOS: Slot = {
  patron: 'aislamiento',
  grupo: 'gemelo',
  tipo: 'accesorio',
  preferidos: pref(['elevacion-talones']),
}
const GLUTEO_AISLADO: Slot = {
  patron: 'aislamiento',
  grupo: 'gluteo',
  tipo: 'accesorio',
  preferidos: pref(['abductores-maquina', 'hip-thrust']),
}
const HOMBRO_LATERAL: Slot = {
  patron: 'aislamiento',
  grupo: 'hombro',
  tipo: 'accesorio',
  preferidos: pref(['elevaciones-laterales']),
}
const HOMBRO_POSTERIOR: Slot = {
  patron: 'aislamiento',
  grupo: 'hombro',
  tipo: 'accesorio',
  preferidos: pref(['face-pull', 'pajaros-mancuernas'], ['pajaros-mancuernas', 'face-pull']),
}
const BICEPS: Slot = {
  patron: 'aislamiento',
  grupo: 'biceps',
  tipo: 'accesorio',
  preferidos: pref(['curl-biceps-mancuernas', 'curl-martillo'], ['curl-biceps-barra', 'curl-martillo'], ['curl-biceps-barra', 'curl-predicador']),
}
const TRICEPS: Slot = {
  patron: 'aislamiento',
  grupo: 'triceps',
  tipo: 'accesorio',
  preferidos: pref(['extension-triceps-polea', 'fondos-banco'], ['extension-triceps-polea', 'press-frances'], ['fondos-paralelas', 'press-frances']),
}
const CORE: Slot = {
  patron: 'core',
  grupo: 'core',
  tipo: 'accesorio',
  preferidos: pref(['plancha', 'crunch-abdominal'], ['crunch-polea', 'plancha'], ['elevacion-piernas', 'crunch-polea']),
}
export const CARDIO: Slot = {
  patron: 'cardio',
  grupo: 'cardio',
  tipo: 'accesorio',
  preferidos: pref(['caminadora', 'eliptica', 'bicicleta-estatica']),
}

// ---------- Plantillas ----------
export const FULL_BODY_A: PlantillaSesion = {
  id: 'fb-a',
  nombre: 'Cuerpo completo A',
  descripcion: 'Sentadilla, empuje y jalón. Base de todo.',
  slots: [SENTADILLA, EMPUJE_H_PRINCIPAL, JALON_H, HOMBRO_LATERAL, CORE],
}
export const FULL_BODY_B: PlantillaSesion = {
  id: 'fb-b',
  nombre: 'Cuerpo completo B',
  descripcion: 'Bisagra de cadera, hombro y espalda vertical.',
  slots: [BISAGRA, EMPUJE_V, JALON_V, ISQUIOS_AISLADO, BICEPS],
}
export const FULL_BODY_C: PlantillaSesion = {
  id: 'fb-c',
  nombre: 'Cuerpo completo C',
  descripcion: 'Unilateral, pecho y brazos.',
  slots: [UNILATERAL, EMPUJE_H_SECUNDARIO, JALON_H, TRICEPS, GEMELOS],
}
export const TORSO: PlantillaSesion = {
  id: 'torso',
  nombre: 'Torso',
  descripcion: 'Pecho, espalda, hombro y brazos.',
  slots: [EMPUJE_H_PRINCIPAL, JALON_H, EMPUJE_V, JALON_V, HOMBRO_LATERAL, BICEPS, TRICEPS],
}
export const TORSO_B: PlantillaSesion = {
  id: 'torso-b',
  nombre: 'Torso B',
  descripcion: 'Variación con énfasis en espalda y hombro posterior.',
  slots: [JALON_V, EMPUJE_H_SECUNDARIO, JALON_H, EMPUJE_V, HOMBRO_POSTERIOR, TRICEPS, BICEPS],
}
export const PIERNA: PlantillaSesion = {
  id: 'pierna',
  nombre: 'Pierna',
  descripcion: 'Cuádriceps, isquios, glúteo y gemelo.',
  slots: [SENTADILLA, BISAGRA, UNILATERAL, CUADRICEPS_AISLADO, ISQUIOS_AISLADO, GEMELOS, CORE],
}
export const PIERNA_B: PlantillaSesion = {
  id: 'pierna-b',
  nombre: 'Pierna B',
  descripcion: 'Énfasis en glúteo e isquios.',
  slots: [BISAGRA, SENTADILLA, GLUTEO_AISLADO, ISQUIOS_AISLADO, UNILATERAL, GEMELOS, CORE],
}
export const PUSH: PlantillaSesion = {
  id: 'push',
  nombre: 'Empuje (Push)',
  descripcion: 'Pecho, hombro y tríceps.',
  slots: [EMPUJE_H_PRINCIPAL, EMPUJE_V, EMPUJE_H_SECUNDARIO, HOMBRO_LATERAL, TRICEPS, CORE],
}
export const PULL: PlantillaSesion = {
  id: 'pull',
  nombre: 'Jalón (Pull)',
  descripcion: 'Espalda, hombro posterior y bíceps.',
  slots: [JALON_V, JALON_H, { ...JALON_H, preferidos: pref(['remo-mancuerna', 'pull-over-polea'], ['remo-mancuerna', 'pull-over-polea'], ['remo-mancuerna', 'pull-over-polea']) }, HOMBRO_POSTERIOR, BICEPS, { ...BICEPS, preferidos: pref(['curl-martillo']) }],
}
export const LEGS: PlantillaSesion = {
  id: 'legs',
  nombre: 'Pierna (Legs)',
  descripcion: 'Cuádriceps, isquios, glúteo y gemelo.',
  slots: [SENTADILLA, BISAGRA, UNILATERAL, CUADRICEPS_AISLADO, ISQUIOS_AISLADO, GEMELOS],
}

/** Parámetros de series/reps/descanso por objetivo. */
export interface Dosis {
  series: number
  repsMin: number
  repsMax: number
  descansoSeg: number
}
export function dosisPorObjetivo(objetivo: Objetivo, tipo: Slot['tipo'], nivel: Nivel): Dosis {
  const seriesBase = nivel === 'principiante' ? 3 : tipo === 'principal' ? 4 : 3
  switch (objetivo) {
    case 'fuerza':
      return tipo === 'principal'
        ? { series: nivel === 'principiante' ? 3 : 5, repsMin: 4, repsMax: 6, descansoSeg: 150 }
        : { series: 3, repsMin: 8, repsMax: 10, descansoSeg: 90 }
    case 'ganar_musculo':
      return { series: seriesBase, repsMin: 8, repsMax: 12, descansoSeg: tipo === 'principal' ? 90 : 60 }
    case 'perder_grasa':
      return { series: seriesBase, repsMin: 12, repsMax: 15, descansoSeg: 45 }
    case 'mantener':
      return { series: 3, repsMin: 10, repsMax: 12, descansoSeg: 60 }
  }
}
