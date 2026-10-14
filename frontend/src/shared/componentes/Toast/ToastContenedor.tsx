import { cx } from '@/shared/utils/cx'

import estilos from './Toast.module.css'
import { useToasts } from './useToasts'

export function ToastContenedor() {
  const toasts = useToasts((estado) => estado.toasts)
  const cerrar = useToasts((estado) => estado.cerrar)

  return (
    <div className={estilos.contenedor} role="region" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <div key={toast.id} className={cx(estilos.toast, estilos[toast.tipo])} role="status">
          <span>{toast.mensaje}</span>
          <button
            type="button"
            className={estilos.cerrar}
            aria-label="Cerrar notificación"
            onClick={() => {
              cerrar(toast.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
