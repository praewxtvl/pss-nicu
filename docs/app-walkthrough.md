# PSS:NICU — App Walkthrough

PSS:NICU ("Parental Stressor Scale: NICU") is a clinician console used by
Thai NICU staff (King Chulalongkorn Memorial Hospital / KCMH and Sawanpracharak
Hospital / SPR) to record and track parental stress assessments for families
with infants admitted to the NICU, and to drive a stress-severity-based
intervention protocol. The UI is entirely in Thai.

## Tech stack — no build step

This is a **no-build, static single-page app**. There is no `package.json`,
bundler, or transpile step:

- `index.html` loads React 18 + ReactDOM + `@babel/standalone` from a CDN
  (unpkg), then loads the app's own `.jsx` files with
  `<script type="text/babel" src="...">` — Babel transforms JSX **in the
  browser** on every page load.
- Load order matters: `data.jsx` → `components.jsx` → `screens.jsx` →
  `tweaks-panel.jsx` → `app.jsx`. Each file attaches its functions/consts as
  plain globals (no ES modules, no imports/exports), so later files can call
  earlier ones directly.
- Styling is plain CSS custom properties defined in a `<style>` block in
  `index.html` (`--terracotta`, `--paper`, `--s1`..`--s9` spacing scale,
  severity color tokens, etc.) — no CSS-in-JS, no Tailwind.
- To run it locally: just open/serve `index.html` (any static file server).
  There's nothing to `npm install`.

## File map

| File | Purpose |
|---|---|
| `index.html` | HTML shell, design-system CSS variables, CDN script tags, and the runtime config (`window.PSS_CLIENT_ID`, `PSS_GATEWAY_URL`, `PSS_API_URL`, `PSS_TWEAK_DEFAULTS`). |
| `data.jsx` | Static domain data: the PSS question bank (`PSS_QUESTIONS`, 4 subscales), `SUBSCALE_META`, `severity()` scoring function, and `RECOMMENDATIONS` (the intervention protocol per severity level). |
| `components.jsx` | Reusable presentational pieces: `TopNav`, `SlimHeader`, `BottomTabBar`, `Avatar`, `SeverityBadge`, `MiniTrend`/`AreaTrend` (SVG trend charts), `SubscaleBars`, `Toast`/`ToastContainer`, `SkeletonBlock`. |
| `screens.jsx` | All route-level screens (see below) plus their tab sub-components. |
| `tweaks-panel.jsx` | Dev-only floating panel (`TweaksPanel`) for live-tuning theme/density/severity thresholds — only rendered when `window.PSS_DEV_MODE` is set. |
| `app.jsx` | App shell: session restore, routing (plain `useState` string, no router library), data loading from the GAS backend, offline queue, and all the `handle*` mutation callbucks passed down to screens. |
| `gas/Gateway.gs`, `gas/Gateway_Setup.gs` | The Google Apps Script **auth gateway** backend (see Architecture below). |
| `assets/` | Logo images. |
| `deploy.ps1` | PowerShell helper that patches the GAS backend URL(s) into the HTML and commits/pushes. |

## Screens / routing

Routing is a single `route` string in `App` state (`dashboard`, `families`,
`familyDetail`, `assessment`, `result`, `alerts`, `analytics`, `admin`) — no
history/URL sync, it's an internal switch statement in `app.jsx`'s render.

- **`LoginScreen`** — Google Identity Services button (One Tap/GSI) or a
  fallback email+password form.
- **`DashboardScreen`** — landing page: stat cards, recent alerts, quick links.
- **`FamilyListScreen`** — all admitted families/beds for the clinician's
  hospital, `AddFamilyForm` to register a new family.
- **`FamilyDetailScreen`** — tabbed per-family view: `FamilyOverviewTab`
  (latest scores/severity), `FamilyHistoryTab` (assessment history + trend
  chart), `CareAndLogTab` (checklist-driven care plan + intervention log),
  bed transfer, notes.
- **`AssessmentScreen`** — the PSS questionnaire itself (4 subscales: Sights &
  Sounds, Infant Appearance, Parental Role, Staff Communication), scores on
  submit and routes to `ResultScreen`. Supports edit-mode for correcting a
  past assessment (`editAssId`).
