## 📐 Діаграми архітектури

### Діаграма загальної архітектури системи

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend]
    end

    subgraph "API Gateway"
        API[NestJS Application]
    end

    subgraph "Authentication Layer"
        AUTH[Auth Module]
        USERS[Users Module]
        AUTH --> USERS
    end

    subgraph "Business Logic Layer"
        APPS[Apps Module<br/>Central Module]
        TEMPLATES[Templates Module]
        LANDINGS[Landings Module]
        LOGGING[Logging Module]
    end

    subgraph "Integration Layer"
        CF[Cloudflare Module]
        DOMAINS[Domains Module]
        WG[Worker Generator<br/>Module]
        CF --> DOMAINS
    end

    subgraph "Storage Layer"
        DB[(PostgreSQL<br/>via Prisma)]
        R2[(Cloudflare R2<br/>Storage)]
    end

    subgraph "External Services"
        KC[Keycloak<br/>Identity Provider]
        CF_API[Cloudflare API<br/>Workers, DNS, Routes]
        CF_R2[Cloudflare R2<br/>Storage API]
    end

    subgraph "Deployed Infrastructure"
        WORKERS[Cloudflare Workers<br/>Generated Apps]
    end

    FE -->|HTTP + JWT| API
    API --> AUTH
    API --> APPS

    APPS --> TEMPLATES
    APPS --> LANDINGS
    APPS --> LOGGING
    APPS --> CF
    APPS --> WG
    APPS --> USERS

    LANDINGS --> R2
    APPS --> R2

    TEMPLATES --> DB
    APPS --> DB
    LANDINGS --> DB
    LOGGING --> DB
    USERS --> DB
    DOMAINS --> DB

    AUTH -->|JWT Validation| KC
    CF -->|Deploy Workers| CF_API
    R2 -->|Store/Retrieve| CF_R2

    CF_API -->|Deploy| WORKERS
    WORKERS -->|Logs| APPS

    style APPS fill:#4CAF50,stroke:#2E7D32,stroke-width:3px
    style WG fill:#2196F3,stroke:#1565C0,stroke-width:2px
    style DB fill:#FF9800,stroke:#E65100,stroke-width:2px
    style R2 fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px
```

### Діаграма залежностей модулів

```mermaid
graph TD
    AUTH[AuthModule]
    USERS[UsersModule]
    APPS[AppsModule]
    TEMPLATES[TemplatesModule]
    LANDINGS[LandingsModule]
    CF[CloudflareModule]
    DOMAINS[DomainModule]
    LOGGING[LoggingModule]
    WG[WorkerGeneratorModule]
    R2[R2Module]
    DB[DatabaseModule]
    CONFIG[ConfigModule]

    AUTH --> USERS
    AUTH --> CONFIG

    APPS --> CF
    APPS --> WG
    APPS --> TEMPLATES
    APPS --> LANDINGS
    APPS --> LOGGING
    APPS --> USERS
    APPS --> DB

    CF --> DOMAINS

    DOMAINS --> DB

    TEMPLATES --> DB

    LANDINGS --> DB
    LANDINGS --> R2

    LOGGING --> DB

    USERS --> DB

    R2 --> CONFIG

    style APPS fill:#4CAF50,stroke:#2E7D32,stroke-width:3px
    style WG fill:#2196F3,stroke:#1565C0,stroke-width:2px,stroke-dasharray: 5 5
    style DB fill:#FF9800,stroke:#E65100,stroke-width:2px
```

### Діаграма послідовності: Деплой застосунку

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AppsController
    participant AppsService
    participant TemplatesService
    participant LandingsService
    participant WorkerGenerator
    participant CloudflareService
    participant LogService
    participant R2Service
    participant DB[(PostgreSQL)]
    participant CF_API[Cloudflare API]
    participant R2_STORAGE[Cloudflare R2]

    User->>Frontend: Deploy App
    Frontend->>AppsController: POST /apps/:id/deploy
    AppsController->>AppsService: deployApp()

    AppsService->>TemplatesService: getTemplate()
    TemplatesService->>DB: Get template data
    DB-->>TemplatesService: Template data
    TemplatesService-->>AppsService: Template

    AppsService->>LandingsService: publishManifest()
    LandingsService->>R2Service: uploadFile()
    R2Service->>R2_STORAGE: Upload manifest
    R2_STORAGE-->>R2Service: Success
    R2Service-->>LandingsService: Manifest key
    LandingsService-->>AppsService: Manifest info

    AppsService->>WorkerGenerator: generateWorkerCode()
    WorkerGenerator-->>AppsService: Generated code

    AppsService->>CloudflareService: deployWorker()
    CloudflareService->>CF_API: Deploy worker
    CF_API-->>CloudflareService: Deployment result
    CloudflareService-->>AppsService: Worker ID

    AppsService->>LogService: createLog()
    LogService->>DB: Store log
    DB-->>LogService: Success
    LogService-->>AppsService: Log created

    AppsService->>DB: Update app status
    DB-->>AppsService: Success

    AppsService-->>AppsController: Deploy result
    AppsController-->>Frontend: Response
    Frontend-->>User: Deployment complete
```

### Діаграма послідовності: Збір логів від воркера

```mermaid
sequenceDiagram
    participant Worker[Cloudflare Worker]
    participant PublicAPI[PublicAppsController]
    participant AppsService
    participant LogService
    participant DB[(PostgreSQL)]

    Worker->>PublicAPI: POST /public/apps/worker-log<br/>(No Auth Required)
    PublicAPI->>AppsService: findAppByWorkerName()
    AppsService->>DB: Query app by worker name
    DB-->>AppsService: App data
    AppsService-->>PublicAPI: App ID

    PublicAPI->>LogService: createWorkerLog()
    LogService->>DB: Insert worker log
    DB-->>LogService: Success
    LogService-->>PublicAPI: Log created

    PublicAPI-->>Worker: 200 OK
```

### Діаграма компонентів: Архітектура деплою

```mermaid
graph LR
    subgraph "Template Storage"
        T_DB[(Template<br/>Database)]
        T_CODE[Template Code]
    end

    subgraph "App Configuration"
        APP_CONFIG[App Config<br/>Dynamic Fields<br/>Endpoint Mappings]
        APP_DB[(App<br/>Database)]
    end

    subgraph "Worker Generator"
        WG[WorkerGeneratorService]
        ROUTER[Router Generator]
        ENV[ENV Variables<br/>Generator]
        TEMPLATE_PROC[Template<br/>Processor]
    end

    subgraph "Deployment"
        CF_API[Cloudflare API]
        DEPLOYED[Deployed Worker]
    end

    subgraph "Landings"
        L_DB[(Landing<br/>Database)]
        MANIFEST[Manifest<br/>Generation]
        L_R2[(Landing Files<br/>R2 Storage)]
    end

    T_DB --> WG
    T_CODE --> TEMPLATE_PROC
    APP_DB --> WG
    APP_CONFIG --> WG

    TEMPLATE_PROC --> ROUTER
    ENV --> ROUTER
    ROUTER --> WG

    WG --> CF_API
    CF_API --> DEPLOYED

    L_DB --> MANIFEST
    L_R2 --> MANIFEST
    MANIFEST --> ENV

    style WG fill:#4CAF50,stroke:#2E7D32,stroke-width:3px
    style DEPLOYED fill:#2196F3,stroke:#1565C0,stroke-width:2px
```

---
