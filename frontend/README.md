# DisPet — Frontend

Plataforma web para gestionar dispensadores automáticos de comida para
mascotas. El frontend se conecta al backend FastAPI o a MSW en modo demo.

## Stack

React 18 + TypeScript (estricto) + Vite · React Router v6 · TanStack Query ·
Zustand · react-hook-form + Zod · CSS Modules · Vitest + Testing Library ·
MSW · ESLint + Prettier.

## Conexión con los datos

Por defecto, el frontend usa el backend FastAPI en `http://localhost:8000`;
asegúrate de iniciar primero el backend y de mantener `VITE_USAR_MOCKS=false`
en `.env` para que las cuentas y los cambios se guarden en PostgreSQL. El perfil
de demostración permanece disponible después de cargar los datos de prueba del
backend. Para volver al modo simulado, cambia `VITE_USAR_MOCKS=true`; ese modo
usa MSW y no persiste cambios en PostgreSQL.

## Funcionalidades añadidas

- El tablero muestra consumo exitoso diario (7 días) y semanal (4 semanas)
  por mascota, a partir del historial.
- El historial filtra por mascota, estado y rango de fechas; permite descargar
  todos los resultados filtrados en Excel, PDF o Word desde el backend.
- Mi perfil permite editar datos personales, activar avisos de batería baja y
  actualizaciones, y cambiar contraseña. El correo se cambia tras confirmar un
  código enviado a la nueva dirección.
- El registro, el inicio de sesión y las nuevas contraseñas exigen de 9 a 19
  caracteres y al menos un carácter que no sea un número.
- La recuperación envía un enlace de un solo uso por correo; requiere que el
  backend tenga configurado SMTP en `backend/.env`.

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

## Pruebas

Los tests viven junto a lo que prueban (`Boton.test.tsx` al lado de
`Boton.tsx`, `LoginPage.test.tsx` al lado de `LoginPage.tsx`), no en una
carpeta aparte: así se ve de inmediato qué componente o página no tiene
cobertura. La carpeta `tests/` en la raíz solo tiene la infraestructura
compartida:

- `tests/setup.ts` — arranca un servidor MSW en Node (`src/mocks/servidor.ts`,
  los mismos `handlers.ts` de la Fase 3) antes de todos los tests, y lo
  resetea entre cada uno.
- `tests/renderizar.tsx` — un `render` de Testing Library que ya envuelve
  en `QueryClientProvider` y `MemoryRouter`, para no repetirlo en cada
  prueba de una página. Se importa como `@tests/renderizar`.

Qué cubre la suite:

- **Componentes compartidos** (`src/shared/componentes/*/**.test.tsx`):
  que `Boton` no dispare `onClick` si está `disabled` o `cargando`, que
  `Campo`/`Select` asocien la etiqueta con su input y expongan el error
  vía `aria-describedby`, que `Modal` cierre con Escape y enfoque su
  contenido, que `LimiteDeError` capture el fallo y `Reintentar` lo
  recupere.
- **Formularios** (`LoginPage`, `RegistroPage`): cada caso de error de
  Zod (campo vacío, correo inválido, contraseña corta, contraseñas que no
  coinciden) y el camino feliz contra el mock de `/auth/login` real.
- **Una página completa** (`MascotasPage`): lista, valida el alta y
  confirma que la mascota nueva aparece en la tabla — de punta a punta,
  con MSW respondiendo de verdad en vez de mockear `fetch`.

```bash
npm run test        # toda la suite, una vez
npm run test:watch  # modo watch
```

## Nota de seguridad

`react-router-dom@6.30.6` (la última versión de la rama v6) tiene dos
advisories moderados abiertos (CVE sobre open-redirect en `Link`/`useNavigate`
y sobre `deserializeErrors()` en SSR). El segundo no aplica: esta app es
100% cliente, sin SSR. El primero se mitiga no construyendo rutas de
navegación a partir de datos sin sanitizar. La rama v7 ya lo corrige, pero
el stack pedido fija React Router en v6.
