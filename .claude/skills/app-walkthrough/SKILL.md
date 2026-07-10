---
name: app-walkthrough
description: Use when orienting to the PSS:NICU codebase — onboarding, answering "how does X work" questions, or before making changes to auth, routing, scoring, or deployment. Loads a full walkthrough of the app's architecture, screens, data model, auth gateway, and deployment process.
---

# PSS:NICU app walkthrough

Read `docs/app-walkthrough.md` in this repo for the full walkthrough before
answering architecture questions or making non-trivial changes. It covers:

- **Stack**: no-build static SPA — React 18 + Babel-standalone loaded from a
  CDN in `index.html`, JSX transformed in-browser. Load order:
  `data.jsx` → `components.jsx` → `screens.jsx` → `tweaks-panel.jsx` →
  `app.jsx`. All globals, no ES modules/imports.
- **File map**: `app.jsx` (shell/routing/data-fetch/mutations),
  `screens.jsx` (route-level screens + tabs), `components.jsx` (reusable
  UI), `data.jsx` (PSS question bank, scoring, intervention protocol),
  `tweaks-panel.jsx` (dev-only live theme/threshold tuning),
  `gas/Gateway.gs` + `gas/Gateway_Setup.gs` (auth backend).
- **Routing**: single `route` string in `App` state, no router library or
  URL sync.
- **Scoring**: 4 PSS subscales (SS/IA/PR/SC, max 104 total) →
  `severity()` in `data.jsx` maps to none/mild/mod/high/extreme using
  tweakable thresholds → `RECOMMENDATIONS[severity]` drives the care plan.
- **Auth**: central Gateway GAS (`PSS_GATEWAY_URL`) verifies Google ID token
  or email+password against a registry spreadsheet, mints a 6h session token
  cached server-side, returns the caller's hospital-specific `apiUrl` for
  actual patient data. Session lives in `sessionStorage` (PDPA — not
  `localStorage`).
- **Data flow**: optimistic mutations + toast feedback, offline queue in
  `localStorage` retried on the `online` event, lazy per-family loads on
  `openFamily()`.
- **Deployment**: no CI; `deploy.ps1` patches GAS backend URLs into the HTML
  and pushes. GAS deployment URLs change on redeploy — expect frequent
  `config:`/`fix:` commits repointing `PSS_GATEWAY_URL`/`PSS_API_URL`.

If `docs/app-walkthrough.md` doesn't answer the question, read the source
files directly rather than guessing — this file only summarizes.
