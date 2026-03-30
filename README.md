# Credit Data Lookup Service

A RESTful backend service that aggregates credit data from multiple upstream API endpoints and serves it through a unified interface with SQLite caching.

## Overview

This service acts as an aggregation layer between clients and a Credit Data API. For a given SSN, it fetches personal details, debt information, and assessed income from three separate endpoints, merges them into a single response, and caches the result in a local SQLite database so that subsequent requests are served instantly without hitting the upstream API again.

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
└── creditDataService.test.js   # Unit tests with mocked dependencies
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

### Testing

```bash
# Unit tests (Jest)
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
