# Aportación a la memoria — Erardo (CertificateService + CoursePurchaseProcessService)

> Texto listo para pegar en el documento de Google Docs del grupo, en la sección
> de **Implementación / Fase 2** (apartado 8.2 de la memoria actual: *Trabajo pendiente para la segunda fase*).
>
> Toda la redacción referencia los apartados originales para que el profesor
> pueda trazar enunciado ↔ implementación.

---

## A. CertificateService — Implementación SOAP en Mule 4

### A.1. Objetivo
Materializar el contrato WSDL definido en el apartado **6.2 (CertificateService)** y descrito como caso de uso en el apartado **9.1 (Proceso de Negocio: Emisión de Certificado)**. El servicio expone dos operaciones SOAP:

- `generateCertificate(studentId, courseId, finalGrade, completionDate, [requestId])`
- `getCertificate(certificateId)`

### A.2. Arquitectura del flow
La aplicación Mule consta de un **flow dispatcher** que escucha en `POST /services/CertificateService` y enruta la petición según el header `SOAPAction` hacia el flow específico (`flow-generateCertificate` o `flow-getCertificate`). Esta decisión arquitectónica permite mantener un único endpoint HTTP por servicio (alineado con el `soap:address` del WSDL) y separar la lógica de cada operación en su propio flow para favorecer la legibilidad y la trazabilidad.

### A.3. Mapeo del proceso de negocio (sección 9.1)
| Paso del enunciado (9.1 Paso 1) | Implementación |
|---|---|
| Recibir solicitud de emisión | HTTP Listener + `Parse SOAP` con DataWeave |
| Consultar nota final / información del curso | En esta fase la nota llega como parámetro de entrada. En el flujo ESB futuro, el orquestador la consultará a EvaluationService antes de invocar al servicio |
| Verificar requisitos de certificación | Comparación `finalGrade ≥ passingGrade` (configurable, por defecto 5.0) |
| Generar certificado digital | Generación de UUID + `repositoryReference` derivado |
| Almacenar certificado en el repositorio | `INSERT` en MySQL (tabla `certificates`) |
| Registrar la emisión realizada | El propio `INSERT` con `status = GENERATED` cubre el registro |
| Notificar disponibilidad al usuario | `POST` a `EmailNotificationService /notifications/certificate` en modo *best-effort* (los errores de notificación no rompen la respuesta) |
| Registrar incidencia / notificar error | SOAP Fault `INTERNAL_ERROR` + logging |
| Denegar emisión | Respuesta SOAP con `status = NOT_ELIGIBLE` (no es Fault: es respuesta de negocio según el enum `CertificateStatusType` del WSDL) |

### A.4. Idempotencia (sección 7.2.4)
El parámetro opcional `requestId` actúa como clave de idempotencia: si una petición con el mismo `requestId` ya generó un certificado, el servicio devuelve la misma respuesta sin volver a insertar ni notificar. Esto permite al ESB reintentar invocaciones sin riesgo de duplicar emisiones, en línea con el principio de que *“todos los servicios que participen en flujos transaccionales deberán implementar operaciones idempotentes”* (apartado 7.2.4).

### A.5. Gestión de errores (sección 6.4)
Se devuelven tres tipos de SOAP Fault, todos con el `ServiceFaultType` definido en el WSDL:

- `UNSUPPORTED_OPERATION` — el `SOAPAction` recibido no corresponde a ninguna operación del port type.
- `NOT_FOUND` — `getCertificate` con un `certificateId` inexistente.
- `INTERNAL_ERROR` — fallo de conectividad de BBDD u otra excepción no controlada.

Errores de negocio “esperados” (nota insuficiente) NO se modelan como Fault sino como respuesta normal con `status = NOT_ELIGIBLE`, manteniendo la semántica del enumerado del WSDL y evitando confundir errores técnicos con resultados negativos de negocio.

### A.6. Modelo de datos
Tabla `certificates` en la base de datos `elearning_certificates` (MySQL):

```sql
certificate_id        VARCHAR(36)  PK
student_id            VARCHAR(64)
course_id             VARCHAR(64)
final_grade           DECIMAL(4,2)
completion_date       DATE
issue_date            DATE
repository_reference  VARCHAR(128)
status                VARCHAR(16)    -- GENERATED | PENDING | FAILED | NOT_ELIGIBLE
request_id            VARCHAR(64)   UNIQUE   -- idempotencia
```

---

## B. CoursePurchaseProcessService — Process Service SOAP

### B.1. Objetivo
Implementar el **Process Service** del apartado **5.2** que coordina el flujo de compra descrito en el apartado **9.5 (Proceso de Negocio: Compra de Cursos)**. A diferencia del CertificateService, este servicio no es un “task service” aislado: orquesta tres servicios externos (`FinancialGatewayService`, `EnrollmentService` y `CourseService`) y aplica el **patrón Saga por coreografía** descrito en el apartado 7.2.2.

### B.2. Modelo de estados
Cada compra avanza por una máquina de estados persistida en MySQL (tabla `course_purchases`), permitiendo reanudar la Saga ante reinicios o caídas:

```
INITIATED → PAYMENT_PENDING → PAYMENT_CONFIRMED → COMPLETED
                    │                 │
                    └─── CANCELLED ←──┘    (compensación)
                    │
                    └─── FAILED            (error no recuperable)
```

