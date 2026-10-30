# Date Night Phase 5 — product UX

Status: PASS. Date: 30 October 2026.
Repository: E:\Etsy\GitHub\date-night-engine\date-night-engine.
HEAD before/after: 227ebc22704214034c5d7942109a412ae6173c4e. No commit, push or deployment.
The existing uncommitted Phase 4 implementation and browser audit were preserved. No original Social Game Engine operations were performed.

## Design direction

Warm charcoal, cream typography, soft neutral surfaces and restrained sage accents replace the pink-heavy interface. Georgia and system sans-serif fonts are used without external font requests or new dependencies. A simple Date Night mark is shared by the header and new SVG favicon. The document title is Date Night — Build Your Night, with a Date Night description and matching theme-color metadata.

Home communicates Stop planning. Start your date.; One guided date night. Five activities. Zero planning.; the three-choice explanation; BUILD YOUR DATE; and 5 guided activities • 1 phone • 2 people. A five-step visual recipe explains the shape of the night. No visible Girls Night, Spill or Sip, chaos/confession framing, player statistics or drinking language remains in the active interface. Legacy modules and assets remain isolated for regression tests; no broad cleanup was attempted.

## Screens and interactions

- Home: two-column hero/recipe at larger widths, a stacked mobile landing with the main CTA before the recipe. Clear preview labelling avoids presenting this as a finished content release.
- Setup: semantic fieldsets and native radio groups for Vibe, Time and Intensity, presented as selectable cards. Selected cards have a border, filled surface and checked radio. Native arrow-key group navigation is retained. Time explains Quick Date/Full Date; Sweet/Flirty descriptions explain the experience and that Flirty includes Sweet. No selects or customer-visible ceiling terminology.
- Play: one shared card architecture, uppercase stage labels, stage-specific subtitle/instructions/accent, Activity X of 5 and a decorative five-segment indicator derived from the existing slot. Prompts are large and readable. No history-based completion counters are shown.
- Reveal: distinct high-contrast region with 18px text and generous line height. Reveal and Done remain separate actions. The disabled REVEALED button reflects persisted state.
- Done: primary filled action. Reveal is secondary; Swap has its own helper row; End is separated below a divider with lower emphasis.
- Swap: replacement appears with a concise status announcement. Exhaustion focuses a polite notice and disables NO MORE SWAPS for the current item. There is no verbose success message or automatic progression.
- End: labelled inline nonmodal alertdialog, explanatory saved-as-ended copy, KEEP PLAYING as default focus and a separated END DATE action. Escape cancels; Tab reaches confirmation. Both click cancellation and Escape restore focus to End. No engine semantics change.
- Completed: Your date is complete, five-activity explanation, emotional supporting copy, NEW DATE / CHANGE VIBE / HOME.
- Cancelled: Date ended and You stopped this date early, without a completion claim; same navigation options.

## Focus and live announcements

The UI focuses the new screen heading on navigation, Done, Swap, completion and cancellation. Reveal moves focus into the labelled reveal region rather than losing it when its button becomes disabled. A concise polite status announces each new activity and ordinal, Swap replacement and reveal readiness. Focused reveal content provides the actual revealed text. Unavailable Swap/storage notices use a separate polite status; they are not duplicated into the global status region. Decorative elements are excluded from announcements.

Native radio inputs retain arrow-key interaction; all action controls are buttons. Fieldsets/legends label the three choices. All focusable controls have visible focus styling. End confirmation is inline and nonmodal, so no modal focus trap is claimed or added. Confirmation receives safe default focus, supports Escape and restores focus correctly. No business state or persistence is performed by React state updater callbacks or focus effects.

## Engine guarantees retained

The composer, sessionActions, gameplayController, sessionStart, validators, schemas, storage adapter and configuration contract are unchanged by Phase 5. All actions still call the existing controller with the rendered revision. The full queue is composed and saved before Play; failed writes do not expose candidate progression. No reroll on render/refresh, no new persistence key, no schema change, no history/scoring model, and no composition-policy change were introduced.

The warm theme is a validated presentation theme, not a change to gameplay manifests or saved sessions. Existing content IDs, duration metadata, moods, intensities, reveals and game version remain unchanged from Phase 4.

## Placeholder presentation

The underlying 40-item infrastructure fixture is unchanged. A deterministic UI presenter substitutes clearly marked demonstration wording only for recognized synthetic IDs with the known infrastructure text prefix. Each of the eight alternatives in each activity family has distinct preview wording, so a Swap visibly changes the activity. Preview edition and Preview · sample activities remain visible.

This is UI-only demonstration phrasing, not the final 72-item pack or a content-balancing exercise. Real/non-fixture cards display their actual prompt and reveal unchanged. Unknown fixture-like IDs also pass through unchanged. The presenter cannot introduce reveal availability where the card contract has no reveal. Phase 6 must replace the synthetic inventory and validate real duration/vibe/intensity/replacement coverage; the current sample copy makes no production suitability claim.

## Browser QA

