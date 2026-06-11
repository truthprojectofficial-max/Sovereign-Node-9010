---
name: deterministic-code-quality
description: 'Run deterministic lint, format, and type-check passes on changed files. Use when: pre-commit checks, enforce code style, lint fix, format code, run formatter, check style, typecheck, code quality gate, validate before commit, deterministic validation, strict linting.'
argument-hint: "Optionally specify file paths or 'all' to check all files"
---

# Deterministic Code-Quality Gate

Run the project's configured linters, formatters, and type-checker on changed (or specified) files and auto-fix what's possible. This skill is deterministic — it uses only the project's own tooling and config, never guesses or substitutes.

## When to Use

- Before committing — catch issues that would fail CI
- After editing multiple files — quick quality pass
- When asked to "lint", "format", "check style", or "typecheck"
- When the pre-commit hook fires (`.github/hooks/pre-commit-lint.json`)

## Procedure

### 1. Scope the Check

Determine which files to check:

- **Default (no argument):** Changed files only — run `git diff --cached --name-only` (staged) then `git diff --name-only` (unstaged). Union the results.
- **Specific files:** If the user names files, use those.
- **`all`:** Run against the full project (`npm run lint`, `npm run format:check`, `npm run typecheck`).

Filter to relevant extensions: `.ts`, `.tsx`, `.css`, `.json`.
Root-level files like `server.ts` are in scope — not just files under `src/`.

**If zero files are in scope**, report `✔ 0 files in scope — nothing to check` and stop. Do not fall back to checking all files.

### 2. Run Lint

```bash
npx eslint --max-warnings 0 <files>
```

If errors found, auto-fix:

```bash
npx eslint --fix <files>
```

Report any remaining unfixable violations.

### 3. Run Formatter

```bash
npx prettier --check <files>
```

If formatting drift found, auto-fix:

```bash
npx prettier --write <files>
```

### 4. Run Type-Check

```bash
npx tsc --noEmit
```

Type errors cannot be auto-fixed. Report them clearly with file, line, and message.

### 5. Stage Fixed Files

If any files were auto-fixed in steps 2–3:

```bash
git add <fixed-files>
```

### 6. Report

Use this output format:

```
✔ Checked: <N> files
✔ Auto-fixed: <N> issues in <files>
✘ Remaining: <N> issues

<file>:<line>:<col> <rule> <message>

─── GATE: PASS | FAIL ───
```

**Verdict rule:** If any unfixable lint errors or type errors remain after auto-fix, the gate is **FAIL**. Otherwise **PASS**. Warnings alone do not fail the gate — only errors.

## Constraints

- **Scope discipline:** Only operate on files in scope (step 1). Never lint the entire repo unless explicitly asked.
- **No commits:** Stop after staging fixes — never commit on behalf of the user.
- **No config changes:** Do not modify ESLint, Prettier, or TypeScript configs unless explicitly asked.
- **No rule suppression:** Surface all violations. Never add `eslint-disable` comments or skip rules.
- **Project tooling only:** Use the versions installed in `node_modules` (via `npx`), not global installs.

## Project Tooling Reference

| Tool           | Config             | npm Script                                |
| -------------- | ------------------ | ----------------------------------------- |
| ESLint 9       | `eslint.config.js` | `npm run lint` / `npm run lint:fix`       |
| Prettier 3     | `.prettierrc`      | `npm run format:check` / `npm run format` |
| TypeScript 5.7 | `tsconfig.json`    | `npm run typecheck`                       |

## Formatting Rules (`.prettierrc`)

| Setting         | Value          |
| --------------- | -------------- |
| Semicolons      | Yes            |
| Quotes          | Single         |
| Tab width       | 2 spaces       |
| Trailing commas | All            |
| Line width      | 100 chars      |
| End of line     | CRLF (Windows) |

## User Command List

Copy-paste these into chat or terminal as needed.

### Copilot Chat Commands

| Type this                         | What it does                                   |
| --------------------------------- | ---------------------------------------------- |
| `/deterministic-code-quality`     | Run lint + format + typecheck on changed files |
| `/deterministic-code-quality all` | Run on the entire project                      |
| `@deterministic`                  | Invoke the generic code-quality agent          |

### Terminal Commands (copy-paste ready)

```powershell
# Lint changed .ts/.tsx files (report only)
npm run lint

# Lint and auto-fix
npm run lint:fix

# Check formatting (report only)
npm run format:check

# Auto-format all source files
npm run format

# Type-check (no output = success)
npm run typecheck

# Run all three checks in sequence
npm run lint ; npm run format:check ; npm run typecheck
```

### Git + Quality Gate (copy-paste ready)

```powershell
# Stage your changes, then run the gate before committing
git add -A
npm run lint:fix ; npm run format ; npm run typecheck

# If gate passes, commit
git commit -m "your message"
```

## Relationship to `@deterministic` Agent

The user-level `deterministic.agent.md` is a **generic** code-quality enforcer that works across any project. This skill is the **project-specific** version — it knows this repo's exact tooling, npm scripts, and file layout. The agent can invoke this skill, or the skill can be used independently by any agent via `/deterministic-code-quality`.
