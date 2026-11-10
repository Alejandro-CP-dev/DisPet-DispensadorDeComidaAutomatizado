import { http, HttpResponse } from 'msw'

import type { Dispensacion, Horario, Mascota, Usuario } from '@/tipos'

import { dispensaciones, dispositivos, horarios, mascotas, usuario as usuarioDemo } from './datos'

const URL_BASE = import.meta.env.VITE_API_URL
const ruta = (camino: string) => `${URL_BASE}${camino}`
const CONTRASENA_DEMO = 'dispet123'
let contrasenaActual = CONTRASENA_DEMO
let correoPendiente = ''
const usuarioDemoInicial = { ...usuarioDemo }
const correosRegistrados = new Set([usuarioDemo.correo.toLowerCase()])

export function reiniciarEstadoAuth(): void {
  contrasenaActual = CONTRASENA_DEMO
  correoPendiente = ''
  Object.assign(usuarioDemo, usuarioDemoInicial)
  correosRegistrados.clear()
  correosRegistrados.add(usuarioDemoInicial.correo.toLowerCase())
}

function generarId(prefijo: string): string {
  return `${prefijo}-${crypto.randomUUID().slice(0, 8)}`
}

function crearPdfDemostracion(): Uint8Array {
  const codificar = (texto: string) => new TextEncoder().encode(texto)
  const contenido = [
    'BT',
    '/F1 18 Tf',
    '50 740 Td',
    '(DisPet - Historial de comidas) Tj',
    '/F1 11 Tf',
    '0 -28 Td',
    '(Archivo PDF de demostracion para MSW) Tj',
    '0 -20 Td',
    '(Usa FastAPI para descargar el historial completo.) Tj',
    'ET',
  ].join('\n')
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${String(codificar(contenido).length)} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const desplazamientos = objetos.map((objeto, indice) => {
    const desplazamiento = codificar(pdf).length
    pdf += `${String(indice + 1)} 0 obj\n${objeto}\nendobj\n`
    return desplazamiento
  })
  const inicioXref = codificar(pdf).length
  pdf += `xref\n0 ${String(objetos.length + 1)}\n0000000000 65535 f \n`
  pdf += desplazamientos
    .map((desplazamiento) => `${String(desplazamiento).padStart(10, '0')} 00000 n \n`)
    .join('')
  pdf += `trailer\n<< /Size ${String(objetos.length + 1)} /Root 1 0 R >>\nstartxref\n${String(inicioXref)}\n%%EOF\n`
  return codificar(pdf)
}

