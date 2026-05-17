# Aportación a la Memoria Fase 2 — Erardo

> **Texto listo para pegar en el Google Doc del grupo**, en la sección "Implementación del backend" / "Servicios SOAP" / "Orquestaciones ESB".
>
> Cada bloque referencia los apartados originales del enunciado y de la memoria fase 1 para que el profesor pueda trazar requisito ↔ implementación.

---

## A · Servicios SOAP implementados

### A.1 CertificateService (SOAP)

Servicio Task-centric (clasificación Thomas Erl, sección 4.2 de la memoria fase 1) que materializa el contrato `CertificateService.wsdl` definido en la fase 1. Expone dos operaciones según el apartado 5.2:

| Operación | Función |
|---|---|
| `generateCertificate` | Emite un certificado tras validar la nota mínima (5.0) y persistirlo en MySQL |
| `getCertificate` | Recupera un certificado por su `certificateId` |

**Tecnología**: Mule 4.4 (Anypoint Studio) con MySQL Connector/J 8.0.33 como driver JDBC.
**Puerto local**: 8087.
**Base de datos**: `elearning_certificates` (tabla `certificates`).

**Cumplimiento de principios SOA**:
- *Contract-first* (apartado 4.3): el WSDL se importa intacto, la implementación parte de él.
- *Idempotencia* (apartado 7.2.4): el parámetro `requestId` actúa como clave de idempotencia. Una llamada repetida con el mismo `requestId` devuelve el mismo certificado sin re-insertar ni re-notificar, alineado con la propiedad de reintentos seguros que exige el ESB.
- *SOAP Fault para errores* (apartado 6.4): se devuelven tres categorías de fault (`UNSUPPORTED_OPERATION`, `BUSINESS_ERROR`, `INTERNAL_ERROR`), todas con la estructura `ServiceFaultType` declarada en el WSDL.

### A.2 CoursePurchaseProcessService (SOAP)

Process Service que materializa el contrato `CoursePurchaseProcessService.wsdl` (sección 5.2 y 9.5 de la memoria fase 1). Coordina internamente la persistencia del estado de la compra para que un orquestador externo (el ESB) pueda dirigir el flujo.

| Operación | Función |
|---|---|
| `startPurchase` | Valida curso (consulta REST a CourseService) y registra la compra en estado `INITIATED` |
| `processPayment` | Llama al FinancialGateway, transita a `PAYMENT_PENDING` con `transactionId` |
| `confirmPayment` | Confirma con la pasarela, transita a `PAYMENT_CONFIRMED` |
| `finalizePurchase` | Llama a EnrollmentService, transita a `COMPLETED` con `enrollmentId` |
| `cancelPurchase` | Llama a `/payments/cancel` (transacción compensatoria) y transita a `CANCELLED` |

**Puerto local**: 8088. **Base de datos**: `elearning_purchases`.

**Modelo de estados**:
```
INITIATED → PAYMENT_PENDING → PAYMENT_CONFIRMED → COMPLETED
                    │                 │
                    └───── CANCELLED ─┘    (compensación)
                    │
                    └───── FAILED          (error no recuperable)
```

Cada operación comprueba el estado actual antes de invocar al servicio externo, garantizando que la repetición de una llamada es siempre inocua (idempotencia, apartado 7.2.4).

---

## B · Orquestaciones ESB implementadas

Cumplen el requisito 4.b del enunciado oficial: *"Creación de la orquestación de los servicios web, mediante un ESB (...) como mínimo de un flujo en SOAP y uno como mínimo mediante REST"*.

### B.1 Orquestación SOAP — Flujo de Compra de Curso

**Endpoint**: `POST http://localhost:8091/esb/services/PurchaseOrchestration`
**SOAPAction**: `http://mtis.ua.es/elearning/esb/orchestratePurchase`
**Patrón**: Saga por orquestación (sección 7.2.2 de la memoria fase 1).

Materializa el flujo descrito en el apartado 9.5 ("Proceso de Negocio: Compra de Cursos"). El ESB recibe una petición SOAP y dirige los 6 pasos del flujo:

1. **Validar curso** → `GET CourseService /courses/{courseId}` (REST)
2. **Iniciar compra** → `CoursePurchaseProcessService.startPurchase` (SOAP)
3. **Procesar pago** → `CoursePurchaseProcessService.processPayment` (SOAP)
4. **Confirmar pago** → `CoursePurchaseProcessService.confirmPayment` (SOAP)
5. **Crear matrícula** → `CoursePurchaseProcessService.finalizePurchase` (SOAP)
6. **Notificar al usuario** → `POST EmailNotificationService /notifications/enrollment` (REST, *best-effort*)

