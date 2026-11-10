import { describe, expect, it } from 'vitest'

import { exportarHistorial } from './api'

describe('exportarHistorial', () => {
  it('devuelve un PDF válido desde el handler MSW', async () => {
    const archivo = await exportarHistorial('pdf', {})
    const contenido = new TextDecoder().decode(await archivo.arrayBuffer())
    const referenciaXref = /startxref\n(\d+)\n%%EOF/.exec(contenido)

    expect(archivo.type).toBe('application/pdf')
    expect(contenido.startsWith('%PDF-1.4')).toBe(true)
    expect(referenciaXref).not.toBeNull()
    expect(contenido.slice(Number(referenciaXref?.[1])).startsWith('xref\n')).toBe(true)
  })
})
