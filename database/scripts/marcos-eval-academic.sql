-- =============================================================================
-- MTIS · Esquema base + Evaluation Service + Academic History Process
-- =============================================================================
-- Alineado con:
--   src/main/resources/api/evaluation-service.raml
--   src/main/resources/api/academic-history-process.raml
--
-- student_id en evaluaciones / académico es el identificador de negocio del
-- contrato (p. ej. STU-1). Si más adelante unificas con users.id (CHAR(36)),
-- puedes añadir user_id CHAR(36) NULL y FK, o migrar a UUID en el API.
-- =============================================================================

USE mtis;

-- ---------------------------------------------------------------------------
-- Esquema ya usado en integración (usuarios, cursos, matrículas, email, clave)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS courses (
    id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id CHAR(36) NOT NULL,
    instructor_name VARCHAR(100),
    category VARCHAR(100),
    duration_hours INT,
    price DECIMAL(10,2),
    currency CHAR(3) DEFAULT 'EUR',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    external_content_id VARCHAR(255),
    external_last_modified TIMESTAMP NULL,
    external_checksum VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_course_instructor
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS enrollments (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    enrollment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_course (user_id, course_id),
    CONSTRAINT fk_enrollment_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_log (
    id CHAR(36) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT,
    notification_type ENUM('WELCOME', 'ENROLLMENT', 'CERTIFICATE', 'ERROR', 'OTHER') NOT NULL DEFAULT 'OTHER',
    status ENUM('SENT', 'FAILED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    related_user_id CHAR(36) NULL,
    sent_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_email_log_user
        FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS restkey (
    rest_key VARCHAR(255) NOT NULL PRIMARY KEY
);

INSERT IGNORE INTO restkey (rest_key) VALUES ('elearning-key-2025');

-- ---------------------------------------------------------------------------
-- Evaluation Service (RAML: EvaluationStatus, Evaluation, CRUD /evaluations)
-- ---------------------------------------------------------------------------

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
) COMMENT = 'Evaluaciones académicas (Evaluation Service API)';

-- ---------------------------------------------------------------------------
-- Academic History: historial + solicitudes de certificado
-- ---------------------------------------------------------------------------

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
) COMMENT = 'Módulos calificados del historial (GET academic-history)';

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
) COMMENT = 'Solicitudes de certificado (POST .../certificates)';

-- ---------------------------------------------------------------------------
-- Datos de ejemplo (coherentes con el panel web: STU-1, CS101, etc.)
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO evaluations (id, student_id, course_code, status, score, comments)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'STU-1', 'CS101', 'SUBMITTED', 8.50, 'Semilla SQL · historial académico de prueba'),
    ('550e8400-e29b-41d4-a716-446655440001', 'STU-1', 'MA201', 'APPROVED', 9.00, 'Aprobada');

INSERT IGNORE INTO academic_records (id, student_id, term, course_code, course_name, grade, credits)
VALUES
    ('a1b2c3d4-e5f6-4789-a012-345678901201', 'STU-1', '2025-1', 'CS101', 'Introducción', 'A', 4),
    ('a1b2c3d4-e5f6-4789-a012-345678901202', 'STU-1', '2025-2', 'MA201', 'Cálculo', 'B+', 6);

-- Opcional: una solicitud de certificado ya creada (el POST del API suele insertar nuevas filas)
INSERT IGNORE INTO certificate_requests (id, student_id, certificate_type, delivery_email, status)
VALUES
    ('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'STU-1', 'FULL', 'smoke@example.com', 'PENDING');
