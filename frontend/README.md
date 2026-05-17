# Frontend — Plataforma E-Learning UA (Grupo 20)

Cliente web simple en **HTML + JavaScript vanilla + Tailwind CDN** que consume las orquestaciones ESB del backend a través del **API Gateway** (`backend/dev-bundle/src/main/mule/api-gateway.xml`, puerto 8094).

## ¿Por qué este stack tan simple?

- **Sin builds** ni `npm install`: abres el HTML y funciona.
- **Tailwind por CDN**: estilos consistentes sin pelearte con CSS.
- **Vanilla JS**: el profesor ve claramente las llamadas HTTP, no escondidas tras un framework.
- **API Gateway encapsula CORS y SOAP**: el navegador habla JSON puro, sin envelopes ni preflight problemáticos.

## Funcionalidades (cumple el apartado 6 del enunciado oficial)

| Vista | Qué consume |
|---|---|
| **Login** | `POST /api/login` del gateway (mock — cualquier user/password funciona) |
| **Cursos disponibles** | `GET /api/courses` → mock CourseService 8082 |
| **Comprar curso** | `POST /api/buy-course` → **Orquestación ESB SOAP 8091** (Saga completa: validar → start → pago → confirmar → finalizar → notificar) |
| **Mis matrículas** | en memoria de sesión, generadas tras compras exitosas |
| **Solicitar certificado** | `POST /api/issue-certificate` → **Orquestación ESB REST 8092** |
| **Consultar certificado** | `GET /api/certificates/{id}` → CertificateService SOAP via gateway |

## Cómo arrancarlo

### Paso 1: arrancar el backend
Asegúrate de tener el bundle Mule (`backend/dev-bundle/`) corriendo en Anypoint Studio. Comprueba con:

```powershell
netstat -an | findstr "LISTENING" | findstr ":80"
```

Tienen que aparecer **9 puertos**: 8082, 8083, 8085, 8086, 8087, 8088, 8091, 8092, **8094** (gateway).

### Paso 2: abrir el frontend

**Opción A — Servidor HTTP simple (recomendado)**:

```powershell
cd C:\Users\erard\Documents\MTIS\Gr20_E-learning_SOA\frontend
python -m http.server 5173
```

Luego abre tu navegador en http://localhost:5173

**Opción B — Doble click**:

Abre `index.html` haciendo doble click. Funciona pero algunos navegadores pueden poner pegas con el `file://`; si te da problemas, usa la opción A.

### Paso 3: probar el flujo end-to-end

1. **Login**: cualquier usuario/password sirve (es mock). Por defecto `STU-0042 / demo1234`.
2. **Tab "Cursos disponibles"** → ves la lista de cursos cargada desde el mock CourseService.
3. **Click "Comprar curso"** → se abre un modal con loading mientras el ESB orquesta los 6 servicios. Al terminar verás `purchaseId`, `transactionId`, `enrollmentId` y la lista de pasos completados (esto es lo que se demuestra al profesor: la Saga real con `correlationId`).
4. **Tab "Mis matrículas"** → ves la matrícula recién creada.
5. **Click "Solicitar certificado"** en una matrícula → te lleva a la pestaña de certificados con los datos prerrellenados → click en el botón verde → invoca la orquestación ESB REST.
6. **Tab "Mis certificados"** → ves el certificado emitido. Click en "Consultar al CertificateService SOAP →" para verificar que el backend SOAP responde.

## Archivos

```
frontend/
├── index.html      ← UI completa con tabs y modal
├── app.js          ← lógica + llamadas al gateway
└── README.md       ← este archivo
```

## Para la demo del 20/05

El frontend cumple el requisito *"Aplicación web o de escritorio realizada por los alumnos en un lenguaje de programación (c#, javascript, php, java, etc.)"* del enunciado oficial. En la presentación, conviene mostrar:

1. Login + lista de cursos (carga desde mock/CourseService real).
2. Compra completa de un curso — destacar visualmente la lista de pasos (`steps`) del modal: son los 6 servicios orquestados por el ESB.
3. Solicitar certificado y verlo en la pestaña.
4. Click en "Consultar al CertificateService SOAP" para mostrar que el backend SOAP también responde directamente.

> 🎬 **Tip para la presentación**: en el modal de compra exitosa hay un `details` (desplegable "Ver JSON completo de respuesta") que enseña la respuesta JSON íntegra. Es buen momento para mencionar que el frontend habla JSON pero por debajo se ha hecho una conversión SOAP→JSON en el gateway.
