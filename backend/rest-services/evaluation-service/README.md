# EvaluationService (REST) — Marcos

Servicio task-centric para evaluaciones y cálculo de notas.

Contrato: `contratos/rest/EvaluationService.yml`
Puerto asignado: **3006**
Base de datos: `elearning_evaluations`

Operaciones:
- `GET /evaluations/{courseId}/questions` — obtener preguntas
- `POST /evaluations/answers` — enviar respuestas
- `POST /evaluations/calculate-grade` — calcular nota
- `GET /evaluations/{enrollmentId}/grade` — consultar nota

⚠️ Este servicio es invocado en el flujo de **Emisión de Certificado** (la orquestación REST lo consulta para verificar que el alumno aprobó).
