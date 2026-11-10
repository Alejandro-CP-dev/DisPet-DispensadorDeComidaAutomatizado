import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { servidor } from '@/mocks/servidor'
import { reiniciarEstadoAuth } from '@/mocks/handlers'

beforeAll(() => {
  servidor.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  servidor.resetHandlers()
  reiniciarEstadoAuth()
})

afterAll(() => {
  servidor.close()
})
