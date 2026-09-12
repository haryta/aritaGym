import { useState } from 'react'
import type { Ejercicio } from '../domain/types'
import { urlBusquedaYoutube } from '../data/ejercicios'

interface Props {
  ejercicio: Ejercicio
  autoAbrir?: boolean
}

/**
 * Muestra el video de YouTube del ejercicio. El iframe solo se carga cuando
 * el usuario toca "Ver video" para no descargar YouTube en cada tarjeta.
 */
export function VideoYoutube({ ejercicio, autoAbrir = false }: Props) {
  const [abierto, setAbierto] = useState(autoAbrir)
  const id = ejercicio.youtubeId

  if (!id) {
    return (
      <a
        href={urlBusquedaYoutube(ejercicio)}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl bg-slate-800 p-4 text-center text-sm text-emerald-300"
      >
        ▶ Buscar video en YouTube
      </a>
    )
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="relative block aspect-video w-full overflow-hidden rounded-xl bg-slate-800"
        aria-label={`Ver video de ${ejercicio.nombre}`}
      >
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-80"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg">▶ Ver video</span>
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&hl=es`}
          title={`Video: ${ejercicio.nombre}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <a href={urlBusquedaYoutube(ejercicio)} target="_blank" rel="noreferrer" className="block text-center text-xs text-slate-400 underline">
        ¿El video no sirve? Buscar otros en YouTube
      </a>
    </div>
  )
}
