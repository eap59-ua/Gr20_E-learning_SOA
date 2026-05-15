# Grupo 20 — Plataforma E-Learning (Escenario 20)

Proyecto de Integración de la asignatura **Metodologías y Tecnologías de Integración de Sistemas (MTIS, 34044)** — Curso 2025-2026 — Universidad de Alicante.

> Escenario nº 20 del enunciado oficial: *"Plataforma de educación online (e-learning). Integración de gestión de cursos, usuarios, evaluaciones, certificaciones, pagos y sistemas externos de contenidos."*

## 👥 Equipo

| Miembro | Servicios SOAP | Servicios REST |
|---|---|---|
| **Erardo Aldana Pessoa** | CertificateService, CoursePurchaseProcessService | — |
| **Cayetano (Tano) Cánovas Martínez** | LegacyConnectorService | FinancialGatewayService |
| **Joaquín (Joaco) Martínez García** | — | CourseService, EnrollmentService |
| **Guillermo (Mo) Amorós Navalón** | — | UserService, EmailNotificationService |
| **Marcos Bentivegna Adrián** | — | EvaluationService, AcademicHistoryProcess |

## 📅 Calendario

| Fecha | Hito |
|---|---|
| 17/03/2026 | ✅ Entrega Fase SOA (memoria + contratos + presentación) |
| 18/03/2026 — 25/03/2026 | ✅ Presentaciones Fase SOA |
| **19/05/2026** | 🔴 Entrega final en Moodle (memoria + fuentes + BBDD + PPT) |
| **20/05/2026** | 🔴 Presentación final + demo (15 min) |

## 🏗️ Arquitectura

Sistema implementado siguiendo metodología SOA de Thomas Erl con 4 capas de servicios:

- **Entity Services**: UserService, CourseService (REST)
- **Task Services**: EnrollmentService, EvaluationService (REST) + CertificateService (SOAP)
- **Application/Utility Services**: EmailNotificationService (REST), LegacyConnectorService (SOAP)
- **Process Services**: CoursePurchaseProcessService (SOAP), AcademicHistoryProcess (REST)

**Stack tecnológico**:
- Backend: **Mule 4** (Anypoint Studio) para servicios y orquestación ESB
- BBDD: **MySQL 8.0** con credenciales unificadas `mule/mule123`
- Frontend: *(pendiente — ver `frontend/`)*
- Documentación contratos: **WSDL** (SOAP) + **OpenAPI 3.0** (REST)

## 📂 Estructura del repositorio

```
.
├── README.md                  ← este archivo
├── CONTRIBUTING.md            ← cómo añadir tu parte
├── docs/                      ← enunciado, memorias, presentaciones
├── contratos/                 ← WSDL + OpenAPI (entrega 1)
├── backend/
│   ├── soap-services/         ← cada uno su carpeta
│   ├── rest-services/
│   └── esb-orchestrations/    ← flujos orquestados (obligatorio enunciado)
├── frontend/                  ← aplicación cliente
├── database/                  ← schemas SQL
└── tests/                     ← Postman + SOAP UI
```

## 🚀 Cómo arrancar en local

1. **Base de datos**:
   ```bash
   mysql -u root -p < database/schema-completo.sql
   mysql -u root -p < database/seed.sql
   ```
2. **Servicios**: importar cada carpeta dentro de `backend/` en Anypoint Studio y arrancar.
3. **Frontend**: ver instrucciones en `frontend/README.md`.

## 📌 Estado actual

Marcado de cada pieza para coordinar el sprint final hasta el 19/05:

- [x] Contratos WSDL + OpenAPI (Fase 1)
- [x] Memoria descriptiva Fase 1
- [x] CertificateService (SOAP) — Erardo
- [x] CoursePurchaseProcessService (SOAP) — Erardo
- [ ] LegacyConnectorService (SOAP)
- [ ] FinancialGatewayService (REST) — Tano
- [ ] CourseService (REST) — Joaco
- [ ] EnrollmentService (REST) — Joaco
- [ ] UserService (REST) — Mo
- [ ] EmailNotificationService (REST) — Mo
- [ ] EvaluationService (REST) — Marcos
- [ ] AcademicHistoryProcess (REST) — Marcos
- [ ] **Orquestación ESB — flujo SOAP** (mínimo enunciado)
- [ ] **Orquestación ESB — flujo REST** (mínimo enunciado)
- [ ] **Frontend** (obligatorio enunciado)
- [ ] Memoria Fase 2
- [ ] Presentación final PPT
