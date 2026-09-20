# Metodología ágil y planificación de sprints

## 1. Contexto: trabajo individual con metodología de equipo

Este proyecto fue desarrollado por una sola persona (Percy Falén Morales), pero se organizó y documentó siguiendo las prácticas ágiles que pediría un equipo real, para dejar evidencia del proceso de planificación y no solo del resultado final. En un contexto de equipo, cada uno de los roles descritos en `ROLES.md` habría sido una persona distinta; aquí, el mismo autor asumió los cuatro roles en momentos distintos del trabajo, y esta bitácora refleja esos cambios de sombrero.

Se usó un tablero Kanban de tres columnas (**Por hacer / En progreso / Hecho**) y sprints cortos de alcance fijo en vez de sprints por fecha calendario, dado que el trabajo se ejecutó de forma intensiva y no distribuida en semanas.

## 2. Product Backlog (resumen)

| # | Historia de usuario | Prioridad |
|---|---|---|
| HU-1 | Como administrador, quiero crear cuentas con rol (admin/docente/estudiante) para controlar quién accede al sistema | Alta |
| HU-2 | Como docente, quiero crear y editar cursos para organizar mi oferta académica | Alta |
| HU-3 | Como docente, quiero matricular estudiantes en mis cursos | Alta |
| HU-4 | Como docente, quiero registrar notas de mis estudiantes por evaluación | Alta |
| HU-5 | Como docente, quiero registrar la asistencia diaria de mis estudiantes | Alta |
| HU-6 | Como estudiante, quiero ver mis propios cursos, notas y asistencia | Media |
| HU-7 | Como administrador, quiero ver una bitácora de quién hizo cada cambio | Media |
| HU-8 | Como cualquier usuario, quiero una interfaz que funcione bien en mi celular | Media |
| HU-9 | Como responsable técnico, quiero que el sistema se pueda desplegar en contenedores y escalar | Alta |
| HU-10 | Como responsable técnico, quiero pruebas automáticas y un pipeline de CI/CD para no romper producción | Alta |
| HU-11 | Como responsable técnico, quiero métricas y alertas del estado del sistema en producción | Media |

## 3. Sprints

### Sprint 1 — Fundación del backend
**Objetivo:** tener una API funcional, segura y probada, antes de construir nada visual.

- Diseño del modelo de datos relacional (`001_init.sql`): usuarios, cursos, matrículas, notas, asistencia.
- Autenticación con JWT y contraseñas con `bcryptjs`.
- Middleware de autorización por rol y de validación de entrada.
- CRUD completo de cursos, matrículas, notas y asistencia.
- Bitácora de actividad en MongoDB (polyglot persistence).
- Pruebas automatizadas con Jest + Supertest sobre una base de datos de pruebas aislada.

**Resultado:** 14 pruebas automatizadas pasando; API verificada manualmente con `curl` y con una colección de Postman.

### Sprint 2 — Interfaz de usuario
**Objetivo:** dar una cara usable a la API para los tres roles.

- Aplicación React con Vite y Tailwind CSS v4.
- Pantalla de login y manejo de sesión con Context API + interceptores de Axios.
- Rutas protegidas por rol (`ProtectedRoute`).
- Pantallas de Dashboard, Cursos, Matrículas, Notas y Asistencia.
- Verificación visual con capturas de pantalla del flujo completo (login → dashboard → cursos).

**Resultado:** SPA funcional, responsive, consumiendo la API real en desarrollo local.

### Sprint 3 — Contenedores, despliegue y observabilidad
**Objetivo:** dejar el proyecto listo para desplegarse en cualquier entorno, no solo en la máquina de desarrollo.

- `Dockerfile` multi-etapa para backend (Node) y frontend (build con Node, servido con Nginx).
- `docker-compose.yml` orquestando los seis servicios (backend, frontend, PostgreSQL, MongoDB, Prometheus, Grafana).
- Manifiestos de Kubernetes con ConfigMap/Secret, sondas de salud, PVC para las bases de datos y HPA para el backend.
- Pipeline de GitHub Actions: lint, pruebas, build de frontend, build de imágenes Docker y despliegue del frontend a Netlify.
- Configuración de Prometheus (scrape del endpoint `/metrics`) y de un dashboard de Grafana provisionado automáticamente.
- Colección de Postman con las 18 peticiones principales de la API, verificada en vivo contra el backend.

**Resultado:** repositorio funcional completo, con infraestructura como código y pipeline de CI/CD, listo para clonar y ejecutar.

## 4. Retrospectiva

**Qué funcionó bien:** dividir el trabajo en "primero la API, después la interfaz, al final la infraestructura" permitió probar cada capa de forma aislada antes de integrarla, y detectar errores temprano (por ejemplo, un caso real: al probar la API con datos que hacían referencia a un registro ya eliminado, el sistema devolvía un error 500 genérico en vez de una respuesta clara; se corrigió el manejador de errores para traducir ese tipo de fallo de base de datos a una respuesta 409 entendible).

**Qué se haría diferente en equipo:** con más de una persona, el Sprint 2 (frontend) y parte del Sprint 1 (endpoints menos críticos, como asistencia) podrían haberse trabajado en paralelo en vez de en secuencia, reduciendo el tiempo total.

**Riesgo identificado y gestionado:** el entorno de construcción usado para verificar este proyecto no tenía acceso al registro de imágenes Docker Hub. Se gestionó ese riesgo verificando la lógica de la aplicación contra una base de datos PostgreSQL instalada de forma nativa, y dejando documentada esa limitación en `ARQUITECTURA.md` para que quien despliegue el proyecto en un entorno con internet normal sepa que el `docker compose up` no fue probado de punta a punta en este entorno específico, aunque sí sigue patrones estándar.
