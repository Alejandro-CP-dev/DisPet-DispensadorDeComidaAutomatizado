import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useSesion } from '@/features/auth/hooks'

export function RutaProtegida() {
  const { haySesion } = useSesion()
  const location = useLocation()

  if (!haySesion) {
    return <Navigate to="/login" replace state={{ desde: location }} />
  }

  return <Outlet />
}
