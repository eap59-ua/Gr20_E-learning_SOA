# gr20-dev-bundle — Bundle de desarrollo

> Solo para **desarrollo local rápido**. NO es la entrega.

## Qué es

Un proyecto Mule único que levanta **todo el stack local del grupo** con un solo **Run As → Mule Application**:

| Puerto | Servicio | Tipo | Responsable |
|--------|----------|------|-------------|
| 8082 | mock-course-service | REST (mock) | Erardo |
| 8083 | mock-enrollment-service | REST (mock) | Erardo |
| 8084 | **EvaluationService** | REST + MySQL | **Marcos** |
| 8085 | mock-email-notification | REST (mock) | Erardo |
| 8086 | mock-financial-gateway | REST (mock) | Erardo |
| 8087 | certificate-service | SOAP | Erardo |
| 8088 | course-purchase-process-service | SOAP | Erardo |
| 8091 | orchestración compra (ESB) | SOAP | Erardo |
| 8092 | orchestración certificado (ESB) | REST | Erardo |
| 8093 | **AcademicHistoryProcess** | REST + MySQL | **Marcos** |
| 8094 | **Web BFF + panel React** | HTTP | **Marcos** |

> **8090** sigue reservado en el acuerdo del grupo a la orquestación user+email (Mo); el panel usa **8094**.

## Por qué existe

Anypoint Studio en algunas configuraciones solo permite **una** Mule app en ejecución. Este bundle evita levantar evaluation, academic, mocks, SOAP y BFF por separado.

## Cómo usarlo

1. **MySQL** en marcha y scripts de Marcos:
   ```bash
   mysql -u root -p < ../rest-services/evaluation-service/src/main/resources/database/schema.sql
   mysql -u root -p < ../rest-services/academic-history-process/src/main/resources/database/schema.sql
   ```
2. **Panel web** (opcional, ya empaquetado si existe `src/main/resources/public/`):
   ```bash
   cd ../../frontend && npm install && npm run build
   ```
   El build copia el SPA a `src/main/resources/public/` del bundle vía `vite.config` (o copiar desde `web-bff` tras `npm run build`).
3. **Importar** `backend/dev-bundle/` en Studio → **Run As → Mule Application**.
4. Abrir **http://localhost:8094** (panel de pruebas BFF).

Verificar puertos:
```powershell
netstat -an | findstr "LISTENING" | findstr ":808"
netstat -an | findstr "LISTENING" | findstr ":809"
```

## Producción / entrega

Cada servicio sigue en su carpeta:

- `backend/rest-services/evaluation-service/`
- `backend/rest-services/academic-history-process/`
- `backend/rest-services/web-bff/`
- `backend/soap-services/…` y mocks de Erardo

Los XML `*-bundle.xml` de Marcos en este proyecto son **copias hardcoded** solo para el bundle; la fuente de verdad son las carpetas `rest-services/`.
