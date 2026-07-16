# Frontend Logic Leak — Security Checklist

Pre-deploy checklist for PSS:NICU. Run this before every push that touches
`index.html`, `data.jsx`, `components.jsx`, `screens.jsx`, `tweaks-panel.jsx`,
or `app.jsx`.

**Guiding principle:** a real secret (credential, patient data, an algorithm
that must not be gamed) must never reach the browser in the first place.
Hiding or minifying it after the fact is not a fix — if it's in a file the
`<script>` tags load, the browser has it, and DevTools/View Source can read
it verbatim.

## Why this app has no "build output" round

PSS:NICU is a **no-build static SPA** — `index.html` loads React + Babel
from a CDN and Babel transforms the `.jsx` files **in the browser** on every
page load (see `docs/app-walkthrough.md`). There is no `npm run build`, no
bundler, no `dist/`, no minification step. **The source files ARE the build
output**, byte for byte. That's actually a stronger guarantee than a typical
build pipeline (nothing can leak into a bundle that isn't already in a
tracked source file) but it also means there is zero obfuscation — treat
every string literal in `data.jsx` / `screens.jsx` / `app.jsx` / `index.html`
as fully public before you commit it.

---

## Round 1 — Source Audit Checklist

- [ ] `grep -rniE "(api[_-]?key|secret|password|token|private[_-]?key|bearer)"
  *.jsx *.html` — flag anything that isn't a Google **Client ID** (public by
  OAuth design) or the GAS **Gateway/API URLs** (see below; these are known,
  accepted exposures, not new leaks).
- [ ] Confirm no `gas/*.gs` content (or any hospital-backend secret) has been
  copy-pasted into a `.jsx`/`.html` file. `gas/` scripts run server-side on
  Apps Script and are never referenced by an `index.html` `<script>` tag —
  keep it that way.
- [ ] Confirm `window.PSS_DEV_MODE` is **not** set to `true` in the deployed
  `index.html`. If it is, the dev-bypass login (`screens.jsx` ~L334,
  `token: 'dev-bypass'`) and the `TweaksPanel` (live severity-threshold
  editor) become reachable in production, skipping real authentication.
- [ ] Scan for comments that explain *why* a number/threshold is what it is,
  or that cite an internal document/policy code (e.g. an internal QA form
  number). Comments like that leak institutional process, not just code —
  reword or drop them, and never repeat them in commit messages that stay in
  the same public log.
- [ ] Any new clinical scoring/weighting logic added to `data.jsx` — ask: is
  this the kind of thing a parent/family member (who also gets to use
  DevTools) should be able to read in full? If not, it doesn't belong here
  at all — not "hidden here," genuinely computed server-side instead.

### Known/accepted exposures (do not re-flag unless changed)

| Item | Location | Why it's OK |
|---|---|---|
| `window.PSS_CLIENT_ID` | `index.html` | Google OAuth client IDs are meant to be public; the secret half (client secret) is never used client-side. |
| `window.PSS_GATEWAY_URL`, `window.PSS_API_URL` | `index.html` | GAS "Anyone" web-app URLs are not bearer credentials by themselves — every call still requires a valid Google ID token or session token, checked server-side in `Gateway.gs`. Treat a leaked URL as "now publicly known," not "now exploitable," **as long as** every hospital backend actually re-validates `token` via `verifySession` on every request (confirm this per hospital backend — those scripts live outside this repo). |
| `AUD` constant in `gas/Gateway.gs` | server-side | Same Google Client ID as above, just referenced again; fine server-side. |

### Findings from this audit (2026-07-16)

1. **PSS severity scoring is entirely client-side and untrusted-input in,
   untrusted-output out.** `AssessmentScreen` (`screens.jsx` ~L1687-1692)
   computes `totals`/`total` from the raw answers in browser state, calls
   `severity(total, thresholds)` (`data.jsx`), and the resulting `total`,
   `sev`, and per-subscale scores are packed into the `ass` object and POSTed
   to the hospital's GAS backend via `saveAssessment`
   (`app.jsx` ~L303, ~L136) **as already-computed fields**, not as raw
   answers for the server to score. Nothing in this repo shows the backend
   recomputing or validating `total`/`severity` against the raw item
   answers before persisting them.
   - **Risk:** this is a clinical triage score that drives an intervention
     protocol, including a `safety: true` flag at the "extreme" tier
     (`data.jsx` `RECOMMENDATIONS.extreme`). A tampered client (modified
     JS, direct POST to the API URL, or a compromised browser extension)
     can submit any `total`/`severity` it wants, and there is currently no
     server-side recomputation in this codebase to catch that.
   - **Fix (backend, not in this repo):** each hospital's data-serving GAS
     script should recompute `total`/`severity` from the raw `ss1..sc5`
     answers server-side on `saveAssessment`, using the same `severity()`
     logic (or a canonical server copy of it), and reject/flag mismatches
     rather than trusting the client's numbers. The frontend can keep
     computing and displaying the score instantly for UX; it just shouldn't
     be the system of record for it.
   - Re-check this any time `AssessmentScreen`'s submit payload or a
     hospital backend's `saveAssessment` handler changes.

