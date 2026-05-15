# Memoria — Segunda Entrega (Plantilla)

> Guion sugerido para la memoria final. Sigue el orden del apartado "Entrega" del enunciado oficial. Cada miembro rellena lo que sabe; al final se fusiona en el Google Docs / PDF.

---

## 1. Escenario de Integración

*Resumen breve del Escenario 20 (Plataforma E-Learning), apoyándose en la memoria de la Fase 1. No repetir todo, solo lo necesario para contextualizar.*

## 2. Arquitectura del Sistema

### 2.1. Back End

**Tecnologías empleadas**:
- Servicios SOAP: Mule 4 (Anypoint Studio)
- Servicios REST: Mule 4 (Anypoint Studio)  [o el stack que use cada uno]
- ESB para orquestación: Mule 4
- Base de datos: MySQL 8.0

**Listado de servicios desplegados**: tabla con servicio, tipo (SOAP/REST), puerto, responsable.

**Listado de flujos orquestados**: nombre, tipo (SOAP/REST), descripción.

### 2.2. Front End

**Tecnología empleada**: *(a rellenar cuando se decida)*
**Vistas implementadas**: *(lista de pantallas)*
**Conexión con el back end**: cómo el cliente consume los servicios (directamente vs a través del ESB).

### 2.3. Base de datos

Diagrama relacional, tablas por servicio, justificación de "una BBDD por servicio" (principio SOA de autonomía).

## 3. Puesta en Marcha e Instalación

Paso a paso para que el profesor pueda arrancar todo:

1. Pre-requisitos (Java, Mule Runtime, MySQL, Node, etc.)
2. Cargar las BBDD: `mysql -u root -p < database/schema-completo.sql`
3. Arrancar los servicios en orden (con tabla de servicio → puerto)
4. Arrancar las orquestaciones ESB
5. Arrancar el frontend

## 4. Problemas Planteados y Soluciones

| Problema | Causa | Solución |
|---|---|---|
| *(ejemplo)* Servicios SOAP necesitaban autenticación y CORS con frontend | WS-Security pendiente | Mock JWT en cabeceras durante la demo |
| ... | ... | ... |

> Esto es donde se nota qué grupos han trabajado de verdad. Documentad **todos** los problemas reales que os habéis encontrado (no inventar).

## 5. Conclusiones

- Aprendizajes técnicos (qué aporta SOA frente a monolito)
- Aprendizajes de coordinación (trabajar a partir de contratos)
- Limitaciones de la solución actual
- Posibles mejoras para producción (WS-Security real, contenedores, monitorización)

## 6. Anexos

- Inventario de servicios
- Capturas de la demo
- Diagramas de secuencia de los 2 flujos orquestados
