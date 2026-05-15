# CourseService (REST) — Joaco

Servicio entity-centric para la gestión del catálogo de cursos (sección 5.1 memoria fase 1).

Contrato: `contratos/rest/CourseService_openapi.yaml`
Puerto asignado: **3002**
Base de datos: `elearning_courses`

Operaciones:
- `GET /courses` — listar (con filtros opcionales)
- `POST /courses` — crear
- `GET /courses/{courseId}` — consultar
- `PUT /courses/{courseId}` — modificar
- `DELETE /courses/{courseId}` — eliminar
- `POST /courses/sync` — sincronizar con sistema legacy