Local command: pnpm dev, unchanged script. URL: http://localhost:5173/.
Browser: visible ChatGPT in-app Chromium browser, with DOM/accessibility inspection and available CDP network/runtime monitoring.

Complete flow passed:
Home → Setup → Build My Date → Connect → Done → Predict → Reveal → Swap → Done → Play → Done → Challenge → Done → Closer → Done → Completed → New Date.

Additional checks passed:
- Setup choices changed by native radio arrow keys, including Funny, 30 min and Flirty; keyboard Enter started the date.
- New screen/activity headings received focus; status text included the correct activity and progress.
- Reveal focused Your reveal and announced readiness. Refresh retained revealed content.
- Swap focused the activity heading, announced A new activity is shown, reset Reveal, changed the visible prompt, and the replacement persisted after refresh.
- Completed heading received focus; completion survived refresh rather than restarting.
- New Date returned to Connect with the existing controller reset semantics.
- End → KEEP PLAYING and End → Escape both preserved the active activity and returned focus to End.
- End confirmation defaulted to KEEP PLAYING; Tab reached END DATE; keyboard confirmation produced Date ended and the cancelled state survived refresh.
- Change Vibe retained editable configuration and focused Setup; Back to Home focused Home.
- Exhausted Swap produced a polite customer-facing notice, focused that notice and disabled further Swap without advancing progress.
- Reduced-motion emulation reported matching preference, no animation and 0s transitions; the temporary override was cleared.

Console errors: 0 observed. Runtime exceptions: 0 observed. React warnings: 0 observed. Failed requests/HTTP errors: 0 observed. The long debugging trace buffer could truncate old events; a fresh final reload was therefore captured separately: 35 responses, no failures/exceptions, non-truncated trace, and an empty console error/warning list. No visible render failure or broken asset.

A direct debugging storage read was unavailable during this turn; visible restore was verified in the browser and exact session persistence remains covered by the unchanged engine regression tests. Actual screen-reader and physical touch-device certification were not performed.

## Responsive QA and screenshots

| Viewport | Result | Observations |
| --- | --- | --- |
| 390 × 844 | PASS | Two-column radio-card choices remain readable; measured cards 108px high. No horizontal overflow. Home CTA is 52px high and within the first viewport. Prompt and distinct Reveal region wrap cleanly; vertical scrolling is intentional for setup and longer revealed activities. Done/Reveal wrap intentionally; Swap and End are separate rows. Completion fits with clear actions. |
| 768 × 1024 | PASS | Setup options and typography fit in the constrained content width. Play and inline confirmation are readable; KEEP PLAYING/END DATE fit in an intentional action row. |
| 1440 × 900/1000 | PASS | Hero/recipe use the desktop width; Play card remains capped at 720px, avoiding over-wide prompts. Standard action buttons measured 52px high. Consistent header/footer and screen margins. |

Browser screenshots were captured inline for desktop Home, mobile setup/Play/Reveal/completion/Home, and tablet confirmation/setup. A viewport switch briefly yielded a scaled transition capture; settled screenshots and DOM metrics were used for conclusions. The browser screenshot file-export limitation from Phase 4.5 remains; no PNG files are claimed in this repository. Screenshots are visible in the conversation and the localhost tab is retained as a deliverable. Temporary viewport overrides were reset.

## Automated verification

- pnpm run typecheck: PASS.
- pnpm test: PASS, 412 tests including all existing Phase 2–4 and retained legacy/SSR tests.
- pnpm run build: PASS; dist output produced.
- git diff --check: PASS.

Twelve focused product UI/presentation tests were added: Home identity/value/preview copy, native radio group structure and selected options, metadata, canonical theme parsing, distinct/no-mutation presentation for each of five stage families, real-content pass-through, unchanged reveal availability and unknown-ID pass-through. Existing tests were not weakened or edited. No new package, external font, global installation or script change.

The normal shell wrapper remained unavailable, but the existing commands ran successfully through the available local execution runtime. There was no source workaround for environment restrictions.

## Phase 5 files

- index.html
- public/date-night-mark.svg
- src/App.tsx
- src/components/DateNightSetup.tsx
- src/components/dateNightPresentation.ts
- src/data/themes/date-night-warm.json
- src/date-night.css
- tests/dateNightUi.test.mjs
- docs/DATE_NIGHT_PHASE_5_PRODUCT_UX.md

The working tree still includes the earlier uncommitted Phase 4 files and audit. Only the above paths were written for Phase 5. No commit was created.

## Known limitations and Phase 6 prerequisites

The interface is ready for production-content work, not deployment. Sample presentation and universal-mood synthetic coverage must not be mistaken for final authored/balanced content. Physical-device/screen-reader testing and production-length prompt/reveal checks remain appropriate once real content is available. Setup drafts are still transient, and controller revision guards remain single-instance rather than cross-tab locks, as before.

Phase 6 should supply the final real content and validate all 16 configuration budgets plus replacement capacity, then verify the new content displays verbatim with correct reveals and readable lengths. Do not add analytics, accounts, backend, hosting, SEO integration or relationship history as part of this completed phase. Phase 6 has not begun.
