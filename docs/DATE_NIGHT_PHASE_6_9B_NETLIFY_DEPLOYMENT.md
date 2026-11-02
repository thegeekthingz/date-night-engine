# Phase 6.9B — Existing production deployment QA

Date: 2026-11-02 (Europe/Rome). Status: **PARTIAL — automatic deployment verification pending**. This report records observed evidence, not inferred success.

## Deployment identity

| Fact | Verified value |
| --- | --- |
| Production URL / final browser URL | https://date-night-game-1.netlify.app/ |
| Existing Netlify site | date-night-game-1 |
| Site ID | 98412337-439c-491f-9997-5d62e874d75c |
| Team | The Geek Thingz |
| Repository | https://github.com/thegeekthingz/date-night-engine |
| Production branch | main |
| Baseline commit | 44970a85aa592a45f06e70e9e0f359517bfb09a3 |
| Baseline deploy | 6ae849a5a09f383cf76876fd — READY, production, Vite |
| Final deployment | Pending documentation-only push and observation |

Netlify connector confirms baseline commit, READY, production context and no password/SSO. Authenticated dashboard confirms linked repository, production branch main, active builds and public production visibility. No second site, import, rename, manual deploy, account/DRM or product change was performed.

## Live identity and desktop QA

PASS: HTTPS loads directly at the production URL, title “Date Night — Build Your Night”; no unrelated redirect, password screen, error page, preview/sample fixture, debug controls or Spill or Sip UI. Date Night branding and 72 activities displayed. Setup has all four vibes, 15/30 minutes and Sweet/Flirty. Production loader uses the 72-item version 2.0.0 pack. Visual tokens match Phase 5.6; corrected content is in baseline Phase 6.8. Only documentation changes are authorized in this verification.

PASS: Home → Build Your Date → Romantic / 30 / Flirty → Build My Date → Connect → Done → Predict → Reveal → Swap → Done → Play → Done → Challenge → Done → Closer → Done → completion. Each transition was observed through the live browser accessibility state.

## Persistence evidence

| Check | Result / evidence |
| --- | --- |
| Reveal restore | PASS: session 15e288e7-a64f-4f9a-a2fb-07214b82e547, Predict slot index 1, DN-PRE-007; revealed text and revealState=revealed survived refresh. |
| Swap restore | PASS: DN-PRE-007 → DN-PRE-016; same session/slot/progress, original retired, replacement retained after refresh. Reveal resets for the replacement as expected. |
| Completion restore | PASS: same first session restored endedReason=completed, slot 4, Romantic styling retained. |
| New Date | PASS: session a9d33e4e-56c5-48d6-ba38-289232a3807c, Romantic/30/Flirty retained, regenerated queue (Closer DN-CLO-001 rather than DN-CLO-007), Connect restored after refresh. Repeated items across dates are allowed. |
| End → Keep Playing | PASS: second session JSON remained unchanged and usable at Connect. |
| End → End Date → refresh | PASS: same second session restored endedReason=cancelled, “Date ended”. |
| Change Vibe | PASS: returned to setup, stored session removed; Competitive selected, --vibe-accent=#F1A05F; a new Competitive session started and restored after refresh. |
| Storage isolation | PASS: live origin had only date-night-engine:v1:session; production adapter only uses this key. No Social Game Engine key read/write in the active production path. |

Storage is browser/device-local localStorage, not an account or cloud sync. Clearing site data, private browsing or storage restrictions may lose/prevent progress. A save does not transfer between devices or browsers.

## Console, network, HTTPS and performance

Browser CDP Network/Runtime/Log monitoring during live refreshes and gameplay: **0 failed requests, 0 HTTP errors, 0 console errors, 0 runtime exceptions, 0 React warnings, 0 other warnings**. Event buffer was not truncated. HTML returned 200; JS/CSS returned successful cache validation (304), SVG mark 200. No failed content requests or mixed content. Content is bundled with JS. System UI and Georgia fonts render locally; no external font download required. Netlify injects its same-origin public badge/HUD script; it loaded successfully and is not a gameplay dependency. No unexpected third-party gameplay calls were observed.

HTTPS PASS: secure browser response, TLS 1.3, DigiCert Global G2 TLS RSA SHA256 2020 CA1, certificate covers *.netlify.app, no warning or insecure dependency observed. No security bypass used.

Sanity classification: initial load GOOD; scroll GOOD; Reveal GOOD; Swap GOOD; stage transitions GOOD. No visible stalls or desktop horizontal overflow. One observed reload loadEventEnd was approximately 149 ms; this is a local observation, not a benchmark or SLA. No optimization project started.

