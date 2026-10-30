# Phase 6.8 - Targeted corrections

Status: **PASS**. Four production prompts edited, one fixed printable selection replaced, no engine or visual change. Synthetic-panel findings were hypotheses, not customer research; this pass does not claim validated reduction in refund risk or actual couple preference.

## Scope and addressed issues

Source of truth: [Phase 6.7 report](DATE_NIGHT_PHASE_6_7_SYNTHETIC_PANEL.md) and [panel data](DATE_NIGHT_SYNTHETIC_PANEL_DATA.json), preserved as historical pre-correction observations.

- I01/I08: customer handoff explains browser access, primary app versus bonus PDFs, identical edition content and paper/printer choices.
- I07/I06: concrete interactive value versus four fixed offline journeys; no 72-item printable or inflated file-count claim.
- I09/I13: finite replay and non-explicit Flirty-ceiling expectations, with no global no-repeat or guaranteed Flirty item claim.
- I02/I12: narrow performance audit; quiet alternatives added sparingly, not to every activity.
- I03: Romantic paper keeps the chemistry scene but replaces the adjacent invitation-delivery challenge with existing DN-CHA-013.
- I11: CLO-001 now asks for sharing a spoken postcard, not reading it.

## Delivery, file chooser and product explanation

[DATE_NIGHT_CUSTOMER_HANDOFF.md](DATE_NIGHT_CUSTOMER_HANDOFF.md) is the draft customer handoff. It makes the browser WebApp primary, states no app-store download, explains opening/reloading with internet, limits save/restore to browser storage, and identifies static, non-editable offline PDFs as the bonus. A4 and Letter are paper sizes; Color and Ink-Saver are printer-use choices. All four files contain the same 20 activities / four dates, not the full 72.

The handoff contains a concise chooser: use the A4 edition for A4 paper, Letter for Letter; choose Color for visual appeal or Ink-Saver for less ink. Only one matching edition is needed. It does not add pages or redesign the PDFs.

Unresolved access URL, access duration/entitlement, launch login/account terms, any device-sync or offline-app offer, subscription terms, hosting guarantees, support and gift handoff are explicitly **TO BE DEFINED BEFORE LAUNCH**. No nonexistent feature or permanent hosting guarantee is invented. The draft is not ready to send until these fields are resolved.

[DATE_NIGHT_VALUE_PROPOSITION.md](DATE_NIGHT_VALUE_PROPOSITION.md) explains the existing 72-item, four-vibe, five-stage WebApp, 15/30 pacing, Sweet/Flirty, dynamic queue, Reveal, eligible Swap and local save/restore. It contrasts the four fixed, phone-free printable dates. It is product explanation for later reuse, not listing assets or a pricing/deployment task.

Replay copy says activities can reappear across dates; composed-session IDs remain unique and session-local Swap exclusions remain. Flirty is tasteful, playful, a little bolder and non-explicit; it permits Sweet + Flirty without guaranteeing a Flirty card. Time options remain pacing estimates, not elapsed-duration guarantees.

## Production edits - exactly four IDs

| ID | Before | After |
| --- | --- | --- |
| DN-PLY-001 | Make a soundscape for a place you would both like to be. Add one sound each in turn until the imaginary scene feels complete. | Build a soundscape for a place you would both like to be. Take turns making or naming one sound until the imaginary scene feels complete. |
| DN-CHA-001 | Show how your day felt using only your hands and face. Let your partner translate, then swap roles and finish with a gesture for how you want tonight to feel. | Describe your day in three gestures or three words. Let your partner interpret them, then exchange roles and choose one gesture or word for how you want tonight to feel. |
| DN-CLO-001 | Make a spoken postcard from tonight: each choose a moment, a detail and a feeling you would put on it. Read your versions to each other and end with one line you would keep. | Make a spoken postcard from tonight: each choose a moment, a detail and a feeling you would put on it. Share your versions with each other and end with one line you would keep. |
| DN-CLO-003 | Invent a short sign-off for tonight using a detail you each enjoyed. Trade the stories behind your choices, combine them into one phrase and try it in two ridiculous voices before saying goodbye. | Invent a short sign-off for tonight using a detail you each enjoyed. Trade the stories behind your choices, combine them into one phrase and choose a playful or quiet way to say it together to end the date. |

