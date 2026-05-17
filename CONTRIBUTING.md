# Guía para el equipo — Cómo añadir tu parte al repo

Esta guía es **solo para los miembros del Grupo 20**. Lee esto antes de subir tu trabajo, así evitamos pisarnos.

## 🌳 Estrategia de branches

- `main` → SOLO código probado y funcionando. NUNCA pushees aquí directamente.
- `dev` → integración. Aquí mergeamos las features.
- `feature/<nombre>-<servicio>` → tu rama de trabajo. Ejemplos:
  - `feature/joaco-course-service`
  - `feature/tano-financial-gateway`
  - `feature/mo-user-service`
  - `feature/marcos-evaluation-service`

## 📁 Dónde va cada cosa

### Si has implementado un servicio SOAP
Mete tu proyecto Mule completo (con `pom.xml`, `mule-artifact.json`, `src/`) en:
```
backend/soap-services/<nombre-servicio>/
```
Ejemplo: `backend/soap-services/legacy-connector-service/`

### Si has implementado un servicio REST
```
backend/rest-services/<nombre-servicio>/
```
Ejemplo: `backend/rest-services/course-service/`

### Si tu servicio usa BBDD
Pon el script SQL (CREATE TABLE + INSERTs de prueba) en:
```
<tu-carpeta-servicio>/src/main/resources/database/schema.sql
```
Y haz una copia consolidada en `database/schema-completo.sql` cuando subas.

### Si has hecho un cliente / colección Postman
```
tests/postman/<tu-coleccion>.postman_collection.json
```

### Si has añadido un flow ESB (orquestación)
```
backend/esb-orchestrations/<nombre-flujo>/
```
**Ojo**: el enunciado pide mínimo 1 SOAP y 1 REST orquestados por ESB.

## ⚙️ Convención de configuración

Todas las conexiones MySQL usan estos valores (no los cambies sin avisar):

```properties
db.host=localhost
db.port=3306
db.user=mule
db.password=mule123
db.name=<nombre-tu-bbdd>
```

Cada servicio usa **su propia base de datos** dentro del mismo MySQL (ej. `elearning_certificates`, `elearning_courses`...). Nombre por convención: `elearning_<recurso-en-plural>`.

## 🔌 Puertos asignados (acuerdo grupo 15/05/2026)

> Esquema unificado en rango **8081-8092** acordado en el chat de WhatsApp el 15/05.

| Puerto | Servicio | Tipo | Responsable |
|---|---|---|---|
| 8081 | UserService | REST | Mo |
| 8082 | CourseService | REST | Joaco |
| 8083 | EnrollmentService | REST | Joaco |
| 8084 | EvaluationService | REST | Marcos |
| 8085 | EmailNotificationService | REST | Mo |
| 8086 | FinancialGatewayService | REST | Tano |
| 8087 | **CertificateService** | **SOAP** | **Erardo** |
| 8088 | **CoursePurchaseProcessService** | **SOAP** | **Erardo** |
| 8089 | LegacyConnectorService | SOAP | Tano |
| 8090 | Orquestación user+email (ESB) | REST | Mo |
| 8091 | Orquestación compra (ESB SOAP) | SOAP | Erardo |
| 8092 | Orquestación certificado (ESB REST) | REST | Erardo |
| 8093 | AcademicHistoryProcess | REST | Marcos |
| 5173 | Frontend dev server | — | (a asignar) |

> Si necesitas otro puerto avisa al grupo para actualizar esta tabla.

### Mocks temporales (para pruebas mientras el equipo entrega)

Mientras no estén los servicios reales del equipo, se pueden usar los mocks Mule de `backend/rest-services/_mocks/`. **Usan los mismos puertos** que los reales (8082, 8083, 8085, 8086), así cuando los reales se suben basta con parar el mock y arrancar el servicio del compañero — sin tocar configuración en los servicios que los consumen.

## ✅ Checklist antes de pushear

- [ ] Mi servicio arranca sin errores con `mvn clean package`.
- [ ] He probado al menos 1 happy path con Postman/SOAP UI.
- [ ] El `application.properties` usa las credenciales unificadas.
- [ ] He añadido mi `schema.sql` y los datos de prueba.
- [ ] He marcado mi check en el README principal.
- [ ] He hecho commit en mi `feature/...` branch, NO en `main`.

## 🚨 Lo que NO se sube

- `target/`, `node_modules/`, `.idea/`, `.studio/` (ya están en `.gitignore`).
- Credenciales reales, claves privadas, dumps de BBDD producción.
- Ficheros que pasen de 50MB (usa Drive o WeTransfer para esos).
