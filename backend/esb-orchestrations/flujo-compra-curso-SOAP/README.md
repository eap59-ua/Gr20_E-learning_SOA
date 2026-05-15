# Flujo ESB: Compra de Curso (SOAP orquestado)

> Cumple el requisito de **"mínimo 1 flujo SOAP orquestado por ESB"** del apartado 4.b del enunciado.

## Cómo arrancarlo

1. Importar este proyecto en Anypoint Studio.
2. Asegurarse de que están arrancados los servicios que orquesta:
   - CoursePurchaseProcessService (SOAP, puerto 8081)
   - CourseService (REST, puerto 3002)
   - FinancialGatewayService (REST, puerto 3001)
   - EnrollmentService (REST, puerto 3003)
   - EmailNotificationService (REST, puerto 3005)
3. Arrancar este proyecto (puerto 9001).
4. Llamar al endpoint POST `http://localhost:9001/orchestrations/purchase-course`.

## Estado

🔴 Pendiente de implementar. A asignar entre los miembros del grupo.
