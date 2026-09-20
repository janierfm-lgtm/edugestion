# EduGestión

Sistema de gestión académica (matrícula, notas y asistencia) desarrollado como Proyecto Integrado del curso **"Herramientas y Servicios para Desarrolladores en la Web"** — Educación para el Trabajo (EPT).

**Autor:** Percy Janier Falén Morales — Ingeniero Mecánico Electricista, Jefe de Taller, Docente
**Sector:** Educación
**Modalidad de trabajo:** individual (roles de equipo simulados; ver [`docs/ROLES.md`](docs/ROLES.md))

## Índice

- [¿Qué resuelve este proyecto?](#qué-resuelve-este-proyecto)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [API — endpoints principales](#api--endpoints-principales)
- [Despliegue](#despliegue)
- [Monitoreo](#monitoreo)
- [CI/CD](#cicd)
- [Documentación adicional](#documentación-adicional)
- [Limitaciones conocidas](#limitaciones-conocidas)

## ¿Qué resuelve este proyecto?

Centraliza en un solo sistema tres procesos que en muchas instituciones educativas pequeñas todavía se llevan en hojas de cálculo sueltas o en papel: la matrícula de estudiantes en cursos, el registro de notas por evaluación y el control de asistencia diaria. Añade control de acceso por rol (administrador, docente, estudiante) y una bitácora de auditoría de quién hizo cada cambio.

Ver el detalle de la arquitectura y las decisiones de diseño en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js 20, Express, JWT, bcrypt, express-validator, Helmet, prom-client |
| Base de datos relacional | PostgreSQL 16 |
| Base de datos de auditoría | MongoDB 7 (Mongoose) |
| Frontend | React 19, Vite, React Router, Tailwind CSS v4, Axios |
| Contenedores | Docker (multi-stage builds), Docker Compose |
| Orquestación | Kubernetes (Deployments, Services, ConfigMap/Secret, PVC, HPA, Ingress) |
| CI/CD | GitHub Actions |
| Despliegue del frontend | Netlify / Vercel |
| Monitoreo | Prometheus + Grafana |
| Pruebas | Jest + Supertest |
| Pruebas de API manuales | Postman / Newman |

## Estructura del repositorio

```
edugestion/
├── backend/              API REST (Express + PostgreSQL + MongoDB)
│   ├── src/
│   │   ├── config/       Conexión a Postgres, Mongo y métricas de Prometheus
│   │   ├── controllers/  Lógica de negocio de cada recurso
│   │   ├── middleware/   Autenticación, autorización, validación, errores
│   │   ├── migrations/   Esquema SQL versionado
│   │   ├── routes/       Definición de endpoints
│   │   └── scripts/      migrate.js y seed.js (datos de ejemplo)
│   ├── tests/            Pruebas Jest + Supertest
│   └── Dockerfile
├── frontend/             SPA en React + Vite + Tailwind
│   ├── src/
│   │   ├── api/          Cliente Axios con interceptores
│   │   ├── context/      Estado de autenticación (Context API)
│   │   ├── components/   Layout y rutas protegidas
│   │   └── pages/        Login, Dashboard, Cursos, Matrículas, Notas, Asistencia
│   ├── nginx.conf        Configuración de Nginx para producción
│   └── Dockerfile
├── k8s/                  Manifiestos de Kubernetes
├── monitoring/           Configuración de Prometheus y Grafana
├── postman/              Colección y entorno de Postman para probar la API
├── docs/                 Arquitectura, sprints, roles, ética/seguridad/sostenibilidad
├── .github/workflows/    Pipeline de CI/CD
└── docker-compose.yml    Orquestación local de todo el stack
```

## Cómo ejecutar el proyecto

### Opción A — Con Docker Compose (recomendada)

Requiere Docker y Docker Compose instalados, y conexión a internet para descargar las imágenes base la primera vez.

```bash
git clone <url-del-repositorio>
cd edugestion
cp backend/.env.example backend/.env   # opcional: personalizar valores
docker compose up --build
```

Esto levanta seis servicios: `postgres`, `mongo`, `backend` (puerto 4000), `frontend` (puerto 8080), `prometheus` (puerto 9090) y `grafana` (puerto 3001). La aplicación queda disponible en `http://localhost:8080`.

> **Nota:** este repositorio se construyó y verificó en un entorno de desarrollo sin acceso a Docker Hub, por lo que el flujo de Docker Compose se validó sintácticamente (`docker compose config`) pero no pudo ejecutarse de punta a punta en ese entorno específico. Ver [Limitaciones conocidas](#limitaciones-conocidas).

### Opción B — Backend y frontend en local (sin Docker)

Requiere Node.js 20+, PostgreSQL y (opcionalmente) MongoDB instalados localmente.

```bash
# Backend
cd backend
cp .env.example .env      # ajustar credenciales de Postgres/Mongo si es necesario
npm install
npm run migrate           # crea las tablas
npm run seed               # crea usuarios y curso de ejemplo
npm run dev                 # http://localhost:4000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### Usuarios de ejemplo (creados por `npm run seed`)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@edugestion.pe | Admin123! |
| Docente | docente@edugestion.pe | Docente123! |
| Estudiante | estudiante@edugestion.pe | Estudiante123! |

## Pruebas automatizadas

```bash
cd backend
npm test
```

Ejecuta 14 pruebas con Jest y Supertest (autenticación, cursos y notas) contra una base de datos de pruebas aislada (`edugestion_test`), que se crea y migra automáticamente antes de correr los tests.

También se incluye una colección de Postman (`postman/EduGestion.postman_collection.json`) con 18 peticiones que cubren salud del servicio, métricas, autenticación, cursos, matrículas, notas, asistencia y bitácora. Puede importarse en Postman o ejecutarse por línea de comandos con [Newman](https://www.npmjs.com/package/newman):

```bash
npx newman run postman/EduGestion.postman_collection.json -e postman/EduGestion.postman_environment.json
```

## API — endpoints principales

Todas las rutas (salvo `/health`, `/metrics`, `/api/auth/register` y `/api/auth/login`) requieren el encabezado `Authorization: Bearer <token>` obtenido al iniciar sesión.

| Método | Ruta | Descripción | Roles permitidos |
|---|---|---|---|
| GET | `/health` | Estado del servicio | público |
| GET | `/metrics` | Métricas en formato Prometheus | público |
| POST | `/api/auth/register` | Registrar usuario | público |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) | público |
| GET | `/api/auth/me` | Perfil del usuario autenticado | cualquier autenticado |
| GET/POST/PUT/DELETE | `/api/courses` | CRUD de cursos | lectura: todos; escritura: admin/docente |
| GET/POST/DELETE | `/api/enrollments` | Matrículas | lectura: todos; escritura: admin/docente |
| GET/POST/PUT/DELETE | `/api/grades` | Notas | lectura: todos; escritura: admin/docente |
| GET/POST | `/api/attendance` | Asistencia | lectura: todos; escritura: admin/docente |
| GET | `/api/logs` | Bitácora de actividad (MongoDB) | solo admin |

## Despliegue

- **Backend y frontend en contenedores:** ver `docker-compose.yml` para un despliegue de un solo nodo, o `k8s/` para un clúster de Kubernetes (incluye auto-escalado del backend con HPA, sondas de salud, volúmenes persistentes y un `Ingress` de ejemplo).
- **Frontend en Netlify/Vercel:** el job `deploy-frontend` de `.github/workflows/ci.yml` compila `frontend/` y lo publica en Netlify automáticamente en cada push a la rama principal (requiere configurar los secretos `NETLIFY_AUTH_TOKEN` y `NETLIFY_SITE_ID` en el repositorio de GitHub).

## Monitoreo

El backend expone métricas Prometheus en `/metrics` (peticiones por segundo, latencia, tasa de errores, uso de memoria). La configuración en `monitoring/prometheus/prometheus.yml` ya apunta a ese endpoint, y `monitoring/grafana/provisioning/` incluye un dashboard de Grafana ("EduGestión - Backend API") provisionado automáticamente al levantar el stack con Docker Compose (usuario `admin` / contraseña `admin` por defecto — cambiar en producción).

## CI/CD

`.github/workflows/ci.yml` ejecuta en cada push o pull request:

1. **backend-test** — instala dependencias, corre lint y las 14 pruebas Jest contra un PostgreSQL real levantado como servicio del workflow.
2. **frontend-build** — instala dependencias y compila el frontend con Vite.
3. **docker-build** — construye las imágenes Docker de backend y frontend, y las publica en GitHub Container Registry al hacer push a `main`/`master`.
4. **deploy-frontend** — publica el frontend compilado en Netlify (solo en `main`/`master`).

## Documentación adicional

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — arquitectura completa, modelo de datos y justificación técnica.
- [`docs/SPRINTS.md`](docs/SPRINTS.md) — backlog, sprints y retrospectiva.
- [`docs/ROLES.md`](docs/ROLES.md) — roles del equipo simulado.
- [`docs/ETICA_SEGURIDAD_SOSTENIBILIDAD.md`](docs/ETICA_SEGURIDAD_SOSTENIBILIDAD.md) — ética, seguridad y sostenibilidad.

## Limitaciones conocidas

Este repositorio fue construido y verificado en un entorno de desarrollo en la nube sin acceso a Docker Hub. Como consecuencia:

- El **código de la aplicación** se probó y verificó de extremo a extremo de forma real (14 pruebas automatizadas + verificación manual de las 18 peticiones de la API con Postman/Newman, todas con respuestas correctas).
- `docker-compose.yml` y los manifiestos de `k8s/` se validaron sintácticamente, pero no se pudo ejecutar un `docker compose up` completo en ese entorno concreto porque no se pudieron descargar las imágenes base desde Docker Hub. En una máquina con acceso normal a internet, esto debería funcionar sin cambios.

Más detalle en la sección 8 de [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).
