# Orquestaciones ESB

> 🔴 **Obligatorio según apartado 4.b del enunciado oficial**:
> *"Creación de la orquestación de los servicios web, mediante un ESB. (...) la cantidad de flujos a orquestar mediante los paradigmas SOAP y Rest, deberá ser como mínimo de un flujo en SOAP y uno como mínimo mediante Rest, todas las orquestaciones se realizarán mediante un ESB"*

## Flujos a implementar

### `flujo-compra-curso-SOAP/` — mínimo del enunciado: flujo SOAP orquestado

Orquesta el flujo de **Compra de Curso** (sección 9.5 memoria fase 1) **invocando externamente** a los servicios implicados, en vez de tener la orquestación dentro del CoursePurchaseProcessService.

Patrón Saga por orquestación. El ESB coordina:
1. Llamada al **CourseService** (REST) para validar curso
2. Llamada al **CoursePurchaseProcessService.startPurchase** (SOAP, Erardo) para iniciar compra
3. Llamada al **FinancialGatewayService.processPayment** (REST, Tano) para procesar pago
4. Llamada al **CoursePurchaseProcessService.confirmPayment** (SOAP, Erardo)
5. Llamada al **EnrollmentService.enrollUser** (REST, Joaco) para matricular
6. Llamada al **CoursePurchaseProcessService.finalizePurchase** (SOAP, Erardo)
7. Llamada al **EmailNotificationService** (REST, Mo) para notificar

En caso de fallo en cualquier paso → invocar `cancelPurchase` para compensar.

### `flujo-emision-cert-REST/` — mínimo del enunciado: flujo REST orquestado

Orquesta el flujo de **Emisión de Certificado** (sección 9.1 memoria fase 1). El detonante puede ser un HTTP Listener REST.

Patrón Saga por orquestación. El ESB coordina:
1. Llamada al **EvaluationService.getGrade** (REST, Marcos) para obtener la nota final
2. Llamada al **CourseService.getCourseById** (REST, Joaco) para confirmar curso completado
3. Si nota ≥ 5.0 → llamada al **CertificateService.generateCertificate** (SOAP, Erardo)
4. Llamada al **EmailNotificationService.sendCertificateNotification** (REST, Mo)

En caso de fallo en la generación del certificado → reintentos (sección 7.2.4 memoria).

## Implementación recomendada

En Mule 4 (Anypoint Studio):
- HTTP Listener que recibe la petición de inicio
- `flow-ref` o `try` con cada llamada externa
- Web Service Consumer para los servicios SOAP
- HTTP Request para los servicios REST
- DataWeave para las transformaciones SOAP ↔ REST

Cada flujo es un proyecto Mule independiente con su propio puerto:
- `flujo-compra-curso-SOAP/` → puerto 9001
- `flujo-emision-cert-REST/` → puerto 9002
