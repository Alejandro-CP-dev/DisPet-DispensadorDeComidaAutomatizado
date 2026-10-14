import { useEffect, useState } from 'react'

export function useScrollProgress(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let frameId: number

    function leer() {
      setScrollY(window.scrollY)
      frameId = requestAnimationFrame(leer)
    }

    frameId = requestAnimationFrame(leer)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

  return scrollY
}
