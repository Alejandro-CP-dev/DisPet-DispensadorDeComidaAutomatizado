import { useState } from 'react'

import { useMascotas } from '@/features/mascotas/hooks'
import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Insignia } from '@/shared/componentes/Insignia'
import { Select } from '@/shared/componentes/Select'
import { Spinner } from '@/shared/componentes/Spinner'
import { Tabla } from '@/shared/componentes/Tabla'
import type { ColumnaTabla } from '@/shared/componentes/Tabla'
import { formatearFechaHora } from '@/shared/utils/fechas'
import { formatearGramos } from '@/shared/utils/gramos'
import type { Dispensacion, EstadoDispensacion } from '@/tipos'

import { useHistorial } from '../hooks'
import estilos from './HistorialPage.module.css'

const POR_PAGINA = 10

export function HistorialPage() {
  const { data: mascotas } = useMascotas()
  const [pagina, setPagina] = useState(1)
  const [estado, setEstado] = useState<EstadoDispensacion | ''>('')
  const [mascotaId, setMascotaId] = useState('')

  const { data, isLoading, isError, error, isPlaceholderData } = useHistorial({
    pagina,
    porPagina: POR_PAGINA,
    estado: estado || undefined,
    mascotaId: mascotaId || undefined,
  })

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / POR_PAGINA)) : 1

  function alCambiarFiltro(actualizar: () => void) {
    actualizar()
    setPagina(1)
  }

  const columnas: ColumnaTabla<Dispensacion>[] = [
    {
      clave: 'fechaHora',
      encabezado: 'Fecha y hora',
      render: (item) => formatearFechaHora(item.fechaHora),
    },
    {
      clave: 'mascotaId',
      encabezado: 'Mascota',
      render: (item) => mascotas?.find((m) => m.id === item.mascotaId)?.nombre ?? '—',
    },
    {
      clave: 'gramos',
      encabezado: 'Gramos',
      alinear: 'derecha',
      render: (item) => formatearGramos(item.gramos),
    },
    {
      clave: 'tipo',
      encabezado: 'Tipo',
      render: (item) => (item.tipo === 'programada' ? 'Programada' : 'Manual'),
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (item) => (
        <Insignia tono={item.estado === 'exitosa' ? 'exito' : 'error'}>
          {item.estado === 'exitosa' ? 'Exitosa' : 'Fallida'}
        </Insignia>
      ),
    },
  ]

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Historial</h1>

      <div className={estilos.filtros}>
        <Select
          label="Estado"
          opciones={[
            { valor: '', etiqueta: 'Todos' },
            { valor: 'exitosa', etiqueta: 'Exitosa' },
            { valor: 'fallida', etiqueta: 'Fallida' },
          ]}
          value={estado}
          onChange={(evento) => {
            alCambiarFiltro(() => {
              setEstado(evento.target.value as EstadoDispensacion | '')
            })
          }}
        />
        <Select
          label="Mascota"
          opciones={[
            { valor: '', etiqueta: 'Todas' },
            ...(mascotas ?? []).map((mascota) => ({ valor: mascota.id, etiqueta: mascota.nombre })),
          ]}
          value={mascotaId}
          onChange={(evento) => {
            alCambiarFiltro(() => {
              setMascotaId(evento.target.value)
            })
          }}
        />
      </div>

      {isLoading && (
        <div className={estilos.centro}>
          <Spinner etiqueta="Cargando historial" />
        </div>
      )}

      {isError && (
        <EstadoVacio
          tono="error"
          titulo="No se pudo cargar el historial"
          descripcion={obtenerMensajeError(error)}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <Tabla
            columnas={columnas}
            filas={data.items}
            obtenerClave={(item) => item.id}
            vacio={
              <EstadoVacio
                titulo="No hay dispensaciones"
                descripcion="Todavía no hay registros con estos filtros."
              />
            }
          />
          <div className={estilos.paginacion}>
            <Boton
              variante="secundario"
              tamano="chico"
              disabled={pagina <= 1}
              onClick={() => {
                setPagina((p) => p - 1)
              }}
            >
              Anterior
            </Boton>
            <span className={estilos.infoPagina}>
              Página {pagina} de {totalPaginas}
              {isPlaceholderData && ' · actualizando…'}
            </span>
            <Boton
              variante="secundario"
              tamano="chico"
              disabled={pagina >= totalPaginas}
              onClick={() => {
                setPagina((p) => p + 1)
              }}
            >
              Siguiente
            </Boton>
          </div>
        </>
      )}
    </div>
  )
}