- **`ResultScreen`** — shows the just-computed severity + recommended
  interventions for that severity tier.
- **`AlertsScreen`** — families whose latest score is high/extreme or trending
  up.
- **`AnalyticsScreen`** — aggregate severity histogram across the ward.
- **`AdminScreen`** — hospital-scoped admin views (staff management now lives
  in the Google Sheet registry directly, not in-app — see commit
  `6a60d4d`).
- **`GlobalSearch`** — Cmd/Ctrl+K modal to jump straight to a family.

Responsive behavior: `useIsMobile(1024)` decides between the desktop `TopNav`
and a mobile-native layout (`SlimHeader` + `BottomTabBar` + FAB for "quick
assessment"). iPad-landscape widths (~1024–1180px) get their own breakpoint
inside `TopNav` so nav labels don't wrap (fixed in `d9c1506`).

## Assessment scoring model

`data.jsx` defines the 4 PSS subscales and their item counts/max scores:

| Code | Name (EN) | Thai | Max |
|---|---|---|---|
| SS | Sights & Sounds | สภาพแวดล้อม | 24 |
| IA | Infant Appearance | รูปลักษณ์ทารก | 36 |
| PR | Parental Role | บทบาทพ่อแม่ | 24 |
| SC | Staff Communication | การสื่อสารเจ้าหน้าที่ | 20 |

Total score (max 104) maps to a severity tier via `severity(total, thresholds)`
— `none` → `mild` → `mod` → `high` → `extreme`. Thresholds are **tweakable at
runtime** via the dev Tweaks panel (`thMild`/`thMod`/`thHigh`) rather than
hardcoded, so clinical thresholds can be adjusted without a redeploy.
`RECOMMENDATIONS[severity]` then supplies a structured intervention protocol
(owner role, urgency, safety flags) shown on `ResultScreen` and used to seed
the care-plan checklist.

## Auth architecture — Gateway v2.0

This evolved from **one static HTML file per hospital, each hardcoding its own
GAS backend URL** (there used to be an `index_spr.html` alongside
`index.html` — see `deploy.ps1`, which still references both) to a **single
central login gateway** that routes to per-hospital backends. That
consolidation is why `index_spr.html` no longer exists in the repo even
though `deploy.ps1` still mentions it.

Current flow:

1. The web app only ever talks to one fixed URL for login:
   `window.PSS_GATEWAY_URL`, pointed at `gas/Gateway.gs` deployed as its own
   GAS web app ("Anyone" access, execute as owner).
2. `Gateway.gs` holds a **registry spreadsheet** (`email | name | role |
   hospitalCode | hospitalName | apiUrl | active | password_hash | salt`) —
   one row per staff member, mapping them to their hospital's **own** GAS
   backend URL (`apiUrl`), which is where actual patient/family/assessment
   data lives. The gateway itself stores no PHI.
3. Two login paths, both handled by `doPost` in `Gateway.gs`:
   - **Google ID token** (`LoginScreen`'s GSI button): the gateway verifies
     the token against `oauth2.googleapis.com/tokeninfo` (checking `aud` and
     expiry), then matches the verified email against the registry.
   - **Email + password** (fallback UI, for non-Gmail hospital staff): SHA-256
     salted hash comparison against `password_hash`/`salt` columns
     (`setInitialPassword()` in `Gateway_Setup.gs` seeds these).
4. On success the gateway mints an opaque session token (`Utilities.getUuid()`)
   stored in `CacheService` with a 6-hour TTL (`SESSION_TTL`, GAS's cache hard
   max) and returns it along with the user's `hospitalCode`/`hospitalName`/
   `apiUrl`.
5. The client stores the token in `sessionStorage` (`pss_token`) — not
   `localStorage`, so it doesn't survive tab close (PDPA-driven; see
   `8fc7119`). All subsequent data calls go straight to the user's
   hospital-specific `apiUrl`, sending the session token; each hospital's own
   GAS backend is expected to re-validate it (`verifySession` action) rather
   than trusting it blindly.
6. On page reload, `app.jsx` re-verifies the cached token via
   `verifySession` before showing the app (`restoring` state), so a refresh
   doesn't force a full re-login unless the 6h session has actually expired.
7. Logout clears `sessionStorage`, disables Google's auto-select, and wipes
   any `pss_*` keys from `localStorage` (defense in depth against stale PHI
   sitting in browser storage).

## Client-side data flow

`app.jsx` is the only place that talks to the network for app data (screens
are otherwise pure props-in/callbacks-out):

- On login, it `Promise.all`s `getFamilies` + `getAssessments` against the
  user's hospital `apiUrl`, with a 20s abort timeout and a full-page skeleton
  while loading.
- `openFamily()` lazy-loads that family's interventions/notes/care-plan only
  when its detail screen is opened, rather than eagerly loading everything.
- Mutations (`saveAssessment`, `saveFamily`, `saveCarePlan`, `saveNote`,
  `saveIntervention`) are **optimistic**: local state updates immediately,
  the POST fires in the background, and a toast reports success/failure.
- **Offline queue**: a failed `saveAssessment` is persisted to
  `localStorage` (`pss_pending_assessments`) and retried automatically on the
  browser's `online` event.
- A `dev-bypass` token (used by `PSS_DEV_MODE` auto-login) skips all network
  calls and injects canned sample families/assessments — this is how the
  Tweaks panel / local development works without a live GAS backend.
- `carePlans` state is persisted to `localStorage` as a client-side cache but
  is reconciled against the server's copy (server wins) when a family detail
  screen is opened.

## Deployment

There's no CI/build pipeline. `deploy.ps1` (Windows/PowerShell) is the
release process:

1. Optionally patches `window.PSS_API_URL` in `index.html` (and historically
   `index_spr.html`) when a hospital's GAS backend gets redeployed to a new
   URL — GAS deployments get a new `/exec` URL each time you publish a new
   version unless you reuse a versioned deployment.
2. Commits and pushes straight to the `valhalla-health/pss-nicu` GitHub repo.
3. The static site itself (HTML/JSX) is presumably served from wherever the
   repo/branch is hosted (e.g. GitHub Pages) or copied into a GAS
   `HtmlService` deployment — the backend (`Gateway.gs`, and each hospital's
   own data-serving GAS project, not in this repo) is deployed independently
   via the Apps Script editor as described in the header comment of
   `Gateway.gs`.

Most commit history is exactly this pattern: `config: update gateway URL to
new deployment` / `config(kcmh|spr): update GAS deployment URL` commits
following a redeploy of one of the Apps Script backends.

## Dev tooling — Tweaks panel

`window.PSS_DEV_MODE` (set in `index.html`) gates a floating `TweaksPanel`
(`tweaks-panel.jsx`) rendered at the bottom of `app.jsx`. It lets a developer
live-adjust, without touching code:

- Language, density (comfortable/compact), font pairing, brand color palette,
  whether subscale breakdowns show.
- The three severity thresholds (`thMild`/`thMod`/`thHigh`) directly, so
  clinical cutoffs can be experimented with against real data before being
  hardcoded into `window.PSS_TWEAK_DEFAULTS` in `index.html`.

`PSS_DEV_MODE` + `PSS_DEV_AUTO_LOGIN` together also auto-log-in as a
`dev-bypass` user for a given hospital code, skipping Google OAuth entirely
during local development.

## Recent development themes (from git history)

- **Auth consolidation**: multiple hospital-specific static HTML files →
  single Gateway GAS + registry sheet + per-hospital `apiUrl`, then email+
  password added as a fallback to Google OAuth (Gateway v2.0).
- **PDPA/security hardening**: session tokens in `sessionStorage` instead of
  `localStorage`, clearing `pss_*` keys on logout, iOS refresh fixes.
- **Mobile-native redesign**: bottom tab bar, slim header, swipe gestures,
  responsive breakpoints for phone/tablet/iPad-landscape.
- **Care workflow features**: structured intervention protocol per severity
  level, per-hospital bed lists, bed-transfer history, notes.
- **Ongoing config churn**: GAS web app URLs change on every redeploy, so a
  steady stream of `config:`/`fix:` commits just repoint
  `PSS_GATEWAY_URL`/`PSS_API_URL` — expect this pattern to continue whenever
  a backend script is redeployed.
