# ── Build stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first so this layer is cached while only src/ changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time config (Vite bakes VITE_* vars into the bundle at build time).
# Override with --build-arg VITE_API_BASE_URL=... for a different environment.
ARG VITE_API_BASE_URL=https://api.idempotencia.andrescortes.dev
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ── Runtime stage ────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
