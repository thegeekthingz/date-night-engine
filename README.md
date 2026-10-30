# Date Night Engine

## Product

A browser-based guided date-night WebApp for two. Choose a vibe, time and intensity; the app composes a complete five-stage date before play begins.

## Development

Validated locally with Node.js 24.19.0 and pnpm 12.6.0. No runtime version is pinned in package.json or a Node version file; use the validated versions when reproducing this baseline.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Test

```sh
pnpm run typecheck
pnpm test
```

The current suite contains 450 tests, including isolated legacy regression fixtures.

## Build

```sh
pnpm run build
```

## Production output

Vite writes the static application to **dist/**. This directory is generated and not committed. The app uses in-page state rather than URL routes, so no SPA fallback redirect is currently required.

No environment variables are required by the current production application. No backend, account service or analytics setup is included.

## Content

- 72 production activities in src/data/cards/date-night-v1.json.
- Four vibes: Cozy, Funny, Romantic and Competitive.
- 15- or 30-minute pacing choices; Sweet or Flirty intensity ceiling.
- Fixed journey: Connect -> Predict -> Play -> Challenge -> Closer.
- Dynamic queue, optional Reveal, eligible Swap and browser-local save/restore.

Flirty allows Sweet and Flirty items. Time choices are estimates; activities can reappear across different dates.

## Printable companion

Four fixed offline mini-dates / 20 selected activities. A4 and US Letter, Color and Ink-Saver contain the same dates. Final customer-facing PDFs are versioned in [output/pdf/](output/pdf/).

Source: src/data/printable/date-night-mini-dates.json. Generator: scripts/generate-date-night-printables.py, using Python, ReportLab, pypdf and installed Windows Georgia/Segoe UI fonts. PDF generation is separate from the WebApp build; committed PDFs are available without regenerating them in hosting CI.

## Deployment

Not yet production-deployed. GitHub preparation precedes the separate Netlify step; no hosting or customer access URL has been configured by this phase.

- Install: pnpm install --frozen-lockfile
- Build: pnpm run build
- Publish directory: dist

See [deployment/baseline facts](docs/DATE_NIGHT_PHASE_6_9A_GITHUB_BASELINE.md), [customer handoff](docs/DATE_NIGHT_CUSTOMER_HANDOFF.md) and [targeted correction QA](docs/DATE_NIGHT_PHASE_6_8_TARGETED_FIXES.md).

## Repository evidence

Production source, tests, generators, product reports, coverage data and final PDFs are versioned. Bulk screenshots, rendered PDF pages, local caches and temporary work stay local. Two reference screenshots and the latest PDF verification JSON are retained. Historical reports may refer to additional local-only evidence.

Inherited modules and fixtures remain for regression/provenance; the active entry point loads only the Date Night production pack.
