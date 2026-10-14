import { http, HttpResponse } from 'msw'

import type { Dispensacion, Horario, Mascota, Usuario } from '@/tipos'

import { dispensaciones, dispositivos, horarios, mascotas, usuario as usuarioDemo } from './datos'

const URL_BASE = import.meta.env.VITE_API_URL
const ruta = (camino: string) => `${URL_BASE}${camino}`
const CONTRASENA_DEMO = 'dispet123'

function generarId(prefijo: string): string {
  return `${prefijo}-${crypto.randomUUID().slice(0, 8)}`
}

export const handlers = [
  http.post(ruta('/auth/login'), async ({ request }) => {
    const cuerpo = (await request.json()) as { correo: string; contrasena: string }
    if (cuerpo.correo !== usuarioDemo.correo || cuerpo.contrasena !== CONTRASENA_DEMO) {
      return HttpResponse.json({ mensaje: 'Credenciales incorrectas.' }, { status: 401 })
    }
    return HttpResponse.json({ usuario: usuarioDemo, tokenAcceso: generarId('token') })
  }),

  http.post(ruta('/auth/registro'), async ({ request }) => {
    const cuerpo = (await request.json()) as { nombre: string; correo: string }
    const nuevoUsuario: Usuario = {
      id: generarId('u'),
      nombre: cuerpo.nombre,
      correo: cuerpo.correo,
    }
    return HttpResponse.json(
      { usuario: nuevoUsuario, tokenAcceso: generarId('token') },
      { status: 201 },
    )
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

    let filtradas = dispensaciones
    if (estado) filtradas = filtradas.filter((item) => item.estado === estado)
    if (mascotaId) filtradas = filtradas.filter((item) => item.mascotaId === mascotaId)

    const inicio = (pagina - 1) * porPagina
    const items = filtradas.slice(inicio, inicio + porPagina)

    return HttpResponse.json({
      items,
      total: filtradas.length,
      pagina,
      porPagina,
    })
  }),
]
