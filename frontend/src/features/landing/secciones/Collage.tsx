import { MuroDeFotos } from '@/shared/componentes/MuroDeFotos'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import type { ItemMuro } from '@/shared/componentes/MuroDeFotos'

import estilos from './Collage.module.css'

const fotos: ItemMuro[] = [
  {
    imagen: '/img/collage/perro-comiendo.jpg',
    titulo: 'Perro comiendo de su dispensador DisPet en casa',
  },
  {
    imagen: '/img/collage/app-movil.jpg',
    titulo: 'Persona controlando el dispensador desde la app de DisPet',
  },
  { imagen: '/img/collage/gato-comiendo.jpg', titulo: 'Gato comiendo de su dispensador DisPet' },
  {
    imagen: '/img/collage/dispensador-par.jpg',
    titulo: 'Dispensadores DisPet para perro y gato, uno junto al otro',
  },
  {
    imagen: '/img/collage/croquetas-cayendo.jpg',
    titulo: 'Croquetas cayendo del dispensador hacia el plato',
  },
  {
    imagen: '/img/collage/dispensador-perro.jpg',
    titulo: 'Dispensador DisPet para perro con su plato',
  },
  {
    imagen: '/img/collage/dispensador-perro-lleno.jpg',
    titulo: 'Dispensador DisPet para perro con el plato lleno',
  },
  {
    imagen: '/img/collage/dispensador-gato.jpg',
    titulo: 'Dispensador DisPet para gato con el plato lleno',
  },
  {
    imagen: '/img/collage/croqueta-detalle.jpg',
    titulo: 'Detalle de una croqueta en forma de hueso',
  },
  {
    imagen: '/img/collage/dispensador-perro-angulo.jpg',
    titulo: 'Dispensador DisPet para perro desde otro ángulo',
  },
]

export function Collage() {
  const esMovil = useMediaQuery('(max-width: 640px)')

  return (
    <section className={estilos.seccion}>
      <div className={estilos.encabezado}>
        <h2 className={estilos.titulo}>Mascotas felices, dueños tranquilos</h2>
        <p className={estilos.subtitulo}>
          Así se ve DisPet en el día a día: perros, gatos y la app que los conecta contigo.
        </p>
      </div>
      <div className={estilos.muro}>
        <MuroDeFotos
          items={fotos}
          columnas={esMovil ? 3 : 6}
          anchoFoto={esMovil ? 140 : 325}
          altoFoto={esMovil ? 96 : 132}
          espacio={esMovil ? 12 : 10}
          etiquetaGrupo="Fotos de mascotas usando DisPet"
        />
      </div>
    </section>
  )
}
