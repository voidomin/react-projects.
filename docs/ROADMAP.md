# Roadmap

This file tracks potential improvements for this repo with one guiding rule: keep each app separate and understandable on its own.

## Guiding principle

- Each project stays independent so learners can open one folder and work on it without needing the rest of the repo.
- Shared improvements should reduce duplication and drift, not merge the apps together.
- Refactors should protect the existing behavior first, then modernize the implementation.

## Repo-level

- Keep a consistent tooling story across apps (formatting, linting, and build scripts).
- Keep GitHub Actions as the single deployment path for the repo.
- Add pull-request checks for lint and build when you want stricter safety.
- Consolidate only the configs that are truly shared and stable.
- Keep generated files out of version control.

## App-level refactors

- Normalize folder structure across apps so each project feels familiar.
- Remove dead code, unused helpers, and stale notes from each app.
- Centralize repeated UI patterns only when the abstraction is clearly reusable.
- Improve environment variable documentation per app so setup stays self-contained.
- Add focused tests around fragile flows before deeper refactors.
- Move to TypeScript gradually, starting with the app that has the clearest boundaries.
- Tighten accessibility and responsive behavior so old screens stay reliable.

## Stability checks

- Verify each app still builds independently after changes.
- Keep theme, routing, and asset-path changes backwards-compatible.
- Re-check GitHub Pages deployment after workflow updates.
- Use small, reversible refactors when the code path is shared by multiple apps.
