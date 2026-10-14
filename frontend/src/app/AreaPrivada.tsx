import { useSesion, useLogout } from '@/features/auth/hooks'
import { Boton } from '@/shared/componentes/Boton'

import estilos from './AreaPrivada.module.css'

export function AreaPrivada() {
  const { usuario } = useSesion()
  const cerrarSesion = useLogout()

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Sesión iniciada</h1>
      <p className={estilos.cuerpo}>
        Hola, {usuario?.nombre}. Esta pantalla es temporal y se reemplaza por el Tablero en la Fase
        6.
      </p>
      <Boton variante="secundario" onClick={cerrarSesion}>
        Cerrar sesión
      </Boton>
    </div>
  )
}
