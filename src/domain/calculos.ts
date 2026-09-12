import type { Objetivo, Perfil } from './types'

export function imc(pesoKg: number, estaturaCm: number): number {
  const m = estaturaCm / 100
  if (m <= 0) return 0
  return round1(pesoKg / (m * m))
}

export type CategoriaImc = 'bajo_peso' | 'normal' | 'sobrepeso' | 'obesidad'

export function categoriaImc(valor: number): CategoriaImc {
  if (valor < 18.5) return 'bajo_peso'
  if (valor < 25) return 'normal'
  if (valor < 30) return 'sobrepeso'
  return 'obesidad'
}

export const NOMBRE_CATEGORIA_IMC: Record<CategoriaImc, string> = {
  bajo_peso: 'Bajo peso',
  normal: 'Normal',
  sobrepeso: 'Sobrepeso',
  obesidad: 'Obesidad',
}

/** Tasa metabólica basal, fórmula Mifflin-St Jeor. */
export function tmb(p: Pick<Perfil, 'pesoKg' | 'estaturaCm' | 'edad' | 'sexo'>): number {
  const base = 10 * p.pesoKg + 6.25 * p.estaturaCm - 5 * p.edad
  return Math.round(p.sexo === 'M' ? base + 5 : base - 161)
}

/** Factor de actividad según días de gym por semana. */
export function factorActividad(diasPorSemana: number): number {
  if (diasPorSemana <= 1) return 1.2
  if (diasPorSemana <= 3) return 1.375
  if (diasPorSemana <= 5) return 1.55
  return 1.725
}

export function caloriasMantenimiento(p: Perfil, diasPorSemana: number): number {
  return Math.round(tmb(p) * factorActividad(diasPorSemana))
}

export function caloriasObjetivo(mantenimiento: number, objetivo: Objetivo): number {
  switch (objetivo) {
    case 'perder_grasa':
      return Math.round(mantenimiento * 0.8)
    case 'ganar_musculo':
      return Math.round(mantenimiento * 1.1)
    case 'fuerza':
      return Math.round(mantenimiento * 1.05)
    case 'mantener':
      return mantenimiento
  }
}

/** Proteína diaria sugerida (g) — 1.6 a 2.2 g/kg según objetivo. */
export function proteinaSugerida(pesoKg: number, objetivo: Objetivo): number {
  const factor = objetivo === 'perder_grasa' ? 2.0 : objetivo === 'ganar_musculo' ? 1.8 : 1.6
  return Math.round(pesoKg * factor)
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
