import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/app'
import type { Nivel, Objetivo, Perfil, Sexo } from '../domain/types'
import {
  NOMBRE_CATEGORIA_IMC,
  caloriasMantenimiento,
  caloriasObjetivo,
  categoriaImc,
  imc,
  proteinaSugerida,
  tmb,
} from '../domain/calculos'
import { Boton, Campo, Pagina, Tarjeta, inputClase } from '../components/ui'

const NIVELES: { v: Nivel; t: string; d: string }[] = [
  { v: 'principiante', t: 'Principiante', d: 'Menos de 6 meses entrenando' },
  { v: 'intermedio', t: 'Intermedio', d: 'De 6 meses a 2 años' },
  { v: 'avanzado', t: 'Avanzado', d: 'Más de 2 años con técnica sólida' },
]
const OBJETIVOS: { v: Objetivo; t: string; d: string }[] = [
  { v: 'perder_grasa', t: 'Perder grasa', d: 'Definir y bajar de peso' },
  { v: 'ganar_musculo', t: 'Ganar músculo', d: 'Hipertrofia' },
  { v: 'mantener', t: 'Mantener / tonificar', d: 'Salud general' },
  { v: 'fuerza', t: 'Fuerza', d: 'Levantar más peso' },
]

export function PerfilPage() {
  const perfil = useApp((s) => s.perfil)
  const dias = useApp((s) => s.dias)
  const guardarPerfil = useApp((s) => s.guardarPerfil)
  const navigate = useNavigate()

  const [form, setForm] = useState<Perfil>(
    perfil ?? { nombre: '', edad: 25, sexo: 'F', pesoKg: 60, estaturaCm: 165, nivel: 'principiante', objetivo: 'mantener' },
  )
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof Perfil>(k: K, v: Perfil[K]) => setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('Escribe tu nombre.')
    if (form.edad < 14 || form.edad > 90) return setError('La edad debe estar entre 14 y 90.')
    if (form.pesoKg < 30 || form.pesoKg > 250) return setError('El peso debe estar entre 30 y 250 kg.')
    if (form.estaturaCm < 120 || form.estaturaCm > 230) return setError('La estatura debe estar entre 120 y 230 cm.')
    setError(null)
    guardarPerfil({ ...form, nombre: form.nombre.trim() })
    navigate(perfil ? '/plan' : '/dias')
  }

  const valorImc = imc(form.pesoKg, form.estaturaCm)
  const cat = categoriaImc(valorImc)
  const mant = caloriasMantenimiento(form, Math.max(dias.length, 2))
  const obj = caloriasObjetivo(mant, form.objetivo)

  return (
    <Pagina titulo={perfil ? 'Tu perfil' : '¡Hola! Cuéntame de ti'} subtitulo="Con esto armo tu plan y tus calorías.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Tarjeta className="space-y-3">
          <Campo label="Nombre">
            <input className={inputClase} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Tu nombre" />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Edad">
              <input className={inputClase} type="number" inputMode="numeric" value={form.edad} onChange={(e) => set('edad', Number(e.target.value))} />
            </Campo>
            <Campo label="Sexo">
              <select className={inputClase} value={form.sexo} onChange={(e) => set('sexo', e.target.value as Sexo)}>
                <option value="F">Mujer</option>
                <option value="M">Hombre</option>
              </select>
            </Campo>
            <Campo label="Peso (kg)">
              <input className={inputClase} type="number" inputMode="decimal" step="0.1" value={form.pesoKg} onChange={(e) => set('pesoKg', Number(e.target.value))} />
            </Campo>
            <Campo label="Estatura (cm)">
              <input className={inputClase} type="number" inputMode="numeric" value={form.estaturaCm} onChange={(e) => set('estaturaCm', Number(e.target.value))} />
            </Campo>
          </div>
        </Tarjeta>

        <Tarjeta>
          <p className="mb-2 text-sm text-slate-300">Nivel</p>
          <div className="grid gap-2">
            {NIVELES.map((n) => (
              <Opcion key={n.v} activo={form.nivel === n.v} onClick={() => set('nivel', n.v)} titulo={n.t} detalle={n.d} />
            ))}
          </div>
        </Tarjeta>

        <Tarjeta>
          <p className="mb-2 text-sm text-slate-300">Objetivo</p>
          <div className="grid grid-cols-2 gap-2">
            {OBJETIVOS.map((o) => (
              <Opcion key={o.v} activo={form.objetivo === o.v} onClick={() => set('objetivo', o.v)} titulo={o.t} detalle={o.d} />
            ))}
          </div>
        </Tarjeta>

        <Tarjeta>
          <p className="mb-2 text-sm font-semibold">Tus números</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Dato k="IMC" v={`${valorImc}`} extra={NOMBRE_CATEGORIA_IMC[cat]} />
            <Dato k="Metabolismo basal" v={`${tmb(form)} kcal`} />
            <Dato k="Mantenimiento" v={`${mant} kcal`} extra={`${Math.max(dias.length, 2)} días/sem`} />
            <Dato k="Calorías objetivo" v={`${obj} kcal`} extra={`≈ ${proteinaSugerida(form.pesoKg, form.objetivo)} g proteína`} />
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            Estimaciones generales (fórmula Mifflin-St Jeor). No sustituyen la opinión de un médico o nutriólogo.
          </p>
        </Tarjeta>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <Boton type="submit" className="w-full">
          {perfil ? 'Guardar cambios' : 'Continuar: elegir mis días'}
        </Boton>
      </form>
    </Pagina>
  )
}

function Opcion({ activo, onClick, titulo, detalle }: { activo: boolean; onClick: () => void; titulo: string; detalle: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-left ring-1 transition ${activo ? 'bg-emerald-500/15 ring-emerald-500' : 'bg-slate-900 ring-slate-700'}`}
    >
      <span className="block text-sm font-semibold">{titulo}</span>
      <span className="block text-xs text-slate-400">{detalle}</span>
    </button>
  )
}

function Dato({ k, v, extra }: { k: string; v: string; extra?: string }) {
  return (
    <div className="rounded-xl bg-slate-900 p-3">
      <dt className="text-xs text-slate-400">{k}</dt>
      <dd className="text-lg font-semibold">{v}</dd>
      {extra && <dd className="text-xs text-slate-500">{extra}</dd>}
    </div>
  )
}
