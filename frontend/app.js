/* ============================================================================
   Frontend E-Learning UA — Grupo 20
   Cliente vanilla JS que consume el API Gateway en localhost:8094.
   ============================================================================
*/

const API_BASE = "http://localhost:8094/api";

// Estado en memoria — purgable refrescando la página
const state = {
    user: null,           // { userId, email, token, role }
    courses: [],          // array
    enrollments: [],      // matrículas creadas durante la sesión
    certificates: [],     // certificados emitidos durante la sesión
};

/* ----------------------------------------------------------------------- INIT */
document.addEventListener("DOMContentLoaded", () => {
    checkGatewayHealth();
    document.getElementById("form-login").addEventListener("submit", handleLogin);
    document.getElementById("btn-logout").addEventListener("click", handleLogout);
    document.getElementById("btn-reload-courses").addEventListener("click", loadCourses);
    document.getElementById("form-issue-cert").addEventListener("submit", handleIssueCertificate);
    document.getElementById("btn-close-modal").addEventListener("click", closeModal);
    document.getElementById("modal-backdrop").addEventListener("click", (e) => {
        if (e.target.id === "modal-backdrop") closeModal();
    });

    // Tabs
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Si ya hay usuario en sessionStorage, restáuralo
    const saved = sessionStorage.getItem("mtis-user");
    if (saved) {
        state.user = JSON.parse(saved);
        showApp();
    }
});

