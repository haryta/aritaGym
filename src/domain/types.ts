export type Nivel = 'principiante' | 'intermedio' | 'avanzado'
export type Objetivo = 'perder_grasa' | 'ganar_musculo' | 'mantener' | 'fuerza'
export type Sexo = 'M' | 'F'
export type Dia = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom'

export const DIAS: Dia[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
export const NOMBRE_DIA: Record<Dia, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miércoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sábado',
  dom: 'Domingo',
}

export interface Perfil {
  nombre: string
  edad: number
  sexo: Sexo
  pesoKg: number
  estaturaCm: number
  nivel: Nivel
  objetivo: Objetivo
}

export type GrupoMuscular =
  | 'pecho'
  | 'espalda'
  | 'hombro'
  | 'biceps'
  | 'triceps'
  | 'cuadriceps'
  | 'isquios'
  | 'gluteo'
  | 'gemelo'
  | 'core'
  | 'cardio'

export type Patron =
  | 'empuje_h'
  | 'empuje_v'
  | 'jalon_h'
  | 'jalon_v'
  | 'sentadilla'
  | 'bisagra'
  | 'unilateral'
  | 'aislamiento'
  | 'core'
  | 'cardio'

export interface Ejercicio {
  id: string
  nombre: string
  nombreEn: string
  maquina: string
  grupoPrincipal: GrupoMuscular
  gruposSecundarios: GrupoMuscular[]
  patron: Patron
  nivelMinimo: Nivel
  /** ID del video de YouTube (en español). Si falta, se ofrece búsqueda. */
  youtubeId?: string
  pasos: string[]
  erroresComunes: string[]
}

export interface EjercicioPlanificado {
  ejercicioId: string
  series: number
  repsMin: number
  repsMax: number
  descansoSeg: number
  /** Para cardio: minutos en lugar de reps. */
  minutos?: number
}

export interface Sesion {
  id: string
  nombre: string
  descripcion: string
  ejercicios: EjercicioPlanificado[]
}

export type TipoPlan = 'full_body' | 'upper_lower' | 'ppl' | 'ppl_ul'

export interface PlanSemanal {
  tipo: TipoPlan
  nombre: string
  descripcion: string
  asignacion: Partial<Record<Dia, Sesion>>
  avisos: string[]
}

export interface SerieRegistrada {
  ejercicioId: string
  serie: number
  pesoKg: number
  reps: number
  hecha: boolean
}

export interface RegistroSesion {
  id: string
  fecha: string
  sesionId: string
  sesionNombre: string
  series: SerieRegistrada[]
  duracionMin?: number
}

export interface RegistroPeso {
  fecha: string
  pesoKg: number
}
