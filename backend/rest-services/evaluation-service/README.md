# EvaluationService (REST) — Marcos

**Puerto:** `8084` (tabla en `CONTRIBUTING.md`)

**Contrato implementación (CRUD evaluaciones):** `src/main/resources/api/evaluation-service.raml`  
**Contrato enunciado grupo (preguntas/notas):** `contratos/rest/EvaluationService.yml`

**Base de datos:** `elearning_evaluations` — script `src/main/resources/database/schema.sql`

## Arranque

```bash
cd backend/rest-services/evaluation-service
mvn clean package -DskipTests
# Run As → Mule Application en Studio
```

## Panel web

Tras `npm run build` en `frontend/`, levantar `backend/rest-services/web-bff` y abrir http://localhost:8094
