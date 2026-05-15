# EmailNotificationService (REST) — Mo

Servicio de utilidad para notificaciones por email.

Contrato: `contratos/rest/EmailNotificationService.yml`
Puerto asignado: **3005**

Operaciones:
- `POST /notifications/email` — email genérico
- `POST /notifications/enrollment` — aviso de matrícula
- `POST /notifications/certificate` — aviso de certificado

Para pruebas locales: usar **FakeSMTP** (el que mencionan en las herramientas de la asignatura) en el puerto 25 estándar.
