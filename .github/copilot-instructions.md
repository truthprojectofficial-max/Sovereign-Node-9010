# Groknett ValueForge — Copilot Instructions

You are working in the `beendaer/groknett-valueforge` repository (Sovereign Node 9010).

## Non-negotiables

- No “black box” changes: keep solutions understandable, minimal, and explainable.
- Prefer deterministic behavior and deterministic tooling (use the repo’s existing scripts/config).
- Don’t introduce new build systems or config formats (YAML/JSON/etc.) unless explicitly requested.
- Don’t push to protected branches or merge PRs without explicit approval.

## Stack + runtime

- Backend: Express (TypeScript) in `server.ts`
- Frontend: React 19 + Vite in `src/`
- Database: `sql.js` (WASM SQLite)
- Service port: `8000`

## How to work in this repo

- Use the existing npm scripts; don’t add new tooling unless necessary for the task.
- Make precise, surgical changes and avoid unrelated refactors.
- Prefer TypeScript types for exported functions and APIs.
- Keep UI changes consistent with Tailwind usage already in the codebase.

## Validation (always run before finishing)

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Extra repo customization

- Also follow any scoped instructions in `.github/instructions/*.instructions.md`.
- Reuse available skills in `.github/skills/` when they match the task (for example, deterministic code-quality checks).