/* ----------------------------------------------------------------------- HEALTH */
async function checkGatewayHealth() {
    const statusEl = document.getElementById("gateway-status");
    try {
        const res = await fetch(`${API_BASE}/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        statusEl.innerHTML = `<span class="text-emerald-700">✓ online</span> · servicios activos: ${Object.keys(data.upstreamPorts).length}`;
    } catch (e) {
        statusEl.innerHTML = `<span class="text-red-700">✗ no responde</span> — arranca el bundle Mule (puerto 8094)`;
    }
}

/* ----------------------------------------------------------------------- LOGIN */
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error(`Login falló: ${res.status}`);
        const data = await res.json();
        state.user = data;
        sessionStorage.setItem("mtis-user", JSON.stringify(data));
        showApp();
        toast("Bienvenido, " + data.userId, "success");
    } catch (err) {
        toast("Error en login: " + err.message, "error");
    }
}

function handleLogout() {
    state.user = null;
    state.enrollments = [];
    state.certificates = [];
    sessionStorage.removeItem("mtis-user");
    document.getElementById("view-app").classList.add("hidden");
    document.getElementById("view-login").classList.remove("hidden");
    document.getElementById("user-info").classList.add("hidden");
    document.getElementById("btn-logout").classList.add("hidden");
}

function showApp() {
    document.getElementById("view-login").classList.add("hidden");
    document.getElementById("view-app").classList.remove("hidden");
    document.getElementById("user-info").classList.remove("hidden");
    document.getElementById("user-name").textContent = state.user.userId;
    document.getElementById("btn-logout").classList.remove("hidden");
    loadCourses();
}

/* ----------------------------------------------------------------------- TABS */
function switchTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
    document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
    document.getElementById(`tab-${tab}`).classList.remove("hidden");

    if (tab === "enrollments") renderEnrollments();
    if (tab === "certificates") renderCertificates();
    if (tab === "explorer") renderExplorer();
}

/* ----------------------------------------------------------------------- API EXPLORER */
const apiCatalog = [
    {
        group: "👤 UserService (Mo · 8081)",
        ops: [
            { id: "user-list",    label: "Listar usuarios",       method: "GET",  path: "/api/svc/users",            body: null },
            { id: "user-create",  label: "Crear usuario",         method: "POST", path: "/api/svc/users",            body: { name: "Alumno Demo", email: "demo@alu.ua.es", password: "demo1234", role: "STUDENT" } },
            { id: "user-get",     label: "Consultar usuario",     method: "GET",  path: "/api/svc/users/{userId}",   body: null, params: { userId: "STU-0042" } },
            { id: "user-update",  label: "Modificar usuario",     method: "PUT",  path: "/api/svc/users/{userId}",   body: { name: "Nombre Actualizado" }, params: { userId: "STU-0042" } },
            { id: "user-delete",  label: "Eliminar usuario",      method: "DELETE", path: "/api/svc/users/{userId}", body: null, params: { userId: "STU-OBSOLETO" } },
            { id: "user-login",   label: "Login (autenticación)", method: "POST", path: "/api/svc/users/login",      body: { email: "demo@alu.ua.es", password: "demo1234" } }
        ]
    },
    {
        group: "📚 CourseService (Joaco · 8082)",
        ops: [
            { id: "course-list",   label: "Listar cursos",          method: "GET",  path: "/api/svc/courses",                body: null },
            { id: "course-get",    label: "Consultar curso",        method: "GET",  path: "/api/svc/courses/{courseId}",     body: null, params: { courseId: "COURSE-MTIS-2026" } },
            { id: "course-create", label: "Crear curso",            method: "POST", path: "/api/svc/courses",                body: { title: "Curso Demo",description: "cursillo" ,category: "Pruebas", durationHours: 30, price: 19.99, instructorId: "uuid", instructorName: "Prof. García" } },
            { id: "course-update", label: "Actualizar curso",       method: "PUT",  path: "/api/svc/courses/{courseId}",     body: { title: "Curso Demo",description: "cursillo" ,category: "Pruebas", durationHours: 30, price: 19.99, active: true, legacyContentId: "LEG-005" }, params: { courseId: "COURSE-MTIS-2026" } },
            { id: "course-delete", label: "Eliminar curso",         method: "DELETE", path: "/api/svc/courses/{courseId}",   body: null, params: { courseId: "COURSE-OBSOLETO" } }
        ]
    },
    {
        group: "🎒 EnrollmentService (Joaco · 8083)",
        ops: [
            { id: "enr-create",   label: "Matricular usuario en curso", method: "POST",   path: "/api/svc/enrollments",                  body: { userId: "STU-0042", courseId: "COURSE-MTIS-2026" } },
            { id: "enr-get",      label: "Consultar matrícula",         method: "GET",    path: "/api/svc/enrollments/{enrollmentId}",   body: null, params: { enrollmentId: "ENR-12345678" } },
            { id: "enr-delete",   label: "Cancelar matrícula",          method: "DELETE", path: "/api/svc/enrollments/{enrollmentId}",   body: null, params: { enrollmentId: "ENR-12345678" } }
        ]
    },
    {
        group: "📝 EvaluationService (Marcos · 8084)",
        ops: [
            { id: "eval-questions", label: "Obtener preguntas",  method: "GET",  path: "/api/svc/evaluations/{courseId}/questions", body: null, params: { courseId: "COURSE-MTIS-2026" } },
            { id: "eval-submit",    label: "Enviar respuestas",  method: "POST", path: "/api/svc/evaluations/answers",              body: { enrollmentId: "ENR-12345678", answers: [{ questionId: "Q1", answer: "B" }, { questionId: "Q2", answer: "A" }] } },
            { id: "eval-grade",     label: "Calcular nota",      method: "POST", path: "/api/svc/evaluations/calculate-grade",      body: { enrollmentId: "ENR-12345678" } },
            { id: "eval-get",       label: "Consultar nota",     method: "GET",  path: "/api/svc/evaluations/{enrollmentId}/grade", body: null, params: { enrollmentId: "ENR-12345678" } }
        ]
    },
    {
        group: "✉️ EmailNotificationService (Mo · 8085)",
        ops: [
            { id: "email-generic",     label: "Enviar email",                  method: "POST", path: "/api/svc/notifications/email",        body: { to: "demo@alu.ua.es", subject: "Hola", body: "Cuerpo del correo" } },
            { id: "email-enrollment",  label: "Notificación matrícula",        method: "POST", path: "/api/svc/notifications/enrollment",   body: { userId: "STU-0042", courseId: "COURSE-MTIS-2026", email: "demo@alu.ua.es" } },
            { id: "email-certificate", label: "Notificación certificado",      method: "POST", path: "/api/svc/notifications/certificate",  body: { userId: "STU-0042", certificateId: "11111111-1111-1111-1111-111111111111", email: "demo@alu.ua.es" } }
        ]
    },
    {
        group: "💳 FinancialGatewayService (Tano · 8086)",
        ops: [
            { id: "pay-process", label: "Procesar pago",  method: "POST", path: "/api/svc/payments/process", body: { paymentId: "PAY-001", userId: "STU-0042", amount: 49.99, currency: "EUR", description: "Curso MTIS" } },
            { id: "pay-confirm", label: "Confirmar pago", method: "POST", path: "/api/svc/payments/confirm", body: { paymentId: "PAY-001", transactionId: "TXN-12345" } },
            { id: "pay-cancel",  label: "Cancelar pago",  method: "POST", path: "/api/svc/payments/cancel",  body: { paymentId: "PAY-001", reason: "USER_REQUEST" } }
        ]
    },
    {
        group: "📜 CertificateService SOAP (Erardo · 8087, vía gateway)",
        ops: [
            { id: "cert-get",    label: "Consultar certificado (SOAP→JSON)", method: "GET",  path: "/api/certificates/{certificateId}", body: null, params: { certificateId: "11111111-1111-1111-1111-111111111111" } },
            { id: "cert-issue",  label: "Emitir certificado (orquestación ESB REST)", method: "POST", path: "/api/issue-certificate", body: { studentId: "STU-0042", courseId: "COURSE-MTIS-2026", enrollmentId: "ENR-12345678" } }
        ]
    },
    {
        group: "🛒 CoursePurchase (Erardo · ESB SOAP 8091)",
        ops: [
            { id: "purchase-full", label: "Comprar curso (Saga ESB completa)", method: "POST", path: "/api/buy-course", body: { userId: "STU-0042", courseId: "COURSE-MTIS-2026", paymentMethod: "CARD" } }
        ]
    }
    ,
    {
        group: "🔄 ServicioProcesoGestionUsuarios (Mo · 8090)",
        ops: [
            { id: "proc-registrar", label: "Registrar usuario + notificar", method: "POST", path: "/api/svc/user-process/registrar-usuario", body: { name: "Alumno Demo", email: "demo@alu.ua.es", password: "demo1234", role: "student" } },
            { id: "proc-consultar", label: "Consultar usuario (proceso)", method: "GET", path: "/api/svc/user-process/consultar-usuario/{userId}", body: null, params: { userId: "STU-0042" } },
            { id: "proc-eliminar", label: "Eliminar usuario (proceso)", method: "DELETE", path: "/api/svc/user-process/eliminar-usuario/{userId}", body: null, params: { userId: "STU-0042" } }
        ]
    }
];

let explorerCurrentOp = null;

function renderExplorer() {
    const cat = document.getElementById("explorer-catalog");
    if (cat.children.length > 0) return; // ya renderizado
    cat.innerHTML = apiCatalog.map(group => `
        <div class="mb-3">
            <p class="font-semibold text-xs text-slate-700 mt-3 mb-1 sticky top-0 bg-white py-1">${escapeHtml(group.group)}</p>
            ${group.ops.map(op => `
                <button class="explorer-op-btn w-full text-left px-2 py-1.5 rounded text-sm hover:bg-indigo-50 transition flex items-center space-x-2"
                        data-op-id="${escapeHtml(op.id)}">
                    <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${methodColor(op.method)}">${op.method}</span>
                    <span class="flex-1">${escapeHtml(op.label)}</span>
                </button>
            `).join("")}
        </div>
    `).join("");

    document.querySelectorAll(".explorer-op-btn").forEach(btn => {
        btn.addEventListener("click", () => selectExplorerOp(btn.dataset.opId));
    });
    document.getElementById("explorer-execute").addEventListener("click", executeExplorerOp);
}

function methodColor(m) {
    switch (m) {
        case "GET":    return "bg-emerald-100 text-emerald-700";
        case "POST":   return "bg-indigo-100 text-indigo-700";
        case "PUT":    return "bg-amber-100 text-amber-700";
        case "DELETE": return "bg-red-100 text-red-700";
        default:       return "bg-slate-100 text-slate-700";
    }
}

function findOpById(id) {
    for (const g of apiCatalog) {
        const op = g.ops.find(o => o.id === id);
        if (op) return op;
    }
    return null;
}

function selectExplorerOp(id) {
    const op = findOpById(id);
    if (!op) return;
    explorerCurrentOp = op;

    document.getElementById("explorer-op-header").classList.add("hidden");
    document.getElementById("explorer-op-body").classList.remove("hidden");

    const badge = document.getElementById("explorer-method-badge");
    badge.textContent = op.method;
    badge.className = `font-mono text-xs font-bold px-2 py-1 rounded ${methodColor(op.method)}`;
    document.getElementById("explorer-url").textContent = op.path;
    document.getElementById("explorer-description").textContent = op.label;

    // Parámetros de URL
    const paramsSection = document.getElementById("explorer-params-section");
    const paramsBox = document.getElementById("explorer-params");
    if (op.params) {
        paramsSection.classList.remove("hidden");
        paramsBox.innerHTML = Object.entries(op.params).map(([k, v]) => `
            <div class="flex items-center space-x-2">
                <label class="text-xs font-mono text-slate-600 w-32 truncate">${escapeHtml(k)}</label>
                <input type="text" data-param="${escapeHtml(k)}" value="${escapeHtml(String(v))}"
                       class="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"/>
            </div>
        `).join("");
    } else {
        paramsSection.classList.add("hidden");
        paramsBox.innerHTML = "";
    }

    // Body
    const bodySection = document.getElementById("explorer-body-section");
    const bodyArea = document.getElementById("explorer-body");
    if (op.body !== null && op.method !== "GET" && op.method !== "DELETE") {
        bodySection.classList.remove("hidden");
        bodyArea.value = JSON.stringify(op.body, null, 2);
    } else {
        bodySection.classList.add("hidden");
        bodyArea.value = "";
    }

    // Limpiar resultado anterior
    document.getElementById("explorer-result-card").classList.add("hidden");
}

async function executeExplorerOp() {
    if (!explorerCurrentOp) return;
    const op = explorerCurrentOp;

    // =========================
    // 1. PATH PARAMS
    // =========================
    let url = op.path;

    const pathParams = { ...(op.params || {}) };

    document.querySelectorAll("[data-param]").forEach(input => {
        const k = input.dataset.param;
        const v = input.value;

        if (v !== undefined && v !== null && v !== "") {
            pathParams[k] = v;
        }
    });

    Object.entries(pathParams).forEach(([k, v]) => {
        url = url.replace(`{${k}}`, encodeURIComponent(v));
    });

    // 🚨 FAIL FAST: si queda algún {param}
    if (url.includes("{")) {
        console.error("Falta resolver path params:", url);
        return;
    }

    const fullUrlBase = `http://localhost:8094${url}`;

    // =========================
    // 2. QUERY PARAMS (FORZADO STRING)
    // =========================
    const queryParams = {};

    // 🔥 SIEMPRE FORZAR STRING, NUNCA undefined
    queryParams.courseId =
        (op.params && op.params.courseId !== undefined && op.params.courseId !== null)
            ? String(op.params.courseId)
            : "";

    queryParams.id =
        op.id !== undefined && op.id !== null
            ? String(op.id)
            : "";

    // 🔥 DEBUG
    console.log("QUERY PARAMS RAW:", queryParams);

    // Construcción segura
    const qs = new URLSearchParams(queryParams).toString();
    const fullUrl = `${fullUrlBase}?${qs}`;

    // =========================
    // 3. FETCH
    // =========================
    const opts = {
        method: op.method,
        headers: {
            "rest_key": "1234"
        }
    };

    if (op.method !== "GET" && op.method !== "DELETE") {
        const bodyStr = document.getElementById("explorer-body").value;
    
        let bodyObj;
        try {
            bodyObj = bodyStr.trim() ? JSON.parse(bodyStr) : {};
        } catch (e) {
            showExplorerResult(null, "ERROR JSON: " + e.message);
            return;
        }
    
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(bodyObj);
    }

    console.log("FINAL URL:", fullUrl);
    console.log(opts.body)

    try {
        const res = await fetch(fullUrl, opts);
        const text = await res.text();

        showExplorerResult(
            res.status,
            `${res.status} ${res.statusText}`,
            text
        );
    } catch (err) {
        showExplorerResult(0, `ERROR DE RED: ${err.message}`);
    }
}

function showExplorerResult(status, statusLabel, body) {
    document.getElementById("explorer-result-card").classList.remove("hidden");
    const statusEl = document.getElementById("explorer-result-status");
    statusEl.textContent = statusLabel;
    statusEl.className = "text-xs font-mono " +
        (status && status >= 200 && status < 300 ? "text-emerald-700" :
         status && status >= 400 ? "text-red-700" :
         "text-slate-600");
    document.getElementById("explorer-result-body").textContent = body || "(sin cuerpo)";
}

/* ----------------------------------------------------------------------- COURSES */
function normalizeCourse(c) {
    return {
        id: c.id,
        title: c.title,
        description: c.description,
        price: Number(c.price || 0),
        currency: c.currency || "EUR",
        instructorName: c.instructorName || c.instructor_name || "—",
        durationHours: c.durationHours || c.duration_hours || 0,
        category: c.category || "General"
    };
}

async function loadCourses() {
    const container = document.getElementById("courses-list");

    try {
        console.log("iniciando fetch...");

        const res = await fetch(`${API_BASE}/courses`, {
            method: "GET",
            headers: {
                "rest_key": "1234"
            }
        });

        console.log("respuesta recibida");

        const data = await res.json();
        console.log("DATA:", data);

        const bodyObj = {
            sourceSystem: "legacy-lm",
            catalogId: "Legacy",
            modifiedSince: "2026-05-10T09:00:00Z"
        };
        
        const res2 = await fetch(`${API_BASE}/courses/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "rest_key": "1234"
            },
            body: JSON.stringify(bodyObj)
        });

        const data2 = await res2.json();
        console.log("DATA2:", data2)

        // 🔥 AQUÍ estaba el fallo
        state.courses = data.data || [];

        state.courses = data.data.map(normalizeCourse);

        // 🔥 ahora sí renderizas
        renderCourses();

    } catch (err) {
        console.error("ERROR FETCH:", err);
        container.innerHTML = `
            <p class="col-span-full text-center text-red-600 py-8">
                Error cargando cursos: ${err.message}
            </p>
        `;
    }
}

function renderCourses() {
    const container = document.getElementById("courses-list");
    if (state.courses.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-slate-500 py-8">No hay cursos disponibles.</p>`;
        return;
    }
    const emojiFor = (cat) => {
        const c = (cat || "").toLowerCase();
        if (c.includes("ingenier")) return "🧩";
        if (c.includes("web")) return "🌐";
        if (c.includes("cloud") || c.includes("sistema")) return "☁️";
        if (c.includes("dato")) return "📊";
        return "📚";
    };
    container.innerHTML = state.courses.map(course => `
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
            <div class="bg-gradient-to-br from-indigo-500 to-violet-600 h-24 relative flex items-center justify-center">
                <span class="text-5xl">${emojiFor(course.category)}</span>
                <span class="absolute top-2 right-2 bg-white/95 text-emerald-700 font-bold text-sm px-2.5 py-0.5 rounded-full shadow">${course.price} ${course.currency || "EUR"}</span>
            </div>
            <div class="p-5">
                <span class="inline-block text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mb-2">${escapeHtml(course.category || "General")}</span>
                <h3 class="font-bold text-lg mb-1 leading-tight">${escapeHtml(course.title)}</h3>
                <p class="text-xs text-slate-500 mb-1">${escapeHtml(course.description || "")}</p>
                <p class="text-sm text-slate-600 mb-4">
                    <span class="text-slate-400">👤</span> ${escapeHtml(course.instructorName || "—")}
                    <span class="mx-1 text-slate-300">·</span>
                    <span class="text-slate-400">⏱</span> ${course.durationHours || "?"} h
                </p>
                <button onclick="buyCourse('${escapeHtml(course.id)}', '${escapeHtml(course.title)}')"
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition shadow-sm hover:shadow">
                    🛒 Comprar curso
                </button>
            </div>
        </div>
    `).join("");
}

/* ----------------------------------------------------------------------- BUY COURSE (ESB SOAP) */
async function buyCourse(courseId, courseTitle) {
    openModal("Procesando compra...", `
        <div class="text-center py-8">
            <div class="inline-block animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
            <p class="mt-4 text-slate-600">Orquestando llamadas SOAP/REST a través del ESB...</p>
            <p class="text-sm text-slate-500 mt-2">Curso: <strong>${escapeHtml(courseTitle)}</strong></p>
        </div>
    `, []);

    try {
        const res = await fetch(`${API_BASE}/buy-course`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: state.user.userId,
                courseId: courseId,
                paymentMethod: "CARD"
            })
        });
        const data = await res.json();

        if (data.status === "COMPLETED") {
            // Guardar matrícula en sesión
            state.enrollments.push({
                enrollmentId: data.enrollmentId,
                purchaseId:   data.purchaseId,
                transactionId: data.transactionId,
                courseId, courseTitle,
                createdAt: new Date().toISOString()
            });

            openModal(`✅ Compra completada`, `
                <div class="space-y-3">
                    <div class="bg-emerald-50 border border-emerald-200 rounded p-4">
                        <p class="font-semibold text-emerald-800">Saga ejecutada correctamente.</p>
                        <p class="text-sm text-emerald-700 mt-1">Esta operación atravesó 6 servicios en cadena vía ESB.</p>
                    </div>
                    <dl class="grid grid-cols-2 gap-2 text-sm">
                        <dt class="font-medium">Correlation ID:</dt><dd><code>${escapeHtml(data.correlationId)}</code></dd>
                        <dt class="font-medium">Purchase ID:</dt><dd><code>${escapeHtml(data.purchaseId)}</code></dd>
                        <dt class="font-medium">Transaction ID:</dt><dd><code>${escapeHtml(data.transactionId)}</code></dd>
                        <dt class="font-medium">Enrollment ID:</dt><dd><code>${escapeHtml(data.enrollmentId)}</code></dd>
                    </dl>
                    <div>
                        <p class="text-sm font-medium mb-2">Pasos completados por la orquestación ESB:</p>
                        <ol class="list-decimal list-inside text-sm space-y-1 bg-slate-50 p-3 rounded">
                            ${(data.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}
                        </ol>
                    </div>
                    <details class="text-xs">
                        <summary class="cursor-pointer text-slate-500">Ver JSON completo de respuesta</summary>
                        <pre class="json mt-2 bg-slate-100 p-3 rounded">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
                    </details>
                </div>
            `, [
                { label: "Ver mis matrículas", action: () => { closeModal(); switchTab("enrollments"); } },
                { label: "Cerrar", action: closeModal, primary: false }
            ]);
            toast("Compra completada", "success");
        } else {
            openModal("❌ La compra falló", `
                <div class="bg-red-50 border border-red-200 rounded p-4">
                    <p class="font-semibold text-red-800">Status: ${escapeHtml(data.status)}</p>
                    <p class="text-sm text-red-700 mt-1">${escapeHtml(data.message || "Error sin descripción")}</p>
                </div>
                <details class="mt-3 text-xs">
                    <summary class="cursor-pointer text-slate-500">Respuesta completa</summary>
                    <pre class="json mt-2 bg-slate-100 p-3 rounded">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
                </details>
            `, [{ label: "Cerrar", action: closeModal }]);
        }
    } catch (err) {
        openModal("❌ Error de red", `<p class="text-red-700">${escapeHtml(err.message)}</p>`, [
            { label: "Cerrar", action: closeModal }
        ]);
    }
}

