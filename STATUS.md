# 📊 Estado del proyecto MTIS — Grupo 20

> **Última actualización**: 16/05/2026 (sábado tarde)
> **Próximo deadline**: 🔴 entrega Moodle **19/05** (lunes) + presentación **20/05** (martes)
> **Repo**: https://github.com/eap59-ua/Gr20_E-learning_SOA

---

## ✅ Mi parte (Erardo) — COMPLETADA al 95%

### Backend (100% terminado)

| Pieza | Estado | Puerto | Notas |
|---|---|---|---|
| `CertificateService` (SOAP) | ✅ Funcionando + testeado | 8087 | Idempotente, SOAP Fault, BBDD MySQL |
| `CoursePurchaseProcessService` (SOAP) | ✅ Funcionando + testeado | 8088 | Saga states, 5 ops, compensación |
| ESB Orquestación SOAP — Compra de Curso | ✅ Implementada | 8091 | Saga por orquestación con rollback |
| ESB Orquestación REST — Emisión Cert. | ✅ Implementada | 8092 | SOAP+REST mixto, fallback nota |
| Mocks (Course, Enrollment, Email, Financial) | ✅ Funcionando | 8082,8083,8085,8086 | Temporales hasta entrega equipo |
| Bundle de desarrollo (8 flows en 1) | ✅ Funcionando | — | `backend/dev-bundle/` |
| BBDD MySQL (cert + purchases) | ✅ Cargadas | `mule/mule123` | 2 schemas, 1 fila demo |
| Postman collection SOAP services | ✅ Lista | — | `tests/postman/Erardo-SOAP-Services...` |
| Postman collection ESB orchestrations | ✅ Lista | — | `tests/postman/Erardo-ESB-Orchestrations...` |
| Peticiones SOAP UI XML | ✅ Listas | — | `tests/soap-ui/*.xml` |

### Documentación (95% terminado)

| Doc | Estado | Ubicación |
|---|---|---|
| README maestro del repo | ✅ | `README.md` |
| Guía de contribución del equipo | ✅ | `CONTRIBUTING.md` |
| Mi sección de memoria fase 2 (Markdown) | ✅ | `docs/fase2-final/aportaciones/Memoria-aportacion-Erardo.md` |
| Mi sección lista para pegar en Google Docs | ✅ | `docs/fase2-final/aportaciones/Erardo-PARA-PEGAR-EN-DOCS.txt` |
| Pegado real en el Google Docs del grupo | 🟡 En curso (yo lo pegué hoy) | https://docs.google.com/document/d/1tmhdWRb_y2InpmRtyhqUdjTMCLsKBYmEdA5T7XqcTn0 |
| README de cada placeholder de servicio | ✅ | `backend/rest-services/*/README.md` |
| README del bundle | ✅ | `backend/dev-bundle/README.md` |

### Repo GitHub

- ✅ Repo creado: https://github.com/eap59-ua/Gr20_E-learning_SOA
- ✅ Estructura completa pusheada
- ✅ Colaboradores añadidos: `mba90-ua` (Marcos), `jmg241-ua` (Joaco), `Guillr3031` (Mo), `ccm183-ua` (Tano)
- ✅ Estructura de carpetas según enunciado

### Pendiente individual (Erardo)

| Tarea | Tiempo | Prioridad |
|---|---|---|
| 🔴 **2-3 slides para PPT final** | ~1 h | Alta — antes del 20/05 |
| 🟡 Test integrado cuando el equipo suba sus reales | ~30 min | Media — el lunes |
| 🟢 Pequeñas iteraciones sobre la memoria si el grupo pide ajustes | variable | Baja |

---

## 🟡 Parte del equipo — Estado conocido

| Miembro | Servicios asignados | Estado (al 16/05) |
|---|---|---|
| **Mo (Guillermo)** | UserService (8081), EmailNotificationService (8085) | ✅ Subidos + orquestación user+email extra en 8090 |
| **Joaco (Joaquín)** | CourseService (8082), EnrollmentService (8083) | 🟡 En progreso |
| **Marcos** | EvaluationService (8084), AcademicHistoryProcess | 🟡 En progreso |
| **Tano (Cayetano)** | LegacyConnectorService (8089), FinancialGatewayService (8086) | 🔴 LegacyConnector necesita rehacer (tabla real, no solo transform). Va atrasado, dijo "mañana" |

### Bloqueantes del grupo (sin asignar)

| Bloqueante | Estado | Quién |
|---|---|---|
| 🔴 **Frontend** (cliente web) — OBLIGATORIO enunciado | NADIE lo coge aún | sin asignar |
| 🟡 Memoria fase 2 consolidación final | En progreso | grupo |
| 🟡 PowerPoint final unificado | Sin empezar | grupo |
| 🟡 Validar que todos los servicios encajan juntos | Sin hacer | grupo |

