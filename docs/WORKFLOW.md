# Development Workflow — FanConnect 2030

## Phase 1: Project Initialization

1. Install prerequisites (Java 21, Maven, Node 20, Docker)
2. Open `FanConnect-2030.code-workspace` in VS Code
3. Install recommended extensions
4. Run `.\scripts\setup.ps1`
5. Initialize Git: `git init && git add . && git commit -m "Initial scaffold"`

## Phase 2: Local Development

### Daily Workflow

```
Terminal 1: docker compose up postgres -d
Terminal 2: cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
Terminal 3: cd frontend && npm run dev
```

### VS Code Tasks (Ctrl+Shift+P → "Tasks: Run Task")

| Task                        | Description              |
|-----------------------------|--------------------------|
| Docker: Start Database Only | PostgreSQL container     |
| Backend: Run Spring Boot    | API on port 8080         |
| Frontend: Dev Server        | SPA on port 5173         |
| Backend: Maven Build        | Compile & package JAR    |

### VS Code Debug (F5)

- **Spring Boot - FanConnect (dev)**: Debug backend with breakpoints
- **Full Stack Dev**: Starts DB + backend + opens Chrome

## Phase 3: Feature Development

### Backend Feature Checklist

1. Create/update Entity in `model/entity/`
2. Add Repository interface in `repository/`
3. Create DTOs in `dto/request/` and `dto/response/`
4. Implement Service in `service/`
5. Add Controller endpoint in `controller/`
6. Update `SecurityConfig` if new public routes needed
7. Test via Swagger UI or REST Client

### Frontend Feature Checklist

1. Add API module in `src/api/`
2. Create/update page in `src/pages/`
3. Add reusable components in `src/components/`
4. Register route in `App.jsx`
5. Wire auth via `useAuth()` hook

## Phase 4: Testing

```powershell
# Backend unit tests
cd backend
mvn test

# Frontend lint
cd frontend
npm run lint
```

## Phase 5: API Documentation

Swagger UI auto-generates from controller annotations:

- URL: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/v3/api-docs

## Phase 6: Docker Build & Deploy

```powershell
# Build all images
docker compose build

# Start full stack
docker compose up -d

# View logs
docker compose logs -f backend

# Stop
docker compose down
```

## Phase 7: Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (reverse proxy / load balancer)
- [ ] Configure database backups
- [ ] Set up CI/CD pipeline (GitHub Actions recommended)

## Git Branching Strategy

```
main          → production-ready releases
develop       → integration branch
feature/*     → new features (feature/cafe-search)
fix/*         → bug fixes
```