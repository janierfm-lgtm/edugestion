# Ética, seguridad y sostenibilidad

## 1. Ética y protección de datos personales

EduGestión almacena datos personales de estudiantes y docentes (nombres, correos, notas, asistencia), por lo que su diseño tomó en cuenta los siguientes principios:

- **Minimización de datos:** el sistema solo pide los datos estrictamente necesarios para su función académica (nombre, correo, rol, y los datos propios de matrícula/notas/asistencia). No se solicitan datos sensibles innecesarios (documento de identidad, dirección, datos de salud, etc.).
- **Acceso según necesidad (need to know):** un estudiante solo puede ver su propia información; solo docentes y administradores pueden ver o modificar notas y asistencia de un curso; solo un administrador puede ver la bitácora completa de actividad del sistema. Esto se implementa técnicamente con el middleware de autorización por rol en cada endpoint.
- **Trazabilidad sin exposición:** la bitácora de actividad (MongoDB) registra qué usuario hizo qué acción y cuándo, lo cual es necesario para poder auditar el sistema ante un reclamo (por ejemplo, "¿quién cambió esta nota?"), pero el acceso a esa bitácora está restringido solo al rol administrador, precisamente para que esa información de auditoría no se use para vigilancia indebida del resto del personal o del alumnado.
- **Contraseñas:** nunca se guardan en texto plano; se almacenan como hash con `bcryptjs`, de modo que ni siquiera un administrador del sistema puede ver la contraseña original de otra persona.

## 2. Seguridad técnica

Ver también la sección de seguridad en `ARQUITECTURA.md`. En resumen, las medidas implementadas son:

- Autenticación con JWT firmado y con expiración configurable (`JWT_EXPIRES_IN`), en vez de sesiones abiertas indefinidamente.
- Autorización por rol en cada endpoint sensible (no solo se verifica "¿está autenticado?", sino "¿tiene el rol adecuado para esta acción?").
- Validación estricta de toda entrada del usuario (`express-validator`) para prevenir datos malformados o intentos de inyección.
- Uso de consultas parametrizadas (`pg` con `$1, $2, ...`) en vez de concatenar texto en las consultas SQL, lo que elimina el riesgo de inyección SQL.
- Cabeceras HTTP de seguridad con `helmet`.
- Los contenedores corren con un usuario sin privilegios (no root).
- Los secretos (contraseñas de base de datos, secreto JWT) se manejan mediante variables de entorno y, en Kubernetes, mediante el objeto `Secret`, nunca escritos directamente en el código fuente. El archivo `k8s/01-configmap-secrets.yaml` incluido es una **plantilla de ejemplo para desarrollo**; en un despliegue real de producción esos valores se generarían de forma segura y no se subirían al repositorio de código.
- Manejo centralizado y cuidadoso de errores: el sistema nunca expone al cliente detalles internos (trazas de pila, texto crudo de errores de base de datos) que pudieran servir para un ataque; en su lugar, devuelve mensajes claros y códigos HTTP apropiados.

## 3. Uso responsable de herramientas de IA en el desarrollo

Este proyecto se construyó con la asistencia de una herramienta de inteligencia artificial (Claude, de Anthropic) como apoyo técnico para acelerar la escritura de código repetitivo (configuración de contenedores, manifiestos de Kubernetes, pipeline de CI/CD) y la documentación. Esto se declara de forma transparente porque:

- El **criterio de diseño** (qué problema resolver, qué base de datos usar para qué tipo de dato, cómo estructurar los roles y permisos) fue definido y dirigido por el autor, no delegado por completo a la herramienta.
- Todo el código generado fue **ejecutado y verificado** antes de darlo por bueno: se corrieron las 14 pruebas automatizadas del backend, se ejecutó manualmente una colección de 18 peticiones contra la API en funcionamiento, y se corrigieron errores reales que se detectaron en el proceso (por ejemplo, un caso donde la API devolvía un error 500 en vez de un error controlado 409, y un caso donde una consulta a MongoDB podía demorar hasta 10 segundos en fallar en vez de responder rápido).
- Usar herramientas modernas de desarrollo de forma responsable —entendiendo lo que generan y verificándolo, en vez de copiarlo sin revisar— es, de hecho, parte de la competencia que busca desarrollar el curso "Herramientas y Servicios para Desarrolladores en la Web".

## 4. Sostenibilidad

- **Eficiencia de recursos:** el backend expone métricas de uso de memoria y de tiempo de respuesta (`/metrics`), lo que permite detectar código ineficiente o fugas de memoria antes de que se conviertan en un problema de consumo energético innecesario en producción.
- **Escalado bajo demanda, no fijo:** el manifiesto de Kubernetes usa un `HorizontalPodAutoscaler` para el backend, de modo que solo se usan más recursos de cómputo cuando la carga real lo justifica (más tráfico), y se reduce automáticamente cuando la demanda baja, en vez de mantener siempre encendida una capacidad fija sobredimensionada.
- **Imágenes de contenedor ligeras:** tanto el backend como el frontend usan imágenes base `alpine`, significativamente más pequeñas que las imágenes base completas, lo que reduce el tiempo de transferencia, el espacio de almacenamiento y, en agregado, el consumo energético asociado a construir y desplegar el sistema repetidamente.
- **Reutilización sobre reinvención:** el proyecto se apoya en herramientas de código abierto ya maduras y ampliamente mantenidas (PostgreSQL, MongoDB, Express, React, Prometheus, Grafana) en vez de construir alternativas propias, lo cual reduce el esfuerzo de desarrollo y mantenimiento a largo plazo, un principio también alineado con la sostenibilidad del propio proceso de ingeniería de software.
