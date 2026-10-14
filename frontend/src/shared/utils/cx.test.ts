import { describe, expect, it } from 'vitest'

import { cx } from './cx'

describe('cx', () => {
  it('une solo las clases con valor', () => {
    expect(cx('a', 'b')).toBe('a b')
  })

  it('descarta valores falsy', () => {
    expect(cx('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('devuelve una cadena vacía si no hay clases', () => {
    expect(cx(false, undefined)).toBe('')
  })
})
