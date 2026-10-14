import { Route, Routes } from 'react-router-dom'

import { LoginPage } from '@/features/auth/paginas/LoginPage'
import { RegistroPage } from '@/features/auth/paginas/RegistroPage'
import { DispositivosPage } from '@/features/dispositivos/paginas/DispositivosPage'
import { HistorialPage } from '@/features/historial/paginas/HistorialPage'
import { HorariosPage } from '@/features/horarios/paginas/HorariosPage'
import { LandingPage } from '@/features/landing/LandingPage'
import { MascotasPage } from '@/features/mascotas/paginas/MascotasPage'
import { TableroPage } from '@/features/tablero/paginas/TableroPage'

import { ComponentesShowcase } from './ComponentesShowcase'
import { DisenoApp } from './DisenoApp'
import { RutaProtegida } from './RutaProtegida'

export function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/componentes" element={<ComponentesShowcase />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route element={<RutaProtegida />}>
        <Route element={<DisenoApp />}>
          <Route path="/tablero" element={<TableroPage />} />
          <Route path="/mascotas" element={<MascotasPage />} />
          <Route path="/dispositivos" element={<DispositivosPage />} />
          <Route path="/horarios" element={<HorariosPage />} />
          <Route path="/historial" element={<HistorialPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
