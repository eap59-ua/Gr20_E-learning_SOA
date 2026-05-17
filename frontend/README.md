# Panel de pruebas MTIS (React + Vite)

Smoke test del BFF Mule (`backend/rest-services/web-bff`) para Evaluation, Academic y servicios REST del grupo.

## Desarrollo

```bash
npm install
npm run dev
```

Proxy `/api` → `http://localhost:8094` (ver `.env.example`).

## Producción local (SPA en Mule)

```bash
npm run build
# El build va a backend/rest-services/web-bff/src/main/resources/public
# Luego arrancar web-bff y abrir http://localhost:8094
```
