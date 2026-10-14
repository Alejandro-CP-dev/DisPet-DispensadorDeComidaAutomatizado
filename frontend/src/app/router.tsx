import { Route, Routes } from 'react-router-dom'

import { VerificacionBase } from './VerificacionBase'

export function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<VerificacionBase />} />
    </Routes>
  )
}
