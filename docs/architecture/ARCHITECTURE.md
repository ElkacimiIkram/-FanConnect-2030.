# FanConnect 2030 — Application Architecture

## System Overview

FanConnect 2030 is a **3-tier monorepo** application:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  React SPA (Vite) — Browser / Mobile Web                        │
│  Tailwind CSS · Axios · React Router · JWT in localStorage      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                            │
│  Spring Boot 3 API — Port 8080 (/api)                           │
│  Controllers → Services → Repositories → JPA Entities           │
│  Spring Security + JWT Filter · Global Exception Handler        │
│  Swagger OpenAPI at /api/swagger-ui.html                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ JDBC
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA TIER                                │
│  PostgreSQL 16 — users, cafes, reservations                     │
│  Init scripts in database/init/ · Migrations in database/migrations/ │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Layered Architecture

```
com.fanconnect
├── config/          # Security, CORS, OpenAPI configuration
├── controller/      # REST endpoints (thin layer)
├── service/         # Business logic & transactions
├── repository/      # Spring Data JPA interfaces
├── model/
│   ├── entity/      # JPA entities (User, Cafe, Reservation)
│   └── enums/       # Role, ReservationStatus
├── dto/
│   ├── request/     # Incoming API payloads
│   └── response/    # Outgoing API payloads
├── security/        # JWT service, filter, UserDetailsService
├── exception/       # Custom exceptions + @RestControllerAdvice
├── mapper/          # Entity ↔ DTO conversion
└── util/            # Shared utilities
```

### Request Flow

1. Client sends HTTP request with optional `Authorization: Bearer <token>`
2. `JwtAuthenticationFilter` validates token and sets SecurityContext
3. `SecurityConfig` enforces route-level authorization
4. Controller validates input (`@Valid`), delegates to Service
5. Service executes business rules, calls Repository
6. Repository persists/retrieves via JPA/Hibernate
7. Response wrapped in `ApiResponse<T>` JSON envelope

## Frontend Architecture

```
frontend/src/
├── api/             # Axios instance + API modules (authApi, cafeApi...)
├── components/
│   ├── layout/      # Navbar, Footer, Layout shell
│   ├── auth/        # ProtectedRoute, auth forms
│   └── ui/          # Reusable UI primitives (buttons, cards...)
├── context/         # React Context (AuthContext)
├── hooks/           # Custom hooks (useCafes, useReservations...)
├── pages/           # Route-level page components
├── utils/           # Helpers, formatters, constants
├── App.jsx          # Route definitions
└── main.jsx         # Entry point
```

### State Management

- **Auth state**: React Context + localStorage (token, user)
- **Server state**: Axios API calls per page/component
- **Routing**: React Router v6 with protected routes

## Security Model

| Role        | Permissions                              |
|-------------|------------------------------------------|
| CUSTOMER    | Register, login, browse cafés, book      |
| CAFE_OWNER  | Manage own café, view reservations       |
| ADMIN       | Full system administration               |

JWT tokens are stateless; expiration configured via `app.jwt.expiration-ms`.

## API Design

- Base path: `/api`
- Auth: `/api/auth/register`, `/api/auth/login`
- Cafés: `/api/cafes` (GET public, POST/PUT/DELETE authenticated)
- Reservations: `/api/reservations` (authenticated)
- Health: `/api/actuator/health`
- Docs: `/api/swagger-ui.html`

## Docker Deployment Topology

```
docker-compose.yml
├── postgres:5432     → database/init/*.sql on first boot
├── backend:8080      → Spring Boot (profile: docker)
└── frontend:80       → Nginx serves React build, proxies /api → backend
```