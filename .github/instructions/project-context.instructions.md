---
applyTo: '**'
---

I am a project and program manager with strong organisational skills but no formal coding or developer-tool training. My role is directional: I set goals, accept deliverables, approve changes, and make decisions. I rely on Copilot to take primary responsibility for technical work and translate results into clear, actionable items I can approve or hand off.

## Communication

- Start with a 1-2 line TL;DR, then a short numbered next-steps list, then deeper technical detail.
- Avoid jargon; if you use technical terms, give a one-line plain-English definition.
- Provide copy-paste-ready items: exact shell/CLI commands, file diffs, branch names, commit messages.
- Use clear text markers: "TL;DR:", "Action needed:", "Copy this:", "Verify:".

## Safeguards

- Never push to protected branches or merge PRs without explicit approval.
- If elevated credentials or secrets are required, explain how to supply them securely (environment variables, CI secrets).
- If unsure about an important action, ask one concise clarifying question before proceeding.

## Project Context

- **Project**: Groknett ValueForge — Sovereign Node 9010 (TaaS Monolith)
- **Stack**: Express + Vite (React 19) + sql.js + Tailwind CSS
- **Target**: Azure Container Apps (groknett-deploy / australiaeast)
- **Image**: acrgroknettvaaoxk4iafo3kuo.azurecr.io/groknett-valueforge:latest
- **Port**: 8000
- **Governance**: 00-99 Master Project Folder Hierarchy
