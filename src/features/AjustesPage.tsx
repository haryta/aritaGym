import { useRef } from 'react'
import { useApp } from '../store/app'
import { Boton, Pagina, Tarjeta } from '../components/ui'

/** Exportar / importar datos (respaldo manual, útil en iOS donde Safari puede limpiar el almacenamiento). */
export function AjustesPage() {
  const state = useApp()
  const fileRef = useRef<HTMLInputElement>(null)

  const exportar = () => {
    const data = { perfil: state.perfil, dias: state.dias, excluidos: state.excluidos, historial: state.historial, pesos: state.pesos }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coach-gym-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importar = async (file: File) => {
    try {
      const data = JSON.parse(await file.text())
      state.importar(data)
      alert('Datos importados.')
    } catch {
      alert('El archivo no es válido.')
    }
  }

  return (
    <Pagina titulo="Ajustes" subtitulo="Tus datos viven solo en este dispositivo.">
      <Tarjeta className="space-y-3">
        <p className="text-sm text-slate-300">Respalda tus datos por si cambias de teléfono o Safari limpia el almacenamiento.</p>
        <div className="flex gap-2">
          <Boton onClick={exportar}>Exportar JSON</Boton>
          <Boton variante="secundario" onClick={() => fileRef.current?.click()}>Importar JSON</Boton>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
        </div>
      </Tarjeta>
      <Tarjeta className="mt-3 space-y-2">
        <p className="text-sm font-semibold">Instalar en iPhone</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-300">
          <li>Abre esta página en Safari.</li>
          <li>Toca el botón Compartir (cuadro con flecha).</li>
          <li>Elige "Añadir a pantalla de inicio".</li>
        </ol>
      </Tarjeta>
      <Tarjeta className="mt-3">
        <Boton
          variante="peligro"
          onClick={() => {
            if (confirm('¿Borrar perfil, plan e historial? No se puede deshacer.')) state.reiniciar()
          }}
        >
          Borrar todos mis datos
        </Boton>
      </Tarjeta>
    </Pagina>
  )
}
