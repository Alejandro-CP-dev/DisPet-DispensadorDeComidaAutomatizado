import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Campo } from '@/shared/componentes/Campo'
import { Select } from '@/shared/componentes/Select'

import { esquemaMascota } from '../schemas'
import type { ValoresMascota } from '../schemas'
import estilos from './FormularioMascota.module.css'

interface FormularioMascotaProps {
  idFormulario: string
  valoresIniciales?: ValoresMascota
  alEnviar: (valores: ValoresMascota) => void
}

export function FormularioMascota({
  idFormulario,
  valoresIniciales,
  alEnviar,
}: FormularioMascotaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValoresMascota>({
    resolver: zodResolver(esquemaMascota),
    defaultValues: valoresIniciales,
  })

  return (
    <form
      id={idFormulario}
      className={estilos.formulario}
      onSubmit={(evento) => void handleSubmit(alEnviar)(evento)}
      noValidate
    >
      <Campo label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
      <Select
        label="Especie"
        error={errors.especie?.message}
        opciones={[
          { valor: 'perro', etiqueta: 'Perro' },
          { valor: 'gato', etiqueta: 'Gato' },
        ]}
        {...register('especie')}
      />
      <Campo label="Raza" error={errors.raza?.message} {...register('raza')} />
      <Campo
        label="Peso (kg)"
        type="number"
        step="0.1"
        error={errors.pesoKg?.message}
        {...register('pesoKg')}
      />
    </form>
  )
}
