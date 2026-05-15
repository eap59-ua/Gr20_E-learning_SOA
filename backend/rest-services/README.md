# Servicios REST

Cada subcarpeta contiene un servicio REST independiente del equipo.

| Servicio | Responsable | Puerto |
|---|---|---|
| `user-service/` | Mo | 3004 |
| `course-service/` | Joaco | 3002 |
| `enrollment-service/` | Joaco | 3003 |
| `evaluation-service/` | Marcos | 3006 |
| `email-notification-service/` | Mo | 3005 |
| `financial-gateway-service/` | Tano | 3001 |
| `academic-history-process/` | Marcos | 3007 |

## Cómo colocar tu trabajo

Pega tu proyecto (Mule 4, Spring Boot, Node Express, Laravel… lo que hayas usado) dentro de la carpeta que te toca.

Si has implementado en **Mule 4** (recomendado por coherencia), estructura idéntica a la de los servicios SOAP de Erardo:
```
<tu-servicio>/
├── src/
│   ├── main/
│   │   ├── mule/<servicio>.xml
│   │   └── resources/
│   │       ├── api/<Servicio>_openapi.yaml
│   │       ├── config/application.properties
│   │       ├── database/schema.sql
│   │       └── log4j2.xml
├── pom.xml
└── mule-artifact.json
```

Si lo has hecho en otra tecnología (Node, Spring, Laravel) añade un `README.md` propio explicando cómo arrancarlo.
