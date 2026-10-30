# Phase 6.5 — Real smartphone QA

Status: **PENDING — phone access and physical-device testing not yet confirmed**. This document is a test record, not a completed release approval. Prepared 2026-10-30.

## Desktop preparation

- HEAD: 227ebc22704214034c5d7942109a412ae6173c4e.
- Active loader: src/data/defaultGame.ts imports the production manifest and src/data/cards/date-night-v1.json.
- Production game version: 2.0.0; 72/72 items active; no active fixture IDs.
- Existing approved Phase 6 implementation is uncommitted in the working tree. No source, package, content, tests, engine, CSS, themes or manifest changed during this QA preparation.
- Original Social Game Engine was not targeted or modified.
- Existing localhost server remains available. A second Vite listener is bound specifically to the private LAN address, not all interfaces.
- Command (repository directory): pnpm dev --host 192.168.1.177 --port 5173 --strictPort.
- Access method: LAN, Ethernet 2, 192.168.1.177 (router 192.168.1.1).
- Phone URL: **http://192.168.1.177:5173/**.
- Desktop LAN HTTP probe: 200, Date Night title present. Listener confirmed at 192.168.1.177:5173.
- Phone reachability: PENDING. A desktop HTTP response does not prove phone access.
- No public tunnel, hosting, router port forwarding or firewall rule change.

The phone must be on the same home/private LAN (the computer can remain wired to that router). Keep the computer awake and the dev server running. Windows may require permitting the development server on Private networks. Do not disable the firewall. Use the same exact URL and regular browser profile throughout testing: localhost and LAN IP are different storage origins.

## Device information — user to supply

| Field | Value |
|---|---|
| Model | PENDING |
| OS / version | PENDING |
| Browser / version | PENDING |
| Orientation | Portrait primary; landscape brief check pending |
| Phone access confirmation | PENDING |

## Required configuration matrix

| Case | Vibe | Time | Ceiling | Physical-device result |
|---|---|---|---|---|
| A | Cozy | 15 | Sweet | NOT RUN |
| B | Funny | 15 | Flirty | NOT RUN |
| C | Romantic | 30 | Flirty | NOT RUN |
| D | Competitive | 30 | Sweet | NOT RUN |

## Device walkthrough checklist

Proceed only after the user confirms the page opens on their phone. Browser emulation or desktop results cannot satisfy this record.

1. Home: read title/hero, find CTA, check browser chrome, overflow, height and thumb reach.
2. Setup: tap every choice family; check selection contrast, readability without zoom, accidental taps and Build reachability. Judge colors as too dim / balanced / too saturated.
3. For each case A–D, build and inspect the five activities. Check stage/progress, neutral prompt contrast, scrolling, Done/Swap reachability and secondary End.
4. Predict: Reveal; inspect content, focus/scroll movement; refresh and confirm it remains revealed.
5. Swap: verify replacement and unchanged progress; refresh and confirm exact replacement remains.
6. Done: single taps must advance once; check new activity scroll position. Finish all five; inspect completed state and refresh to confirm it persists.
7. On another date, End → Keep Playing must preserve the session. End → End Date must show cancelled; refresh must preserve cancelled.
8. Try New Date, Change Vibe and Home; evaluate all touch target sizes/spacings and response/pressed states.
9. Mid-session, switch apps for about 30 seconds, return, then lock/unlock and return. Confirm same activity, queue and reveal state, with no reroll.
10. Close/reopen the test tab when safe, using the same URL/profile. Confirm expected restoration or document exact privacy behavior.
11. Briefly rotate landscape, check reachability/overflow, then return portrait.
12. Check a longer production activity and long Reveal: readable text, natural scroll, actions reachable. Example longest prompt DN-CON-015, longest reveal DN-PRE-016; normal composition/Swap may be used to encounter long content without changing code.

## Result record — all physical-device checks pending

| Area | Result / notes |
|---|---|
| Home | NOT RUN |
| Setup | NOT RUN |
| Play — A/B/C/D | NOT RUN |
| Touch targets and double taps | NOT RUN |
| Reveal / refresh restore | NOT RUN |
| Swap / refresh restore | NOT RUN |
| Done / scroll positioning | NOT RUN |
| End / Keep Playing / cancelled restore | NOT RUN |
| Completion / restore / navigation | NOT RUN |
| Background / foreground | NOT RUN |
| Lock / unlock | NOT RUN |
| Tab reopen | NOT RUN |
| Portrait / landscape | NOT RUN |
| Long activity / long Reveal | NOT RUN |
| Performance: GOOD / ACCEPTABLE / POOR | PENDING |

## Human real-device color feedback — separate from automated checks

Cozy warmth, Funny energy, Romantic richness and Competitive decisiveness: PENDING. Background darkness, cream text readability, sage CTA strength, glow intensity, selected-state clarity and brightness/display-type observations: PENDING.

Real-device color energy / premium feel / readability scores: NOT YET PROVIDED.

## Real-device screenshots

Destination: docs/screenshots/phase-6-5-real-device/.

Required actual phone screenshots: Home, selected Setup, standard Play, Predict Reveal, long activity and completion. Imported screenshots: **0**. No emulated screenshots are presented as physical-device evidence. User can attach the screenshots in chat for import when supported.

## Findings and release gate

P0 / P1 / P2 / P3: **not assessed on a physical device yet**. No absence-of-issues claim.

Release recommendation: **HOLD pending phone evidence**. Ready for printable phase: NO. Required: usable core touch flow, no P0/serious clipping, persisted Reveal/Swap/completion, safe background/foreground, accepted phone colors and acceptable performance. No automatic fixes or printable/listing work are authorized by this record.

## Recorded initial working-tree status

```text
M index.html
 M src/App.tsx
 M src/data/defaultGame.ts
 M tests/dateNightContracts.test.mjs
 M tests/sessionComposer.test.mjs
?? docs/DATE_NIGHT_CONTENT_REVIEW.md
?? docs/DATE_NIGHT_PHASE_4_5_BROWSER_AUDIT.md
?? docs/DATE_NIGHT_PHASE_4_GAMEPLAY_STATE.md
?? docs/DATE_NIGHT_PHASE_5_5_VIBE_VISUAL_SYSTEM.md
?? docs/DATE_NIGHT_PHASE_5_6_COLOR_ENERGY.md
?? docs/DATE_NIGHT_PHASE_5_PRODUCT_UX.md
?? docs/DATE_NIGHT_PHASE_6_PRODUCTION_CONTENT.md
?? docs/DATE_NIGHT_PRODUCTION_QA_DATA.json
?? docs/DATE_NIGHT_VISUAL_REVIEW.md
?? docs/screenshots/
?? public/date-night-mark.svg
?? scripts/
?? src/components/DateNightSetup.tsx
?? src/components/dateNightPresentation.ts
?? src/data/cards/date-night-v1.json
?? src/data/manifests/
?? src/data/themes/date-night-warm.json
?? src/date-night.css
?? src/engine/gameplayController.ts
?? src/engine/sessionActions.ts
?? src/theme/vibeTokens.ts
?? tests/dateNightProductionContent.test.mjs
?? tests/dateNightUi.test.mjs
?? tests/fixtures/dateNightInfrastructure.ts
?? tests/helpers/
?? tests/sessionActions.test.mjs
?? tests/vibeVisuals.test.mjs
```
