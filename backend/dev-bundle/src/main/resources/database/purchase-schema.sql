-- ============================================================
-- EXPLICACIÓN: Esquema MySQL para CoursePurchaseProcessService.
-- SEGÚN ENUNCIADO (sección 9.5 paso 4 + sección 7.2.2):
--   Patrón Saga por coreografía. Se persiste el estado de la
--   compra en cada paso para soportar compensación y reintentos
--   idempotentes (sección 7.2.4).
--
-- Estados posibles:
--   INITIATED          → tras startPurchase
--   PAYMENT_PENDING    → tras processPayment (transactionId asignado)
--   PAYMENT_CONFIRMED  → tras confirmPayment
--   COMPLETED          → tras finalizePurchase (con enrollmentId)
--   CANCELLED          → tras cancelPurchase (con motivo)
--   FAILED             → error no recuperable
-- ============================================================

CREATE DATABASE IF NOT EXISTS elearning_purchases
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE elearning_purchases;

DROP TABLE IF EXISTS course_purchases;

CREATE TABLE course_purchases (
    purchase_id     VARCHAR(36)   NOT NULL,
    user_id         VARCHAR(64)   NOT NULL,
    course_id       VARCHAR(64)   NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    payment_method  VARCHAR(32)   NULL,
    transaction_id  VARCHAR(64)   NULL,
    enrollment_id   VARCHAR(36)   NULL,
    status          VARCHAR(32)   NOT NULL,
    cancel_reason   VARCHAR(255)  NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (purchase_id),
    INDEX idx_user   (user_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Usuario aplicación (convención del grupo, chat 15/05 10:41)
-- CREATE USER 'mule'@'localhost' IDENTIFIED BY 'mule123';
-- GRANT ALL PRIVILEGES ON elearning_purchases.* TO 'mule'@'localhost';
-- FLUSH PRIVILEGES;
