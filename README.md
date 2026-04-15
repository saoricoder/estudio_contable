# Estudio Contable Eficiente (Contadores Unidos MX)

Monorepo con **Frontend** (React + Vite + Tailwind + Lucide) y **Backend** (Node.js + Express + Prisma + PostgreSQL) listo para iteración del MVP.

## Estructura

- `client/`: SPA React (Vite) + Tailwind CSS.
- `server/`: API Express con base para arquitectura por capas (routes/middlewares/config).
- `server/prisma/`: Prisma schema + migraciones.
- `api/index.ts`: entrypoint serverless para Vercel (reusa `server/src/app.ts`).

## Requisitos

- Node.js 20+
- PostgreSQL (local o remoto)

## Variables de entorno

- Backend: copiar `server/.env.example` a `server/.env` y ajustar:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT` (opcional)
  - `CLIENT_ORIGIN` (opcional)

## Desarrollo local

Instalar dependencias del monorepo:

```bash
npm install
```

Levantar API + Frontend:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- Healthcheck: `GET http://localhost:4000/api/health`

## Prisma (PostgreSQL)

Desde `server/`:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## API (actual)

- `GET /api/health`: confirma que el backend está arriba.

### Auth (JWT)

- `POST /api/auth/register`
  - body: `{ "email": "user@dominio.com", "password": "min-8-chars" }`
  - response: `{ user: { id, email }, token }`
- `POST /api/auth/login`
  - body: `{ "email": "user@dominio.com", "password": "..." }`
  - response: `{ user: { id, email }, token }`

Para endpoints protegidos, enviar header:

- `Authorization: Bearer <token>`

### Clientes (protegido)

- `GET /api/clients`
- `GET /api/clients/:id`
- `POST /api/clients`
  - body: `{ "name": "...", "rfc": "XAXX010101000", "regimen": "601", "email?": "...", "phone?": "..." }`
- `PATCH /api/clients/:id`
- `DELETE /api/clients/:id`

### Nóminas quincenales (protegido)

- `POST /api/payroll/calculate`
  - body (ejemplo):
    - `{ "salaryType": "MONTHLY", "grossSalary": 18000, "daysInPeriod": 15, "integrationFactor": 1.0452, "umaDaily": 108.57, "isrMonthlyEstimate": 1200 }`
  - response: `{ data: { gross, imss, subsidy, netEstimate, disclaimers } }`

### Facturación (recurrente) (protegido)

- `GET /api/invoices/recurring`
- `POST /api/invoices/recurring`
  - body (ejemplo):
    - `{ "clientId": "<uuid>", "concept": "Honorarios contables", "amount": 2500, "currency": "MXN", "frequency": "MONTHLY", "startDate": "2026-01-01T00:00:00.000Z", "nextRunDate": "2026-02-01T00:00:00.000Z", "active": true }`
- `PATCH /api/invoices/recurring/:id`
- `DELETE /api/invoices/recurring/:id`

### Conciliación bancaria (protegido)

- `GET /api/banking/movements` (movimientos internos / libro)
- `POST /api/banking/movements`
  - body: `{ "date": "2026-04-01T00:00:00.000Z", "description": "Pago proveedor", "reference?": "REF123", "amount": -1500.5, "type": "DEBIT" }`
- `GET /api/banking/statements` (líneas de estado de cuenta)
- `POST /api/banking/statements`
  - body: `{ "date": "2026-04-01T00:00:00.000Z", "description": "SPEI a proveedor", "reference?": "SPEI999", "amount": -1500.5, "type": "DEBIT" }`
- `POST /api/banking/match`
  - body: `{ "movementId": "<uuid>", "statementLineId": "<uuid>" }`
- `DELETE /api/banking/match/movement/:movementId`

## Despliegue en Vercel

El repo incluye `vercel.json`:

- **Serverless Function**: `api/index.ts`
- **Static Build**: `client/` (output `client/dist`)

En Vercel configura las env vars (al menos `DATABASE_URL` y `JWT_SECRET`).

