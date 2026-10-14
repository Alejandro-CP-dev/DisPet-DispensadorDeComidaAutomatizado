# DisPet — Frontend

Plataforma de dispensadores automáticos de comida para mascotas controlados
remotamente. Este paquete contiene únicamente el frontend; el backend se
construirá después en Python con FastAPI.

## Stack

React 18 + TypeScript (estricto) + Vite · React Router v6 · TanStack Query ·
Zustand · react-hook-form + Zod · CSS Modules · Vitest + Testing Library ·
MSW · ESLint + Prettier.

## Capa de datos simulada

Mientras no exista backend, toda la red se sirve con MSW (Mock Service
Worker) a partir de `src/mocks/`. El cliente HTTP (`src/shared/api/cliente.ts`,
Fase 3) siempre apunta a `VITE_API_URL`; cuando el backend de FastAPI esté
listo, el único cambio necesario es actualizar esa variable de entorno y
poner `VITE_USAR_MOCKS=false`. Ningún otro archivo debe tocarse.

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Script                 | Qué hace                                             |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con HMR                       |
| `npm run build`        | Typecheck + build de producción                      |
| `npm run preview`      | Sirve el build de producción localmente              |
| `npm run typecheck`    | Solo verifica tipos (`tsc -b --noEmit`)              |
| `npm run lint`         | ESLint sobre todo el proyecto                        |
| `npm run format`       | Prettier, escribe los cambios                        |
| `npm run format:check` | Prettier, solo verifica                              |
| `npm run test`         | Corre la suite de Vitest una vez                     |
| `npm run test:watch`   | Vitest en modo watch                                 |
| `npm run verificar`    | typecheck + lint + format:check + test, en ese orden |

## Estructura

```
src/
├─ app/            bootstrap: providers, router, ruta protegida
├─ features/       un módulo por dominio (landing, auth, mascotas,
│                  dispositivos, horarios, historial), cada uno con
│                  api.ts, hooks.ts, schemas.ts, types.ts, componentes/
│                  y paginas/
├─ shared/         cliente HTTP, componentes de UI reutilizables,
│                  hooks, utils y constantes transversales
├─ styles/         tokens.css (variables de diseño) y global.css
├─ mocks/          handlers y datos de ejemplo para MSW
└─ tipos/          tipos de dominio compartidos entre features
```

Ver también `tsconfig.app.json`: el alias `@/` apunta a `src/`.

## Nota de seguridad

`react-router-dom@6.30.6` (la última versión de la rama v6) tiene dos
advisories moderados abiertos (CVE sobre open-redirect en `Link`/`useNavigate`
y sobre `deserializeErrors()` en SSR). El segundo no aplica: esta app es
100% cliente, sin SSR. El primero se mitiga no construyendo rutas de
navegación a partir de datos sin sanitizar. La rama v7 ya lo corrige, pero
el stack pedido fija React Router en v6.
