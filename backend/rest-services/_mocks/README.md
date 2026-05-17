# 🧪 Mocks de servicios REST del equipo

Estos 4 mini-proyectos Mule simulan los servicios REST que **otros miembros del grupo** todavía no han entregado. Son **temporales**: cuando Joaco/Tano/Mo suban los reales, estos se pueden quitar (o dejar como fallback de demostración).

## Contenido

| Mock | Simula a | Puerto | Endpoints |
|---|---|---|---|
| `mock-financial-gateway/` | Tano (FinancialGatewayService) | 3001 | POST /api/payments/process, /confirm, /cancel |
| `mock-course-service/` | Joaco (CourseService) | 3002 | GET /api/v1/courses, GET /api/v1/courses/{id} |
| `mock-enrollment-service/` | Joaco (EnrollmentService) | 3003 | POST/GET/DELETE /api/v1/enrollments |
| `mock-email-notification/` | Mo (EmailNotificationService) | 3005 | POST /api/v1/notifications/email, /enrollment, /certificate |

## Cómo importarlos en Anypoint Studio

Mismo proceso que con los servicios reales:

1. **File → Import → Anypoint Studio Project from File System**
2. **Browse** → seleccionas la carpeta del mock que quieras importar (por ejemplo `mock-financial-gateway/`)
3. Marca "Copy project into workspace" y **Finish**
4. Click derecho sobre el proyecto → **Run As → Mule Application**

Recomendación: impórtalos **uno a uno** y arráncalos. Los 4 mocks juntos consumen poca RAM (cada uno < 200MB).

## Cómo probar que funcionan

Con cualquier cliente HTTP:

```bash
# CourseService
curl http://localhost:3002/api/v1/courses/COURSE-MTIS-2026

# FinancialGateway
curl -X POST http://localhost:3001/api/payments/process \
     -H "Content-Type: application/json" \
     -d '{"paymentId":"P1","userId":"STU-0001","amount":49.99,"currency":"EUR"}'

# EnrollmentService
curl -X POST http://localhost:3003/api/v1/enrollments \
     -H "Content-Type: application/json" \
     -d '{"userId":"STU-0001","courseId":"COURSE-MTIS-2026"}'

# EmailNotification
curl -X POST http://localhost:3005/api/v1/notifications/email \
     -H "Content-Type: application/json" \
     -d '{"to":"test@alu.ua.es","subject":"Hola","body":"Test"}'
```

## ⚠️ Importante para la demo

Si llega el 20/05 y los compañeros no han entregado, **podemos hacer la demo con estos mocks** y será 100% funcional. Lo importante es **documentar en la memoria fase 2** (sección "Problemas planteados") que se usaron mocks para suplir partes pendientes — el profesor lo ve normal en proyectos de grupo.