Only text changed. All 72 IDs, active flags, categories, types, intensities, moods, duration estimates, closer flags, reveals and pack ordering remain identical. Game version stays 2.0.0 and session schema remains 1: wording clarifications with stable IDs/metadata do not invalidate existing sessions. No migration or storage behavior change.

## Performance audit decisions

Eight priority/clarity entries and twenty-three clearly related entries were reviewed. “KEEP” does not mean suitable for every couple; it means the mechanic is intentional, understandable and not a reason for a blanket quiet-mode rewrite.

| Priority ID | Decision | Reason |
| --- | --- | --- |
| DN-PLY-001 | ADD OPTIONAL QUIET ALTERNATIVE | Making or naming sounds keeps a shared scene interactive without requiring sound performance. |
| DN-CLO-003 | SOFTEN | Keep a shared sign-off; playful or quiet delivery replaces mandatory ridiculous voices and goodbye. |
| DN-CHA-001 | ADD OPTIONAL QUIET ALTERNATIVE | Three words or three gestures gives an equally short active interpretation task. |
| DN-CHA-007 | KEEP | Already descriptive dialogue with questions; no acting, audience or closed-eye ritual required. Long-form imagination remains a valid choice. |
| DN-PLY-008 | KEEP | Radio improv is an intentional Funny/Competitive centerpiece; removing performance would remove the mechanic. |
| DN-PLY-013 | KEEP | Retain one clearly described chemistry scene; reduce fixed paper concentration by changing its following Challenge. |
| DN-CHA-012 | KEEP | Tasteful performance remains an optional app selection; remove it from the fixed Romantic paper sequence, not the 72-item library. |
| DN-CLO-001 | SOFTEN | Clarify spoken sharing, with no writing or reading requirement. |

| Related ID | Decision | Reason |
| --- | --- | --- |
| DN-CON-003 | KEEP | Greeting already offers a phrase, gesture or sound; no extra disclaimer needed. |
| DN-CON-006 | KEEP | Dramatic retelling is the explicit playful mechanic; retain Funny identity. |
| DN-CON-008 | KEEP | Already offers a sound, hand shape or memory method, with seated practice. |
| DN-CON-014 | KEEP | A deliberately unconvincing excuse is mild Flirty play, not a real demand to sit closer. |
| DN-PRE-008 | KEEP | Hypothetical roles and a brief enactment fit Funny/Competitive; no content safety defect. |
| DN-PLY-002 | KEEP | Collaborative invention/pitch remains a strong Funny task; do not flatten it. |
| DN-PLY-005 | KEEP | Seated imagined travel is low physical risk; full improv route remains intentional. |
| DN-PLY-006 | KEEP | Tiny-film performance is explicit, not hidden in the task; keep variety. |
| DN-PLY-009 | KEEP | Guest/server role exchange is the defined long centerpiece, not a mandatory global style. |
| DN-PLY-012 | KEEP | Museum pitch is a playful appreciation form for Funny/Romantic. |
| DN-PLY-015 | KEEP | Two-choice branching story is reciprocal and already easy to describe rather than act. |
| DN-PLY-016 | KEEP | Harmless-mishap rescue is intended comedy, not humiliation. |
| DN-CHA-002 | KEEP | Brief fancy-name delivery is appropriate Funny/Competitive energy. |
| DN-CHA-003 | KEEP | Tiny hand celebration is a small energy shift, not the longer mime task; observe rather than rewrite. |
| DN-CHA-005 | KEEP | Sound memory needs sound to function; replacing it with conversation would destroy the challenge. |
| DN-CHA-006 | KEEP | Award speech is explicitly performative and serves Funny/Romantic rather than every date. |
| DN-CHA-011 | KEEP | Three smiles are low-verbal Flirty play; no mandatory touch or coercion. |
| DN-CHA-013 | KEEP | Five-word guessing is an active but quieter alternative to dramatic delivery; select for paper. |
| DN-CHA-014 | KEEP | Cushion pitch is intentionally absurd, suited to willing performers. |
| DN-CHA-015 | KEEP | Seated slow-motion scene remains explicitly playful, safe and optional by selection/Swap. |
| DN-CHA-016 | KEEP | Charm relay is clearly Flirty, reciprocal and performance-forward; not placed in corrected fixed paper. |
| DN-CLO-002 | KEEP | Affectionate review is a light shared ending, not serious scoring. |
| DN-CLO-008 | KEEP | Overconfident invitation is intentionally playful; the real acceptable invitation is the conclusion. |

