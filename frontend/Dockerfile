# --- Etapa de build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# La URL de la API es relativa (/api) porque nginx la enruta al backend,
# así que no se necesita ninguna variable de entorno especial en build time.
RUN npm run build

# --- Etapa de servidor (nginx) ---
FROM nginx:1.27-alpine AS runner
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
