# idempotencia — Frontend


Frontend de **idempotencia**, construido con **React + Vite + TypeScript** siguiendo arquitectura **Feature-Sliced Design (FSD)**.

> **Estado actual:** landing con métricas de plataforma, registro/login (email+password real contra el backend, más Google/GitHub simulados), pantalla de bienvenida post-aprovisionamiento y dashboard. El aprovisionamiento de base de datos y las métricas de plataforma todavía son simulados (mock en `localStorage`) — el backend aún no expone esos endpoints. Ver [Integración con backend](#integración-con-backend).

- **Dominio de destino:** `idempotencia.andrescortes.dev`
- **Tipo de sitio:** SPA estática (sin SSR) que consume un backend externo para autenticación

---

## Requisitos

- **Node.js** ≥ 18 (recomendado 20 LTS o superior)
- **npm** ≥ 9 (viene con Node)

No se requiere ninguna base de datos local. Para autenticación por email/password el proyecto pega contra el backend real (ver [Integración con backend](#integración-con-backend)) — no hace falta nada adicional para levantarlo en local, ya trae un valor por defecto.

---

## Puesta en marcha local

```bash
# 1. Instalar dependencias
npm install

# 2. (opcional) copiar el archivo de variables de entorno
cp .env.example .env.local

# 3. Levantar el servidor de desarrollo
npm run dev
```

Esto expone la app en **http://localhost:5173/** con hot-reload. Detener con `Ctrl+C`.

---

## Scripts disponibles

| Comando           | Qué hace                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo (Vite) con hot-reload.                            |
| `npm run build`     | Type-check (`tsc -b`) + build de producción. Genera la carpeta `dist/`.  |
| `npm run preview`   | Sirve localmente el contenido de `dist/` tal como quedaría en producción.|
| `npm run lint`      | Corre ESLint sobre todo el proyecto.                                     |

---

## Build de producción

```bash
npm install
npm run build
```

El resultado queda en **`dist/`**: HTML, JS, CSS y assets ya optimizados y con hashing de cache-busting. Esa carpeta es autocontenida — no depende de Node en tiempo de ejecución, es un sitio 100% estático.

Para verificar el build antes de desplegar:

```bash
npm run preview
```

---

## Integración con backend

El backend de autenticación es real y está documentado por el equipo de backend ("API Colmena"). Estado actual de cada pieza:

| Flujo | Estado |
|---|---|
| Registro/login por email+password (`/auth/register`, `/auth/login`) | **Real**, conectado en `shared/api/authApi.ts`. |
| Login/registro con Google/GitHub | **Simulado** en el cliente. El backend expone `/auth/google/login` y `/auth/github/login`, pero hoy su callback no redirige de vuelta al frontend con el token (devuelve el JSON crudo en el navegador) — conectar el redirect real hoy dejaría al usuario fuera de la SPA. Las URLs reales ya están listas en `shared/api/config.ts` (`OAUTH_URLS`) para cuando backend resuelva el callback. |
| Aprovisionamiento de base de datos, métricas de la landing | **Mock** (`localStorage`, vía `shared/api/mock/`) — el backend todavía no expone estos endpoints. |

**Variable de entorno:**

```
VITE_API_BASE_URL=https://api.idempotencia.andrescortes.dev
```

Ver [`.env.example`](.env.example). Si no se define, el proyecto usa ese mismo valor por defecto (hardcodeado en `shared/api/config.ts`). Debe inyectarse en **build time** (convención `VITE_*` de Vite): en Docker vía `--build-arg`/`ARG` en el `Dockerfile` (ver sección de Docker), en local vía `.env.local`.

---

## Docker

El proyecto está encapsulado en una imagen Docker autocontenida — es la forma recomendada de desplegarlo. No requiere Node instalado en el host, solo Docker.

**Cómo está armado (`Dockerfile`, multi-stage):**

1. **Etapa `build`** (`node:20-alpine`): instala dependencias con `npm ci` y corre `npm run build`, generando `dist/`.
2. **Etapa `runtime`** (`nginx:1.27-alpine`): copia únicamente `dist/` y sirve esos archivos estáticos con Nginx. La imagen final no contiene Node, `node_modules` ni código fuente — solo el sitio compilado.

`nginx.conf` ya trae configurado:
- **SPA fallback** (`try_files ... /index.html`) para cuando se agreguen rutas cliente.
- **Cache agresivo** (`1y`, `immutable`) para `/assets/*`, que Vite ya versiona con hash en el nombre de archivo.
- **Gzip** para texto, JS, CSS, JSON y SVG.
- **Healthcheck** integrado en la imagen (`wget` contra `/` cada 30s).

### Levantar con Docker Compose (recomendado)

```bash
docker compose up --build
```

Sirve el sitio en **http://localhost:8080/**. El puerto expuesto está definido en `docker-compose.yml` (`8080:80`) y se puede ajustar ahí según el entorno de destino.

Para correrlo en background: `docker compose up --build -d`. Para bajarlo: `docker compose down`.

### Levantar con Docker a mano

```bash
docker build -t idempotencia-frontend .
docker run --rm -p 8080:80 idempotencia-frontend
```

### Notas para el pipeline de CI/CD

- No hace falta `npm install` ni Node en el runner de CI — solo `docker build`. El `Dockerfile` resuelve todo internamente.
- La imagen expone el puerto **80** (Nginx). Mapear al puerto que exponga el hosting/orquestador destino.
- **Variables de entorno:** `VITE_API_BASE_URL` (ver [Integración con backend](#integración-con-backend)). Se inyecta en **build time** vía `--build-arg`:
  ```bash
  docker build --build-arg VITE_API_BASE_URL=https://api.idempotencia.andrescortes.dev -t idempotencia-frontend .
  ```
  Ya trae ese mismo valor por defecto si no se pasa el `--build-arg` — no en runtime, porque el resultado ya es HTML/JS estático servido por Nginx.
- El `.dockerignore` excluye `node_modules`, `dist`, `.git` y demás archivos que no deben viajar al contexto de build, para builds más rápidos y una imagen más liviana.

---

## Despliegue (para DevOps)

1. **Build de la imagen:**
   ```bash
   docker build -t idempotencia-frontend:<tag> .
   ```
2. **Publicar** la imagen en el registry que corresponda (ECR, GHCR, Docker Hub privado, etc.) y desplegarla en el orquestador/hosting elegido (Kubernetes, ECS, un VPS con `docker compose`, etc.), exponiendo el puerto **80** del contenedor.
3. **Dominio:** apuntar `idempotencia.andrescortes.dev` al servicio/loadbalancer que enruta al contenedor. El sitio se sirve desde la raíz del dominio (no requiere subpath ni `base` especial en `vite.config.ts`).
4. **HTTPS:** el contenedor solo sirve HTTP en el puerto 80; la terminación TLS debe hacerse en la capa delante (loadbalancer, reverse proxy o Cloudflare) apuntando al dominio final.
5. **Variables de entorno:** `VITE_API_BASE_URL` — ver la nota de build-time en la sección de Docker.

Alternativa sin Docker (build local con Node, sirviendo `dist/` como estático en cualquier hosting): ver [Build de producción](#build-de-producción) más arriba.

---

## Arquitectura (Feature-Sliced Design)

```
src/
├── app/          # Inicialización: composición raíz, providers (sesión, router), estilos globales
│   ├── providers/
│   ├── routes/    # AppRouter + guards (RequireAuth, RequireGuest)
│   └── App.tsx
├── pages/        # Páginas completas: landing, login, register, welcome, dashboard
│   └── <page>/ui + index.ts
├── widgets/      # Bloques de UI compuestos entre páginas: site-header, platform-stats,
│                 # database-connection-card, database-usage-card
├── features/     # Casos de uso: auth-with-password, auth-with-provider, logout
├── entities/     # Modelos de negocio + su UI: user (sesión), database, platform-stats
├── shared/       # Sin lógica de negocio, reutilizable en todo el proyecto
│   ├── api/       # authApi/databaseApi/platformStatsApi + httpClient + mocks (ver arriba)
│   ├── config/    # Design tokens (colores, tipografías) de marca
│   ├── lib/       # Helpers puros (formatDate, copyToClipboard, getInitials...)
│   └── ui/        # Componentes de UI genéricos (Button, Input, Logo, íconos)
├── main.tsx      # Entry point de React
└── vite-env.d.ts
```

**Regla de capas FSD** (de abajo hacia arriba, cada capa solo puede importar de las inferiores):

```
shared → entities → features → widgets → pages → app
```

Cada slice expone su API pública a través de un `index.ts` (ej. `src/entities/database/index.ts`); el resto del código importa desde ahí, nunca desde archivos internos del slice.

---

## Identidad de marca

Los tokens de diseño (colores, tipografías, sombras del estilo *claymorphism*) viven en [`src/shared/config/tokens.css`](src/shared/config/tokens.css) y están tomados del documento de branding del proyecto. Cualquier nuevo componente debe usar esas variables CSS (`var(--color-*)`, `var(--font-*)`, `var(--shadow-*)`) en vez de valores hardcodeados.
