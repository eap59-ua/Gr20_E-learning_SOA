# LegacyConnectorService (SOAP)

> **A asignar** — este servicio SOAP queda pendiente en la planificación SOA del grupo.

## Operaciones (sección 5.2 de la memoria fase 1)
- `obtenerContenidosExternos`
- `sincronizarDatosRepositorio`
- `consultarMetadatosContenido`

## Cómo colocar tu trabajo aquí

Pega tu proyecto Mule completo dentro de esta carpeta:
```
legacy-connector-service/
├── src/
│   ├── main/
│   │   ├── mule/legacy-connector-service.xml
│   │   └── resources/
│   │       ├── api/LegacyConnectorService.wsdl
│   │       ├── config/application.properties
│   │       ├── database/schema.sql
│   │       └── log4j2.xml
├── pom.xml
└── mule-artifact.json
```

Puerto asignado: **8083**.
Base de datos: `elearning_legacy_contents`.