No production item was replaced or removed. Three performance-related prompts changed (two quiet routes, one softer ending); the fourth edit is the spoken-postcard clarification. Radio, debate, sound memory, Funny absurdity, Romantic chemistry, seated action and Cozy imagination remain. No new filter or global performance rule was added.

## Real-world content questions - editorial checks, not new user research

| Changed ID | Understand without explanation? | Participation choice | Still interactive/fun? | Vibe fit | Duration rationale |
| --- | --- | --- | --- | --- | --- |
| DN-PLY-001 | Yes: alternate one sound at a time. | Make a sound or name it; no defensive disclaimer. | Both build a shared soundscape, not just answer a question. | Cozy/Funny/Romantic still support an imagined place. | 3 min for alternating additions and completing the scene. |
| DN-CHA-001 | Yes: three gestures or three words, then interpret. | Choose a verbal or gestural version. | The partner still decodes, exchanges roles and sets a tone. | Cozy/Romantic/Competitive remain gentle and playful. | 2 min for two short interpretations and an ending word/gesture. |
| DN-CLO-003 | Yes: choose a detail, combine a phrase, say it together. | Playful or quiet delivery is an equal option. | A custom joint sign-off preserves Funny creativity. | Cozy/Funny remain supported; no louder ending required. | 4 min includes exchanging the stories behind each detail and forming a phrase. |
| DN-CLO-001 | Yes: choose three details and share aloud. | No writing, reading, acting or physical intimacy required. | Both create a spoken postcard together. | Cozy/Romantic ending remains intentional. | 4 min for two versions and one shared line. |

These are reasoned editorial judgments. A new real-couple test was not performed, and the synthetic scores were not automatically raised after editing.

## Romantic printable correction

Option A selected: retain one performance-forward activity and replace the other with an existing production choice.

- Connect DN-CON-015 -> Predict DN-PRE-013 -> Play DN-PLY-013 -> **Challenge DN-CHA-013** -> Closer DN-CLO-006.
- Previous Challenge DN-CHA-012 remains unchanged in the WebApp; it is no longer in the fixed Romantic page.
- New Challenge is a five-word destination guessing exchange, not another acted invitation.
- All five selections are still Romantic-compatible and Flirty. No Sweet flattening or explicit content was added.
- Twenty distinct printed IDs and the five-slot sequence remain; printable source revision is now 2, still based on game 2.0.0.
- CLO-001 and CLO-003 wording is synchronized into the printable JSON and all editions. Paper uses “exchange roles” in CHA-013 to avoid a Swap-control reading.

The current [content map](DATE_NIGHT_PRINTABLE_CONTENT_MAP.md) and [72-item review](DATE_NIGHT_CONTENT_REVIEW.md) reflect these edits. The initial Phase 7 report is labeled historical; Phase 6.7 remains unchanged as pre-fix evidence.

## Regression results

