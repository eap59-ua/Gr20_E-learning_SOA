CREATE DATABASE IF NOT EXISTS elearning_payments
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE elearning_payments;

CREATE TABLE IF NOT EXISTS restkey (
    id INT AUTO_INCREMENT NOT NULL,
    rest_key VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_rest_key (rest_key)
);

CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'EUR',
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    external_ref VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_payments_status (status)
);

INSERT INTO restkey (rest_key, description) VALUES ('1234', 'Clave REST grupo 20')
ON DUPLICATE KEY UPDATE description = VALUES(description);
