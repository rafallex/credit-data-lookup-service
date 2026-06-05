# Credit Data Lookup Service

A RESTful backend service that aggregates credit data from multiple upstream API endpoints and serves it through a unified interface with SQLite caching.

## Overview

This service acts as an aggregation layer between clients and a Credit Data API. For a given SSN, it fetches personal details, debt information, and assessed income from three separate endpoints, merges them into a single response, and caches the result in a local SQLite database so that subsequent requests are served instantly without hitting the upstream API again.

It started as a backend take-home (the "Lookup Service – Level 2" exercise), so the upstream API contract and the Cypress E2E spec in `cypress/e2e/test.cy.js` were given as the grading harness. Everything under `src/` — the service, the parallel API client, the SQLite cache layer, graceful shutdown — is my implementation, along with the Jest unit tests.

## Architecture

```
Client Request
      │
      ▼
┌─────────────┐
│   Express    │  ← routes.js
│   Router     │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────┐
│   Service    │────▶│  SQLite   │  cache hit → return immediately
│    Layer     │     │   Cache   │
└──────┬──────┘     └──────────┘
       │ cache miss
       ▼
┌─────────────┐     ┌──────────────────────┐
│  API Client  │────▶│  Credit Data REST API │
│  (3 parallel │     │  (external service)   │
│   requests)  │     └──────────────────────┘
└─────────────┘
```

### Project Structure

```
src/
├── server.js              # Entrypoint — starts Express on port 8080
├── app.js                 # Express app setup (separated for testability)
├── routes.js              # GET /ping and GET /credit-data/:ssn
├── creditDataService.js   # Orchestrates cache lookup → API fetch → store
├── creditDataClient.js    # Axios client for the 3 upstream API endpoints
└── db.js                  # SQLite caching layer (better-sqlite3)

__tests__/
└── creditDataService.test.js   # Jest unit tests with mocked dependencies

cypress/
└── e2e/test.cy.js              # Cypress E2E spec (provided grading harness)
```

## API Endpoints

### `GET /ping`

Health check endpoint.

**Response:** `200 OK`

### `GET /credit-data/:ssn`

Returns aggregated credit data for the given Social Security Number.

**Response (200):**

```json
{
  "first_name": "Emma",
  "last_name": "Gautrey",
  "address": "09 Westend Terrace",
  "assessed_income": 60668,
  "balance_of_debt": 11585,
  "complaints": true
}
```

**Response (404):** SSN not found in the upstream API.

**Response (502):** Upstream API error.

## Design Decisions

**Parallel fetching** — The three upstream API calls (personal details, debt, assessed income) are dispatched concurrently with `Promise.all`, reducing latency from ~3× sequential to ~1× round-trip.

**Cache-aside pattern** — On first request for an SSN, the service fetches from the upstream API and stores the aggregated result in SQLite. All subsequent requests for the same SSN are served directly from the database, ensuring consistent responses and reducing load on the external API.

**App/server separation** — `app.js` exports the Express application without starting a listener, making it easy to mount in test harnesses or alternative runtimes. `server.js` handles process lifecycle (port binding, graceful shutdown).

**SQLite with WAL mode** — Write-Ahead Logging enables concurrent reads without blocking, suitable for a read-heavy caching workload.

**Boolean handling** — SQLite stores booleans as integers (0/1). The DB module handles conversion transparently so the API always returns native JSON booleans.

**Masked logging** — SSNs are sensitive, so error logs never print them in full. The route handler masks the value to `***-**-1234` (last four digits) before logging an upstream failure.

**Graceful shutdown** — `server.js` listens for `SIGTERM`/`SIGINT`, stops accepting new connections, closes the SQLite handle, and falls back to a forced exit after 10 seconds if the server does not close cleanly.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/rafallex/credit-data-lookup-service.git
cd credit-data-lookup-service
npm install
```

### Running

```bash
npm start
# Server starts on http://localhost:8080
```

### Configuration

All settings have sensible defaults; override them via environment variables.

| Variable         | Default                                | Purpose                                  |
| ---------------- | -------------------------------------- | ---------------------------------------- |
| `PORT`           | `8080`                                 | Port the HTTP server binds to            |
| `CREDIT_API_URL` | `https://coding-test-api.alvalabs.io`  | Base URL of the upstream Credit Data API |
| `DB_PATH`        | `./cache.db`                           | Path to the SQLite cache file            |

### Testing

Two layers of tests:

- **Unit tests (Jest)** — four tests covering the service's cache-aside logic with `db` and the API client mocked out: cache hit (no API call), cache miss (fetch then store), error propagation, and "don't cache on failure." `creditDataService.js` is at 100% statement/branch/function coverage.
- **E2E tests (Cypress)** — six specs that hit the running server against the live upstream API: the `/ping` health check, three named SSN aggregations (Emma, Billy, Gail), a 404 for an unknown SSN, and a repeat-request check that confirms the cached response matches the first. This file is the take-home's grading spec and is left unmodified.

```bash
# Unit tests (Jest, with coverage)
npm run test:unit

# E2E tests (Cypress — requires the server to be running)
npm start &
npm test
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **HTTP Client:** Axios
- **Database:** SQLite via better-sqlite3
- **Testing:** Jest (unit), Cypress (E2E)
