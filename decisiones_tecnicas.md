# Decisiones técnicas — idempotencia (Frontend)

Este documento explica las decisiones de arquitectura y stack tecnológico tomadas para el frontend de idempotencia: qué se eligió, en qué consiste cada pieza y por qué se prefirió sobre las alternativas.

---

## 1. Arquitectura: Feature-Sliced Design (FSD)

### ¿En qué consiste?

FSD es una metodología de organización de código frontend que divide el proyecto en **capas** (layers) horizontales, y cada capa en **slices** verticales (por dominio/funcionalidad). En este proyecto (`src/`) las capas son:

```
app       → inicialización de la aplicación: providers, routing, estilos globales
pages     → páginas completas (landing, login, register, welcome, dashboard)
widgets   → bloques de UI compuestos y reutilizables entre páginas (site-header, platform-stats...)
features  → casos de uso con interacción del usuario (auth-with-provider, logout)
entities  → modelos de negocio y su UI asociada (user, database, platform-stats)
shared    → código sin lógica de negocio, reutilizable en todo el proyecto (api, ui, lib, config)
```

La regla central es la **regla de importación unidireccional**: una capa solo puede importar de las capas que están por debajo de ella en esa lista. `shared` no puede importar de `entities`; `entities` no puede importar de `features`; `pages` puede importar de todo lo de abajo, pero nada de `widgets`/`features`/`entities`/`shared` puede importar de una `page`. Esto se ve reflejado directamente en el proyecto: por ejemplo `shared/api/types.ts` define los contratos de datos (`User`, `DatabaseRecord`, `PlatformStats`) y `entities/user`, `entities/database` simplemente los re-exportan y les agregan UI/lógica propia — nunca al revés.

Además, cada slice expone su **API pública** a través de un único `index.ts` (barrel file). El resto del código nunca importa un archivo interno de un slice directamente (`entities/database/ui/StatusBadge.tsx`), siempre pasa por el barrel (`@/entities/database`). Esto es lo que permite mover o refactorizar el interior de un slice sin romper a quien lo consume.

### ¿Por qué se eligió?

El proyecto va a crecer rápido y en paralelo: hoy son 5 vistas (landing, login, register, welcome, dashboard), pero el roadmap ya contempla más features de negocio (gestión de bases de datos, métricas, roles, etc.) y, cuando el backend entregue las APIs reales, va a haber que tocar la capa de datos sin reescribir la UI. Una estructura por tipo de archivo genérico (`components/`, `hooks/`, `utils/` sueltos) se vuelve difícil de navegar y de acotar responsabilidades apenas el proyecto pasa de un puñado de pantallas. FSD resuelve esto imponiendo una regla explícita de "qué puede depender de qué", en vez de dejarlo a la disciplina de cada persona que toque el código.

### Beneficios concretos que ya se ven en este proyecto

- **Cambios acotados y predecibles.** El bug de la condición de carrera en el logout (ver historial del proyecto) se resolvió tocando un único archivo (`features/logout/ui/LogoutButton.tsx`) sin tener que revisar páginas ni widgets — porque la responsabilidad estaba exactamente donde FSD dice que debe estar.
- **Reutilización real, no copy-paste.** `widgets/database-connection-card` se usa tanto en `pages/welcome` (credenciales visibles) como en `pages/dashboard` (credenciales enmascaradas) con una sola prop de diferencia, en vez de dos componentes casi idénticos.
- **La capa `shared/api` como frontera de integración.** Hoy `authApi`, `databaseApi` y `platformStatsApi` devuelven datos simulados (mock, persistidos en `localStorage`) porque el equipo de backend aún no entregó nada. El día que las APIs reales existan, solo se reemplaza el cuerpo de esas funciones — ninguna página, widget o feature necesita cambiar, porque todos dependen de la *forma* de los datos (`shared/api/types.ts`), no de si vienen de un mock o de un `fetch`.
- **Onboarding más rápido.** Cualquier persona nueva en el equipo puede preguntar "¿dónde vive la lógica de X?" y la respuesta es mecánica: ¿es una página completa? → `pages`. ¿Es una acción del usuario? → `features`. ¿Es un modelo de negocio? → `entities`. ¿No tiene nada de negocio? → `shared`.
- **Escala sin reescritura.** Agregar una sexta vista, o una nueva feature dentro del dashboard, no obliga a reorganizar lo que ya existe — solo se agrega un slice nuevo en la capa correspondiente.

