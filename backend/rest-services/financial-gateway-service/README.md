# FinancialGatewayService (REST) — Tano

Servicio externo de pasarela de pagos (External Utility Service).

Contrato: `contratos/rest/FinancialGatewayService.yml`
Puerto asignado: **3001**
Base de datos: `elearning_payments`

Operaciones:
- `POST /payments/process` — iniciar pago
- `POST /payments/confirm` — confirmar transacción
- `POST /payments/cancel` — cancelar (compensación)

⚠️ Este servicio es invocado desde `CoursePurchaseProcessService` (Erardo). Debe estar arrancado para que la Saga de compra funcione.