- Schema, unique/active inventory 72, exact 16/16/16/16 ordinary + 8 closer counts: PASS.
- Sweet/Flirty counts: 45/27, unchanged; sixteen Predict reveals retained.
- Vibe coverage and all 16 configurations: PASS.
- 100 seeded compositions per configuration, 1,600 total: results **exactly identical** to the prior QA JSON.
- Zero composition failures and zero immediate canonical replacement failures across 8,000 slot checks.
- Every sampled ordinary slot retains at least two alternatives; every closer at least one.
- Every sample total remains exactly 15 or 30 metadata minutes; duration policy and actual-time caveats unchanged.
- Unique queues remain 30-98 per 100 draws; max individual sample share 68%, max identical queue repeats 9. All 72 IDs occur somewhere across the sample set.
- Semantic token-duplication/exact prompt checks: PASS via existing production tests. No new near-clone introduced; old panel concerns are editorial preferences, not automatic removals.
- pnpm run typecheck: PASS.
- pnpm test: PASS, **450/450**, no test assertions weakened or changed.
- pnpm run build: PASS. CSS asset hash remains index-CLAXrJ45.css; JS changes only because bundled content text changes.
- git diff --check: PASS.

## PDF regeneration and print QA

All four affected editions were regenerated through the **unchanged** generator: A4 Color, A4 Ink-Saver, US Letter Color and US Letter Ink-Saver. Each remains six pages with the same cover, Quick Start and one page per vibe. Typography, palette, margins, section hierarchy and architecture are unchanged.

The generator validates all twenty printed texts and comparison instructions, correct slot ordering, unique source IDs, vibe/intensity compatibility and MediaBoxes. Subsequent PDF extraction confirms current wording and rejects the stale spoken/read instruction, forced ridiculous-voice goodbye and old Romantic invitation challenge wording.

All **24 regenerated pages** were rendered with Poppler and visually inspected through complete color/ink-saver page overviews for both sizes. No clipping, overlap, missing reveal comparison, stale selected prompt or blank page observed. Body remains 13 pt; Predict comparison 12.3 pt. Ink-saver retains K-only drawing operators and white surfaces.

Evidence: docs/printable-qa/phase-6-8/ contains 24 page PNGs, four overviews and verification.json. output/pdf/ contains the four current PDFs with unchanged filenames. Digital print QA passed; no new physical printer proof is claimed.

## Intentionally not addressed

- No engine, actions, controller, storage, schema, durations or Swap/Reveal semantics changed.
- No layout, typography, palette, visual theme, PDF architecture or generator change.
- No broad rewrite, difficulty system, quiet-content filter, scorekeeping, timer or cross-session history.
- Competitive game-depth preference and actual elapsed duration remain observation topics; existing copy already limits these promises.
- No price decision based on synthetic medians. No second synthetic panel or claimed customer validation.
- No Etsy gallery, listing assets, deployment or production hosting setup.

## Integrity and remaining risks

Task-start/final fingerprints confirm unchanged protected engine/contract/storage files, App, Setup, CSS/vibe tokens, default loader, package/lockfile and PDF generator. Original Social Game Engine was not targeted or modified. HEAD remains 227ebc22704214034c5d7942109a412ae6173c4e; no commit/push. Pre-existing working-tree changes are preserved.

**Remaining P1 launch gate:** the real customer-facing access URL, access/commercial terms, support route and handoff still need decisions and an end-to-end check before publication. Documentation marks these honestly; this task does not implement access/hosting. Do not ship the draft with placeholders.

Content-fit and printer variation remain real-world validation risks, not known blocking defects. Some intentional performance survives, and the Romantic page still contains one chemistry scene. Quiet alternatives are sparse by design rather than flattening the whole pack.

**Ready for Etsy launch-asset preparation: YES**, after review and separate authorization, using only verified claims. **Ready to publish customer access: not established** until the remaining access fields are resolved and tested. No launch assets were begun automatically.

Next action: review the revised handoff and content, define the remaining access details, then separately authorize launch-asset work.
