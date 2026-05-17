# Web BFF + SPA estático

Proxy `/api/proxy/*` hacia servicios REST del grupo y sirve el panel React compilado desde `frontend/`.

**Puerto:** `8094` (el `8090` del acuerdo de grupo está reservado a la orquestación user+email de Mo).

## Build front + Mule

```bash
cd frontend && npm install && npm run build
cd ../backend/rest-services/web-bff && mvn clean package -DskipTests
```

Abrir http://localhost:8094
