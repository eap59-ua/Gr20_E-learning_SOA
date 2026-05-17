CREATE DATABASE IF NOT EXISTS elearning_legacy_contents
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE elearning_legacy_contents;

CREATE TABLE IF NOT EXISTS contenidos_externos (
    id CHAR(36) NOT NULL,
    external_content_id VARCHAR(255) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    duracion_horas INT,
    precio DECIMAL(10, 2),
    moneda CHAR(3) DEFAULT 'EUR',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultima_modificacion TIMESTAMP NULL,
    checksum VARCHAR(255),
    sistema_origen VARCHAR(100) NOT NULL DEFAULT 'legacy-lms',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_contenidos_external_id (external_content_id),
    KEY idx_contenidos_sistema_categoria (sistema_origen, categoria, activo)
);

CREATE TABLE IF NOT EXISTS sincronizaciones_repositorio (
    id CHAR(36) NOT NULL,
    sistema_origen VARCHAR(100) NOT NULL,
    catalog_id VARCHAR(255) NULL,
    solicitado_por VARCHAR(100) NULL,
    request_id VARCHAR(255) NULL,
    estado ENUM('SUCCESS', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
    elementos_procesados INT NOT NULL DEFAULT 0,
    elementos_actualizados INT NOT NULL DEFAULT 0,
    elementos_fallidos INT NOT NULL DEFAULT 0,
    iniciado_en TIMESTAMP NOT NULL,
    finalizado_en TIMESTAMP NULL,
    mensaje TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sync_sistema_fecha (sistema_origen, iniciado_en)
);

INSERT INTO contenidos_externos (
    id, external_content_id, titulo, descripcion, categoria,
    duracion_horas, precio, moneda, activo, ultima_modificacion, checksum, sistema_origen
) VALUES
(
    'a1000001-0000-4000-8000-000000000001',
    'LEG-001',
    'Fundamentos XML',
    'Contenido importado desde repositorio legacy',
    'Legacy',
    12, 49.99, 'EUR', TRUE,
    '2026-05-15 10:00:00',
    'chk-leg-001',
    'legacy-lms'
),
(
    'a1000002-0000-4000-8000-000000000002',
    'LEG-002',
    'SOAP avanzado',
    'Metadatos publicados por sistema heredado',
    'Legacy',
    20, 79.50, 'EUR', TRUE,
    '2026-05-15 10:05:00',
    'chk-leg-002',
    'legacy-lms'
),
(
    'a1000003-0000-4000-8000-000000000003',
    'LEG-003',
    'Integración ESB con sistemas legacy',
    'Patrones de adaptación y conectores SOAP',
    'Legacy',
    16, 65.00, 'EUR', TRUE,
    '2026-05-16 14:30:00',
    'chk-leg-003',
    'legacy-lms'
),
(
    'a1000004-0000-4000-8000-000000000004',
    'LEG-004',
    'WSDL y contratos de servicio',
    'Definición de operaciones document/literal',
    'Arquitectura',
    8, 39.00, 'EUR', TRUE,
    '2026-05-10 09:00:00',
    'chk-leg-004',
    'legacy-lms'
),
(
    'a1000005-0000-4000-8000-000000000005',
    'LEG-005',
    'Seguridad en servicios web',
    'WS-Security y buenas prácticas',
    'Arquitectura',
    10, 55.00, 'EUR', TRUE,
    '2026-05-12 11:15:00',
    'chk-leg-005',
    'legacy-lms'
),
(
    'a1000006-0000-4000-8000-000000000006',
    'LEG-006',
    'Contenido retirado del catálogo',
    'Registro inactivo para pruebas de filtro activo',
    'Legacy',
    5, 19.99, 'EUR', FALSE,
    '2025-12-01 08:00:00',
    'chk-leg-006-inactivo',
    'legacy-lms'
)
ON DUPLICATE KEY UPDATE
    titulo = VALUES(titulo),
    descripcion = VALUES(descripcion),
    categoria = VALUES(categoria),
    duracion_horas = VALUES(duracion_horas),
    precio = VALUES(precio),
    moneda = VALUES(moneda),
    activo = VALUES(activo),
    ultima_modificacion = VALUES(ultima_modificacion),
    checksum = VALUES(checksum),
    sistema_origen = VALUES(sistema_origen);
