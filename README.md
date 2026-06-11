# Groknett ValueForge — Sovereign Node 9010

**TaaS Monolith v3.9.1** | Deterministic Sovereign Facts Stack

## What This Is

A full-stack application for algorithmic verification and forensic auditing, built on three deterministic engines:

| Engine                                | Purpose                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------- |
| **BBFB** (Barnett Binary Faith-Basis) | Multi-criteria decision analysis: LAW gates, GRACE risk, FRUIT scoring  |
| **Deception Detection**               | 36-pattern ontology + Shannon Entropy for structural deception analysis |
| **Facts Registry**                    | SQLite-backed immutable fact store with ISO Date Mandate compliance     |

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Express.js, sql.js (WASM SQLite)
- **Container**: Docker (OCI-compliant)
- **Target**: Azure Container Apps (groknett-deploy / australiaeast)

## Quick Start

```bash
npm install
npm run dev        # Starts Express (port 8000) + Vite dev server
```

## Build & Deploy

```bash
npm run build      # Vite production build
npm start          # Express serves API + static build on port 8000
```

### Docker

```bash
docker build -t groknett-valueforge .
docker run -p 8000:8000 groknett-valueforge
```

### Azure Container Apps

```bash
# Ensure az login is done first
bash deploy-azure.sh
```

## API Endpoints

| Method | Path                          | Description                           |
| ------ | ----------------------------- | ------------------------------------- |
| GET    | `/api/health`                 | System status                         |
| POST   | `/api/calculate`              | BBFB Engine (cost, performance, risk) |
| POST   | `/api/analyze`                | Deception Scanner (text analysis)     |
| GET    | `/api/facts`                  | List all registered facts             |
| POST   | `/api/facts`                  | Register a new fact                   |
| GET    | `/api/calculate/truthproject` | Red herring detection test            |

## Linting & Formatting

```bash
npm run lint       # ESLint check
npm run lint:fix   # ESLint auto-fix
npm run format     # Prettier format
npm run typecheck  # TypeScript type check
```

Use `@deterministic` in Copilot Chat to run all checks on staged files before committing.

## Operations Runbook

See **RUNBOOK.md** for the full copy-paste-ready operations guide:

- Environment prerequisites checklist
- Reproducible step-by-step instructions (clone to deploy)
- Every CLI command in one place
- Troubleshooting matrix (local, Docker, Azure, CI/CD)
- Quick diagnostic script
- Teardown instructions

## 00-99 Governance Protocol

All project artifacts follow the Master Project Folder Hierarchy. See the "00-99 PROTOCOL" tab in the UI for the full reference.
