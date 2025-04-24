# 1. Base Image: Usar una imagen oficial de Node.js (Alpine es más ligera)
FROM node:20-alpine AS base

# Establecer el directorio de trabajo
WORKDIR /app

# 2. Dependencias
FROM base AS deps
# Copiar package.json y lockfile (usa npm ci para instalaciones más consistentes en CI/CD)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Builder: Construir la aplicación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Establecer variables de entorno necesarias para la compilación (NEXT_PUBLIC_...)
# Debes agregar aquí TODAS las variables NEXT_PUBLIC_ que tu app necesite en tiempo de build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# Copiar variables de Supabase del .env
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# === Añadir variables BASE_URL y DASHBOARD_BASE_URL ===
ARG BASE_URL
ENV BASE_URL=${BASE_URL}
ARG DASHBOARD_BASE_URL
ENV DASHBOARD_BASE_URL=${DASHBOARD_BASE_URL}
# ======================================================

RUN npm run build

# 4. Runner: Preparar la imagen final para producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar artefactos de compilación (usando standalone)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Cambiar al usuario 'node' menos privilegiado
USER node

EXPOSE 3000

# Establecer variables de entorno para el runtime (si las hubiera, aparte de las públicas)
ENV PORT=3000
# ENV OTRA_VARIABLE_RUNTIME=valor

# Comando para iniciar la aplicación
CMD ["node", "server.js"] 