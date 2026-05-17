import { useCallback, useMemo, useState } from 'react'
import './App.css'

const apiBase = import.meta.env.VITE_API_BASE ?? ''

const SOAP_CERT = import.meta.env.VITE_SOAP_CERT_URL ?? 'http://localhost:8087/services/CertificateService'
const SOAP_PURCHASE = import.meta.env.VITE_SOAP_PURCHASE_URL ?? 'http://localhost:8088/services/CoursePurchaseProcessService'
const SOAP_LEGACY = import.meta.env.VITE_SOAP_LEGACY_URL ?? 'http://localhost:8089/services/LegacyConnectorService'

type Result = {
  title: string
  method: string
  path: string
  status: number
  ms: number
  body: string
}

function formatBody(text: string): string {
  const t = text.trim()
  if (!t) return '(vacío)'
  try {
    return JSON.stringify(JSON.parse(t), null, 2)
  } catch {
    return t.slice(0, 8000)
  }
}

async function httpCall(
  method: string,
  path: string,
  body?: object,
  extraHeaders?: Record<string, string>,
): Promise<{ status: number; text: string; ms: number }> {
  const url = `${apiBase}${path}`
  const t0 = performance.now()
  const headers: Record<string, string> = { Accept: 'application/json, text/xml, */*', ...extraHeaders }
  if (body !== undefined) headers['Content-Type'] = extraHeaders?.['Content-Type'] ?? 'application/json'
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const ms = Math.round(performance.now() - t0)
  return { status: res.status, text, ms }
}

type Action = {
  id: string
  method: string
  path: string
  body?: object
  headers?: Record<string, string>
  /** Abre URL absoluta en nueva pestaña (SOAP / WSDL) */
  externalUrl?: string
}

function badgeClass(status: number) {
  if (status >= 200 && status < 300) return 'badge badge-ok'
  if (status >= 400 && status < 500) return 'badge badge-warn'
  return 'badge badge-err'
}

function enc(s: string): string {
  return encodeURIComponent(s)
}

type EvalCtx = {
  evalId: string
  studentId: string
  courseCode: string
  listStudent: string
  listStatus: string
  putStatus: string
  putScore: string
}

type UserCtx = {
  wsKey: string
  userId: string
  loginEmail: string
  loginPassword: string
  createName: string
  createEmail: string
  createPassword: string
  createRole: string
}

type EmailCtx = {
  notifyTo: string
  notifySubject: string
  notifyBody: string
  notifyUserId: string
  notifyCourseId: string
  notifyCertId: string
}

type FinancialCtx = {
  paymentId: string
  transactionId: string
  amount: string
  currency: string
  cancelReason: string
}

type EsbCtx = {
  studentId: string
  courseId: string
  enrollmentId: string
}

function FieldInput(props: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  const { label, value, onChange, type = 'text', placeholder } = props
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </label>
  )
}