---

## 2. React

### ¿En qué consiste?

React es una librería de JavaScript/TypeScript para construir interfaces de usuario mediante **componentes**: funciones que reciben datos (`props`) y devuelven una descripción declarativa de la UI (JSX), que React se encarga de sincronizar con el DOM real. El estado de la aplicación (sesión del usuario, datos de la base de datos, etc.) se modela con `useState`/`useContext` y React re-renderiza automáticamente los componentes afectados cuando ese estado cambia.

### ¿Por qué se eligió?

- **Es el estándar de facto para el ecosistema al que pertenece FSD.** Feature-Sliced Design nació y se documenta principalmente en comunidades React; la disponibilidad de patrones, ejemplos y convenciones probadas es mayor que en cualquier otro framework.
- **Modelo de componentes que encaja naturalmente con FSD.** Cada slice de UI (una página, un widget, una feature) se traduce 1:1 a un árbol de componentes React, sin necesidad de capas de abstracción adicionales.
- **Curva de adopción y disponibilidad de talento.** Es el framework de UI más usado en el mercado, lo que facilita sumar más desarrolladores al proyecto sin fricción.
- **Ecosistema maduro para lo que viene.** Cuando se integren las APIs reales, hay soluciones probadas dentro del mismo ecosistema (React Query, Redux Toolkit/RTK Query, etc.) que se integran sin fricción con la estructura actual, si el proyecto llega a necesitarlas.

### Beneficios concretos en este proyecto

- **Composición sin duplicación.** El flujo de autenticación (`features/auth-with-provider`) es un solo hook (`useProviderAuth`) reutilizado por Login y Registro, cambiando solo una prop de texto — típico patrón de composición de React.
- **Enrutamiento declarativo con React Router**, incluyendo *guards* de autenticación (`RequireAuth`, `RequireGuest`) expresados como componentes de ruta normales, sin lógica imperativa esparcida por la app.
- **Reactividad automática.** Cuando `clearSession()` cambia el estado de sesión, toda la UI que depende de "¿hay usuario logueado?" (el header, los guards de ruta) se actualiza sola, sin código manual de sincronización.

---

## 3. Vite

### ¿En qué consiste?

Vite es la herramienta de build y servidor de desarrollo del proyecto. En desarrollo sirve los módulos de TypeScript/JSX directamente al navegador usando ES Modules nativos (sin empaquetar todo de antemano), lo que hace que el servidor arranque casi instantáneamente y que los cambios se reflejen en milisegundos (Hot Module Replacement). Para producción, usa Rollup por debajo para generar un build optimizado, con *code splitting* y *hashing* de archivos para cache-busting (se ve en `dist/assets/index-<hash>.js`).

### ¿Por qué se eligió?

- **Velocidad de desarrollo.** Frente a alternativas basadas en bundlers tradicionales (Webpack), Vite no tiene que re-empaquetar toda la app en cada cambio — arranca en milisegundos y el HMR es prácticamente instantáneo, algo relevante dado el ritmo de iteración de este proyecto (5 vistas nuevas construidas y verificadas en una sola sesión).
- **Cero configuración para lo que necesitamos.** Soporte nativo de TypeScript, JSX, CSS Modules (usados en todo el proyecto, p. ej. `LandingPage.module.css`) y variables de entorno `VITE_*`, sin plugins adicionales que mantener.
- **Build de producción simple y estático.** `npm run build` genera un `dist/` 100% estático, que es exactamente lo que necesita el `Dockerfile` (etapa `nginx`) para servir el sitio — no requiere Node en tiempo de ejecución ni un servidor con estado.
- **Es el bundler de referencia para proyectos React nuevos** que no requieren SSR (no es el caso aquí: el proyecto es una SPA pura), donde Next.js sería una complejidad innecesaria.

