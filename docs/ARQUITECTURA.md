# Arquitectura de EduGestión

## 1. Problema y sector

EduGestión es un sistema de gestión académica pensado para el sector **Educación**. Resuelve un problema real y cotidiano en instituciones educativas de tamaño pequeño y mediano (colegios, academias, institutos): la matrícula de estudiantes, el registro de notas y el control de asistencia se llevan hoy en hojas de cálculo sueltas, cuadernos físicos o sistemas aislados que no se comunican entre sí. Esto genera duplicidad de trabajo, pérdida de historial y falta de trazabilidad sobre quién hizo qué cambio y cuándo.

La aplicación centraliza estas tres funciones en una sola API con una interfaz web, y añade algo que las hojas de cálculo no ofrecen: una bitácora de actividad (quién creó, editó o eliminó cada registro) y control de acceso por rol.

## 2. Visión general de la arquitectura

```
                         ┌─────────────────────┐
                         │      Usuario         │
                         │  (docente/alumno/    │
                         │   administrador)      │
                         └──────────┬───────────┘
                                    │ HTTPS
                         ┌──────────▼───────────┐
                         │   Frontend (SPA)      │
                         │  React 19 + Vite +    │
                         │  Tailwind CSS v4      │
                         │  servido por Nginx     │
                         └──────────┬───────────┘
                                    │ /api  (proxy inverso)
                         ┌──────────▼───────────┐
                         │   Backend API REST    │
                         │  Node.js + Express     │
                         │  JWT + bcrypt + Helmet │
                         └──────┬────────┬───────┘
                                │        │
                   ┌────────────▼──┐  ┌──▼─────────────┐
                   │  PostgreSQL    │  │   MongoDB        │
                   │  (datos        │  │  (bitácora de    │
                   │  transaccionales│  │   actividad,     │
                   │  relacionales) │  │   auditoría)      │
                   └────────────────┘  └──────────────────┘

                         ┌──────────────────────┐
                         │  /metrics (Prometheus) │
                         │  scrapeado por          │
                         │  Prometheus → Grafana   │
                         └──────────────────────┘
```

## 3. Justificación del stack tecnológico

**Backend: Node.js + Express.** Se eligió Express por ser el framework más extendido en el ecosistema JavaScript para APIs REST, con documentación abundante y una curva de aprendizaje adecuada para un proyecto académico que además debe ser mantenible por una sola persona. Express se combina con `express-validator` para validar cada entrada del usuario antes de tocar la base de datos, `helmet` para cabeceras HTTP de seguridad, `cors` para controlar qué orígenes pueden consumir la API, `jsonwebtoken` para la autenticación sin estado, y `bcryptjs` para nunca almacenar contraseñas en texto plano.

**Persistencia políglota: PostgreSQL + MongoDB.** Se usan dos motores de base de datos a propósito, cada uno para lo que mejor resuelve:

- **PostgreSQL** guarda los datos que tienen una estructura fija y relaciones estrictas entre sí (usuarios, cursos, matrículas, notas, asistencia). Estas entidades se benefician de las restricciones de integridad referencial (`FOREIGN KEY`), las restricciones de validación (`CHECK`, por ejemplo que una nota esté entre 0 y 20) y las transacciones ACID que Postgres ofrece de forma nativa.
- **MongoDB** guarda la bitácora de actividad (quién hizo qué, cuándo, sobre qué recurso). Este tipo de dato es un registro de eventos que crece indefinidamente, no tiene relaciones que respetar y su forma puede variar de un evento a otro (por ejemplo, los metadatos de crear un curso no son los mismos que los de eliminar una matrícula). Un modelo de documentos flexible como MongoDB encaja mejor aquí que forzar una tabla relacional rígida.

Esta decisión demuestra en la práctica el criterio de "usar la herramienta correcta para cada tipo de dato" en lugar de forzar todo dentro de un único motor.

**Frontend: React 19 + Vite + Tailwind CSS v4.** Vite ofrece un ciclo de desarrollo rápido (recarga instantánea) y una build de producción optimizada. React se usa con componentes funcionales y hooks, `react-router-dom` para el enrutamiento de la SPA, un `AuthContext` con la Context API de React para compartir el estado de sesión sin pasar props manualmente por todos los niveles, y `axios` con interceptores para adjuntar automáticamente el token JWT a cada petición y manejar sesiones expiradas de forma centralizada. Tailwind CSS v4 permite construir una interfaz responsive (adaptada a celular, tablet y escritorio) sin escribir hojas de estilo separadas por componente.

**Contenedores y orquestación: Docker + Kubernetes.** Cada servicio (backend, frontend, PostgreSQL, MongoDB, Prometheus, Grafana) corre en su propio contenedor con una imagen reproducible. `docker-compose.yml` permite levantar todo el stack con un solo comando en un entorno de desarrollo o demostración. Los manifiestos de `k8s/` describen cómo desplegar el mismo stack en un clúster de Kubernetes real, con auto-escalado horizontal del backend (HPA), sondas de salud (`readinessProbe`/`livenessProbe`), volúmenes persistentes para las bases de datos y separación de configuración (ConfigMap) y secretos (Secret).

