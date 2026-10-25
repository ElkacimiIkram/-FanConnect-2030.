# Installation Guide — FanConnect 2030

## Required Software & Versions

| Tool            | Minimum Version | Download                                      |
|-----------------|-----------------|-----------------------------------------------|
| Java JDK        | 21 LTS          | https://adoptium.net/                         |
| Maven           | 3.9.6+          | https://maven.apache.org/download.cgi         |
| Node.js         | 20 LTS          | https://nodejs.org/                           |
| npm             | 10+             | Bundled with Node.js                          |
| PostgreSQL      | 16              | https://www.postgresql.org/download/          |
| Docker Desktop  | 4.30+           | https://www.docker.com/products/docker-desktop|
| Docker Compose  | 2.20+           | Bundled with Docker Desktop                   |
| Git             | 2.40+           | https://git-scm.com/downloads                 |
| VS Code         | 1.90+           | https://code.visualstudio.com/                |

### Verify Installations

```powershell
java -version      # openjdk 21.x
mvn -version       # Apache Maven 3.9.x
node -v            # v20.x
npm -v             # 10.x
docker --version   # Docker 24+
docker compose version
```

## VS Code Extensions

Open the workspace and install all recommended extensions when prompted, or run:

**View → Extensions → Filter: @recommended → Install All**

| Extension ID                         | Purpose                    |
|--------------------------------------|----------------------------|
| `vscjava.vscode-java-pack`           | Java language support      |
| `vmware.vscode-spring-boot`          | Spring Boot tooling        |
| `vscjava.vscode-spring-boot-dashboard` | Run/debug Spring apps    |
| `dbaeumer.vscode-eslint`             | JavaScript linting         |
| `bradlc.vscode-tailwindcss`          | Tailwind IntelliSense      |
| `esbenp.prettier-vscode`             | Code formatting            |
| `ms-azuretools.vscode-docker`        | Docker integration         |
| `humao.rest-client`                  | API testing                |
| `eamodio.gitlens`                    | Git history                |
| `PKief.material-icon-theme`          | File icons                 |

## Environment Setup

```powershell
# Clone or navigate to project
cd C:\Users\kassimi\FanConnect-2030

# Copy environment files
copy .env.example .env
copy frontend\.env.example frontend\.env

# Generate a secure JWT secret (Base64, min 256 bits)
# PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
# Paste result into .env as JWT_SECRET=
```

## Database Setup

### Option A: Docker (Recommended)

```powershell
docker compose up postgres -d
```

### Option B: Local PostgreSQL

```sql
CREATE DATABASE fanconnect;
CREATE USER fanconnect WITH ENCRYPTED PASSWORD 'fanconnect_secret';
GRANT ALL PRIVILEGES ON DATABASE fanconnect TO fanconnect;
```

Then run scripts manually:

```powershell
psql -U fanconnect -d fanconnect -f database/init/01-schema.sql
psql -U fanconnect -d fanconnect -f database/init/02-seed-data.sql
```

## Backend Setup

```powershell
cd backend
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

## Full Docker Stack

```powershell
docker compose up --build -d
```

Access: http://localhost (frontend), http://localhost:8080/api/swagger-ui.html (API docs)