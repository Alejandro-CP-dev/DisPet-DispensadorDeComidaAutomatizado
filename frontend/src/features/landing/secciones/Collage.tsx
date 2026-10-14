import estilos from './Collage.module.css'

interface FotoCollage {
  archivo: string
  descripcion: string
}

const fotos: FotoCollage[] = [
  { archivo: 'perro-comiendo.jpg', descripcion: 'Perro comiendo de su dispensador DisPet en casa' },
  {
    archivo: 'app-movil.jpg',
    descripcion: 'Persona controlando el dispensador desde la app de DisPet',
  },
  { archivo: 'gato-comiendo.jpg', descripcion: 'Gato comiendo de su dispensador DisPet' },
  {
    archivo: 'dispensador-par.jpg',
    descripcion: 'Dispensadores DisPet para perro y gato, uno junto al otro',
  },
  {
    archivo: 'croquetas-cayendo.jpg',
    descripcion: 'Croquetas cayendo del dispensador hacia el plato',
  },
  { archivo: 'dispensador-perro.jpg', descripcion: 'Dispensador DisPet para perro con su plato' },
  {
    archivo: 'dispensador-perro-lleno.jpg',
    descripcion: 'Dispensador DisPet para perro con el plato lleno',
  },
  {
    archivo: 'dispensador-gato.jpg',
    descripcion: 'Dispensador DisPet para gato con el plato lleno',
  },
  { archivo: 'croqueta-detalle.jpg', descripcion: 'Detalle de una croqueta en forma de hueso' },
  {
    archivo: 'dispensador-perro-angulo.jpg',
    descripcion: 'Dispensador DisPet para perro desde otro ángulo',
  },
]

export function Collage() {
  return (
    <section className={estilos.seccion}>
      <div className={estilos.encabezado}>
        <h2 className={estilos.titulo}>Mascotas felices, dueños tranquilos</h2>
        <p className={estilos.subtitulo}>
          Así se ve DisPet en el día a día: perros, gatos y la app que los conecta contigo.
        </p>
      </div>
      <div className={estilos.masonry}>
        {fotos.map((foto) => (
          <figure key={foto.archivo} className={estilos.figura}>
            <img
              src={`/img/collage/${foto.archivo}`}
              alt={foto.descripcion}
              className={estilos.imagen}
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </section>
  )
}
