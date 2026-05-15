# Implementación SOAP — Erardo (Grupo 20)

Servicios SOAP del proyecto **Plataforma E-Learning** (MTIS 2025-2026, Grupo 20).
Implementación en **Mule 4** (Anypoint Studio) con enfoque **contract-first** sobre los WSDL ya definidos en `../ContratosWSDL-OpenAPI/`.

---

## 1. Servicios incluidos

| Servicio | Tipo SOA | Operaciones | Puerto | Descripción |
|---|---|---|---|---|
| **CertificateService** | Task Service | `generateCertificate`, `getCertificate` | 8081 | Emisión y consulta de certificados digitales (sección 5.2 y 9.1 del enunciado) |
| **CoursePurchaseProcessService** | Process Service | `startPurchase`, `processPayment`, `confirmPayment`, `finalizePurchase`, `cancelPurchase` | 8082 | Orquestación del flujo de compra de curso (sección 9.5). Patrón Saga por coreografía |

Ambos exponen SOAP/HTTP (en desarrollo). En producción quedarían detrás del ESB con TLS 1.2+ y WS-Security (sección 7.1).

---

## 2. Estructura del directorio

```
Implementacion/
├── certificate-service/                   # Aplicación Mule
│   ├── src/main/mule/certificate-service.xml
│   ├── src/main/resources/
│   │   ├── api/CertificateService.wsdl
│   │   ├── config/application.properties
│   │   ├── database/schema.sql
│   │   └── log4j2.xml
│   ├── pom.xml
│   └── mule-artifact.json
├── course-purchase-process-service/        # Aplicación Mule
│   ├── src/main/mule/course-purchase-service.xml
│   ├── src/main/resources/
│   │   ├── api/CoursePurchaseProcessService.wsdl
│   │   ├── config/application.properties
│   │   ├── database/schema.sql
│   │   └── log4j2.xml
│   ├── pom.xml
│   └── mule-artifact.json
└── test-requests/                          # Ejemplos para SOAP UI / Postman
    ├── *.xml                               # Envelopes SOAP individuales
    └── Erardo-SOAP-Services.postman_collection.json
```

---

## 3. Requisitos previos

| Herramienta | Versión recomendada |
|---|---|
| Anypoint Studio | 7.15 o superior (Mule Runtime 4.4.x) |
| MySQL Server | 8.0 |
| Postman o SOAP UI | última |
| MySQL Connector/J | 8.0.33 (lo descarga Maven automáticamente) |

---

## 4. Configuración de la base de datos

> **Convención del grupo (WhatsApp 15/05/2026 10:41):** usuario `mule`, contraseña `mule123`.

```sql
-- 1) Crear el usuario una sola vez (como root):
CREATE USER 'mule'@'localhost' IDENTIFIED BY 'mule123';

-- 2) Ejecutar los DDL de cada servicio:
SOURCE certificate-service/src/main/resources/database/schema.sql;
SOURCE course-purchase-process-service/src/main/resources/database/schema.sql;

-- 3) Otorgar permisos sobre las dos BBDD:
GRANT ALL PRIVILEGES ON elearning_certificates.* TO 'mule'@'localhost';
GRANT ALL PRIVILEGES ON elearning_purchases.*    TO 'mule'@'localhost';
FLUSH PRIVILEGES;
```

El esquema `elearning_certificates` incluye una fila de prueba con `certificate_id = 11111111-1111-1111-1111-111111111111` para probar `getCertificate`.

---

## 5. Importar y arrancar en Anypoint Studio

1. **File → Import → Anypoint Studio → Anypoint Studio project from File System**
2. Seleccionar la carpeta `certificate-service/` y aceptar. Repetir con `course-purchase-process-service/`.
3. Esperar a que Maven descargue dependencias (MySQL Connector/J, db-connector, http-connector).
4. Botón derecho sobre el proyecto → **Run As → Mule Application**.
5. Verificar en consola:
   - `Started app 'certificate-service'` en puerto 8081
   - `Started app 'course-purchase-process-service'` en puerto 8082

