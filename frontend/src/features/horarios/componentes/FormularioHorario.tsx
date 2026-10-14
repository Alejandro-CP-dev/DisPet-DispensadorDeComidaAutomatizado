import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Campo } from '@/shared/componentes/Campo'
import { Select } from '@/shared/componentes/Select'
import { DIAS_SEMANA } from '@/shared/constantes/dias'
import { cx } from '@/shared/utils/cx'
import type { Dispositivo } from '@/tipos'

import { esquemaHorario } from '../schemas'
import type { ValoresHorario } from '../schemas'
import estilos from './FormularioHorario.module.css'

interface FormularioHorarioProps {
  idFormulario: string
  dispositivos: Dispositivo[]
  valoresIniciales?: ValoresHorario
  alEnviar: (valores: ValoresHorario) => void
}

export function FormularioHorario({
  idFormulario,
  dispositivos,
  valoresIniciales,
  alEnviar,
}: FormularioHorarioProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ValoresHorario>({
    resolver: zodResolver(esquemaHorario),
    defaultValues: valoresIniciales ?? { dias: [], activo: true },
  })

  return (
    <form
      id={idFormulario}
      className={estilos.formulario}
      onSubmit={(evento) => void handleSubmit(alEnviar)(evento)}
      noValidate
    >
      <Select
        label="Dispositivo"
        placeholder="Selecciona un dispositivo"
        error={errors.dispositivoId?.message}
        opciones={dispositivos.map((dispositivo) => ({
          valor: dispositivo.id,
          etiqueta: dispositivo.nombre,
        }))}
        {...register('dispositivoId')}
      />
      <Campo label="Hora" type="time" error={errors.hora?.message} {...register('hora')} />
      <Campo label="Gramos" type="number" error={errors.gramos?.message} {...register('gramos')} />

      <Controller
        control={control}
        name="dias"
        render={({ field }) => (
          <div className={estilos.grupo}>
            <span className={estilos.etiquetaGrupo}>Días</span>
            <div className={estilos.dias}>
              {DIAS_SEMANA.map((dia) => {
                const activo = field.value.includes(dia.valor)
                return (
                  <button
                    key={dia.valor}
                    type="button"
                    className={cx(estilos.dia, activo && estilos.diaActivo)}
                    aria-pressed={activo}
                    onClick={() => {
                      field.onChange(
                        activo
                          ? field.value.filter((valor) => valor !== dia.valor)
                          : [...field.value, dia.valor],
                      )
                    }}
                  >
                    {dia.etiqueta.slice(0, 3)}
                  </button>
                )
              })}
            </div>
            {errors.dias && <span className={estilos.error}>{errors.dias.message}</span>}
          </div>
        )}
      />

      <label className={estilos.casilla}>
        <input type="checkbox" {...register('activo')} />
        Horario activo
      </label>
    </form>
  )
}
