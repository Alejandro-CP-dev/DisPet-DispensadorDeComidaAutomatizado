import { NavLink, Outlet } from 'react-router-dom'

import { useLogout, useSesion } from '@/features/auth/hooks'
import { Boton } from '@/shared/componentes/Boton'
import { ToastContenedor } from '@/shared/componentes/Toast'
import { useMenu } from '@/shared/hooks/useMenu'
import { cx } from '@/shared/utils/cx'

import estilos from './DisenoApp.module.css'

const ENLACES = [
  { to: '/tablero', etiqueta: 'Tablero' },
  { to: '/mascotas', etiqueta: 'Mascotas' },
  { to: '/dispositivos', etiqueta: 'Dispositivos' },
  { to: '/horarios', etiqueta: 'Horarios' },
  { to: '/historial', etiqueta: 'Historial' },
]

export function DisenoApp() {
  const { usuario } = useSesion()
  const cerrarSesion = useLogout()
  const abierto = useMenu((estado) => estado.abierto)
  const alternar = useMenu((estado) => estado.alternar)
  const cerrarMenu = useMenu((estado) => estado.cerrar)

  return (
    <div className={estilos.contenedor}>
      <header className={estilos.topbar}>
        <NavLink to="/tablero" className={estilos.marca}>
          <img
            src="/img/mascota.png"
            alt=""
            className={cx(estilos.icono, 'logo-sobre-superficie')}
          />
          <span className={estilos.nombre}>DisPet</span>
        </NavLink>

        <button
          type="button"
          className={estilos.hamburguesa}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={alternar}
        >
          ☰
        </button>

        <nav className={cx(estilos.nav, abierto && estilos.navAbierto)}>
          {ENLACES.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              className={({ isActive }) => cx(estilos.enlace, isActive && estilos.enlaceActivo)}
              onClick={cerrarMenu}
            >
              {enlace.etiqueta}
            </NavLink>
          ))}
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              cx(estilos.enlace, estilos.perfilMovil, isActive && estilos.enlaceActivo)
            }
            onClick={cerrarMenu}
          >
            Editar perfil
          </NavLink>
        </nav>

        <div className={estilos.usuario}>
          <NavLink
            to="/perfil"
            className={estilos.nombreUsuario}
            aria-label={`Editar perfil de ${usuario?.nombre ?? 'usuario'}`}
            title="Editar perfil"
          >
            {usuario?.nombre}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10" cy="8" r="3.5" />
              <path d="M3.5 19a6.5 6.5 0 0 1 11-4.6" />
              <path d="m14.5 18.5 5.7-5.7 2 2-5.7 5.7-2.7.7.7-2.7Z" />
            </svg>
          </NavLink>
          <Boton variante="secundario" tamano="chico" onClick={cerrarSesion}>
            Cerrar sesión
          </Boton>
        </div>
      </header>

      <main className={estilos.contenido}>
        <Outlet />
      </main>

      <ToastContenedor />
    </div>
  )
}
