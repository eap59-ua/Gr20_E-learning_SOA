# AcademicHistoryProcess (REST) — Marcos

**Puerto:** `8093`

**Contrato:** `src/main/resources/api/academic-history-process.raml`  
**OpenAPI grupo:** `contratos/rest/AcademicHistoryProcess.yaml`

**Base de datos:** `elearning_academic_history` — script `src/main/resources/database/schema.sql`

## Arranque

```bash
cd backend/rest-services/academic-history-process
mvn clean package -DskipTests
```

## Panel web

BFF en `backend/rest-services/web-bff` (:8094) — sección Academic en `frontend/`
