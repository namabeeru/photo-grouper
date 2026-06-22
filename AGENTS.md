# AGENTS.md

Public-safe instructions for agents working in this repo.

This repository may be public. Do not add private operator notes, private local paths, secret
references, personal workflow details, or unpublished product plans to committed files.

## Read order

1. Read this file.
2. If `AGENTS.local.md` exists, read it next. It is private local context and must never be
   committed.
3. Read `README.md`, `PRIVACY.md`, `CONTRIBUTING.md`, and the files relevant to the requested
   change.
4. Check current git status before editing.

## Working rules

- Keep changes small and scoped to the requested task.
- Carry approved tasks end to end using available resources: the repo, CLI tools, APIs,
  browser/computer-use automation, and approved secret workflows. Do not hand operational steps back
  to the maintainer just because they require an external dashboard or API.
- Standing Git authorization: after relevant checks pass, commit completed task changes and push the
  current branch to the existing configured remote before reporting completion. Use `main` unless
  the maintainer requests a branch/PR, the repo requires one, or work is already on a review branch.
  Do not ask for separate commit/push permission. Push synchronizes work; it does not authorize
  deployment, publishing, force-pushes, or other gated actions.
- Do not deploy, submit to app stores, change production settings, change DNS, publish releases, or
  modify public privacy claims unless the maintainer explicitly authorizes that exact action for the
  current task.
- Do not read, print, copy, or commit secret values from `.env`, local config, device state, photo
  libraries, or private notes.
- Treat privacy, analytics, app-store metadata, and photo-processing behavior as maintainer-gated.
  If authorization is exact, execute within that scope; if it is missing or ambiguous, stop and ask.
- Stop rather than guess when work depends on unavailable private operator context, would expose
  secrets, or raises a concrete safety/security/legal/privacy concern.

## Memory and handoff

- Record important outcomes in the final response: what changed, validation run, risks, and next
  steps.
- Good memory candidates are stable project gotchas, repeated mistakes, decisions, release notes,
  privacy/security constraints, and meaningful user preferences.
- If `AGENTS.local.md` points to a private operator workspace, follow that file for local
  memory updates. Otherwise, do not create extra memory files in this repo.
