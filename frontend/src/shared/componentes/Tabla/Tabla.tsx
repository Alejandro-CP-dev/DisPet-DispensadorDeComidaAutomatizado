import type { ReactNode } from 'react'

import estilos from './Tabla.module.css'

export interface ColumnaTabla<T> {
  clave: Extract<keyof T, string>
  encabezado: string
  alinear?: 'izquierda' | 'derecha' | 'centro'
  render?: (fila: T) => ReactNode
}

interface TablaProps<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  obtenerClave: (fila: T) => string
  vacio?: ReactNode
}

const claseAlineacion: Record<'izquierda' | 'derecha' | 'centro', string | undefined> = {
  izquierda: undefined,
  derecha: estilos.alinearDerecha,
  centro: estilos.alinearCentro,
}

export function Tabla<T>({ columnas, filas, obtenerClave, vacio }: TablaProps<T>) {
  return (
    <div className={estilos.envoltorio}>
      <table className={estilos.tabla}>
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna.clave}
                className={claseAlineacion[columna.alinear ?? 'izquierda']}
                scope="col"
              >
                {columna.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr className={estilos.filaVacia}>
              <td colSpan={columnas.length}>{vacio ?? 'No hay datos para mostrar.'}</td>
            </tr>
          ) : (
            filas.map((fila) => (
              <tr key={obtenerClave(fila)}>
                {columnas.map((columna) => (
                  <td
                    key={columna.clave}
                    className={claseAlineacion[columna.alinear ?? 'izquierda']}
                  >
                    {columna.render ? columna.render(fila) : String(fila[columna.clave])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
