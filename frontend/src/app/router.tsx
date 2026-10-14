import { Route, Routes } from 'react-router-dom'

import { LoginPage } from '@/features/auth/paginas/LoginPage'
import { RegistroPage } from '@/features/auth/paginas/RegistroPage'

import { AreaPrivada } from './AreaPrivada'
import { ComponentesShowcase } from './ComponentesShowcase'
import { RutaProtegida } from './RutaProtegida'
import { VerificacionBase } from './VerificacionBase'

export function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<VerificacionBase />} />
      <Route path="/componentes" element={<ComponentesShowcase />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route element={<RutaProtegida />}>
        <Route path="/tablero" element={<AreaPrivada />} />
      </Route>
    </Routes>
  )
}
