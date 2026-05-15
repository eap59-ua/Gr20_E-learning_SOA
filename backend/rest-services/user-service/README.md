# UserService (REST) — Mo

Servicio entity-centric para la gestión de usuarios (sección 5.1 memoria fase 1).

Contrato: `contratos/rest/UserService_openapi.yaml`
Puerto asignado: **3004**
Base de datos: `elearning_users`

Operaciones:
- `POST /users` — crear usuario
- `GET /users/{userId}` — consultar
- `PUT /users/{userId}` — modificar
- `DELETE /users/{userId}` — eliminar
- `GET /users` — listar
- `POST /users/login` — autenticación