---

## 📅 Plan sugerido para el sprint final

### Domingo 17/05
- [ ] Esperar a que Joaco, Marcos, Tano suban sus reales
- [ ] Probar integración: parar mocks, arrancar reales, lanzar orquestaciones ESB
- [ ] **Quien coja el Frontend** lo empieza ya (HTML + JS o React)

### Lunes 18/05 (mañana)
- [ ] Reunión rápida del grupo: ¿qué falla?
- [ ] Cerrar memoria fase 2 (consolidar aportaciones, redactar Conclusiones)
- [ ] Empezar PPT final

### Lunes 19/05 ⚠️ DEADLINE
- [ ] Cerrar PPT
- [ ] Empaquetar: zip de fuentes + dump SQL + memoria PDF + PPT
- [ ] Subir a Moodle **antes de las 23:59**

### Martes 20/05 — Presentación + demo
- [ ] Probar la demo end-to-end por la mañana
- [ ] Repartir quién dice qué en la presentación
- [ ] 15 minutos en clase

---

## 🚀 Cuando vuelvas, empieza por aquí

**Acción inmediata al retomar**:
1. Mira el WhatsApp del grupo, lee mensajes desde 16/05.
2. `git pull` en `C:\Users\erard\Documents\MTIS\Gr20_E-learning_SOA` para bajarte lo que hayan subido los compañeros.
3. Confirma que `STATUS.md` (este fichero) sigue siendo correcto, o márcalo como obsoleto.
4. Prioridad #1: **2-3 slides para el PPT final** (di tu parte del proyecto).
5. Prioridad #2: probar la demo completa con los servicios reales del equipo cuando los suban.

**Si algo se rompe al pullear o al integrar con los reales del equipo** → empieza el chat con Claude diciendo *"Vuelvo al proyecto MTIS, lee STATUS.md primero y dime qué hacemos"*.

---

## 📂 Mapa rápido del repo

```
Gr20_E-learning_SOA/
├── README.md ............................ portada
├── CONTRIBUTING.md ...................... convenciones equipo (puertos, credenciales)
├── STATUS.md ............................ este fichero
├── .gitignore
│
├── docs/
│   ├── enunciado/MTIS_proyecto_2025-2026.pdf
│   ├── fase1-SOA/ ....................... entregables 17/03 (Memoria + PPT)
│   └── fase2-final/
│       ├── README.md
│       ├── plantilla-memoria.md
│       └── aportaciones/
│           ├── Memoria-aportacion-Erardo.md
│           └── Erardo-PARA-PEGAR-EN-DOCS.txt  ← copia esto a Google Docs
│
├── contratos/
│   ├── soap/ (3 WSDL)
│   └── rest/ (7 OpenAPI)
│
├── backend/
│   ├── README.md
│   ├── soap-services/
│   │   ├── certificate-service/           (ERARDO — listo)
│   │   ├── course-purchase-process-service/ (ERARDO — listo)
│   │   ├── legacy-connector-service/      (TANO — pendiente)
│   │   └── README-Erardo.md
│   ├── rest-services/
│   │   ├── _mocks/                        (Erardo — temporales)
│   │   ├── user-service/                  (MO — entregado)
│   │   ├── course-service/                (JOACO — pendiente)
│   │   ├── enrollment-service/            (JOACO — pendiente)
│   │   ├── evaluation-service/            (MARCOS — pendiente)
│   │   ├── email-notification-service/    (MO — entregado)
│   │   ├── financial-gateway-service/     (TANO — pendiente)
│   │   └── academic-history-process/      (MARCOS — pendiente)
│   ├── esb-orchestrations/
│   │   ├── flujo-compra-curso-SOAP/       (ERARDO — listo)
│   │   └── flujo-emision-cert-REST/       (ERARDO — listo)
│   └── dev-bundle/                        (ERARDO — bundle local de prueba)
│
├── frontend/                              🔴 PENDIENTE SIN ASIGNAR
│
├── database/
│   └── README.md
│
└── tests/
    ├── postman/ (2 colecciones)
    └── soap-ui/ (8 envelopes SOAP)
```

---

## 🎓 Calendario clave

| Fecha | Hito | Estado |
|---|---|---|
| 17/03/2026 | ✅ Entrega Fase SOA (memoria + contratos + PPT) | Hecho |
| 18-25/03/2026 | ✅ Presentaciones Fase SOA | Hecho |
| **19/05/2026** | 🔴 Entrega final Moodle (memoria PDF + fuentes + BBDD + PPT) | Pendiente |
| **20/05/2026** | 🔴 Presentación final + demo (15 min, todo el grupo presenta) | Pendiente |

**Hoy es 16/05/2026** → quedan **3 días** hasta la entrega.
