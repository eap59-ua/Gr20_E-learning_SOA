# EnrollmentService (REST) — Joaco

Servicio task-centric para gestión de matrículas.

Contrato: `contratos/rest/EnrollmentService.yml`
Puerto asignado: **3003**
Base de datos: `elearning_enrollments`

Operaciones:
- `POST /enrollments` — matricular usuario en curso
- `GET /enrollments/{enrollmentId}` — consultar
- `DELETE /enrollments/{enrollmentId}` — cancelar

⚠️ **Importante**: este servicio es invocado por `CoursePurchaseProcessService.finalizePurchase` cuando se completa una compra. Debe estar arrancado para que el flujo de compra termine bien.
