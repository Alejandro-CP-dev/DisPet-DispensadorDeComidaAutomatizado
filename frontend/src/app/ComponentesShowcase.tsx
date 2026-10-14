import { useState } from 'react'

import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Insignia } from '@/shared/componentes/Insignia'
import { LimiteDeError } from '@/shared/componentes/LimiteDeError'
import { Modal } from '@/shared/componentes/Modal'
import { Select } from '@/shared/componentes/Select'
import { Spinner } from '@/shared/componentes/Spinner'
import { Tabla } from '@/shared/componentes/Tabla'
import { ToastContenedor, useToasts } from '@/shared/componentes/Toast'
import type { ColumnaTabla } from '@/shared/componentes/Tabla'

import estilos from './ComponentesShowcase.module.css'

interface FilaEjemplo {
  id: string
  mascota: string
  gramos: number
  estado: 'exitosa' | 'fallida'
}

const filasEjemplo: FilaEjemplo[] = [
  { id: '1', mascota: 'Luna', gramos: 120, estado: 'exitosa' },
  { id: '2', mascota: 'Simba', gramos: 80, estado: 'fallida' },
]

const columnasEjemplo: ColumnaTabla<FilaEjemplo>[] = [
  { clave: 'mascota', encabezado: 'Mascota' },
  { clave: 'gramos', encabezado: 'Gramos', alinear: 'derecha' },
  {
    clave: 'estado',
    encabezado: 'Estado',
    render: (fila) => (
      <Insignia tono={fila.estado === 'exitosa' ? 'exito' : 'error'}>
        {fila.estado === 'exitosa' ? 'Exitosa' : 'Fallida'}
      </Insignia>
    ),
  },
]

function ComponenteFallido(): never {
  throw new Error('Fallo de ejemplo provocado a propósito.')
}

function DemoLimiteDeError() {
  const [fallar, setFallar] = useState(false)

  return (
    <LimiteDeError
      respaldo={(reintentar) => (
        <EstadoVacio
          tono="error"
          titulo="Algo salió mal"
          descripcion="Fallo de ejemplo provocado a propósito."
          accion={
            <Boton
              variante="secundario"
              onClick={() => {
                setFallar(false)
                reintentar()
              }}
            >
              Reintentar
            </Boton>
          }
        />
      )}
    >
      {fallar ? (
        <ComponenteFallido />
      ) : (
        <Boton
          variante="peligro"
          onClick={() => {
            setFallar(true)
          }}
        >
          Provocar error
        </Boton>
      )}
    </LimiteDeError>
  )
}

export function ComponentesShowcase() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const mostrarToast = useToasts((estado) => estado.mostrar)

  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezadoPagina}>
        <h1 className={estilos.tituloPagina}>Componentes compartidos</h1>
        <p className={estilos.subtitulo}>
          Fase 2: cada pieza visual reutilizable de DisPet, construida solo con las variables de{' '}
          <code>tokens.css</code>.
        </p>
      </header>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Boton</h2>
        <div className={estilos.fila}>
          <Boton variante="primario">Primario</Boton>
          <Boton variante="secundario">Secundario</Boton>
          <Boton variante="fantasma">Fantasma</Boton>
          <Boton variante="peligro">Peligro</Boton>
          <Boton tamano="chico">Chico</Boton>
          <Boton cargando>Guardando</Boton>
          <Boton disabled>Deshabilitado</Boton>
        </div>
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Campo y Select</h2>
        <div className={estilos.grid}>
          <Campo
            label="Nombre de la mascota"
            placeholder="Luna"
            ayuda="Como aparece en el tablero."
          />
          <Campo
            label="Correo"
            type="email"
            defaultValue="correo-invalido"
            error="Ingresa un correo válido."
          />
          <Select
            label="Especie"
            placeholder="Selecciona una especie"
            opciones={[
              { valor: 'perro', etiqueta: 'Perro' },
              { valor: 'gato', etiqueta: 'Gato' },
            ]}
          />
        </div>
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Insignia</h2>
        <div className={estilos.fila}>
          <Insignia tono="exito">Exitosa</Insignia>
          <Insignia tono="error">Fallida</Insignia>
          <Insignia tono="exito">Conectado</Insignia>
          <Insignia tono="alerta">Nivel bajo</Insignia>
          <Insignia tono="neutral">Desconectado</Insignia>
        </div>
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Spinner</h2>
        <div className={estilos.fila}>
          <Spinner tamano="chico" />
          <Spinner tamano="mediano" />
          <Spinner tamano="grande" />
        </div>
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Tabla</h2>
        <Tabla columnas={columnasEjemplo} filas={filasEjemplo} obtenerClave={(fila) => fila.id} />
        <Tabla columnas={columnasEjemplo} filas={[]} obtenerClave={(fila) => fila.id} />
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>EstadoVacio</h2>
        <div className={estilos.grid}>
          <EstadoVacio
            titulo="Todavía no hay mascotas"
            descripcion="Agrega la primera mascota para empezar a programar horarios."
            accion={<Boton variante="secundario">Agregar mascota</Boton>}
          />
          <EstadoVacio
            tono="error"
            titulo="No se pudo cargar el historial"
            descripcion="Revisa tu conexión e intenta de nuevo."
            accion={<Boton variante="secundario">Reintentar</Boton>}
          />
        </div>
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Modal</h2>
        <Boton
          onClick={() => {
            setModalAbierto(true)
          }}
        >
          Abrir modal
        </Boton>
        <Modal
          abierto={modalAbierto}
          alCerrar={() => {
            setModalAbierto(false)
          }}
          titulo="Confirmar dispensación"
          pie={
            <>
              <Boton
                variante="secundario"
                onClick={() => {
                  setModalAbierto(false)
                }}
              >
                Cancelar
              </Boton>
              <Boton
                onClick={() => {
                  setModalAbierto(false)
                }}
              >
                Confirmar
              </Boton>
            </>
          }
        >
          <p>¿Dispensar 100 gramos de comida ahora para Luna?</p>
        </Modal>
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Toast</h2>
        <div className={estilos.fila}>
          <Boton
            onClick={() => {
              mostrarToast('Dispensación registrada.', 'exito')
            }}
          >
            Toast de éxito
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => {
              mostrarToast('No se pudo conectar con el dispensador.', 'error')
            }}
          >
            Toast de error
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => {
              mostrarToast('El nivel de alimento está bajo.', 'alerta')
            }}
          >
            Toast de alerta
          </Boton>
        </div>
        <ToastContenedor />
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>LimiteDeError</h2>
        <DemoLimiteDeError />
      </section>
    </div>
  )
}
