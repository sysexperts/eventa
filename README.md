# Local Events – Event-Plattform (Docker)

Docker-basierte Webanwendung für eine Event-Plattform, auf der Veranstalter kostenlos Events erstellen und verwalten können.

## Architektur

- **Frontend**: React + TypeScript + Vite + TailwindCSS (`frontend/`)
- **Backend**: Node.js + TypeScript + Express + Prisma + Zod (`backend/`)
- **Datenbank**: PostgreSQL (`db` via Docker)
- **Auth**: JWT in **HTTP-only Cookie** (kein LocalStorage/SessionStorage/IndexedDB)

## Voraussetzungen

- Docker
- Docker Compose

## Start

1. Optional: `.env.example` nach `.env` kopieren und Werte anpassen.
2. Starten:

```bash
docker-compose up --build
```

3. Öffnen:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Wichtige Sicherheits-/State-Info

- Es werden **keine** relevanten Daten im Browser persistent gespeichert.
- Auth erfolgt über ein **HTTP-only Cookie**.
- Alle Event- und Profildaten liegen zentral in PostgreSQL.

## API (Auszug)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/events` (Filter via Query-Params)
- `GET /api/events/:id`
- `POST /api/events` (auth)
- `PUT /api/events/:id` (auth + owner)
- `DELETE /api/events/:id` (auth + owner)
