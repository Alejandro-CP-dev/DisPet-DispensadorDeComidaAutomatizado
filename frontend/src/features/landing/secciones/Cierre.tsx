import { Link } from 'react-router-dom'

import estilos from './Cierre.module.css'

export function Cierre() {
  return (
    <section className={estilos.seccion}>
      <h2 className={estilos.titulo}>Pruébalo con la app real</h2>
      <Link to="/login" className={estilos.boton}>
        Iniciar sesión
      </Link>
    </section>
  )
}