export const handlers = [
  http.post(ruta('/auth/login'), async ({ request }) => {
    const cuerpo = (await request.json()) as { correo: string; contrasena: string }
    if (cuerpo.correo !== usuarioDemo.correo || cuerpo.contrasena !== contrasenaActual) {
      return HttpResponse.json({ mensaje: 'Credenciales incorrectas.' }, { status: 401 })
    }
    return HttpResponse.json({ usuario: usuarioDemo, tokenAcceso: generarId('token') })
  }),

  http.post(ruta('/auth/registro'), async ({ request }) => {
    const cuerpo = (await request.json()) as { nombre: string; correo: string }
    const correo = cuerpo.correo.trim().toLowerCase()
    if (correosRegistrados.has(correo)) {
      return HttpResponse.json({ detail: 'Ya existe una cuenta con ese correo.' }, { status: 409 })
    }

    correosRegistrados.add(correo)
    const nuevoUsuario: Usuario = {
      id: generarId('u'),
      nombre: cuerpo.nombre,
      correo,
      fechaCreacion: new Date().toISOString(),
      notificacionBateriaBaja: false,
      notificacionActualizaciones: false,
    }
    return HttpResponse.json(
      { usuario: nuevoUsuario, tokenAcceso: generarId('token') },
      { status: 201 },
    )
  }),

  http.put(ruta('/auth/perfil'), async ({ request }) => {
    const cambios = (await request.json()) as Pick<
      Usuario,
      'nombre' | 'notificacionBateriaBaja' | 'notificacionActualizaciones'
    >
    Object.assign(usuarioDemo, cambios)
    return HttpResponse.json(usuarioDemo)
  }),

  http.post(ruta('/auth/correo/codigo'), async ({ request }) => {
    const cuerpo = (await request.json()) as { correo: string; contrasena: string }
    if (cuerpo.contrasena !== contrasenaActual) {
      return HttpResponse.json({ mensaje: 'La contraseña actual no es correcta.' }, { status: 400 })
    }
    correoPendiente = cuerpo.correo
    return HttpResponse.json({ mensaje: 'Enviamos un código de verificación al nuevo correo.' })
  }),

  http.post(ruta('/auth/correo/confirmar'), async ({ request }) => {
    const cuerpo = (await request.json()) as { codigo: string }
    if (!/^\d{6}$/.test(cuerpo.codigo) || !correoPendiente) {
      return HttpResponse.json({ mensaje: 'Código no válido.' }, { status: 400 })
    }
    correosRegistrados.delete(usuarioDemo.correo.toLowerCase())
    usuarioDemo.correo = correoPendiente
    correosRegistrados.add(usuarioDemo.correo.toLowerCase())
    correoPendiente = ''
    return HttpResponse.json(usuarioDemo)
  }),

  http.put(ruta('/auth/contrasena'), async ({ request }) => {
    const cuerpo = (await request.json()) as { contrasenaActual: string; contrasenaNueva: string }
    if (cuerpo.contrasenaActual !== contrasenaActual) {
      return HttpResponse.json({ mensaje: 'La contraseña actual no es correcta.' }, { status: 400 })
    }
    contrasenaActual = cuerpo.contrasenaNueva
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(ruta('/auth/recuperar-contrasena'), () =>
    HttpResponse.json({
      mensaje:
        'Si el correo está asociado a una cuenta, recibirás un enlace para cambiar tu contraseña.',
    }),
  ),

  http.post(ruta('/auth/restablecer-contrasena'), async ({ request }) => {
    const cuerpo = (await request.json()) as { token: string; contrasenaNueva: string }
    if (!cuerpo.token) return HttpResponse.json({ mensaje: 'Enlace no válido.' }, { status: 400 })
    contrasenaActual = cuerpo.contrasenaNueva
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(ruta('/mascotas'), () => HttpResponse.json(mascotas)),

  http.post(ruta('/mascotas'), async ({ request }) => {
    const cuerpo = (await request.json()) as Omit<Mascota, 'id' | 'usuarioId'>
    const nueva: Mascota = { ...cuerpo, id: generarId('m'), usuarioId: 'u1' }
    mascotas.push(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.put(ruta('/mascotas/:id'), async ({ params, request }) => {
    const indice = mascotas.findIndex((mascota) => mascota.id === params.id)
    if (indice === -1) return new HttpResponse(null, { status: 404 })
    const cambios = (await request.json()) as Partial<Mascota>
    const actual = mascotas[indice]
    if (!actual) return new HttpResponse(null, { status: 404 })
    const actualizada = { ...actual, ...cambios }
    mascotas[indice] = actualizada
    return HttpResponse.json(actualizada)
  }),

  http.delete(ruta('/mascotas/:id'), ({ params }) => {
    const indice = mascotas.findIndex((mascota) => mascota.id === params.id)
    if (indice === -1) return new HttpResponse(null, { status: 404 })
    mascotas.splice(indice, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(ruta('/dispositivos'), () => HttpResponse.json(dispositivos)),

  http.post(ruta('/dispositivos/:id/dispensar'), async ({ params, request }) => {
    const dispositivo = dispositivos.find((item) => item.id === params.id)
    if (!dispositivo) return new HttpResponse(null, { status: 404 })

    const cuerpo = (await request.json().catch(() => ({}))) as { gramos?: number }
    const nueva: Dispensacion = {
      id: generarId('disp'),
      dispositivoId: dispositivo.id,
      mascotaId: dispositivo.mascotaId,
      horarioId: null,
      fechaHora: new Date().toISOString(),
      gramos: cuerpo.gramos ?? 50,
      tipo: 'manual',
      estado: dispositivo.estadoConexion === 'conectado' ? 'exitosa' : 'fallida',
    }
    dispensaciones.unshift(nueva)
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.get(ruta('/horarios'), () => HttpResponse.json(horarios)),

  http.post(ruta('/horarios'), async ({ request }) => {
    const cuerpo = (await request.json()) as Omit<Horario, 'id'>
    const nuevo: Horario = { ...cuerpo, id: generarId('h') }
    horarios.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.put(ruta('/horarios/:id'), async ({ params, request }) => {
    const indice = horarios.findIndex((horario) => horario.id === params.id)
    if (indice === -1) return new HttpResponse(null, { status: 404 })
    const cambios = (await request.json()) as Partial<Horario>
    const actual = horarios[indice]
    if (!actual) return new HttpResponse(null, { status: 404 })
    const actualizado = { ...actual, ...cambios }
    horarios[indice] = actualizado
    return HttpResponse.json(actualizado)
  }),

  http.delete(ruta('/horarios/:id'), ({ params }) => {
    const indice = horarios.findIndex((horario) => horario.id === params.id)
    if (indice === -1) return new HttpResponse(null, { status: 404 })
    horarios.splice(indice, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(ruta('/historial'), ({ request }) => {
    const url = new URL(request.url)
    const pagina = Number(url.searchParams.get('pagina') ?? '1')
    const porPagina = Number(url.searchParams.get('porPagina') ?? '10')
    const estado = url.searchParams.get('estado')
    const mascotaId = url.searchParams.get('mascotaId')
    const desde = url.searchParams.get('desde')
    const hasta = url.searchParams.get('hasta')

    let filtradas = dispensaciones
    if (estado) filtradas = filtradas.filter((item) => item.estado === estado)
    if (mascotaId) filtradas = filtradas.filter((item) => item.mascotaId === mascotaId)
    if (desde) filtradas = filtradas.filter((item) => item.fechaHora.slice(0, 10) >= desde)
    if (hasta) filtradas = filtradas.filter((item) => item.fechaHora.slice(0, 10) <= hasta)

    const inicio = (pagina - 1) * porPagina
    const items = filtradas.slice(inicio, inicio + porPagina)

    return HttpResponse.json({
      items,
      total: filtradas.length,
      pagina,
      porPagina,
    })
  }),

  http.get(ruta('/historial/exportar'), ({ request }) => {
    const url = new URL(request.url)
    const formato = url.searchParams.get('formato')
    const tipoContenido: Record<string, string> = {
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    const mime = formato ? tipoContenido[formato] : undefined
    if (!formato || !mime) {
      return HttpResponse.json({ mensaje: 'Formato de exportación no válido.' }, { status: 422 })
    }
    const contenido =
      formato === 'pdf'
        ? crearPdfDemostracion()
        : new TextEncoder().encode('DisPet - Historial de comidas (archivo de demostración)')
    return new HttpResponse(contenido, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="historial-dispet.${formato}"`,
      },
    })
  }),
]