function renderEnrollments() {
    const container = document.getElementById("enrollments-list");
    if (state.enrollments.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-500 py-8">No tienes matrículas aún. Compra un curso para empezar.</p>`;
        return;
    }
    container.innerHTML = state.enrollments.map(e => `
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
            <div>
                <p class="font-semibold">${escapeHtml(e.courseTitle)}</p>
                <p class="text-xs text-slate-500 mt-1">
                    Matrícula <code>${escapeHtml(e.enrollmentId)}</code> · ${new Date(e.createdAt).toLocaleString()}
                </p>
            </div>
            <button onclick="prefillCertificateForm('${escapeHtml(e.enrollmentId)}','${escapeHtml(e.courseId)}')"
                    class="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded">
                🏅 Solicitar certificado
            </button>
        </div>
    `).join("");
}

function prefillCertificateForm(enrollmentId, courseId) {
    switchTab("certificates");
    document.getElementById("cert-enrollment-id").value = enrollmentId;
    document.getElementById("cert-course-id").value = courseId;
}

/* ----------------------------------------------------------------------- ISSUE CERTIFICATE (ESB REST) */
async function handleIssueCertificate(e) {
    e.preventDefault();
    const enrollmentId = document.getElementById("cert-enrollment-id").value;
    const courseId = document.getElementById("cert-course-id").value;

    openModal("Procesando solicitud...", `
        <div class="text-center py-8">
            <div class="inline-block animate-spin w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
            <p class="mt-4 text-slate-600">Orquestando: consulta de nota → generación SOAP → notificación...</p>
        </div>
    `, []);

    try {
        const res = await fetch(`${API_BASE}/issue-certificate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentId: state.user.userId,
                courseId,
                enrollmentId
            })
        });
        const data = await res.json();

        if (data.status === "GENERATED") {
            state.certificates.push({
                certificateId: data.certificateId,
                studentId: data.studentId,
                courseId: data.courseId,
                finalGrade: data.finalGrade,
                issuedAt: new Date().toISOString()
            });
            openModal("🎉 Certificado emitido", `
                <div class="bg-emerald-50 border border-emerald-200 rounded p-4 mb-3">
                    <p class="font-semibold text-emerald-800">Certificado generado correctamente.</p>
                </div>
                <dl class="grid grid-cols-2 gap-2 text-sm">
                    <dt class="font-medium">Certificate ID:</dt><dd><code>${escapeHtml(data.certificateId)}</code></dd>
                    <dt class="font-medium">Correlation ID:</dt><dd><code>${escapeHtml(data.correlationId)}</code></dd>
                    <dt class="font-medium">Nota final:</dt><dd>${data.finalGrade}</dd>
                    <dt class="font-medium">Status:</dt><dd>${escapeHtml(data.status)}</dd>
                </dl>
                <div class="mt-3">
                    <p class="text-sm font-medium mb-2">Pasos del ESB:</p>
                    <ol class="list-decimal list-inside text-sm space-y-1 bg-slate-50 p-3 rounded">
                        ${(data.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}
                    </ol>
                </div>
            `, [
                { label: "Ver mis certificados", action: () => { closeModal(); renderCertificates(); } },
                { label: "Cerrar", action: closeModal, primary: false }
            ]);
            toast("Certificado emitido", "success");
        } else if (data.status === "NOT_ELIGIBLE") {
            openModal("❌ No elegible", `
                <div class="bg-amber-50 border border-amber-200 rounded p-4">
                    <p class="font-semibold text-amber-800">No se puede emitir el certificado.</p>
                    <p class="text-sm text-amber-700 mt-1">${escapeHtml(data.message || "El alumno no cumple los requisitos.")}</p>
                </div>
                <p class="mt-3 text-sm">Nota final detectada: <strong>${data.finalGrade}</strong> (mínimo: 5.0)</p>
            `, [{ label: "Cerrar", action: closeModal }]);
        } else {
            openModal("⚠️ Resultado inesperado", `
                <pre class="json bg-slate-100 p-3 rounded">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
            `, [{ label: "Cerrar", action: closeModal }]);
        }
    } catch (err) {
        openModal("❌ Error", `<p class="text-red-700">${escapeHtml(err.message)}</p>`, [
            { label: "Cerrar", action: closeModal }
        ]);
    }
}

function renderCertificates() {
    const container = document.getElementById("certificates-list");
    if (state.certificates.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-500 py-8">No tienes certificados emitidos en esta sesión.</p>`;
        return;
    }
    container.innerHTML = state.certificates.map(c => `
        <div class="bg-white border border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-white rounded-xl p-4">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold text-emerald-800">🏅 ${escapeHtml(c.courseId)}</p>
                    <p class="text-xs text-slate-500 mt-1">
                        Certificate ID <code>${escapeHtml(c.certificateId)}</code>
                    </p>
                </div>
                <span class="text-sm font-bold text-emerald-700">${c.finalGrade}/10</span>
            </div>
            <button onclick="viewCertificate('${escapeHtml(c.certificateId)}')"
                    class="mt-3 text-xs text-indigo-600 hover:text-indigo-800">
                Consultar al CertificateService SOAP →
            </button>
        </div>
    `).join("");
}

/* ----------------------------------------------------------------------- VIEW CERTIFICATE (Gateway → SOAP) */
async function viewCertificate(certificateId) {
    try {
        const res = await fetch(`${API_BASE}/certificates/${certificateId}`);
        const data = await res.json();
        openModal(`Certificado ${certificateId}`, `
            <pre class="json bg-slate-100 p-3 rounded text-xs">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
            <p class="mt-3 text-xs text-slate-500">Fuente: CertificateService.getCertificate (SOAP) vía API Gateway</p>
        `, [{ label: "Cerrar", action: closeModal }]);
    } catch (err) {
        toast("Error consultando certificado: " + err.message, "error");
    }
}

/* ----------------------------------------------------------------------- MODAL / TOAST helpers */
function openModal(title, bodyHtml, buttons) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = bodyHtml;
    const footer = document.getElementById("modal-footer");
    footer.innerHTML = "";
    (buttons || []).forEach(b => {
        const btn = document.createElement("button");
        btn.textContent = b.label;
        btn.className = (b.primary !== false)
            ? "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
            : "text-slate-600 hover:text-slate-900 px-4 py-2 text-sm";
        btn.onclick = b.action;
        footer.appendChild(btn);
    });
    document.getElementById("modal-backdrop").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-backdrop").classList.add("hidden");
}

function toast(msg, type) {
    const el = document.getElementById("toast");
    el.className = "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg fade-in " +
        (type === "success" ? "bg-emerald-600 text-white" :
         type === "error"   ? "bg-red-600 text-white" :
                               "bg-slate-800 text-white");
    el.textContent = msg;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 3000);
}

function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}