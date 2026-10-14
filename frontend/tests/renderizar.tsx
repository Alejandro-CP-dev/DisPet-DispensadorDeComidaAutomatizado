import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

function crearQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

interface EnvolverProps {
  children: ReactNode
  rutaInicial: string
}

function Envolver({ children, rutaInicial }: EnvolverProps) {
  const queryClient = crearQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[rutaInicial]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

type OpcionesRenderizar = Omit<RenderOptions, 'wrapper'> & { rutaInicial?: string }

export function renderizarConProveedores(ui: ReactElement, opciones: OpcionesRenderizar = {}) {
  const { rutaInicial = '/', ...resto } = opciones
  return render(ui, {
    wrapper: ({ children }) => <Envolver rutaInicial={rutaInicial}>{children}</Envolver>,
    ...resto,
  })
}

export * from '@testing-library/react'
