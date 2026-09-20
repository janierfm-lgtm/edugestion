# --- Etapa de dependencias ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# --- Imagen final ---
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Usuario sin privilegios (buenas prácticas de seguridad en contenedores)
RUN addgroup -S edugestion && adduser -S edugestion -G edugestion

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

USER edugestion

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]
