import { Link } from 'react-router-dom'

import { cx } from '@/shared/utils/cx'

import estilos from './Footer.module.css'

export function Footer() {
  return (
    <footer className={estilos.footer}>
      <div className={estilos.contenido}>
        <div className={estilos.marca}>
          <img src="/img/logo.png" alt="DisPet" className={cx(estilos.logo, 'logo-sobre-ink')} />
          <p className={estilos.eslogan}>
            Dispensadores automáticos de comida para mascotas, controlados desde donde estés.
          </p>
        </div>
        <div className={estilos.columnas}>
          <div className={estilos.columna}>
            <span className={estilos.tituloColumna}>Producto</span>
            <a href="#escena">¿Qué es DisPet?</a>
            <a href="#escena">¿Por qué DisPet?</a>
          </div>
          <div className={estilos.columna}>
            <span className={estilos.tituloColumna}>Cuenta</span>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
