import { Boton } from '@/shared/componentes/Boton'
import { Insignia } from '@/shared/componentes/Insignia'
import { cx } from '@/shared/utils/cx'
import type { Dispositivo } from '@/tipos'

import estilos from './TarjetaDispositivo.module.css'

const NIVEL_BAJO = 20

interface TarjetaDispositivoProps {
  dispositivo: Dispositivo
  mascotaNombre?: string
  onDispensar: () => void
  dispensando: boolean
}

export function TarjetaDispositivo({
  dispositivo,
  mascotaNombre,
  onDispensar,
  dispensando,
}: TarjetaDispositivoProps) {
  const nivelBajo = dispositivo.nivelAlimentoPorcentaje <= NIVEL_BAJO
  const conectado = dispositivo.estadoConexion === 'conectado'

  return (
    <div className={estilos.tarjeta}>
      <div className={estilos.encabezado}>
        <span className={estilos.nombre}>{dispositivo.nombre}</span>
        <div className={estilos.insignias}>
          <Insignia tono={conectado ? 'exito' : 'neutral'}>
            {conectado ? 'Conectado' : 'Desconectado'}
          </Insignia>
          {nivelBajo && <Insignia tono="alerta">Nivel bajo</Insignia>}
        </div>
      </div>

      {mascotaNombre && <span>Mascota: {mascotaNombre}</span>}

      <div className={estilos.nivel}>
        <div className={estilos.nivelEtiqueta}>
          <span>Nivel de alimento</span>
          <span>{dispositivo.nivelAlimentoPorcentaje}%</span>
        </div>
        <div
          className={estilos.barra}
          role="progressbar"
          aria-valuenow={dispositivo.nivelAlimentoPorcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cx(estilos.relleno, nivelBajo && estilos.rellenoBajo)}
            style={{ width: `${String(dispositivo.nivelAlimentoPorcentaje)}%` }}
          />
        </div>
      </div>

      <Boton onClick={onDispensar} cargando={dispensando} disabled={!conectado}>
        Dispensar ahora
      </Boton>
    </div>
  )
}
