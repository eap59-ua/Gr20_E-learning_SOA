# Flujo ESB: Emisión de Certificado (REST orquestado)

> Cumple el requisito de **"mínimo 1 flujo REST orquestado por ESB"** del apartado 4.b del enunciado.

## Cómo arrancarlo

1. Importar este proyecto en Anypoint Studio.
2. Asegurarse de que están arrancados los servicios que orquesta:
   - EvaluationService (REST, puerto 3006)
   - CourseService (REST, puerto 3002)
   - CertificateService (SOAP, puerto 8081)
   - EmailNotificationService (REST, puerto 3005)
3. Arrancar este proyecto (puerto 9002).
4. Llamar al endpoint POST `http://localhost:9002/orchestrations/issue-certificate`.

## Estado

🔴 Pendiente de implementar. A asignar entre los miembros del grupo.