**CI/CD: GitHub Actions.** El pipeline definido en `.github/workflows/ci.yml` automatiza lo que un desarrollador tendría que hacer manualmente antes de cada entrega: instalar dependencias, revisar el estilo del código (lint), ejecutar las pruebas automatizadas del backend contra una base de datos PostgreSQL real levantada como servicio del propio workflow, compilar el frontend, construir las imágenes Docker y, en la rama principal, publicarlas y desplegar el frontend a Netlify.

**Monitoreo: Prometheus + Grafana.** El backend expone un endpoint `/metrics` en formato Prometheus (usando `prom-client`) con el número de peticiones HTTP recibidas, la duración de cada petición y las métricas por defecto de Node.js (uso de memoria, garbage collector, etc.). Prometheus recolecta (scrapea) estas métricas periódicamente y Grafana las visualiza en un panel con la tasa de peticiones, la tasa de errores 5xx, la latencia p95 y el estado de disponibilidad del servicio.

## 4. Modelo de datos (PostgreSQL)

| Tabla | Descripción | Relaciones |
|---|---|---|
| `users` | Usuarios del sistema con rol `admin`, `docente` o `estudiante` | — |
| `courses` | Cursos, cada uno con un docente responsable | `teacher_id` → `users.id` |
| `enrollments` | Matrícula de un estudiante en un curso (par único) | `student_id`, `course_id` → `users`, `courses` |
| `grades` | Notas registradas sobre una matrícula (0 a 20) | `enrollment_id` → `enrollments.id` |
| `attendance` | Asistencia diaria de una matrícula (presente/tardanza/falta) | `enrollment_id` → `enrollments.id` |

Todas las claves foráneas tienen borrado en cascada (`ON DELETE CASCADE`) donde corresponde, de modo que eliminar un curso limpia automáticamente sus matrículas, notas y asistencias asociadas, evitando datos huérfanos.

## 5. Seguridad

- Contraseñas nunca almacenadas en texto plano: se guardan con `bcryptjs` (hash + salt).
- Autenticación mediante JWT firmado con un secreto de servidor (`JWT_SECRET`), con expiración configurable.
- Autorización por rol: los endpoints de escritura sensibles (crear/editar/eliminar cursos, matrículas, notas) están restringidos a `admin` y `docente`; ver la bitácora de actividad está restringido solo a `admin`.
- Validación de entrada en cada endpoint con `express-validator`, para rechazar datos mal formados antes de que lleguen a la base de datos.
- Cabeceras de seguridad HTTP con `helmet` (protección contra algunos ataques comunes de navegador).
- Manejo centralizado de errores que nunca expone detalles internos (trazas de pila, consultas SQL) al cliente; los errores de base de datos conocidos (violación de unicidad, de clave foránea, de campo obligatorio) se traducen a mensajes claros en español con el código HTTP correcto (409, 400, etc.) en vez de un 500 genérico.
- El contenedor del backend corre con un usuario sin privilegios de administrador (no root), siguiendo buenas prácticas de seguridad en contenedores.

## 6. Accesibilidad y diseño responsive del frontend

La interfaz usa elementos HTML semánticos (`nav`, `main`, `table`, etiquetas `label` asociadas a sus campos de formulario), contraste de color adecuado y un diseño basado en utilidades de Tailwind que se adapta desde pantallas de celular hasta escritorio mediante *breakpoints* responsive, sin necesidad de una versión "móvil" separada.

## 7. Despliegue

- **Backend y frontend** se empaquetan como imágenes Docker independientes (`backend/Dockerfile`, `frontend/Dockerfile`) y pueden desplegarse juntos con `docker-compose.yml` o por separado en Kubernetes (`k8s/`).
- **Frontend** puede además desplegarse de forma independiente y gratuita en **Netlify** o **Vercel** a partir de la carpeta `frontend/dist` generada por `npm run build`; el job `deploy-frontend` del pipeline de CI/CD ya automatiza la publicación a Netlify.
- El backend está preparado para autoarrancar en cualquier entorno de contenedores: al iniciar, espera a que PostgreSQL esté disponible (reintentando con backoff) y aplica automáticamente el esquema de la base de datos si aún no existe, así que no requiere un paso manual de migración antes del primer arranque.

## 8. Limitación conocida de verificación en este entorno

Este repositorio se construyó y probó en un entorno de espacio aislado (sandbox) sin acceso a Docker Hub (el registro de imágenes de contenedores estaba bloqueado por la política de red del entorno). Por esa razón:

- El **código de la aplicación** (backend y frontend) sí se ejecutó, probó y verificó de extremo a extremo de forma real: los 14 tests automatizados con Jest pasan, y se verificó manualmente con una colección de Postman (18 peticiones) contra el backend corriendo con una base de datos PostgreSQL real.
- Los archivos `docker-compose.yml`, los `Dockerfile` y los manifiestos de `k8s/` se validaron sintácticamente (`docker compose config` se ejecutó sin errores y todos los YAML de Kubernetes se parsearon correctamente), pero **no se pudo ejecutar un `docker compose up` completo de extremo a extremo** en este entorno concreto porque no se pudieron descargar las imágenes base (`node`, `nginx`, `postgres`, `mongo`, `prometheus`, `grafana`) desde Docker Hub.
- En cualquier máquina o servidor con acceso normal a internet (como la del alumno, o un runner de GitHub Actions), `docker compose up --build` debería funcionar sin cambios, ya que los archivos siguen patrones estándar y ampliamente documentados.
