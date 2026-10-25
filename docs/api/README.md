# API Documentation

Interactive API documentation is available via Swagger UI when the backend is running:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/v3/api-docs

## Authentication

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

Obtain a token via `POST /api/auth/login` or `POST /api/auth/register`.

## Response Envelope

```json
{
  "success": true,
  "message": "Optional message",
  "data": { },
  "timestamp": "2026-06-22T10:00:00Z"
}
```