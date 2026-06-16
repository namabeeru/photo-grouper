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
- Use a branch or PR-ready summary for meaningful work. Do not push directly to `main` unless the
  maintainer explicitly authorizes that exact action for the current task.
- Do not deploy, submit to app stores, change production settings, change DNS, publish releases, or
  modify public privacy claims without maintainer review.
- Do not read, print, copy, or commit secret values from `.env`, local config, device state, photo
  libraries, or private notes.
- Treat privacy, analytics, app-store metadata, and photo-processing behavior as maintainer-gated.
- If work depends on private operator context, stop and ask for that context rather than guessing.

## Memory and handoff

- Record important outcomes in the final response: what changed, validation run, risks, and next
  steps.
- Good memory candidates are stable project gotchas, repeated mistakes, decisions, release notes,
  privacy/security constraints, and meaningful user preferences.
- If `AGENTS.local.md` points to a private operator workspace, follow that file for local
  memory updates. Otherwise, do not create extra memory files in this repo.
