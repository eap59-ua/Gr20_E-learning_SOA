-- AcademicHistoryProcess — base elearning_academic_history
CREATE DATABASE IF NOT EXISTS elearning_academic_history CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elearning_academic_history;

CREATE TABLE IF NOT EXISTS academic_records (
    id CHAR(36) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    term VARCHAR(32) NOT NULL,
    course_code VARCHAR(64) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    grade VARCHAR(16) NOT NULL,
    credits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_academic_records_student (student_id),
    KEY idx_academic_records_term (student_id, term)
);

CREATE TABLE IF NOT EXISTS certificate_requests (
    id CHAR(36) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    certificate_type ENUM('FULL', 'PARTIAL') NOT NULL,
    delivery_email VARCHAR(255) NULL,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_certificate_requests_student (student_id),
    KEY idx_certificate_requests_status (status)
);

INSERT IGNORE INTO academic_records (id, student_id, term, course_code, course_name, grade, credits)
VALUES
    ('a1b2c3d4-e5f6-4789-a012-345678901201', 'STU-1', '2025-1', 'CS101', 'Introducción', 'A', 4),
    ('a1b2c3d4-e5f6-4789-a012-345678901202', 'STU-1', '2025-2', 'MA201', 'Cálculo', 'B+', 6);

INSERT IGNORE INTO certificate_requests (id, student_id, certificate_type, delivery_email, status)
VALUES
    ('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'STU-1', 'FULL', 'smoke@example.com', 'PENDING');
