import type { Dispensacion, Dispositivo, Horario, Mascota, Usuario } from '@/tipos'

function crearGeneradorAleatorio(semilla: number): () => number {
  let estado = semilla
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

const aleatorio = crearGeneradorAleatorio(20240115)

export const usuario: Usuario = {
  id: 'u1',
  nombre: 'Alejandro Tareas',
  correo: 'alejandro@dispet.test',
}

export const mascotas: Mascota[] = [
  {
    id: 'm1',
    usuarioId: usuario.id,
    nombre: 'Luna',
    especie: 'perro',
    raza: 'Labrador',
    pesoKg: 22,
  },
  {
    id: 'm2',
    usuarioId: usuario.id,
    nombre: 'Simba',
    especie: 'gato',
    raza: 'Siamés',
    pesoKg: 4.5,
  },
]

export const dispositivos: Dispositivo[] = [
  {
    id: 'd1',
    usuarioId: usuario.id,
    mascotaId: 'm1',
    nombre: 'Dispensador sala',
    estadoConexion: 'conectado',
    nivelAlimentoPorcentaje: 68,
  },
  {
    id: 'd2',
    usuarioId: usuario.id,
    mascotaId: 'm2',
    nombre: 'Dispensador cocina',
    estadoConexion: 'desconectado',
    nivelAlimentoPorcentaje: 12,
  },
]

const todosLosDias: Horario['dias'] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
]

export const horarios: Horario[] = [
  {
    id: 'h1',
    dispositivoId: 'd1',
    mascotaId: 'm1',
    hora: '07:30',
    gramos: 120,
    dias: todosLosDias,
    activo: true,
  },
  {
    id: 'h2',
    dispositivoId: 'd1',
    mascotaId: 'm1',
    hora: '19:00',
    gramos: 120,
    dias: todosLosDias,
    activo: true,
  },
  {
    id: 'h3',
    dispositivoId: 'd2',
    mascotaId: 'm2',
    hora: '08:00',
    gramos: 50,
    dias: todosLosDias,
    activo: true,
  },
  {
    id: 'h4',
    dispositivoId: 'd2',
    mascotaId: 'm2',
    hora: '20:30',
    gramos: 45,
    dias: ['lunes', 'miercoles', 'viernes'],
    activo: true,
  },
]

const diasPorIndiceJs: Horario['dias'] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
]

function combinarFechaYHora(fecha: Date, hora: string): Date {
  const [horas, minutos] = hora.split(':').map(Number)
  const combinada = new Date(fecha)
  combinada.setHours(horas ?? 0, minutos ?? 0, 0, 0)
  return combinada
}

function generarDispensaciones(): Dispensacion[] {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const candidatas: Dispensacion[] = []
  let contador = 0

  for (let diasAtras = 14; diasAtras >= 0; diasAtras -= 1) {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() - diasAtras)
    const nombreDia = diasPorIndiceJs[fecha.getDay()]

    for (const horario of horarios) {
      if (!nombreDia || !horario.dias.includes(nombreDia)) continue

      contador += 1
      const variacionGramos = Math.round((aleatorio() - 0.5) * 10)
      const fallo = aleatorio() < 0.12

      candidatas.push({
        id: `disp-${String(contador)}`,
        dispositivoId: horario.dispositivoId,
        mascotaId: horario.mascotaId,
        horarioId: horario.id,
        fechaHora: combinarFechaYHora(fecha, horario.hora).toISOString(),
        gramos: horario.gramos + variacionGramos,
        tipo: 'programada',
        estado: fallo ? 'fallida' : 'exitosa',
      })
    }
  }

  const diasManual = [1, 4, 9]
  for (const diasAtras of diasManual) {
    contador += 1
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() - diasAtras)
    fecha.setHours(13, 15, 0, 0)
    const mascota = aleatorio() < 0.5 ? mascotas[0] : mascotas[1]
    const dispositivo = dispositivos.find((d) => d.mascotaId === mascota?.id)

    if (!mascota || !dispositivo) continue

    candidatas.push({
      id: `disp-${String(contador)}`,
      dispositivoId: dispositivo.id,
      mascotaId: mascota.id,
      horarioId: null,
      fechaHora: fecha.toISOString(),
      gramos: 40 + Math.round(aleatorio() * 30),
      tipo: 'manual',
      estado: 'exitosa',
    })
  }

  const manuales = candidatas.filter((d) => d.tipo === 'manual')
  const programadas = candidatas.filter((d) => d.tipo === 'programada')
  const programadasBarajadas = [...programadas].sort(() => aleatorio() - 0.5)
  const seleccion = [...manuales, ...programadasBarajadas.slice(0, 30 - manuales.length)]

  const fallidasPresentes = seleccion.filter((d) => d.estado === 'fallida').length
  if (fallidasPresentes < 3) {
    const exitosas = seleccion.filter((d) => d.tipo === 'programada' && d.estado === 'exitosa')
    for (let i = 0; i < 3 - fallidasPresentes && i < exitosas.length; i += 1) {
      const candidata = exitosas[i]
      if (candidata) candidata.estado = 'fallida'
    }
  }

  return seleccion.sort((a, b) => b.fechaHora.localeCompare(a.fechaHora))
}

export const dispensaciones: Dispensacion[] = generarDispensaciones()
