import { useCallback, useSyncExternalStore } from 'react'

export function useMediaQuery(consulta: string): boolean {
  const suscribir = useCallback(
    (alCambiar: () => void) => {
      const mql = window.matchMedia(consulta)
      mql.addEventListener('change', alCambiar)
      return () => {
        mql.removeEventListener('change', alCambiar)
      }
    },
    [consulta],
  )

  const obtenerInstantanea = useCallback(() => window.matchMedia(consulta).matches, [consulta])

  return useSyncExternalStore(suscribir, obtenerInstantanea)
}