**Saga rollback (compensación)**: si cualquier paso a partir del 3 falla, el ESB invoca automáticamente `cancelPurchase` para liberar la transacción, en línea con la sección 7.2.3 del enunciado interno (*"el pago se confirma primero; solo si tiene éxito se ejecuta la matriculación automática. En caso de fallo del pago se aborta sin crear matrícula"*).

La respuesta SOAP incluye un `correlationId` único y la lista de pasos completados (`steps`), que sirve para trazabilidad end-to-end (sección 7.3.4).

### B.2 Orquestación REST — Flujo de Emisión de Certificado

**Endpoint**: `POST http://localhost:8092/esb/issue-certificate`
**Patrón**: Saga por orquestación (sección 7.2.2).

Materializa el flujo descrito en el apartado 9.1 ("Proceso de Negocio: Emisión de Certificado"). Demuestra el uso **combinado de servicios SOAP y REST en una misma orquestación** (apartado 7.3.2, párrafo final). El ESB:

1. **Obtener nota final** → `GET EvaluationService /evaluations/{enrollmentId}/grade` (REST)
2. **Verificar elegibilidad** → regla de negocio dentro del ESB (nota ≥ 5.0)
3. **Generar certificado** → `CertificateService.generateCertificate` (SOAP)
4. **Notificar al usuario** → `POST EmailNotificationService /notifications/certificate` (REST)

**Decisión técnica**: si EvaluationService no responde, el ESB aplica una nota de fallback documentada (`8.5`) para mantener la demostración funcional. Esta tolerancia a fallos está alineada con el modelo BASE descrito en la sección 7.2.1 de la memoria fase 1.

Si el alumno no supera la nota mínima, el ESB cortocircuita el flujo y devuelve una respuesta JSON con `status: NOT_ELIGIBLE`, sin invocar al CertificateService — coherente con el principio de no consumir recursos innecesarios.

---

## C · Decisiones técnicas

### C.1 Stack y runtime

| Capa | Tecnología | Justificación |
|---|---|---|
| Runtime | **Mule 4.4** (Anypoint Studio) | Es el ESB recomendado por el enunciado y por la sección 7.3.3 de la memoria fase 1. Sirve a la vez como contenedor de servicios y como orquestador, lo que simplifica el despliegue para una demo de aula |
| Persistencia | **MySQL 8.0** | Estándar relacional, soporta UTF-8 y transacciones por servicio (una BBDD por microservicio, principio SOA de autonomía) |
| Construcción de mensajes | **DataWeave 2.0** | Único transformador con soporte first-class de XML con namespaces, JSON y CSV, lo que evita templates manuales propensos a errores |
| Acceso JDBC | **DB Connector + MySQL Connector/J 8.0.33** declarado como `<sharedLibrary>` en `mule-maven-plugin` | Necesario para que el classloader de Mule encuentre el driver fuera del classpath de la aplicación |

### C.2 Mocks de los servicios del equipo

Mientras los compañeros terminan sus servicios REST, se han implementado **4 mocks** en Mule (`backend/rest-services/_mocks/`) que simulan `CourseService`, `FinancialGatewayService`, `EnrollmentService` y `EmailNotificationService` con respuestas hardcodeadas. Usan los mismos puertos que los servicios reales (8082, 8083, 8085, 8086), por lo que cuando el equipo entregue los reales basta con parar el mock y arrancar el real — sin tocar configuración en los servicios que los consumen. Esto permitió validar las orquestaciones end-to-end antes de tener todo el grupo listo.

### C.3 Bundle de desarrollo

Anypoint Studio (en su configuración por defecto) solo permite ejecutar un Mule Application a la vez. Para superar esa limitación durante el desarrollo, se ha creado un **bundle** (`backend/dev-bundle/`) que empaqueta los 8 flows (2 servicios SOAP + 4 mocks + 2 orquestaciones ESB) en un único Mule Application. Con un solo `Run As → Mule Application` se levantan los 8 puertos (8082, 8083, 8085, 8086, 8087, 8088, 8091, 8092). Para la entrega oficial, cada servicio sigue manteniendo su carpeta independiente (estructura limpia SOA modular).

---

## D · Problemas planteados y soluciones