### Beneficios concretos en este proyecto

- **Iteración rápida durante la verificación en navegador**: cada cambio (por ejemplo, el fix de la condición de carrera del logout) se reflejó al instante en el servidor de desarrollo sin reinicios manuales.
- **Build reproducible y liviano** para CI/CD: `npm ci && npm run build` es todo lo que necesita el pipeline, documentado en el `README.md` para DevOps.
- **Alias de rutas (`@/`)** configurados una sola vez en `vite.config.ts` y reutilizados en todo el código (`@/shared/api`, `@/entities/user`, etc.), lo que mantiene los imports legibles incluso con la profundidad de carpetas que impone FSD.

---

## 4. TypeScript

### ¿En qué consiste?

TypeScript es un superset de JavaScript que agrega tipado estático opcional, verificado en tiempo de compilación (`tsc`) antes de que el código llegue al navegador. El proyecto lo usa en modo `strict`, lo que exige tipar explícitamente las formas de los datos y prohíbe patrones inseguros (variables implícitamente `any`, accesos a propiedades que podrían no existir, etc.).

### ¿Por qué se eligió?

- **Los contratos de datos son el corazón de la estrategia de integración futura.** Todo el proyecto está diseñado para que, cuando lleguen las APIs reales del backend, solo haya que cambiar la implementación de `shared/api/*.ts` sin tocar el resto. Eso solo es seguro si los **tipos** (`User`, `DatabaseRecord`, `PlatformStats` en `shared/api/types.ts`) están explícitos y el compilador avisa apenas algo deja de encajar — sin TypeScript, ese contrato sería solo una convención informal, fácil de romper sin darse cuenta.
- **Detecta errores antes de llegar al navegador.** `npm run build` corre `tsc -b` antes de generar el bundle; un error de tipos rompe el build en vez de manifestarse como un bug en producción.
- **Autocompletado y refactors seguros.** Con una arquitectura en capas como FSD, donde el mismo tipo (`DatabaseRecord`) viaja desde `shared/api` hasta `entities/database`, `widgets/database-connection-card` y `pages/dashboard`, el tipado estático es lo que permite renombrar o extender un campo (por ejemplo, agregar `spaceMaxMb`) y que el compilador señale automáticamente cada lugar que hay que actualizar.
- **Estándar de facto junto con React + Vite.** Es la combinación con mejor soporte de tooling (ESLint, editor, autocompletado) del ecosistema actual.

### Beneficios concretos en este proyecto

- **Cero errores de tipos en producción hasta ahora**: todo el flujo de autenticación, aprovisionamiento y dashboard pasó `tsc -b` sin `any` ni *type assertions* forzadas.
- **Refactors ya probados durante el desarrollo**: al dividir `session-context.tsx` en `session-context.ts` + `SessionProvider.tsx` + `use-session.ts` (para dejar el lint en cero), TypeScript garantizó que el tipo `SessionContextValue` siguiera siendo el mismo en los tres archivos sin necesidad de pruebas manuales.
- **Los mocks son honestos.** `shared/api/mock/mockStore.ts` construye datos falsos, pero como devuelve el tipo `DatabaseRecord` real, es imposible que el mock "mienta" sobre la forma de los datos que va a mandar el backend de verdad.

---

## Resumen

| Decisión | En qué consiste | Por qué se eligió |
|---|---|---|
| **Feature-Sliced Design** | Capas (`app/pages/widgets/features/entities/shared`) con regla de importación unidireccional y API pública por slice | Escala sin reescritura, acota el impacto de cada cambio y aísla la futura integración con el backend en `shared/api` |
| **React** | UI declarativa basada en componentes y estado reactivo | Estándar del ecosistema FSD, curva de adopción baja, ecosistema maduro |
| **Vite** | Dev server basado en ES Modules nativos + build de producción con Rollup | Arranque y HMR casi instantáneos, build 100% estático listo para el `Dockerfile`/Nginx |
| **TypeScript** | JavaScript con tipado estático estricto | Protege el contrato de datos que hace posible integrar las APIs reales sin reescribir la UI, detecta errores antes de producción |
