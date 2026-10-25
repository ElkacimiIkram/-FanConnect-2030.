# FanConnect 2030 — Smart Café Reservation Platform

Enterprise-grade graduation project workspace for a full-stack café reservation system.

## Quick Start

```powershell
# 1. Open workspace in VS Code
code FanConnect-2030.code-workspace

# 2. Run setup (installs deps, builds backend, starts DB)
.\scripts\setup.ps1

# 3. Start backend (Terminal 1)
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev
```

| Service   | URL                                      |
|-----------|------------------------------------------|
| Frontend  | http://localhost:5173                    |
| Backend   | http://localhost:8080/api                |
| Swagger   | http://localhost:8080/api/swagger-ui.html |
| PostgreSQL| localhost:5432                           |

## Project Structure

```
FanConnect-2030/
├── backend/                 # Spring Boot 3 API (Java 21, Maven)
├── frontend/                # React + Vite + Tailwind CSS SPA
├── database/                # SQL schema, seeds, migrations
│   ├── init/                # Auto-run on Docker PostgreSQL startup
│   └── migrations/          # Versioned migration scripts
├── docker/                  # Dockerfiles (backend, frontend/nginx)
├── docs/                    # Architecture, API, workflow documentation
├── scripts/                 # Setup and utility scripts
├── .vscode/                 # VS Code tasks, launch, extensions
├── docker-compose.yml       # Full stack orchestration
├── docker-compose.dev.yml   # Dev override (DB only)
├── .env.example             # Environment variable template
└── FanConnect-2030.code-workspace
```

## Tech Stack

| Layer      | Technology                          | Version   |
|------------|-------------------------------------|-----------|
| Backend    | Java                                | 21 LTS    |
| Backend    | Spring Boot                         | 3.3.5     |
| Backend    | Spring Security + JWT               | —         |
| Backend    | Spring Data JPA                     | —         |
| Backend    | PostgreSQL Driver                   | —         |
| Backend    | SpringDoc OpenAPI (Swagger)         | 2.6.0     |
| Backend    | Maven                               | 3.9+      |
| Frontend   | React                               | 18.3      |
| Frontend   | Vite                                | 5.4       |
| Frontend   | Tailwind CSS                        | 3.4       |
| Frontend   | Axios                               | 1.7       |
| Frontend   | React Router                        | 6.28      |
| Frontend   | Node.js                             | 20 LTS    |
| Database   | PostgreSQL                          | 16        |
| DevOps     | Docker                              | 24+       |
| DevOps     | Docker Compose                      | 2.20+     |

## Documentation

- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Development Workflow](docs/WORKFLOW.md)

## License

MIT — Graduation Project 2026