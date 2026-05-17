-- EvaluationService — base elearning_evaluations (convención grupo)
CREATE DATABASE IF NOT EXISTS elearning_evaluations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elearning_evaluations;

CREATE TABLE IF NOT EXISTS evaluations (
    id CHAR(36) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    course_code VARCHAR(64) NOT NULL,
    status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    score DECIMAL(6, 2) NULL,
    comments TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_evaluations_student (student_id),
    KEY idx_evaluations_status (status),
    KEY idx_evaluations_student_status (student_id, status)
);

INSERT IGNORE INTO evaluations (id, student_id, course_code, status, score, comments)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'STU-1', 'CS101', 'SUBMITTED', 8.50, 'Semilla SQL · panel de pruebas'),
    ('550e8400-e29b-41d4-a716-446655440001', 'STU-1', 'MA201', 'APPROVED', 9.00, 'Aprobada');
