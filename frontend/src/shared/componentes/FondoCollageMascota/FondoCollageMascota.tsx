import { useState } from 'react'
import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './FondoCollageMascota.module.css'

interface Sticker {
  id: number
  top: string
  left: string
  tamano: number
  rotacion: number
  opacidad: number
}

function generarStickers(cantidad: number): Sticker[] {
  return Array.from({ length: cantidad }, (_, indice) => ({
    id: indice,
    top: `${String(Math.random() * 100)}%`,
    left: `${String(Math.random() * 100)}%`,
    tamano: 56 + Math.random() * 84,
    rotacion: Math.random() * 50 - 25,
    opacidad: 0.12 + Math.random() * 0.16,
  }))
}

interface FondoCollageMascotaProps extends HTMLAttributes<HTMLDivElement> {
  /** Cantidad de íconos de la mascota a esparcir de fondo. */
  cantidad?: number
}

/**
 * Fondo decorativo: la mascota de DisPet repartida al azar como un collage,
 * detrás del contenido de la página. Puramente visual (aria-hidden).
 */
export function FondoCollageMascota({
  cantidad = 22,
  className,
  ...resto
}: FondoCollageMascotaProps) {
  // Inicializador perezoso: Math.random() solo corre una vez, al montar (ver
  // DestellosTexto para la misma razón: la regla de pureza de React no deja
  // llamar funciones impuras en el cuerpo del componente).
  const [stickers] = useState<Sticker[]>(() => generarStickers(cantidad))

  return (
    <div className={cx(estilos.fondo, className)} aria-hidden="true" {...resto}>
      {stickers.map((sticker) => (
        <img
          key={sticker.id}
          src="/img/mascota.png"
          alt=""
          draggable={false}
          className={cx(estilos.sticker, 'logo-sobre-superficie')}
          style={{
            top: sticker.top,
            left: sticker.left,
            width: sticker.tamano,
            height: sticker.tamano,
            opacity: sticker.opacidad,
            transform: `translate(-50%, -50%) rotate(${String(sticker.rotacion)}deg)`,
          }}
        />
      ))}
    </div>
  )
}