2. **Intervention protocol comment cites an internal document code.**
   `data.jsx` line 93: `// Activity recommendations by severity (paraphrased
   from F-WI-RAISO-QS-201/01)`. This reveals an internal QA/policy document
   number in a comment shipped verbatim to every browser. Low severity (it's
   a form reference, not a credential), but it's exactly the "comment that
   explains internal logic/process" pattern this checklist watches for —
   drop the internal doc code from any code comment; keep that traceability
   in an internal wiki/ticket instead.

3. **`RECOMMENDATIONS` (the full care-plan/intervention protocol,
   including safety-flag logic) ships as a plain JS object in `data.jsx`.**
   This is accepted as-is today (it's a published/paraphrased clinical
   protocol, not a trade secret, and the walkthrough documents it as
   intentionally tweakable), but re-confirm this classification each time
   clinical content is added — if a future revision embeds anything
   hospital-proprietary (e.g., named-vendor pricing, internal escalation
   contacts, non-public policy text), move it server-side.

4. **No secrets, passwords, or API keys found hardcoded in `.jsx`/`.html`
   files.** Password hashing (`hashPassword`, salt/hash comparison) is
   correctly confined to `gas/Gateway.gs` / `gas/Gateway_Setup.gs`, which
   run server-side and are never loaded by `index.html`.

---

## Round 2 — Build Output Audit Checklist

Not applicable in the traditional sense — **see "Why this app has no build
output round" above.** What *is* worth checking on every deploy:

- [ ] `git diff` on `index.html` only ever touches the two `window.PSS_*_URL`
  lines (and, rarely, `PSS_TWEAK_DEFAULTS`) — if a diff touches the `<style>`
  block or script tags in a way you didn't intend, review it as carefully as
  a `.jsx` change; it ships exactly as written.
  ```bash
  git diff -- index.html
  ```
- [ ] Confirm `window.PSS_DEV_MODE` / `window.PSS_DEV_AUTO_LOGIN` are absent
  from `index.html` before pushing (same check as Round 1, worth doing again
  right before `deploy.ps1`/push since this is the actual file served).
- [ ] Re-run the Round 1 `grep` (secrets/keywords) against the working tree
  one more time immediately before push — there is no minify/bundle step to
  "clean up" a leftover console.log or debug credential; whatever's in the
  file is what ships.

---

## Round 3 — API Response Audit Checklist

The hospital-specific data-serving GAS backends (`getFamilies`,
`getAssessments`, etc.) are **not in this repo** — only the auth `Gateway.gs`
is. That means this round can't be done from source alone; it needs a live
DevTools Network-tab capture compared against what the UI actually renders.

- [ ] Open DevTools → Network, log in, and capture the raw JSON from
  `getFamilies` and `getAssessments` (and any `openFamily()` lazy-load calls:
  interventions/notes/care-plan).
- [ ] Diff every field in that JSON against what the frontend actually reads.
  As of this audit, the frontend only ever accesses these fields — anything
  the backend sends beyond this list is over-fetching and should be trimmed
  server-side, not just left unrendered:
  - **Family record:** `famId`, `hospitalCode`, `name`, `parentName`,
    `initials`, `infantId`, `dx`, `ga`, `bw`, `bed`, `bedHistory`,
    `admitDate`, `dayAdmit`
  - **Assessment record:** `assId`, `famId`, `date`, `assessedBy`, `by`,
    `notes`, `ssScore`, `iaScore`, `prScore`, `scScore`, `subTotals`, `total`
  - (Re-run `grep -ohE "\bfam\.[a-zA-Z_]+" screens.jsx app.jsx components.jsx
    | sort -u` and the equivalent for `a\.`/`ass.` to regenerate this list
    after any screen changes — it drifts.)
- [ ] Specifically check for other-family/other-patient data in a single
  response — a `getFamilies` call should only ever return the caller's own
  `hospitalCode`, never a cross-hospital dump.
- [ ] Note that `parentName`, `infantId` (HN), and `dx` are PHI under PDPA
  and *are* legitimately used by the UI — that's expected, not a leak by
  itself. The point of this round is catching fields the backend sends but
  the UI **never** uses (dead weight that's pure exposure with zero product
  value), not flagging every PHI field as a problem.
- [ ] Remember: once PHI is in `families`/`assessments` React state, it's
  visible via React DevTools / the console even if not rendered in the DOM.
  "Not displayed" is not the same as "not exposed" — the only real fix for
  a field that shouldn't be in the browser at all is the backend not sending
  it.

---

## Round 4 — Recurring Process

- [ ] Before every deploy: re-run Round 1's `grep` sweep and the
  `window.PSS_DEV_MODE` check.
- [ ] After every `deploy.ps1` run (which only patches GAS URLs), re-diff
  `index.html` per Round 2.
- [ ] On any change to `AssessmentScreen`'s submit payload, `data.jsx`
  scoring/recommendation content, or a hospital backend's `saveAssessment`
  handler: re-check Finding 1 above (server-side score validation).
- [ ] On any change to what a hospital backend returns from `getFamilies`/
  `getAssessments`/lazy-load endpoints: redo Round 3's field diff.
- [ ] Keep this file's "Known/accepted exposures" and field lists up to date
  — a stale checklist that still lists last quarter's fields will hide new
  over-fetching instead of catching it.
