import { Link } from 'react-router-dom'

import { useTema } from '@/shared/hooks/useTema'

import estilos from './VerificacionBase.module.css'

export function VerificacionBase() {
  const tema = useTema((estado) => estado.tema)
  const establecerTema = useTema((estado) => estado.establecerTema)
  const siguienteTema = tema === 'oscuro' ? 'claro' : 'oscuro'

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Base de DisPet lista</h1>
      <p className={estilos.cuerpo}>
        Fase 1: estructura, configuración y tokens. Esta pantalla es temporal y se reemplaza por el
        landing en la Fase 5.
      </p>
      <button
        type="button"
        className={estilos.boton}
        onClick={() => {
          establecerTema(siguienteTema)
        }}
      >
        Cambiar a tema {siguienteTema}
      </button>
      <Link to="/componentes">Ver componentes compartidos</Link>
    </div>
  )
}
