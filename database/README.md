# Base de datos del proyecto

Esquemas MySQL consolidados de todos los servicios.

## Convención

- Un MySQL único en `localhost:3306`
- Un usuario común: `mule` / `mule123`
- **Una base de datos por servicio** (sigue el principio SOA de autonomía: cada servicio dueño de sus propios datos):

| Servicio | Base de datos |
|---|---|
| CertificateService | `elearning_certificates` |
| CoursePurchaseProcessService | `elearning_purchases` |
| UserService | `elearning_users` |
| CourseService | `elearning_courses` |
| EnrollmentService | `elearning_enrollments` |
| EvaluationService | `elearning_evaluations` |
| FinancialGatewayService | `elearning_payments` |
| LegacyConnectorService | `elearning_legacy_contents` |

## Cómo cargar TODO de cero

```bash
mysql -u root -p < schema-completo.sql
mysql -u root -p < seed.sql
```

## Ficheros pendientes

- [ ] `schema-completo.sql` — concatenación de los `schema.sql` de cada servicio
- [ ] `seed.sql` — datos de prueba consistentes entre todos los servicios (un usuario, un curso, una matrícula, una nota, un pago, un certificado)

> Cada miembro debe pegar su `schema.sql` aquí cuando suba su servicio, para que tengamos el "schema-completo.sql" final.
