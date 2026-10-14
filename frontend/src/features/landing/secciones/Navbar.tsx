import { Link } from 'react-router-dom'

import { useScrollProgress } from '@/shared/hooks/useScrollProgress'
import { cx } from '@/shared/utils/cx'

import estilos from './Navbar.module.css'

export function Navbar() {
  const scrollY = useScrollProgress()
  const solido = scrollY > 8

  return (
    <nav className={cx(estilos.navbar, solido && estilos.solido)}>
      <Link to="/" className={estilos.marca}>
        <img src="/img/mascota.png" alt="" className={cx(estilos.icono, 'logo-sobre-superficie')} />
        <span className={estilos.nombre}>DisPet</span>
      </Link>
      <Link to="/login" className={estilos.entrar}>
        Iniciar sesión
      </Link>
    </nav>
  )
}