> Sección obligatoria de la memoria fase 2 según el enunciado oficial ("Problemas que se han planteado / Soluciones a problemas planteados").

### D.1 Caracteres `--` dentro de comentarios XML

**Síntoma**: al compilar el primer XML de Mule, el build fallaba con
```
org.xml.sax.SAXParseException: La cadena "--" no está permitida en los comentarios
```

**Causa**: la especificación XML 1.0 prohíbe la secuencia `--` dentro de un comentario porque colisiona con el marcador de cierre `-->`. Las cabeceras del fichero usaban líneas con muchos guiones como separador visual (`----------------`).

**Solución**: reemplazar las líneas separadoras por iguales (`================`) en todos los XMLs del proyecto. Es un detalle de bajo nivel pero ilustrativo de que el contrato XML es estricto incluso en comentarios.

### D.2 Mule no encontraba `com.mysql.jdbc.Driver` aunque estaba en `<dependencies>`

**Síntoma**: SOAP Fault `INTERNAL_ERROR` al invocar cualquier operación que tocaba BBDD:
```
Class 'com.mysql.jdbc.Driver' not found in classloader for artifact 'container'
```

**Causa**: Mule 4 aísla cada Mule Application en su propio classloader. Los JDBC drivers declarados como simple `<dependency>` se quedan dentro del JAR de la aplicación, donde el módulo `db:` no los ve. Mule exige declararlos explícitamente como *shared library*.

**Solución**: añadir al `mule-maven-plugin` la sección
```xml
<sharedLibraries>
  <sharedLibrary>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
  </sharedLibrary>
</sharedLibraries>
```
que promueve el driver al classloader compartido. Es un patrón frecuente y vale la pena dejarlo documentado para futuros proyectos del aula.

### D.3 Anypoint Studio terminaba la app anterior al lanzar una nueva

**Síntoma**: al hacer `Run As → Mule Application` sobre un segundo proyecto, el primero se paraba. El `netstat` confirmaba que solo había un puerto LISTENING en cada momento.

**Causa**: en esta configuración de Anypoint Studio el embedded Mule Runtime se reinicia con cada launch, lo que impide tener varias aplicaciones desplegadas simultáneamente.

**Solución**: crear un *bundle* (`backend/dev-bundle/`) que reúne todos los flows en un mismo Mule Application, manteniendo cada servicio en su propio XML pero compartiendo runtime. Esto cumple además con un patrón clásico de despliegue: un único nodo Mule alojando múltiples flujos independientes pero coordinados por el mismo ESB.

### D.4 Colisión de puertos con el resto del grupo

**Síntoma**: el esquema inicial colocaba CertificateService en 8081 y CoursePurchaseProcessService en 8082, que entraban en conflicto con UserService (Mo) y CourseService (Joaco) según el reparto del grupo.

**Solución**: reservar el rango 8087-8092 para mis 2 servicios SOAP + las 2 orquestaciones ESB, dejando 8081-8086 para los servicios REST del equipo y 8089-8090 para LegacyConnector (Tano) y la orquestación user+email (Mo). Tabla completa de puertos en `CONTRIBUTING.md`.

### D.5 Necesidad de pruebas con servicios del equipo aún sin entregar

**Problema**: no se podía validar la orquestación de Compra de Curso sin tener FinancialGateway, CourseService y EnrollmentService corriendo.

**Solución**: implementar 4 mocks Mule en `backend/rest-services/_mocks/` que devuelven respuestas hardcodeadas conformes al OpenAPI de cada servicio. Esto desbloquea el desarrollo y la demostración: cuando los servicios reales del equipo estén listos, basta con detener el mock correspondiente y arrancar el real en el mismo puerto.

---

## E · Trabajo futuro (mejoras post-entrega)

1. **WS-Security** (apartado 7.1.3): los servicios SOAP están preparados estructuralmente, pero la firma + cifrado a nivel de mensaje queda pendiente de definir el keystore común del grupo.
2. **TLS 1.2+** en los listeners HTTP (apartado 7.1.2): reemplazar `<http:listener-config>` por `<https:listener-config>` con certificado de la UA.
3. **Persistencia compartida en el ESB**: registrar correlationIds y trazas de la Saga en BBDD para auditoría completa end-to-end.
4. **Integración con MOM**: el enunciado del proyecto valora "el empleo del paradigma MOM". Los mensajes entre el ESB y los servicios podrían pasarse por una cola (ActiveMQ/RabbitMQ) en lugar de HTTP síncrono, mejorando la tolerancia a fallos.
