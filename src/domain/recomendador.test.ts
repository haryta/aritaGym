import { describe, expect, it } from 'vitest'
import { ejercicioPorId } from '../data/ejercicios'
import { alternativas, asignarSesiones, generarPlan, tipoPlanPorDias } from './recomendador'
import type { Perfil, Sesion } from './types'

const base: Perfil = {
  nombre: 'Ana',
  edad: 28,
  sexo: 'F',
  pesoKg: 62,
  estaturaCm: 165,
  nivel: 'intermedio',
  objetivo: 'ganar_musculo',
}

describe('tipoPlanPorDias', () => {
  it('mapea días a tipo de plan', () => {
    expect(tipoPlanPorDias(2)).toBe('full_body')
    expect(tipoPlanPorDias(3)).toBe('full_body')
    expect(tipoPlanPorDias(4)).toBe('upper_lower')
    expect(tipoPlanPorDias(5)).toBe('ppl_ul')
    expect(tipoPlanPorDias(6)).toBe('ppl')
  })
})

describe('generarPlan', () => {
  it('asigna una sesión a cada día elegido', () => {
    const plan = generarPlan(base, ['lun', 'mie', 'vie'])
    expect(plan.tipo).toBe('full_body')
    expect(Object.keys(plan.asignacion)).toEqual(['lun', 'mie', 'vie'])
    for (const s of Object.values(plan.asignacion)) {
      expect(s!.ejercicios.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('todos los ejercicios existen en el catálogo', () => {
    const plan = generarPlan(base, ['lun', 'mar', 'jue', 'vie', 'sab', 'dom'])
    for (const s of Object.values(plan.asignacion)) {
      for (const e of s!.ejercicios) expect(ejercicioPorId(e.ejercicioId)).toBeDefined()
    }
  })

  it('principiante tiene máximo 5 ejercicios y usa máquinas', () => {
    const plan = generarPlan({ ...base, nivel: 'principiante' }, ['lun', 'mie', 'vie', 'sab'])
    const torso = plan.asignacion.lun!
    expect(torso.ejercicios.length).toBeLessThanOrEqual(5)
    const ids = Object.values(plan.asignacion).flatMap((s) => s!.ejercicios.map((e) => e.ejercicioId))
    expect(ids).not.toContain('sentadilla-barra')
    expect(ids).not.toContain('peso-muerto')
  })

  it('principiante con 6 días recibe aviso y plan de 5 sesiones', () => {
    const plan = generarPlan({ ...base, nivel: 'principiante' }, ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'])
    expect(plan.tipo).toBe('ppl_ul')
    expect(plan.avisos.length).toBeGreaterThan(0)
    expect(Object.keys(plan.asignacion)).toHaveLength(5)
  })

  it('objetivo fuerza usa rangos bajos en compuestos', () => {
    const plan = generarPlan({ ...base, nivel: 'avanzado', objetivo: 'fuerza' }, ['lun', 'jue'])
    const primero = plan.asignacion.lun!.ejercicios[0]
    expect(primero.repsMax).toBeLessThanOrEqual(6)
    expect(primero.descansoSeg).toBeGreaterThanOrEqual(120)
  })

  it('objetivo perder grasa agrega cardio al final', () => {
    const plan = generarPlan({ ...base, objetivo: 'perder_grasa' }, ['lun', 'mie'])
    const ultimo = plan.asignacion.lun!.ejercicios.at(-1)!
    expect(ultimo.minutos).toBe(15)
    expect(ejercicioPorId(ultimo.ejercicioId)!.patron).toBe('cardio')
  })

  it('edad 50+ evita peso muerto y sentadilla con barra', () => {
    const plan = generarPlan({ ...base, edad: 55, nivel: 'avanzado' }, ['lun', 'mar', 'jue', 'vie'])
    const ids = Object.values(plan.asignacion).flatMap((s) => s!.ejercicios.map((e) => e.ejercicioId))
    expect(ids).not.toContain('peso-muerto')
    expect(ids).not.toContain('sentadilla-barra')
    expect(plan.avisos.join(' ')).toMatch(/bajo impacto/)
  })

  it('respeta ejercicios excluidos', () => {
    const plan = generarPlan(base, ['lun', 'mie', 'vie'], { excluidos: ['press-banca-mancuernas'] })
    const ids = Object.values(plan.asignacion).flatMap((s) => s!.ejercicios.map((e) => e.ejercicioId))
    expect(ids).not.toContain('press-banca-mancuernas')
  })
})

describe('asignarSesiones', () => {
  const mk = (nombre: string): Sesion => ({ id: nombre, nombre, descripcion: '', ejercicios: [] })
  it('evita pierna en días consecutivos cuando puede', () => {
    const r = asignarSesiones(['lun', 'mar', 'jue', 'vie'], [mk('Torso'), mk('Pierna'), mk('Torso B'), mk('Pierna B')])
    expect(r.lun!.nombre).toBe('Torso')
    expect(r.mar!.nombre).toBe('Pierna')
    expect(r.jue!.nombre).toBe('Torso B')
    expect(r.vie!.nombre).toBe('Pierna B')
    const r2 = asignarSesiones(['lun', 'mar', 'mie', 'jue'], [mk('Pierna'), mk('Pierna B'), mk('Torso'), mk('Torso B')])
    expect(r2.lun!.nombre).toBe('Pierna')
    expect(r2.mar!.nombre).toBe('Torso')
  })
})

describe('alternativas', () => {
  it('ofrece sustitutos del mismo patrón', () => {
    const alts = alternativas('press-banca-barra', base).map((e) => e.id)
    expect(alts).toContain('press-pecho-maquina')
    expect(alts).not.toContain('press-banca-barra')
    expect(alts).not.toContain('jalon-polea-alta')
  })
})
