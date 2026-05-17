-- ============================================================================
-- Tablas de Erardo para integrar en el schema unificado `mtis`
-- ============================================================================
-- Se añaden 2 tablas que necesitan los servicios SOAP de Erardo:
--   - certificates              ← usado por CertificateService (SOAP, 8087)
--   - course_purchases          ← usado por CoursePurchaseProcessService (SOAP, 8088)
--
-- Nombres y tipos siguen las convenciones que ya usa el resto del schema
-- mtis (CHAR(36) para UUIDs, DECIMAL(10,2) para importes, snake_case, etc.).
--
-- Notas:
--   * `certificate_requests` (de Tano) y `certificates` (de Erardo) son
--     tablas distintas y NO se solapan: la primera modela peticiones
--     pendientes; la segunda registra emisiones efectivas con la nota,
--     la referencia al repositorio y el requestId de idempotencia.
--   * `payments` (de Tano) y `course_purchases` (de Erardo) tampoco se
--     solapan: la primera es la transacción financiera; la segunda es la
--     máquina de estados de la Saga de compra que orquesta el ESB.
-- ============================================================================

USE mtis;


-- ----------------------------------------------------------------------------
-- Tabla: certificates
-- Usada por: CertificateService (operación generateCertificate / getCertificate)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    certificate_id        CHAR(36)      NOT NULL,
    student_id            VARCHAR(64)   NOT NULL,
    course_id             VARCHAR(64)   NOT NULL,
    final_grade           DECIMAL(4,2)  NOT NULL,
    completion_date       DATE          NOT NULL,
    issue_date            DATE          NULL,
    repository_reference  VARCHAR(128)  NULL,
    status                VARCHAR(16)   NOT NULL,    -- GENERATED | PENDING | FAILED | NOT_ELIGIBLE
    request_id            VARCHAR(64)   NULL,        -- clave de idempotencia
    created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (certificate_id),
    INDEX idx_cert_student (student_id),
    INDEX idx_cert_course  (course_id),
    UNIQUE KEY uk_cert_request_id (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fila de demo para probar getCertificate
INSERT INTO certificates
  (certificate_id, student_id, course_id, final_grade, completion_date,
   issue_date, repository_reference, status, request_id)
VALUES
  ('11111111-1111-1111-1111-111111111111',
   'STU-0001', 'COURSE-MTIS-2026', 8.75, '2026-05-10',
   '2026-05-11', 'REPO-CERT-11111111', 'GENERATED', 'REQ-DEMO-001')
ON DUPLICATE KEY UPDATE certificate_id = certificate_id;


-- ----------------------------------------------------------------------------
-- Tabla: course_purchases
-- Usada por: CoursePurchaseProcessService (Saga de compra completa)
-- Estados: INITIATED → PAYMENT_PENDING → PAYMENT_CONFIRMED → COMPLETED
--                                                       └→ CANCELLED (compensación)
--                                                       └→ FAILED
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_purchases (
    purchase_id     CHAR(36)      NOT NULL,
    user_id         VARCHAR(64)   NOT NULL,
    course_id       VARCHAR(64)   NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    currency        CHAR(3)       NOT NULL DEFAULT 'EUR',
    payment_method  VARCHAR(32)   NULL,
    transaction_id  VARCHAR(64)   NULL,
    enrollment_id   CHAR(36)      NULL,
    status          VARCHAR(32)   NOT NULL,
    cancel_reason   VARCHAR(255)  NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (purchase_id),
    INDEX idx_purchase_user   (user_id),
    INDEX idx_purchase_course (course_id),
    INDEX idx_purchase_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
