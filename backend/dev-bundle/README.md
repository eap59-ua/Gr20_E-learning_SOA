# gr20-dev-bundle — Bundle de desarrollo

> Solo para **desarrollo local rápido**. NO es la entrega.

## Qué es

Un proyecto Mule único que contiene los 6 servicios juntos:

| Puerto | Servicio | Tipo |
|---|---|---|
| 8082 | mock-course-service | REST (mock) |
| 8083 | mock-enrollment-service | REST (mock) |
| 8085 | mock-email-notification | REST (mock) |
| 8086 | mock-financial-gateway | REST (mock) |
| 8087 | certificate-service | SOAP (Erardo) |
| 8088 | course-purchase-process-service | SOAP (Erardo) |

## Por qué existe

Anypoint Studio en algunas configuraciones solo permite ejecutar 1 Mule app a la vez (cada `Run As → Mule Application` mata la anterior). Este bundle empaqueta los 6 servicios como flows separados dentro de UN solo Mule application: con UN solo Run arrancan los 6 a la vez.

## Cómo usarlo

1. **Importar en Anypoint Studio**: File → Import → Anypoint Studio Project from File System → Browse → seleccionar `backend/dev-bundle/` → marcar "Copy project into workspace" → Finish.
2. Esperar a que Maven descargue dependencias (~1 min).
3. Click derecho sobre `gr20-dev-bundle` en Package Explorer → **Run As → Mule Application**.
4. En la consola verás `Started app 'gr20-dev-bundle'` cuando esté listo. Verifica con PowerShell:
   ```powershell
   netstat -an | findstr "LISTENING" | findstr ":808"
   ```
   Deberías ver 6 líneas (8082, 8083, 8085, 8086, 8087, 8088).
5. Probar con la colección Postman.

## Cómo se diferencia del código de producción

- **No usa application.properties** — todos los valores están **hardcoded** en los XMLs (puerto, credenciales BBDD, URLs de servicios). Para la entrega real, cada servicio se despliega por separado y SÍ usa su application.properties (ver `backend/soap-services/certificate-service/` y `backend/soap-services/course-purchase-process-service/`).
- **No incluye log4j2 personalizado por servicio**, solo uno genérico para todo el bundle.

## ¿Qué se entrega al profesor?

Las carpetas originales de cada servicio en `backend/soap-services/` y `backend/rest-services/` — NO este bundle. Este bundle es solo una conveniencia para desarrollo.
