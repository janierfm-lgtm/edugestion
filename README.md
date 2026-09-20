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
