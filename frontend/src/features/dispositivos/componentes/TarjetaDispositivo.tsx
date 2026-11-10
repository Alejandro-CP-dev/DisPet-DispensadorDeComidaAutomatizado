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
    <article
      className={cx(
        estilos.tarjeta,
        conectado && estilos.conectado,
        nivelBajo && estilos.nivelBajo,
      )}
    >
      <div className={estilos.encabezado}>
        <span className={estilos.nombre}>{dispositivo.nombre}</span>
        <svg
          className={estilos.iconoDispensador}
          viewBox="0 0 48 56"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 5h28v5H10zM13 10h22v21H13zM10 31h28v5H10zM15 36v14h18V36M18 50V38h12v12"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M18 16h12v8H18zM21 42h6" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="20" cy="27" r="1.5" fill="currentColor" />
          <circle cx="24" cy="27" r="1.5" fill="currentColor" />
          <circle cx="28" cy="27" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className={estilos.insignias}>
        <Insignia tono={conectado ? 'exito' : 'neutral'}>
          {conectado ? (
            <>
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2.5 6.5a8 8 0 0 1 11 0M5 9a4.5 4.5 0 0 1 6 0M7.5 11.5a1 1 0 0 1 1 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Conectado
            </>
          ) : (
            'Desconectado'
          )}
        </Insignia>
        {nivelBajo && (
          <span className={estilos.insigniaAlerta}>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 2.2 14 13H2L8 2.2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M8 6v3.2M8 11.2v.1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Nivel bajo
          </span>
        )}
        {!nivelBajo && <Insignia tono="exito">Nivel adecuado</Insignia>}
      </div>

      <div className={estilos.mascota}>
        <span>Mascota: {mascotaNombre ?? 'Sin asignar'}</span>
        <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
          <ellipse cx="8" cy="11" rx="2.5" ry="3" />
          <ellipse cx="13.5" cy="7.5" rx="2.4" ry="3" />
          <ellipse cx="20" cy="7.5" rx="2.4" ry="3" />
          <ellipse cx="25" cy="11" rx="2.5" ry="3" />
          <path d="M16 14c-3.2 0-5.2 2-6.7 4.4-1.3 2-2.1 3.6-1.1 5 .9 1.3 2.6.9 4.1.3 1.2-.5 2.4-.7 3.7-.7s2.5.2 3.7.7c1.5.6 3.2 1 4.1-.3 1-1.4.2-3-1.1-5C21.2 16 19.2 14 16 14Z" />
        </svg>
      </div>

      <div className={estilos.nivel}>
        <div className={estilos.nivelEtiqueta}>
          <span>Nivel de alimento</span>
          <span>{dispositivo.nivelAlimentoPorcentaje}%</span>
        </div>
        <div className={estilos.nivelVisual}>
          <div
            className={estilos.barra}
            role="progressbar"
            aria-label={`Nivel de alimento de ${dispositivo.nombre}`}
            aria-valuenow={dispositivo.nivelAlimentoPorcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cx(estilos.relleno, nivelBajo && estilos.rellenoBajo)}
              style={{ width: `${String(dispositivo.nivelAlimentoPorcentaje)}%` }}
            />
          </div>
          {nivelBajo && <span className={estilos.aviso}>Reabastecer pronto</span>}
        </div>
      </div>

      <Boton
        className={estilos.boton}
        onClick={onDispensar}
        cargando={dispensando}
        disabled={!conectado}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 2h10v2H5zM6 4h8v5H6zM5 9h10v2H5zM7 11v7h6v-7M8.5 16v-3h3v3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="7" r=".7" fill="currentColor" />
          <circle cx="10" cy="7" r=".7" fill="currentColor" />
          <circle cx="11.5" cy="7" r=".7" fill="currentColor" />
        </svg>
        Dispensar ahora
      </Boton>
    </article>
  )
}
