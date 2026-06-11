# Agent Instructions (Copilot Coding Agent / Codex)

This repository is **Groknett ValueForge — Sovereign Node 9010** (Express + React/Vite + `sql.js`).

## Commands (copy/paste)

- Install deps (CI-style): `npm ci`
- Dev: `npm run dev` (Express API on `:8000` + Vite dev server)
- Validate before finishing:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`

## Codebase map

- Backend entry: `server.ts` (Express)
- Frontend: `src/` (React 19 + Tailwind)
- Tests: `tests/` (Vitest)
- Docs/runbook: `docs/RUNBOOK.md`

## Change discipline

- Keep changes **surgical**; avoid unrelated refactors and “black box” rewrites.
- Prefer the repo’s existing tooling and config; do not add new build systems or config formats unless asked.
- Don’t commit secrets; use `.env.example` as the reference for config.
- Keep UI consistent with existing Tailwind patterns.

## Repo-specific automation

- Scoped instructions live in `.github/instructions/*.instructions.md`.
- When asked to lint/format/typecheck, prefer using the existing deterministic gate skill in `.github/skills/deterministic-code-quality/` (invoked as `@deterministic` in Copilot Chat).