function FieldSelect(props: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const { label, value, onChange, options } = props
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function buildEvaluationActions(ctx: EvalCtx): { title: string; action: Action }[] {
  const eid = ctx.evalId.trim()
  const sid = ctx.studentId.trim()
  const cc = ctx.courseCode.trim()
  const qs: string[] = []
  if (ctx.listStudent.trim()) qs.push(`studentId=${enc(ctx.listStudent.trim())}`)
  if (ctx.listStatus.trim()) qs.push(`status=${enc(ctx.listStatus.trim())}`)
  const listQuery = qs.length ? `?${qs.join('&')}` : ''

  const putBody: Record<string, unknown> = {}
  if (ctx.putStatus.trim()) putBody.status = ctx.putStatus.trim()
  const sc = Number.parseFloat(ctx.putScore)
  if (!Number.isNaN(sc)) putBody.score = sc

  return [
    { title: 'GET lista', action: { id: 'ev-g1', method: 'GET', path: `/api/proxy/evaluation/evaluations${listQuery}` } },
    { title: 'GET por id', action: { id: 'ev-g3', method: 'GET', path: `/api/proxy/evaluation/evaluations/${enc(eid)}` } },
    {
      title: 'POST crear',
      action: {
        id: 'ev-p1',
        method: 'POST',
        path: '/api/proxy/evaluation/evaluations',
        body: { studentId: sid || 'STU-1', courseCode: cc || 'CS101' },
      },
    },
    {
      title: 'PUT actualizar',
      action: {
        id: 'ev-u1',
        method: 'PUT',
        path: `/api/proxy/evaluation/evaluations/${enc(eid)}`,
        body: Object.keys(putBody).length ? putBody : { status: 'SUBMITTED' },
      },
    },
    { title: 'DELETE (204)', action: { id: 'ev-d1', method: 'DELETE', path: `/api/proxy/evaluation/evaluations/${enc(eid)}` } },
  ]
}

function buildAcademicActions(
  studentId: string,
  certType: string,
  deliveryEmail: string,
): { title: string; action: Action }[] {
  const s = studentId.trim() || 'STU-1'
  return [
    { title: 'GET historial', action: { id: 'ac-g1', method: 'GET', path: `/api/proxy/academic/students/${enc(s)}/academic-history` } },
    {
      title: 'POST certificado',
      action: {
        id: 'ac-p1',
        method: 'POST',
        path: `/api/proxy/academic/students/${enc(s)}/academic-history/certificates`,
        body: {
          certificateType: certType === 'PARTIAL' ? 'PARTIAL' : 'FULL',
          deliveryEmail: deliveryEmail.trim() || 'smoke@example.com',
        },
      },
    },
  ]
}

function userHeaders(wsKey: string): Record<string, string> {
  return wsKey.trim() ? { WSKey: wsKey.trim() } : {}
}

function buildUserActions(t: UserCtx): { title: string; action: Action }[] {
  const h = userHeaders(t.wsKey)
  const uid = enc(t.userId.trim() || 'user-demo-1')
  return [
    { title: 'GET lista usuarios', action: { id: 'mo-u1', method: 'GET', path: '/api/proxy/svc-user/api/v1/users', headers: h } },
    { title: 'GET usuario por id', action: { id: 'mo-u2', method: 'GET', path: `/api/proxy/svc-user/api/v1/users/${uid}`, headers: h } },
    {
      title: 'POST crear usuario',
      action: {
        id: 'mo-u3',
        method: 'POST',
        path: '/api/proxy/svc-user/api/v1/users',
        headers: h,
        body: {
          name: t.createName.trim() || 'Usuario panel',
          email: t.createEmail.trim() || `panel.${Date.now()}@ua.es`,
          password: t.createPassword.trim() || 'Test1234!',
          role: t.createRole.trim() || 'student',
        },
      },
    },
    {
      title: 'POST login',
      action: {
        id: 'mo-u4',
        method: 'POST',
        path: '/api/proxy/svc-user/api/v1/users/login',
        body: { email: t.loginEmail.trim() || 'student@ua.es', password: t.loginPassword.trim() || 'secret' },
      },
    },
  ]
}

function buildEmailActions(t: EmailCtx): { title: string; action: Action }[] {
  return [
    {
      title: 'POST email genérico',
      action: {
        id: 'mo-e1',
        method: 'POST',
        path: '/api/proxy/svc-email/api/v1/notifications/email',
        body: {
          to: t.notifyTo.trim() || 'smoke@example.com',
          subject: t.notifySubject.trim() || 'MTIS panel',
          body: t.notifyBody.trim() || 'Prueba EmailNotificationService',
        },
      },
    },
    {
      title: 'POST notif. matrícula',
      action: {
        id: 'mo-e2',
        method: 'POST',
        path: '/api/proxy/svc-email/api/v1/notifications/enrollment',
        body: {
          userId: t.notifyUserId.trim() || 'STU-1',
          courseId: t.notifyCourseId.trim() || 'COURSE-MTIS-2026',
          email: t.notifyTo.trim() || 'smoke@example.com',
        },
      },
    },
    {
      title: 'POST notif. certificado',
      action: {
        id: 'mo-e3',
        method: 'POST',
        path: '/api/proxy/svc-email/api/v1/notifications/certificate',
        body: {
          userId: t.notifyUserId.trim() || 'STU-1',
          certificateId: t.notifyCertId.trim() || 'CERT-DEMO-1',
          email: t.notifyTo.trim() || 'smoke@example.com',
        },
      },
    },
  ]
}

function buildCourseActions(courseId: string): { title: string; action: Action }[] {
  const cid = enc(courseId.trim() || 'COURSE-MTIS-2026')
  return [
    { title: 'GET listar cursos', action: { id: 'jo-c1', method: 'GET', path: '/api/proxy/svc-course/api/v1/courses' } },
    { title: 'GET curso por id', action: { id: 'jo-c2', method: 'GET', path: `/api/proxy/svc-course/api/v1/courses/${cid}` } },
  ]
}

function buildEnrollmentActions(
  userId: string,
  courseId: string,
  enrollmentId: string,
): { title: string; action: Action }[] {
  const eid = enc(enrollmentId.trim() || 'ENR-001')
  return [
    {
      title: 'POST matricular',
      action: {
        id: 'jo-en1',
        method: 'POST',
        path: '/api/proxy/svc-enrollment/api/v1/enrollments',
        body: { userId: userId.trim() || 'STU-1', courseId: courseId.trim() || 'COURSE-MTIS-2026' },
      },
    },
    { title: 'GET matrícula por id', action: { id: 'jo-en2', method: 'GET', path: `/api/proxy/svc-enrollment/api/v1/enrollments/${eid}` } },
    { title: 'DELETE cancelar', action: { id: 'jo-en3', method: 'DELETE', path: `/api/proxy/svc-enrollment/api/v1/enrollments/${eid}` } },
  ]
}

function buildFinancialActions(t: FinancialCtx): { title: string; action: Action }[] {
  const pid = t.paymentId.trim() || 'PAY-WEB-1'
  const txn = t.transactionId.trim() || 'TXN-WEB-1'
  const amount = Number.parseFloat(t.amount)
  const amt = Number.isNaN(amount) ? 49.99 : amount
  return [
    {
      title: 'POST process',
      action: {
        id: 'ta-f1',
        method: 'POST',
        path: '/api/proxy/svc-financial/api/payments/process',
        body: { orderId: pid, amount: amt, currency: t.currency.trim() || 'EUR' },
      },
    },
    {
      title: 'POST confirm',
      action: {
        id: 'ta-f2',
        method: 'POST',
        path: '/api/proxy/svc-financial/api/payments/confirm',
        body: { paymentId: pid, transactionId: txn },
      },
    },
    {
      title: 'POST cancel',
      action: {
        id: 'ta-f3',
        method: 'POST',
        path: '/api/proxy/svc-financial/api/payments/cancel',
        body: { paymentId: pid, reason: t.cancelReason.trim() || 'Panel prueba' },
      },
    },
  ]
}

function buildEsbActions(t: EsbCtx): { title: string; action: Action }[] {
  return [
    {
      title: 'POST emitir certificado (REST)',
      action: {
        id: 'er-esb1',
        method: 'POST',
        path: '/api/proxy/svc-esb-cert/esb/issue-certificate',
        body: {
          studentId: t.studentId.trim() || 'STU-1',
          courseId: t.courseId.trim() || 'COURSE-MTIS-2026',
          enrollmentId: t.enrollmentId.trim() || 'ENR-001',
        },
      },
    },
  ]
}

function buildSoapLinks(urls: {
  cert: string
  purchase: string
  legacy: string
  esbPurchase: string
}): { title: string; action: Action }[] {
  return [
    { title: 'CertificateService (SOAP) â†—', action: { id: 'soap-1', method: 'GET', path: '', externalUrl: urls.cert } },
    { title: 'CoursePurchaseProcess (SOAP) â†—', action: { id: 'soap-2', method: 'GET', path: '', externalUrl: urls.purchase } },
    { title: 'LegacyConnector (SOAP) â†—', action: { id: 'soap-3', method: 'GET', path: '', externalUrl: urls.legacy } },
    { title: 'ESB compra SOAP (:8091) â†—', action: { id: 'soap-4', method: 'GET', path: '', externalUrl: urls.esbPurchase } },
  ]
}

type Section = {
  id: string
  title: string
  owner: string
  sub: string
  actions: { title: string; action: Action }[]
}

export function App() {
  const [result, setResult] = useState<Result | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [batchLog, setBatchLog] = useState<string | null>(null)

  const [evalId, setEvalId] = useState('550e8400-e29b-41d4-a716-446655440000')
  const [studentId, setStudentId] = useState('STU-1')
  const [courseCode, setCourseCode] = useState('CS101')
  const [listStudent, setListStudent] = useState('')
  const [listStatus, setListStatus] = useState('')
  const [putStatus, setPutStatus] = useState('APPROVED')
  const [putScore, setPutScore] = useState('9')
  const [deliveryEmail, setDeliveryEmail] = useState('smoke@example.com')
  const [certType, setCertType] = useState<'FULL' | 'PARTIAL'>('FULL')

  const [wsKey, setWsKey] = useState('elearning-key-2025')
  const [userServiceId, setUserServiceId] = useState('user-demo-1')
  const [loginEmail, setLoginEmail] = useState('student@ua.es')
  const [loginPassword, setLoginPassword] = useState('secret')
  const [createName, setCreateName] = useState('Usuario panel')
  const [createEmail, setCreateEmail] = useState('nuevo@ua.es')
  const [createPassword, setCreatePassword] = useState('Test1234!')
  const [createRole, setCreateRole] = useState('student')

  const [notifyTo, setNotifyTo] = useState('smoke@example.com')
  const [notifySubject, setNotifySubject] = useState('MTIS panel')
  const [notifyBody, setNotifyBody] = useState('Prueba EmailNotificationService')
  const [notifyUserId, setNotifyUserId] = useState('STU-1')
  const [notifyCourseId, setNotifyCourseId] = useState('COURSE-MTIS-2026')
  const [notifyCertId, setNotifyCertId] = useState('CERT-DEMO-1')

  const [courseId, setCourseId] = useState('COURSE-MTIS-2026')
  const [enrollUserId, setEnrollUserId] = useState('STU-1')
  const [enrollCourseId, setEnrollCourseId] = useState('COURSE-MTIS-2026')
  const [enrollmentId, setEnrollmentId] = useState('ENR-001')

  const [paymentId, setPaymentId] = useState('PAY-WEB-1')
  const [transactionId, setTransactionId] = useState('TXN-WEB-1')
  const [payAmount, setPayAmount] = useState('49.99')
  const [payCurrency, setPayCurrency] = useState('EUR')
  const [cancelReason, setCancelReason] = useState('Panel prueba')

  const [esbStudentId, setEsbStudentId] = useState('STU-1')
  const [esbCourseId, setEsbCourseId] = useState('COURSE-MTIS-2026')
  const [esbEnrollmentId, setEsbEnrollmentId] = useState('ENR-001')

  const [soapCertUrl, setSoapCertUrl] = useState(SOAP_CERT)
  const [soapPurchaseUrl, setSoapPurchaseUrl] = useState(SOAP_PURCHASE)
  const [soapLegacyUrl, setSoapLegacyUrl] = useState(SOAP_LEGACY)
  const [soapEsbPurchaseUrl, setSoapEsbPurchaseUrl] = useState(
    'http://localhost:8091/esb/services/PurchaseOrchestration',
  )

  const evalCtx = useMemo(
    () => ({ evalId, studentId, courseCode, listStudent, listStatus, putStatus, putScore }),
    [evalId, studentId, courseCode, listStudent, listStatus, putStatus, putScore],
  )

  const userCtx = useMemo(
    () => ({
      wsKey,
      userId: userServiceId,
      loginEmail,
      loginPassword,
      createName,
      createEmail,
      createPassword,
      createRole,
    }),
    [wsKey, userServiceId, loginEmail, loginPassword, createName, createEmail, createPassword, createRole],
  )

  const emailCtx = useMemo(
    () => ({ notifyTo, notifySubject, notifyBody, notifyUserId, notifyCourseId, notifyCertId }),
    [notifyTo, notifySubject, notifyBody, notifyUserId, notifyCourseId, notifyCertId],
  )

  const financialCtx = useMemo(
    () => ({ paymentId, transactionId, amount: payAmount, currency: payCurrency, cancelReason }),
    [paymentId, transactionId, payAmount, payCurrency, cancelReason],
  )

  const esbCtx = useMemo(
    () => ({ studentId: esbStudentId, courseId: esbCourseId, enrollmentId: esbEnrollmentId }),
    [esbStudentId, esbCourseId, esbEnrollmentId],
  )

  const soapUrls = useMemo(
    () => ({
      cert: soapCertUrl.trim() || SOAP_CERT,
      purchase: soapPurchaseUrl.trim() || SOAP_PURCHASE,
      legacy: soapLegacyUrl.trim() || SOAP_LEGACY,
      esbPurchase: soapEsbPurchaseUrl.trim() || 'http://localhost:8091/esb/services/PurchaseOrchestration',
    }),
    [soapCertUrl, soapPurchaseUrl, soapLegacyUrl, soapEsbPurchaseUrl],
  )

  const sections: Section[] = useMemo(
    () => [
      {
        id: 'evaluation',
        title: 'EvaluationService',
        owner: 'Marcos',
        sub: ':8084 · CRUD /evaluations · BFF /api/proxy/evaluation',
        actions: buildEvaluationActions(evalCtx),
      },
      {
        id: 'academic',
        title: 'AcademicHistoryProcess',
        owner: 'Marcos',
        sub: ':8093 · historial y certificados · BFF /api/proxy/academic',
        actions: buildAcademicActions(studentId, certType, deliveryEmail),
      },
      {
        id: 'user',
        title: 'UserService',
        owner: 'Mo',
        sub: ':8081 · /api/v1/users · header WSKey en lista/CRUD (mock o real)',
        actions: buildUserActions(userCtx),
      },
      {
        id: 'email',
        title: 'EmailNotificationService',
        owner: 'Mo',
        sub: ':8085 · /api/v1/notifications/*',
        actions: buildEmailActions(emailCtx),
      },
      {
        id: 'course',
        title: 'CourseService',
        owner: 'Joaco',
        sub: ':8082 · /api/v1/courses (mock en dev-bundle)',
        actions: buildCourseActions(courseId),
      },
      {
        id: 'enrollment',
        title: 'EnrollmentService',
        owner: 'Joaco',
        sub: ':8083 · /api/v1/enrollments',
        actions: buildEnrollmentActions(enrollUserId, enrollCourseId, enrollmentId),
      },
      {
        id: 'financial',
        title: 'FinancialGatewayService',
        owner: 'Tano',
        sub: ':8086 · /api/payments/* (sin prefijo /api/v1)',
        actions: buildFinancialActions(financialCtx),
      },
      {
        id: 'esb',
        title: 'Orquestación certificado (ESB REST)',
        owner: 'Erardo',
        sub: ':8092 · POST /esb/issue-certificate · mezcla REST+SOAP interno',
        actions: buildEsbActions(esbCtx),
      },
      {
        id: 'soap',
        title: 'Servicios SOAP (WSDL / SoapUI)',
        owner: 'Erardo · Tano',
        sub: 'No pasan por BFF JSON; abren endpoint en nueva pestaña. Prueba con SoapUI o Postman SOAP.',
        actions: buildSoapLinks(soapUrls),
      },
    ],
    [evalCtx, studentId, certType, deliveryEmail, userCtx, emailCtx, courseId, enrollUserId, enrollCourseId, enrollmentId, financialCtx, esbCtx, soapUrls],
  )

  const run = useCallback(async (title: string, a: Action) => {
    if (a.externalUrl) {
      window.open(a.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setLoadingId(a.id)
    setBatchLog(null)
    try {
      const { status, text, ms } = await httpCall(a.method, a.path, a.body, a.headers)
      setResult({ title, method: a.method, path: a.path, status, ms, body: formatBody(text) })
    } catch (e) {
      setResult({ title, method: a.method, path: a.path, status: 0, ms: 0, body: String(e) })
    } finally {
      setLoadingId(null)
    }
  }, [])

  const renderSectionFields = (secId: string) => {
    switch (secId) {
      case 'evaluation':
        return (
          <div className="field-grid" aria-label="Parámetros Evaluation">
            <FieldInput label="evaluationId (GET/PUT/DELETE)" value={evalId} onChange={setEvalId} placeholder="UUID" />
            <FieldInput label="studentId (POST crear)" value={studentId} onChange={setStudentId} placeholder="STU-1" />
            <FieldInput label="courseCode (POST)" value={courseCode} onChange={setCourseCode} placeholder="CS101" />
            <FieldInput label="filtro lista · studentId" value={listStudent} onChange={setListStudent} placeholder="opcional" />
            <FieldInput label="filtro lista · status" value={listStatus} onChange={setListStatus} placeholder="APPROVED, DRAFT…" />
            <FieldInput label="PUT · status" value={putStatus} onChange={setPutStatus} />
            <FieldInput label="PUT · score" value={putScore} onChange={setPutScore} placeholder="número" />
          </div>
        )
      case 'academic':
        return (
          <div className="field-grid" aria-label="Parámetros Academic">
            <FieldInput label="studentId (ruta)" value={studentId} onChange={setStudentId} placeholder="STU-1" />
            <FieldSelect
              label="certificateType (POST)"
              value={certType}
              onChange={(v) => setCertType(v as 'FULL' | 'PARTIAL')}
              options={[
                { value: 'FULL', label: 'FULL' },
                { value: 'PARTIAL', label: 'PARTIAL' },
              ]}
            />
            <FieldInput label="deliveryEmail (POST)" value={deliveryEmail} onChange={setDeliveryEmail} type="email" />
          </div>
        )
      case 'user':
        return (
          <div className="field-grid" aria-label="Parámetros User">
            <FieldInput label="WSKey (GET/POST con seguridad)" value={wsKey} onChange={setWsKey} placeholder="elearning-key-2025" />
            <FieldInput label="userId (GET por id)" value={userServiceId} onChange={setUserServiceId} />
            <FieldInput label="login · email" value={loginEmail} onChange={setLoginEmail} type="email" />
            <FieldInput label="login · password" value={loginPassword} onChange={setLoginPassword} type="password" />
            <FieldInput label="crear · name" value={createName} onChange={setCreateName} />
            <FieldInput label="crear · email" value={createEmail} onChange={setCreateEmail} type="email" />
            <FieldInput label="crear · password" value={createPassword} onChange={setCreatePassword} type="password" />
            <FieldSelect
              label="crear · role"
              value={createRole}
              onChange={setCreateRole}
              options={[
                { value: 'student', label: 'student' },
                { value: 'instructor', label: 'instructor' },
                { value: 'admin', label: 'admin' },
              ]}
            />
          </div>
        )
      case 'email':
        return (
          <div className="field-grid" aria-label="Parámetros Email">
            <FieldInput label="to / email destino" value={notifyTo} onChange={setNotifyTo} type="email" />
            <FieldInput label="subject (email genérico)" value={notifySubject} onChange={setNotifySubject} />
            <FieldInput label="body (email genérico)" value={notifyBody} onChange={setNotifyBody} />
            <FieldInput label="userId (notif. matrícula/cert.)" value={notifyUserId} onChange={setNotifyUserId} />
            <FieldInput label="courseId (notif. matrícula)" value={notifyCourseId} onChange={setNotifyCourseId} />
            <FieldInput label="certificateId (notif. cert.)" value={notifyCertId} onChange={setNotifyCertId} />
          </div>
        )
      case 'course':
        return (
          <div className="field-grid" aria-label="Parámetros Course">
            <FieldInput label="courseId (GET por id)" value={courseId} onChange={setCourseId} placeholder="COURSE-MTIS-2026" />
          </div>
        )
      case 'enrollment':
        return (
          <div className="field-grid" aria-label="Parámetros Enrollment">
            <FieldInput label="userId (POST matricular)" value={enrollUserId} onChange={setEnrollUserId} />
            <FieldInput label="courseId (POST matricular)" value={enrollCourseId} onChange={setEnrollCourseId} />
            <FieldInput label="enrollmentId (GET/DELETE)" value={enrollmentId} onChange={setEnrollmentId} placeholder="ENR-001" />
          </div>
        )
      case 'financial':
        return (
          <div className="field-grid" aria-label="Parámetros Financial">
            <FieldInput label="orderId / paymentId" value={paymentId} onChange={setPaymentId} />
            <FieldInput label="transactionId (confirm)" value={transactionId} onChange={setTransactionId} />
            <FieldInput label="amount (process)" value={payAmount} onChange={setPayAmount} placeholder="49.99" />
            <FieldInput label="currency" value={payCurrency} onChange={setPayCurrency} placeholder="EUR" />
            <FieldInput label="reason (cancel)" value={cancelReason} onChange={setCancelReason} />
          </div>
        )
      case 'esb':
        return (
          <div className="field-grid" aria-label="Parámetros ESB certificado">
            <FieldInput label="studentId" value={esbStudentId} onChange={setEsbStudentId} />
            <FieldInput label="courseId" value={esbCourseId} onChange={setEsbCourseId} />
            <FieldInput label="enrollmentId" value={esbEnrollmentId} onChange={setEsbEnrollmentId} />
          </div>
        )
      case 'soap':
        return (
          <div className="field-grid" aria-label="URLs SOAP">
            <FieldInput label="CertificateService URL" value={soapCertUrl} onChange={setSoapCertUrl} />
            <FieldInput label="CoursePurchaseProcess URL" value={soapPurchaseUrl} onChange={setSoapPurchaseUrl} />
            <FieldInput label="LegacyConnector URL" value={soapLegacyUrl} onChange={setSoapLegacyUrl} />
            <FieldInput label="ESB compra SOAP URL" value={soapEsbPurchaseUrl} onChange={setSoapEsbPurchaseUrl} />
          </div>
        )
      default:
        return null
    }
  }

  const runAllBff = useCallback(async () => {
    setBatchLog(null)
    setLoadingId('__batch__')
    const lines: string[] = []
    const flat: { title: string; a: Action }[] = []
    for (const sec of sections) {
      if (sec.id === 'soap') continue
      for (const { title, action } of sec.actions) {
        flat.push({ title: `${sec.owner} · ${sec.title} · ${title}`, a: action })
      }
    }
    for (const { title, a } of flat) {
      if (a.externalUrl) continue
      try {
        const { status, text, ms } = await httpCall(a.method, a.path, a.body, a.headers)
        const ok = status >= 200 && status < 300 ? 'âœ“' : 'âœ—'
        lines.push(`${ok} ${title}  HTTP ${status}  ${ms}ms`)
        lines.push(formatBody(text).split('\n').slice(0, 6).join('\n'))
        lines.push('—')
      } catch (e) {
        lines.push(`âœ— ${title}  ${String(e)}`)
        lines.push('—')
      }
      await new Promise((r) => setTimeout(r, 100))
    }
    setBatchLog(lines.join('\n'))
    setResult(null)
    setLoadingId(null)
  }, [sections])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Panel de pruebas MTIS — Grupo 20</h1>
        <p>
          Todas las llamadas REST van al BFF (<strong>/api/proxy/…</strong>) en <strong>:8094</strong> (dev-bundle o
          web-bff). Levanta <code>gr20-dev-bundle</code> con MySQL y ejecuta <code>npm run build:bundle</code> en{' '}
          <code>frontend/</code>.
        </p>
        <div className="pill-row">
          <span className="pill">
            <strong>BFF</strong> {apiBase || '(mismo origen)'}
          </span>
        </div>
      </header>

      <div className="toolbar">
        <button type="button" className="btn btn-primary" disabled={loadingId !== null} onClick={() => void runAllBff()}>
          Probar todos los REST (sin SOAP â†—)
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={loadingId !== null}
          onClick={() => {
            setResult(null)
            setBatchLog(null)
          }}
        >
          Limpiar panel
        </button>
      </div>

      <div className="sections">
        {sections.map((sec) => (
          <section key={sec.id} className="card">
            <div className="card-head">
              <h2>
                {sec.title} <span className="owner-tag">{sec.owner}</span>
              </h2>
              <p className="sub">{sec.sub}</p>
            </div>
            <div className="card-body card-body-stack">
              {renderSectionFields(sec.id)}
              <div className="action-row">
                {sec.actions.map(({ title, action }, idx) => {
                  const key = `${sec.id}-${idx}`
                  const needsEvalId = sec.id === 'evaluation' && ['ev-g3', 'ev-u1', 'ev-d1'].includes(action.id)
                  const isExternal = Boolean(action.externalUrl)
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`btn${isExternal ? ' btn-external' : ''}`}
                      disabled={loadingId !== null || (needsEvalId && !evalId.trim())}
                      onClick={() => void run(`${sec.title} · ${title}`, action)}
                    >
                      {loadingId === action.id ? '…' : null}
                      {title}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="result-panel">
        {batchLog !== null ? (
          <>
            <div className="result-head">
              <span className="badge badge-ok">Resumen lote</span>
              <span className="result-meta mono">Todos los REST vía BFF (sin enlaces SOAP)</span>
            </div>
            <pre className="pre-out">{batchLog}</pre>
          </>
        ) : result ? (
          <>
            <div className="result-head">
              <span className={badgeClass(result.status)}>HTTP {result.status || 'ERR'}</span>
              <span className="result-meta">
                <span className="mono">{result.method}</span> · {result.ms} ms · {result.title}
              </span>
            </div>
            <div className="result-meta mono" style={{ marginBottom: '0.5rem' }}>
              {apiBase}
              {result.path}
            </div>
            <pre className="pre-out">{result.body}</pre>
          </>
        ) : (
          <p className="result-meta" style={{ margin: 0 }}>
            Elige un servicio del equipo. SOAP se abre en otra pestaña; el resto usa el BFF en el mismo origen.
          </p>
        )}
      </div>
    </div>
  )
}