> Si el puerto está ocupado, modificar `http.port` en `src/main/resources/config/application.properties`.

---

## 6. Pruebas

### Opción A — Postman (recomendado)
Importar `test-requests/Erardo-SOAP-Services.postman_collection.json`.
La colección **encadena** los pasos de la compra: tras `startPurchase` guarda automáticamente el `purchaseId` en una variable de colección, y lo reutiliza en `processPayment` (que también guarda el `transactionId`).

Orden recomendado:
1. `CertificateService → generateCertificate` (verás `status = GENERATED`)
2. `CertificateService → generateCertificate (NOT_ELIGIBLE)` (nota 3.2 → no certifica, sin error)
3. `CertificateService → getCertificate` (datos del certificado fijo de prueba)
4. `CoursePurchase → 1. startPurchase` → 2 → 3 → 4 (flujo feliz completo)
5. Repetir 1+2+5 para probar `cancelPurchase` con compensación

### Opción B — SOAP UI
1. Crear nuevo proyecto desde el WSDL `certificate-service/src/main/resources/api/CertificateService.wsdl`.
2. Pegar el contenido de los XMLs de `test-requests/` en las peticiones generadas.

### Opción C — curl rápido
```bash
curl -X POST http://localhost:8081/services/CertificateService \
     -H "Content-Type: text/xml; charset=UTF-8" \
     -H "SOAPAction: http://mtis.ua.es/elearning/certificates/getCertificate" \
     --data @test-requests/CertificateService-getCertificate.xml
```

---

## 7. Mapeo del enunciado

| Requisito de la memoria | Implementación |
|---|---|
| **Sección 4.3** Contract-first | El WSDL se importa tal cual; el flow se construye sobre el contrato |
| **Sección 6.4** Gestión de errores SOAP Fault | Sub-flows `sub-fault-unsupported`, `sub-fault-business`, `sub-fault-internal` |
| **Sección 7.1.2** TLS 1.2+ | Listener HTTP en dev; en prod sustituir por `https:listener-config` con keystore |
| **Sección 7.1.3** WS-Security | Pendiente para despliegue; el flow está aislado para añadir `ws:security` config |
| **Sección 7.2.2** Patrón Saga | `CoursePurchaseProcessService`: coreografía implícita persistiendo estado entre operaciones |
| **Sección 7.2.4** Idempotencia | `requestId` en `generateCertificate`; comprobación de status previo en cada operación de compra |
| **Sección 9.1 paso 4** Verificación de requisitos | Validación `finalGrade >= passingGrade` antes de emitir |
| **Sección 9.5 paso 4** Compensación si falla pago | `cancelPurchase` invoca `/payments/cancel` y marca `CANCELLED` |

---

## 8. Integración con el resto del grupo

- **EnrollmentService** (Joaco) — invocado desde `finalizePurchase`. Endpoint REST configurable en `application.properties`.
- **CourseService** (Joaco) — invocado desde `startPurchase` para validar curso. Endpoint REST configurable.
- **FinancialGatewayService** (Tano) — invocado desde `processPayment`, `confirmPayment`, `cancelPurchase`. Endpoint REST configurable.
- **EmailNotificationService** (Mo) — invocado best-effort desde `generateCertificate` y eventualmente desde el ESB.

Si tu servicio (Joaco/Tano/Mo) escucha en otro host/puerto, basta con editar **un solo fichero**: `src/main/resources/config/application.properties`.

---

## 9. Próximos pasos (fase ESB)

Cuando se monte el ESB (Mule ESB / WSO2, sección 7.3 del enunciado), estos dos servicios actuarán como **endpoints internos** invocados por las orquestaciones:

- El flujo de **emisión de certificado** (sección 7.3.2, *Flujo REST*) llamará a `CertificateService.generateCertificate` tras `EvaluationService` calcular la nota final.
- El flujo de **compra de curso** (sección 7.3.2, *Flujo SOAP*) podría reaplicar la coreografía o sustituirla por una orquestación ESB que llame en cadena a las 5 operaciones.
