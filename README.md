# idempotencia — Frontend

Frontend de **idempotencia**, construido con **React + Vite + TypeScript** siguiendo arquitectura **Feature-Sliced Design (FSD)**.

> **Estado actual:** landing page provisional ("Estamos trabajando para usted"). Es un placeholder mientras se desarrolla el producto — no requiere backend, API keys ni variables de entorno.

- **Dominio de destino:** `idempotencia.andrescortes.dev`
- **Tipo de sitio:** SPA estática (sin SSR, sin backend)

---

## Requisitos

- **Node.js** ≥ 18 (recomendado 20 LTS o superior)
- **npm** ≥ 9 (viene con Node)

No se requiere ninguna otra herramienta, base de datos ni variable de entorno para este estado del proyecto.

---

## Puesta en marcha local

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
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

## Despliegue (para DevOps)

Este proyecto es una **SPA estática**: el artefacto a desplegar es únicamente el contenido de `dist/` tras correr `npm run build`.

1. **Build:**
   ```bash
   npm ci
   npm run build
   ```
   (`npm ci` en vez de `npm install` en CI, para builds reproducibles a partir de `package-lock.json`.)
2. **Servir** el contenido de `dist/` como archivos estáticos (Nginx, S3+CloudFront, Vercel, Netlify, etc.).
3. **Dominio:** apuntar `idempotencia.andrescortes.dev` al hosting elegido. El sitio se sirve desde la raíz del dominio (no requiere subpath ni `base` especial en `vite.config.ts`).
4. **SPA fallback:** aunque hoy solo hay una página, configurar el servidor para redirigir cualquier ruta desconocida a `index.html` (fallback típico de SPA), de forma que no haya que reconfigurar el hosting cuando se agreguen rutas reales.
5. **Variables de entorno:** no hay ninguna en este momento. Si se agregan más adelante, deben inyectarse en build time con el prefijo `VITE_` (convención de Vite) y documentarse aquí.
6. **HTTPS:** recomendado forzar HTTPS en el dominio final.

No hay contenedor Docker ni pipeline de CI/CD definidos todavía — el build es un simple `npm ci && npm run build` que puede correr en cualquier runner con Node ≥ 18.

---

## Arquitectura (Feature-Sliced Design)

```
src/
├── app/          # Inicialización de la app: composición raíz, estilos globales, providers
│   ├── App.tsx
│   └── styles/global.css
├── pages/        # Páginas completas, componen widgets/features/entities
│   └── landing/
│       ├── ui/LandingPage.tsx
│       └── index.ts        # API pública del slice
├── widgets/      # Bloques de UI compuestos y reutilizables entre páginas (aún vacío)
├── features/     # Casos de uso con interacción del usuario (aún vacío)
├── entities/     # Modelos de negocio y su UI asociada (aún vacío)
├── shared/       # Código sin lógica de negocio, reutilizable en todo el proyecto
│   ├── assets/    # Imágenes, gifs, etc.
│   ├── config/    # Design tokens (colores, tipografías) de marca
│   └── ui/        # Componentes de UI genéricos (aún vacío)
├── main.tsx      # Entry point de React
└── vite-env.d.ts
```

**Regla de capas FSD** (de abajo hacia arriba, cada capa solo puede importar de las inferiores):

```
shared → entities → features → widgets → pages → app
```

Cada slice expone su API pública a través de un `index.ts` (ver `src/pages/landing/index.ts`); el resto del código importa desde ahí, nunca desde archivos internos del slice.

Las carpetas `widgets/`, `features/` y `entities/` están vacías (con un `.gitkeep`) porque la landing actual no las necesita todavía — quedan listas para cuando se agregue funcionalidad real.

---

## Identidad de marca

Los tokens de diseño (colores, tipografías, sombras del estilo *claymorphism*) viven en [`src/shared/config/tokens.css`](src/shared/config/tokens.css) y están tomados del documento de branding del proyecto. Cualquier nuevo componente debe usar esas variables CSS (`var(--color-*)`, `var(--font-*)`, `var(--shadow-*)`) en vez de valores hardcodeados.
