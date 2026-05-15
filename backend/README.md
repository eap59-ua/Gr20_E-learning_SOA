# Backend del proyecto

Carpeta que agrupa **todo el código backend** del Grupo 20: servicios SOAP, servicios REST y orquestaciones ESB.

## Estructura

```
backend/
├── soap-services/             ← Servicios web SOAP (1 carpeta por servicio)
├── rest-services/             ← Servicios web REST (1 carpeta por servicio)
└── esb-orchestrations/        ← Flujos orquestados por ESB (mín. 1 SOAP + 1 REST)
```

## Convenciones

- Cada servicio es un **proyecto Mule 4 independiente** (su propio `pom.xml`, `mule-artifact.json`, `src/`).
- Las credenciales de MySQL están unificadas: `mule / mule123` (ver `CONTRIBUTING.md` raíz).
- Cada servicio expone su API en un puerto distinto (ver tabla de puertos en `CONTRIBUTING.md`).

## Mapeo enunciado ↔ código

Apartado 4 del enunciado oficial:

| Punto enunciado | Carpeta |
|---|---|
| 4.a.i — *Generación de servicios web SOAP* | `soap-services/` |
| 4.a.ii — *Generación de servicios web Restful* | `rest-services/` |
| 4.b — *Creación de la orquestación de los servicios web, mediante un ESB* | `esb-orchestrations/` |