### B.3. Mapeo de operaciones SOAP a pasos del flujo (sección 9.5)
| Operación | Paso del enunciado | Interacciones externas |
|---|---|---|
| `startPurchase` | Recibir solicitud + Validar datos + Iniciar proceso | `GET CourseService /courses/{id}` para validar curso |
| `processPayment` | Invocar sistema externo de pago + Procesar pago | `POST FinancialGatewayService /payments/process` |
| `confirmPayment` | Confirmar estado de la transacción | `POST FinancialGatewayService /payments/confirm` |
| `finalizePurchase` | Registrar compra + Habilitar acceso al curso | `POST EnrollmentService /enrollments` (matriculación automática) |
| `cancelPurchase` | Cancelar la compra si el pago falla + Registrar incidencia | `POST FinancialGatewayService /payments/cancel` (transacción compensatoria) |

### B.4. Patrón Saga por coreografía (sección 7.2.2)
La elección del patrón está alineada con el enunciado: *“el pago se confirma primero; solo si tiene éxito se ejecuta la matriculación automática. En caso de fallo del pago se aborta sin crear matrícula”* (sección 7.2.3). La implementación traduce este principio en dos garantías:

1. **No se invoca al EnrollmentService hasta `PAYMENT_CONFIRMED`.** El flow `finalizePurchase` rechaza con `INVALID_STATE` cualquier intento de matricular antes de confirmar el pago.
2. **`cancelPurchase` ejecuta la compensación.** Si la compra tenía `transaction_id`, se invoca a `/payments/cancel` antes de marcar `CANCELLED`. La compensación es *best-effort*: si la pasarela externa falla, se persiste el estado `CANCELLED` localmente y se registra un warning para revisión manual (cumpliendo el modelo BASE del apartado 7.2.1).

### B.5. Idempotencia (sección 7.2.4)
Cada operación comprueba el estado actual antes de invocar al servicio externo:

- `processPayment` repetido sobre una compra que ya tiene `transaction_id` devuelve el mismo `transactionId` (sin llamar a la pasarela).
- `confirmPayment` repetido devuelve `PAYMENT_CONFIRMED` sin llamar a la pasarela.
- `finalizePurchase` repetido devuelve el `enrollmentId` existente sin volver a matricular.
- `cancelPurchase` repetido es inocuo.

### B.6. Configuración y desacoplamiento
Las URLs de los servicios coordinados (CourseService, FinancialGateway, EnrollmentService) se externalizan en `application.properties`, de modo que cuando el ESB esté operativo bastará con redirigir esos endpoints al bus, sin cambiar una línea de flow.

---

## C. Decisiones técnicas comunes a ambos servicios

| Aspecto | Decisión | Justificación |
|---|---|---|
| **Runtime** | Mule 4.4 (Anypoint Studio) | Coherente con la sección 7.3.3 que apunta a Mule ESB como herramienta candidata para el ESB de la fase final |
| **Construcción de respuestas** | DataWeave 2.0 + namespaces SOAP/WSDL | DataWeave permite generar XML respetando namespaces con `ns soap …` y `ns pur …`, evitando templates frágiles |
| **Acceso a BBDD** | DB Connector (genérico) + MySQL Connector/J 8.0.33 | Estándar en el ecosistema Mule, soporta parámetros nombrados (`:purchaseId`) y previene inyección SQL |
| **Credenciales BBDD** | `mule` / `mule123` | Convención acordada con el equipo el 15/05/2026 |
| **Puertos** | 8081 (Certificate), 8082 (Purchase) | Permiten arrancar ambas apps simultáneamente sin colisión |
| **WS-Security** | No implementado en esta fase | El apartado 7.1.3 lo prevé para el despliegue final; los flows están aislados para añadir `<ws:security>` sin tocar la lógica |

---

## D. Pruebas realizadas

### D.1. CertificateService
1. **Happy path** — `generateCertificate` con nota 8.50 → `status = GENERATED`, `certificateId` UUID, `repositoryReference` generado.
2. **Idempotencia** — Misma petición con mismo `requestId` repetida 3 veces → 3 respuestas idénticas, una sola fila en BBDD.
3. **NOT_ELIGIBLE** — Nota 3.20 → respuesta con `status = NOT_ELIGIBLE` y `message` explicativo. Sin inserción en BBDD.
4. **getCertificate** — Recupera el certificado fijo de prueba (`11111111-…`).
5. **SOAP Fault NOT_FOUND** — `getCertificate` con id inexistente → Fault `NOT_FOUND` correctamente formado.

### D.2. CoursePurchaseProcessService
Flujo feliz completo encadenado con Postman (variables `purchaseId` y `transactionId` propagadas automáticamente):
`startPurchase` → `INITIATED`
`processPayment` → `PAYMENT_PENDING`
`confirmPayment` → `PAYMENT_CONFIRMED`
`finalizePurchase` → `COMPLETED` con `enrollmentId`

Flujo de compensación:
`startPurchase` → `processPayment` → `cancelPurchase` → `CANCELLED`. Verificado que se llama a `/payments/cancel`.

---

## E. Trabajo pendiente y dependencias

1. **WS-Security** — Añadir firma + cifrado a nivel de mensaje cuando se decida el keystore común del grupo (sección 7.1.3).
2. **Orquestación ESB** — Cuando el ESB esté operativo, sustituir las llamadas REST directas por invocaciones al bus para que pueda interceptar enrutado, transformación y monitorización (sección 7.3.1).
3. **TLS** — Reemplazar `http:listener-config` por `https:listener-config` con el certificado de la UA o autofirmado para entornos de pruebas (sección 7.1.2).
4. **Coordinación con compañeros**:
   - `EnrollmentService` (Joaquín): que exponga `POST /enrollments` devolviendo `{enrollmentId, ...}` para que `finalizePurchase` recupere el ID.
   - `CourseService` (Joaquín): `GET /courses/{id}` debe devolver 200 si el curso existe.
   - `FinancialGatewayService` (Cayetano): las 3 operaciones REST conformes al OpenAPI del grupo.
   - `EmailNotificationService` (Marcos / Guillermo): `POST /notifications/certificate`.