## Physical smartphone and network

Owner was asked to run the full public-URL flow, Reveal/Swap/completion refresh checks, touch/layout/font/color checks, Wi-Fi/mobile data, app switching and lock/unlock. Owner response: **“tutto ok”**, followed by **“Samsung A55 browser Chrome”**. Physical smartphone QA: PASS, owner-reported, not browser emulation. No reported security warning, overflow, clipping, touch or persistence defect.

Wi-Fi: owner-reported success in the bundled checklist. Mobile-data availability and whether that optional switch was actually performed are not separately confirmed: **NOT TESTED / not independently established**. Background/foreground and lock/unlock: no issue reported in the bundled checklist; exact reload behavior not supplied. Do not claim offline support or extend this evidence to untested tablets/all devices.

## Actual build settings

| Setting | Observed value |
| --- | --- |
| Package manager | pnpm (lockfile and configured build command) |
| Install command | Netlify-managed pnpm dependency installation; log confirms pnpm install behavior, exact command flags not printed; no custom install override observed |
| Build command | pnpm run build |
| Publish directory | dist |
| Base directory | / |
| Package directory | Not set |
| Node version | Dashboard: 24.x; baseline build log: v24.22.2 |
| PNPM version | 10.30.3 in baseline build log; not pinned in package.json |
| Environment variables | Site environment-variable connector returned [] (NONE); no app env dependency |
| Build image | Ubuntu Noble 24.04 (default) |

## GitHub → Netlify automatic deployment

Repository connection and main are verified. Baseline deploy alone does not prove push-triggered deployment. This documentation-only commit will be pushed normally to main without force or manual build trigger. Record observed Git push → detected commit → build → READY here after the test. Product code, dependencies, content, config and printable PDFs remain unchanged.

## Live access facts

Production URL: https://date-night-game-1.netlify.app. App install NO; account NO; login NO; customer email in app NO; save browser localStorage; cloud sync NO; WebApp offline NOT CLAIMED; printable offline YES (after download/printing); internet required to access the hosted WebApp.

Link sharing risk: **MEDIUM**. Anyone receiving the public URL can open/forward it; no buyer entitlement enforcement exists. Recommendation / V1 decision: **ACCEPT FOR V1**, balancing low-ticket digital-product friction, support burden and customer experience against forwarding/piracy. This is a recommendation, not a claim that copying is prevented. No login/DRM added; no permanent-access promise made.

## Safe rollback plan (availability inspection only)

A — Previous published Netlify deploy: availability pending dashboard inspection; no restore executed and no deliberately bad deployment made.

B — Git revert and automatic deploy: from a clean main updated with origin/main, identify the bad commit with git log, run git revert <bad-commit>, review the revert and run typecheck/tests/build/diff checks, then git push origin main. Verify the new deploy is READY and serves the revert commit before retesting production. Never force-push main or reset shared history. This produces a new traceable commit. For a failed unpublished build, the previous production remains live.

## Customer documentation and owner decisions

Updated DATE_NIGHT_CUSTOMER_HANDOFF.md with live URL and access facts; created DATE_NIGHT_START_HERE_COPY.md and DATE_NIGHT_LAUNCH_CLAIMS_MATRIX.md. Printable bonus is the existing four PDF editions / four fixed dates / 20 activities, not all 72 app items. No lifetime/forever/permanent, never-repeat, editable-PDF, cloud-sync or offline-WebApp claim.

Unresolved: customer support route **TO BE DEFINED BEFORE LAUNCH**; exact purchase-to-delivery route; access duration/entitlement and hosting/commercial promises; gift handoff if offered. Physical tablet untested. Mobile-data test confirmation remains unavailable. These commercial decisions do not turn a passing technical check into a launch approval.

Ready for Etsy launch assets: NO until technical auto-deploy verification completes. Ready to publish listing: NO (unresolved owner decisions). No Etsy assets started.

## Regression and repository state

PASS: pnpm run typecheck; pnpm test (450 passed, 0 failed/skipped/cancelled); pnpm run build (Vite 8.3.0); git diff --check. Initial sandbox runs blocked subprocess creation with spawn EPERM; authorized runs succeeded. The successful local test run emitted a Vite cache-cleanup EPERM rmdir warning; this was local test tooling, not a live production console warning. Generated asset filenames match production (index-Dxe1fYEz.js / index-CLAXrJ45.css). Date Night began clean at the baseline. Original Social Game Engine already had unrelated local changes; they are outside this task and were not edited. Baseline fingerprint of its tracked diff plus status: 1AB1D2221B9336F76E3EC4F97D5EA6F2F92394348391485FA868144B8F03E566.
