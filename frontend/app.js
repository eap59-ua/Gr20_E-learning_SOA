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
}

/* ----------------------------------------------------------------------- COURSES */
async function loadCourses() {
    const container = document.getElementById("courses-list");
    container.innerHTML = `<p class="col-span-full text-center text-slate-500 py-8">Cargando cursos...</p>`;
    try {
        const res = await fetch(`${API_BASE}/courses`);
        const data = await res.json();
        state.courses = data.data || [];
        renderCourses();
    } catch (err) {
        container.innerHTML = `<p class="col-span-full text-center text-red-600 py-8">Error cargando cursos: ${err.message}</p>`;
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
