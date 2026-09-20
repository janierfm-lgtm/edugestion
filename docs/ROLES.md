# Roles del equipo (proyecto individual)

Este proyecto se desarrolló de forma individual (ver la modalidad confirmada al iniciar el trabajo). Sin embargo, la actividad pide simular la organización de un equipo real de desarrollo de software. A continuación se describen los roles que normalmente existirían en un equipo, y cómo el autor los asumió en distintos momentos del proyecto.

## Product Owner
**Responsabilidad habitual:** definir qué problema resuelve el producto, priorizar el backlog y decidir qué se construye primero.

**En este proyecto:** el autor definió el problema (gestión académica en el sector Educación: matrícula, notas y asistencia), redactó las historias de usuario del backlog (`SPRINTS.md`) y decidió el orden de prioridad: primero la seguridad y la integridad de los datos (backend), después la usabilidad (frontend), y al final la infraestructura de despliegue.

## Scrum Master / Coordinador ágil
**Responsabilidad habitual:** organizar el flujo de trabajo, quitar obstáculos y asegurar que el equipo siga el proceso ágil acordado.

**En este proyecto:** el autor organizó el trabajo en tres sprints de alcance fijo con un tablero Kanban de tres columnas, y dejó registrada una retrospectiva al final de cada sprint con lo que funcionó y lo que no (ver `SPRINTS.md`).

## Desarrollador Backend
**Responsabilidad habitual:** diseñar y construir la API, el modelo de datos y la lógica de negocio.

**En este proyecto:** el autor diseñó el esquema relacional en PostgreSQL, implementó la API REST en Express con autenticación JWT y autorización por rol, la bitácora de actividad en MongoDB, y escribió las pruebas automatizadas con Jest.

## Desarrollador Frontend
**Responsabilidad habitual:** construir la interfaz con la que interactúan las personas usuarias finales.

**En este proyecto:** el autor construyó la SPA en React, el manejo de sesión, las rutas protegidas por rol y las pantallas de cada módulo (cursos, matrículas, notas, asistencia), cuidando que la interfaz fuera responsive y accesible.

## Ingeniero DevOps / Responsable de infraestructura
**Responsabilidad habitual:** empaquetar la aplicación, automatizar su despliegue y vigilar su salud en producción.

**En este proyecto:** el autor escribió los `Dockerfile`, el `docker-compose.yml`, los manifiestos de Kubernetes, el pipeline de GitHub Actions y la configuración de Prometheus/Grafana.

## Docente del curso (Percy Falén Morales)
Además de los roles anteriores, propios del equipo de desarrollo, cabe señalar el rol del autor en su vida profesional real: **Percy Janier Falén Morales**, Ingeniero Mecánico Electricista, Jefe de Taller y Docente, responsable del curso "Herramientas y Servicios para Desarrolladores en la Web" dentro de Educación para el Trabajo (EPT). Este proyecto integrado es, a la vez, un ejercicio práctico del propio curso que dicta, lo que motivó que el caso de uso elegido (gestión académica) estuviera directamente relacionado con su contexto real de trabajo.

## Cómo se habría repartido en un equipo real

| Rol | Nº de personas sugerido | Entregable principal |
|---|---|---|
| Product Owner | 1 | Backlog priorizado, criterios de aceptación |
| Scrum Master | 1 (puede compartirse con otro rol) | Tablero Kanban, retrospectivas |
| Backend | 1–2 | API, modelo de datos, pruebas |
| Frontend | 1–2 | SPA, diseño responsive |
| DevOps | 1 | Contenedores, CI/CD, monitoreo |

En un equipo de 4 a 6 personas, estos roles no serían excluyentes entre sí: por ejemplo, quien lidera el backend puede también participar en DevOps, como ocurrió en este proyecto individual.
