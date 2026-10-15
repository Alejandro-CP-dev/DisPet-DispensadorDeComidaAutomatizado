import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'

import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'

import { PaginaAuth } from '../componentes/PaginaAuth/PaginaAuth'
import { useLogin } from '../hooks'
import { esquemaLogin } from '../schemas'
import type { ValoresLogin } from '../schemas'

import estilos from './LoginPage.module.css'

interface EstadoNavegacionLogin {
  desde?: Location
}

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValoresLogin>({ resolver: zodResolver(esquemaLogin) })
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = handleSubmit((valores) => {
    login.mutate(valores, {
      onSuccess: () => {
        const estado = location.state as EstadoNavegacionLogin | null
        navigate(estado?.desde?.pathname ?? '/tablero', { replace: true })
      },
    })
  })

  const mensajeError =
    login.isError && axios.isAxiosError(login.error) && login.error.response?.status === 401
      ? 'Correo o contraseña incorrectos.'
      : login.isError
        ? obtenerMensajeError(login.error)
        : null

  return (
    <PaginaAuth
      titulo="Inicia sesión"
      subtitulo="Entra para gestionar los horarios y porciones de tu mascota."
    >
      <form className={estilos.formulario} onSubmit={(evento) => void onSubmit(evento)} noValidate>
        <Campo
          label="Correo"
          type="email"
          autoComplete="email"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <Campo
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.contrasena?.message}
          {...register('contrasena')}
        />
        {mensajeError && (
          <p role="alert" className={estilos.errorServidor}>
            {mensajeError}
          </p>
        )}
        <Boton type="submit" cargando={login.isPending}>
          Entrar
        </Boton>
        <p className={estilos.ayuda}>
          <strong>Cuenta de prueba:</strong> alejandro@dispet.test / dispet123
        </p>
        <p className={estilos.pie}>
          ¿No tienes cuenta? <Link to="/registro">Crea una</Link>
        </p>
      </form>
    </PaginaAuth>
  )
}
