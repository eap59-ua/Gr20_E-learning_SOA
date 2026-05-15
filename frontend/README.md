# Frontend de la plataforma E-Learning

> 🔴 **Obligatorio según el enunciado oficial**, apartado "Enunciado":
> *"Para el Front End: Aplicación web o de escritorio realizada por los alumnos en un lenguaje de programación (c#, javascript, php, java, etc.)"*
>
> Y apartado 5 del trabajo mínimo: *"Implementación de un Front End"*

## Estado

🔴 **Pendiente** — sin asignar.

## Opciones recomendadas (rápido, demo-friendly)

| Stack | Curva | Tiempo estimado | Comentario |
|---|---|---|---|
| **Vanilla JS + HTML + Tailwind** | 🟢 baja | 1 día | Mínimo viable, súper rápido. Recomendado si no hay tiempo |
| **React + Vite** | 🟡 media | 1-2 días | Profesional, queda muy bien en demo |
| **Vue 3 + Vite** | 🟡 media | 1-2 días | Similar a React, sintaxis más amigable |
| **Laravel + Blade** | 🟡 media | 1-2 días | Si Erardo lo coge: tiene experiencia |
| **Flutter Web** | 🟠 alta | 2-3 días | Erardo lo conoce pero más overkill |

## Vistas mínimas que debería tener

Para una demo decente que justifique el "Front End" del enunciado:

1. **Login** (consume `UserService.login`)
2. **Listado de cursos** (consume `CourseService.listCourses`)
3. **Detalle + Compra de curso** → dispara el flujo SOAP orquestado por ESB
4. **Mis cursos / matrículas** (consume `EnrollmentService`)
5. **Realizar evaluación** (consume `EvaluationService`)
6. **Mi historial académico** (consume `AcademicHistoryProcess`)
7. **Ver certificados** (consume `CertificateService.getCertificate`)

> Con 3-4 vistas funcionando ya hay demo presentable. El profesor valora más que **se demuestre el flujo end-to-end** que la belleza visual.

## Cómo arrancarlo

(A definir cuando esté implementado.)

Puerto sugerido para dev server: **5173** (Vite por defecto).
