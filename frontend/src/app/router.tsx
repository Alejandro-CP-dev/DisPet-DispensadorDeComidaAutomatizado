import { Route, Routes } from 'react-router-dom'

import { ComponentesShowcase } from './ComponentesShowcase'
import { VerificacionBase } from './VerificacionBase'

export function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<VerificacionBase />} />
      <Route path="/componentes" element={<ComponentesShowcase />} />
    </Routes>
  )
}
