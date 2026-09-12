import { describe, expect, it } from 'vitest'
import {
  caloriasMantenimiento,
  caloriasObjetivo,
  categoriaImc,
  factorActividad,
  imc,
  proteinaSugerida,
  tmb,
} from './calculos'
import type { Perfil } from './types'

const perfil: Perfil = {
  nombre: 'Test',
  edad: 30,
  sexo: 'F',
  pesoKg: 60,
  estaturaCm: 165,
  nivel: 'principiante',
  objetivo: 'mantener',
}

describe('imc', () => {
  it('calcula con un decimal', () => {
    expect(imc(60, 165)).toBe(22)
    expect(imc(90, 175)).toBe(29.4)
  })
  it('no divide entre cero', () => {
    expect(imc(60, 0)).toBe(0)
  })
  it('clasifica correctamente', () => {
    expect(categoriaImc(17)).toBe('bajo_peso')
    expect(categoriaImc(22)).toBe('normal')
    expect(categoriaImc(27)).toBe('sobrepeso')
    expect(categoriaImc(31)).toBe('obesidad')
  })
})

describe('tmb (Mifflin-St Jeor)', () => {
  it('mujer 30 años, 60 kg, 165 cm', () => {
    // 600 + 1031.25 - 150 - 161 = 1320.25
    expect(tmb(perfil)).toBe(1320)
  })
  it('hombre suma 5 en lugar de restar 161', () => {
    expect(tmb({ ...perfil, sexo: 'M' })).toBe(1486)
  })
})

describe('calorías', () => {
  it('usa el factor de actividad por días', () => {
    expect(factorActividad(0)).toBe(1.2)
    expect(factorActividad(3)).toBe(1.375)
    expect(factorActividad(5)).toBe(1.55)
    expect(factorActividad(6)).toBe(1.725)
    expect(caloriasMantenimiento(perfil, 3)).toBe(1815)
  })
  it('ajusta según objetivo', () => {
    expect(caloriasObjetivo(2000, 'perder_grasa')).toBe(1600)
    expect(caloriasObjetivo(2000, 'ganar_musculo')).toBe(2200)
    expect(caloriasObjetivo(2000, 'fuerza')).toBe(2100)
    expect(caloriasObjetivo(2000, 'mantener')).toBe(2000)
  })
  it('sugiere proteína por kg', () => {
    expect(proteinaSugerida(60, 'perder_grasa')).toBe(120)
    expect(proteinaSugerida(60, 'mantener')).toBe(96)
  })
})
