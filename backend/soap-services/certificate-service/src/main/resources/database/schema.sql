-- ============================================================
-- EXPLICACIÓN: Esquema MySQL para CertificateService.
-- SEGÚN ENUNCIADO (sección 6.3): los modelos de datos SOAP se
-- definen mediante XML Schema dentro del WSDL. Este DDL es la
-- proyección relacional de esos tipos sobre MySQL.
--
-- Tabla principal: certificates
--   - certificate_id: UUID (PK)
--   - student_id / course_id: identificadores externos
--   - final_grade: nota final del alumno (DECIMAL(4,2) admite 99.99)
--   - status: enum según WSDL (GENERATED, PENDING, FAILED, NOT_ELIGIBLE)
--   - request_id: clave de idempotencia (sección 7.2.4)
-- ============================================================

CREATE DATABASE IF NOT EXISTS elearning_certificates
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE elearning_certificates;

DROP TABLE IF EXISTS certificates;

CREATE TABLE certificates (
    certificate_id        VARCHAR(36)  NOT NULL,
    student_id            VARCHAR(64)  NOT NULL,
    course_id             VARCHAR(64)  NOT NULL,
    final_grade           DECIMAL(4,2) NOT NULL,
    completion_date       DATE         NOT NULL,
    issue_date            DATE         NULL,
    repository_reference  VARCHAR(128) NULL,
    status                VARCHAR(16)  NOT NULL,
    request_id            VARCHAR(64)  NULL,
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (certificate_id),
    INDEX idx_student (student_id),
    INDEX idx_course  (course_id),
    UNIQUE KEY uk_request_id (request_id)
) ENGINE=InnoDB;

-- Usuario aplicación según convención del grupo (chat 15/05 10:41)
-- CREATE USER 'mule'@'localhost' IDENTIFIED BY 'mule123';
-- GRANT ALL PRIVILEGES ON elearning_certificates.* TO 'mule'@'localhost';
-- FLUSH PRIVILEGES;

-- Datos de prueba para SOAP UI / Postman
INSERT INTO certificates
  (certificate_id, student_id, course_id, final_grade, completion_date,
   issue_date, repository_reference, status, request_id)
VALUES
  ('11111111-1111-1111-1111-111111111111',
   'STU-0001', 'COURSE-MTIS-2026', 8.75, '2026-05-10',
   '2026-05-11', 'REPO-CERT-11111111', 'GENERATED', 'REQ-DEMO-001');
