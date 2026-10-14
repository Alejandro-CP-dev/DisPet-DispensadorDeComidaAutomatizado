import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useSesionStore } from '@/features/auth/hooks'
import { configurarAutenticacionApi } from '@/shared/api/cliente'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    configurarAutenticacionApi({
      obtenerToken: () => useSesionStore.getState().tokenAcceso,
      alNoAutorizado: () => {
        useSesionStore.getState().cerrarSesion()
      },
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}
