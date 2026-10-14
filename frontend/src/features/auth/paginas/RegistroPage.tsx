import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'

import { useRegistro } from '../hooks'
import { esquemaRegistro } from '../schemas'
import type { ValoresRegistro } from '../schemas'

import estilos from './RegistroPage.module.css'

export function RegistroPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValoresRegistro>({ resolver: zodResolver(esquemaRegistro) })
  const registro = useRegistro()
  const navigate = useNavigate()

  const onSubmit = handleSubmit((valores) => {
    registro.mutate(valores, {
      onSuccess: () => {
        navigate('/tablero', { replace: true })
      },
    })
  })

  return (
    <div className={estilos.pagina}>
      <form className={estilos.tarjeta} onSubmit={(evento) => void onSubmit(evento)} noValidate>
        <h1 className={estilos.titulo}>Crea tu cuenta en DisPet</h1>
        <Campo
          label="Nombre completo"
          autoComplete="name"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
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
          autoComplete="new-password"
          error={errors.contrasena?.message}
          {...register('contrasena')}
        />
        <Campo
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmarContrasena?.message}
          {...register('confirmarContrasena')}
        />
        {registro.isError && (
          <p role="alert" className={estilos.errorServidor}>
            {obtenerMensajeError(registro.error)}
          </p>
        )}
        <Boton type="submit" cargando={registro.isPending}>
          Crear cuenta
        </Boton>
        <p className={estilos.pie}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}
