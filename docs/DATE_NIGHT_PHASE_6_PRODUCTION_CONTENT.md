# Phase 6 — Production Date Night content

Status: PASS. Pack: src/data/cards/date-night-v1.json. Manifest: src/data/manifests/date-night-v1.json. Active loader: src/data/defaultGame.ts. Game version: **2.0.0**, raised from preview 1.0.2. Session schema remains **1** and storage key remains **date-night-engine:v1:session**. Preview saves are rejected and cleared through existing compatibility validation; no migration or Social Game storage access was added.

## Inventory and design

72 active, stable-ID items: 16 Connect, 16 Predict, 16 Play, 16 Challenge and 8 Closers. Ordinary cards have isCloser=false; all eight closers retain categoryId=connect and isCloser=true. Counts below treat closers as their own recipe family rather than adding them to ordinary Connect.

45 Sweet (62.5%) and 27 Flirty (37.5%). Flirty expands eligibility without excluding Sweet. Connect uses 10 Sweet / 6 Flirty rather than the suggested inverse, preserving sufficient warm-up choices for every Sweet configuration while meeting the full-pack distribution. Every item has 2–3 suitable vibes; none is tagged with all four. All 16 Predict activities have specific revealText; no other family has a synthetic reveal.

The voice is warm, direct, gender-neutral and intended for two adults. Activities work at home with one phone, no recording, purchases, alcohol, printing or outside contact. Interaction forms include remembered details, preference discovery, prediction, sound/gesture, role-play, collaboration, invention, recall and affectionate endings. Touch is offered only as an optional shared choice. No names, marriage, children, shared finances, scoring or relationship tests are required.

## Category balance

| Family | Count | Sweet | Flirty | Cozy | Funny | Romantic | Competitive | Duration min–max | Mean | Reveals |
|---|---|---|---|---|---|---|---|---|---|---|
| connect | 16 | 10 | 6 | 10 | 10 | 11 | 9 | 2–7 | 4.69 | 0 |
| predict | 16 | 10 | 6 | 11 | 9 | 11 | 10 | 2–6 | 4.25 | 16 |
| play | 16 | 10 | 6 | 10 | 10 | 11 | 9 | 3–8 | 5.50 | 0 |
| challenge | 16 | 10 | 6 | 9 | 10 | 10 | 10 | 2–7 | 4.44 | 0 |
| closer | 8 | 5 | 3 | 5 | 4 | 5 | 4 | 2–4 | 3.38 | 0 |

## Eligibility, duration and variety matrix

100 deterministic compositions per configuration (1,600 total), using seeds 12345 + sample×7919 and a reproducible LCG injected into the unchanged composer. The script is reproducible with **node scripts/audit-date-night-content.mjs**. Full item frequencies, closer frequencies, eligible-but-unselected IDs, duration histograms and Swap means are in [DATE_NIGHT_PRODUCTION_QA_DATA.json](DATE_NIGHT_PRODUCTION_QA_DATA.json).

Pool counts are Connect / Predict / Play / Challenge / Closer. Totals are metadata estimates, not measured participant times. Every sample hit its target exactly; allowed policies remain 10–18 and 20–35. No timer or exact-equality requirement was added to the engine.

| Configuration | Eligible pools | Compose failures | Min / max / mean minutes | Unique queues /100 | Most frequent item /100 | Max identical queue repeats | Recipes containing Flirty /100 |
|---|---|---|---|---|---|---|---|
| cozy / 15 / sweet | 7 / 8 / 7 / 7 / 3 | 0 | 15 / 15 / 15 | 73 | DN-PLY-003: 43 | 6 | 0 |
| cozy / 15 / flirty | 10 / 11 / 10 / 9 / 5 | 0 | 15 / 15 / 15 | 98 | DN-CON-001: 32 | 2 | 91 |
| cozy / 30 / sweet | 7 / 8 / 7 / 7 / 3 | 0 | 30 / 30 / 30 | 79 | DN-CLO-003: 38 | 3 | 0 |
| cozy / 30 / flirty | 10 / 11 / 10 / 9 / 5 | 0 | 30 / 30 / 30 | 90 | DN-CHA-007: 51 | 4 | 64 |
| funny / 15 / sweet | 7 / 6 / 7 / 6 / 2 | 0 | 15 / 15 / 15 | 30 | DN-PRE-002: 68 | 6 | 0 |
| funny / 15 / flirty | 10 / 9 / 10 / 10 / 4 | 0 | 15 / 15 / 15 | 80 | DN-PRE-002: 49 | 5 | 84 |
| funny / 30 / sweet | 7 / 6 / 7 / 6 / 2 | 0 | 30 / 30 / 30 | 73 | DN-CLO-003: 53 | 3 | 0 |
| funny / 30 / flirty | 10 / 9 / 10 / 10 / 4 | 0 | 30 / 30 / 30 | 97 | DN-PLY-008: 37 | 2 | 89 |
| romantic / 15 / sweet | 6 / 6 / 6 / 5 / 3 | 0 | 15 / 15 / 15 | 55 | DN-CHA-001: 51 | 3 | 0 |
| romantic / 15 / flirty | 11 / 11 / 11 / 10 / 5 | 0 | 15 / 15 / 15 | 96 | DN-CLO-004: 33 | 2 | 95 |
| romantic / 30 / sweet | 6 / 6 / 6 / 5 / 3 | 0 | 30 / 30 / 30 | 31 | DN-CHA-007: 67 | 7 | 0 |
| romantic / 30 / flirty | 11 / 11 / 11 / 10 / 5 | 0 | 30 / 30 / 30 | 87 | DN-CHA-007: 57 | 3 | 90 |
| competitive / 15 / sweet | 5 / 6 / 5 / 6 / 3 | 0 | 15 / 15 / 15 | 46 | DN-PLY-002: 54 | 4 | 0 |
| competitive / 15 / flirty | 9 / 10 / 9 / 10 / 4 | 0 | 15 / 15 / 15 | 80 | DN-PLY-002: 53 | 5 | 75 |
| competitive / 30 / sweet | 5 / 6 / 5 / 6 / 3 | 0 | 30 / 30 / 30 | 38 | DN-PLY-005: 51 | 9 | 0 |
| competitive / 30 / flirty | 9 / 10 / 9 / 10 / 4 | 0 | 30 / 30 / 30 | 85 | DN-CLO-002: 48 | 3 | 86 |

All **16/16** supported configurations work, including Sweet-only. Mean pacing separates 15-minute and 30-minute choices by 15 metadata minutes in each paired configuration. Durations are not interchangeable: shorter activities use a brief exchange; longer activities specify multiple stories, scenes, roles or rounds.

Some deliberately paced activities exceed the typical guidance: one 7-minute Connect teaching exchange, five 6-minute Predict items, four 8-minute Play activities and three 7-minute Challenges. These are long-form exceptions, not all-card defaults. For example, the 8-minute experience restaurant requires both people to perform both roles for three offerings; the 7-minute debate gives each person a minute per topic. Metadata was calibrated with the written scope, not padded silently to reach 30. Real couple timing still needs empirical validation.

## Swap and no-dead-end matrix

Independent candidate counting excludes every queued ID and verifies the aggregate budget for each potential replacement. The canonical Phase 3 selector is then exercised for all five slots of every sampled session: **8,000 successful replacement selections, zero immediate failures**. Values below are the minimum observed candidate counts across each set of 100 sessions.

| Configuration | Connect | Predict | Play | Challenge | Closer | Selector failures |
|---|---|---|---|---|---|---|
| cozy / 15 / sweet | 3 | 4 | 3 | 3 | 2 | 0 |
| cozy / 15 / flirty | 5 | 7 | 6 | 5 | 4 | 0 |
| cozy / 30 / sweet | 6 | 7 | 6 | 6 | 2 | 0 |
| cozy / 30 / flirty | 9 | 10 | 9 | 8 | 4 | 0 |
| funny / 15 / sweet | 5 | 2 | 3 | 2 | 1 | 0 |
| funny / 15 / flirty | 8 | 4 | 5 | 5 | 3 | 0 |
| funny / 30 / sweet | 6 | 5 | 6 | 5 | 1 | 0 |
| funny / 30 / flirty | 9 | 8 | 9 | 9 | 3 | 0 |
| romantic / 15 / sweet | 2 | 3 | 2 | 2 | 2 | 0 |
| romantic / 15 / flirty | 5 | 7 | 6 | 6 | 4 | 0 |
| romantic / 30 / sweet | 5 | 5 | 5 | 4 | 2 | 0 |
| romantic / 30 / flirty | 10 | 10 | 10 | 9 | 4 | 0 |
| competitive / 15 / sweet | 3 | 3 | 2 | 3 | 2 | 0 |
| competitive / 15 / flirty | 7 | 6 | 5 | 6 | 3 | 0 |
| competitive / 30 / sweet | 4 | 5 | 4 | 5 | 2 | 0 |
| competitive / 30 / flirty | 8 | 9 | 8 | 9 | 3 | 0 |

Every sampled ordinary slot has at least two valid alternatives; every closer has at least one. Funny/Sweet has just two eligible closers, so exactly one replacement is its intentional narrowest closer capacity. Infinite Swap and cross-session no-repeat are not promised. History exclusion and atomic application remain covered by the unchanged Phase 3/4 regression tests.

## Selection concentration and limitations

No item appeared in more than 68% of any 100-session sample. No exact queue appeared more than 9 times. Unique complete queues ranged from 30 to 98 per 100 draws. All 72 items appeared somewhere across the 1,600 sessions. These checks use editorial watch lines (over 75% single-item share or fewer than 30 unique queues), not claims of universal statistical fairness.

Funny/15/Sweet and Romantic/30/Sweet are the narrowest replay pools (30 and 31 sampled unique queues). They pass the stated watch lines, but have less variety than broader Flirty configurations. Some eligible items never occur in a particular sample group because closest-target selection prefers other duration combinations; full IDs are disclosed in the JSON. This is expected pacing bias, not hidden widening or globally unreachable content. Flirty recipes contain at least one Flirty item in 61–97% of final sample groups; a particular Flirty date can still be entirely Sweet by design.

The analysis covers 100 seeded representative sessions per configuration, not every possible history after repeated swaps. No unsupported configuration was quietly broadened. No content/engine compatibility defect required an engine change.

## Semantic duplication and wording review

All 72 prompts and all 16 reveals were reviewed for distinct purpose and interaction form. Exact prompt clones: 0. Structural review compares content-word Jaccard similarity over every pair (2,556 pairs), with a 0.60 flag threshold; no pair reaches it. This is a lexical aid, not a semantic detector. Closest lexical pairs:

| Pair | Jaccard |
|---|---|
| DN-CON-005 / DN-CON-013 | 0.227 |
| DN-PRE-001 / DN-PRE-004 | 0.179 |
| DN-PRE-015 / DN-PRE-016 | 0.156 |
| DN-PLY-015 / DN-CHA-015 | 0.152 |
| DN-CON-002 / DN-PRE-006 | 0.148 |

Manual related-mechanic decisions:

- Private attention signal (PLY-011) was too close to an early “come closer” gesture challenge. CHA-015 was rewritten as seated slow-motion date preparation with partner narration.
- CON-015 changed from another evening-plan exercise to noticing three attraction details, separating it from PRE-007 and PLY-015.
- Future-date concepts remain in PRE-007 (predict a partner’s plan), PLY-015 (branching collaborative fiction) and CLO-004 (one actual no-cost invitation). Their tasks and outcomes differ.
- Media motifs remain limited and distinct: CON-002 retells a day, PLY-006 performs a tiny film, CLO-007 closes with an invitation trailer. They are not three copies of the same question.
- Several Predict cards intentionally share “guess, then reveal” mechanics; the subjects differ (comfort, absurd utilities, food, scenarios, anticipation and invitation), and reveal instructions produce a specific interaction rather than generic answer text.

There are **45 distinct opening words**. Most frequent: Make (6), Build (5), Create (4), Invent (4); only one prompt starts Guess, none starts Tell me or What. Wording variety does not replace editorial judgment. Classic memory/word-chain activities are scored 3 for originality rather than described as novel.

## Per-item editorial quality

[DATE_NIGHT_CONTENT_REVIEW.md](DATE_NIGHT_CONTENT_REVIEW.md) contains all 72 items grouped by family and a separate 72-row internal score table for clarity, fun, couple relevance, vibe fit, mobile readability, replay value and originality (1–5). Every item scores at least 4 on clarity/couple relevance and at least 3 on fun/replay/originality. These are author assessments, not customer ratings, and are excluded from runtime JSON.

## Revisions during QA

- CLO-003 was expanded into a genuine four-minute shared sign-off ritual, correcting an initial Funny/30/Sweet 95% preference for the other longer closer. Final closer shares are reported in the raw matrix.
- Short preference/warm-up items gained only additional defensible mood memberships, never all four, to improve narrow Sweet coverage.
- PLY-005 now includes acting out six arrivals while seated; PLY-009 requires both roles for all three offerings. Their eight-minute estimates reflect that scope.
- CON-007 was tightened to six minutes; PLY-006 includes an encore at seven. CHA-010 specifies three roughly two-minute chains; PLY-010 is a six-minute concise collaborative mystery. Sampling was rerun after these pacing revisions.
- CHA-004 was rewritten from “without describing words” to a concrete contrast between an action and a label for clarity.

## Long-content browser QA

The longest ordinary prompt in each family, longest closer, and longest reveal were rendered in canonically validated, budget-compatible QA sessions at **390×844, 768×1024 and 1440×900**. These sessions were intentionally installed in the Date Night key for inspection; no UI, engine or unrelated localStorage was modified. All 18 checks passed: no horizontal overflow, no clipped prompt/reveal, natural scrolling and keyboard-reachable actions.

| Case | ID | Characters | Mobile document height | 390 | 768 | 1440 |
|---|---|---|---|---|---|---|
| connect | DN-CON-015 | 222 | 1099px | PASS | PASS | PASS |
| predict | DN-PRE-008 | 191 | 1093px | PASS | PASS | PASS |
| play | DN-PLY-009 | 202 | 1059px | PASS | PASS | PASS |
| challenge | DN-CHA-007 | 219 | 1138px | PASS | PASS | PASS |
| closer | DN-CLO-008 | 205 | 1101px | PASS | PASS | PASS |
| reveal | DN-PRE-016 | 148 | 1334px | PASS | PASS | PASS |

Longest prompt: 222 characters. Longest reveal: 148. Mobile documents reach at most 1,334px (about 1.6 viewport heights), with actions reachable through ordinary scroll/Tab. Typography, spacing, cards and approved Phase 5.6 CSS/tokens were preserved rather than shrunk to fit content.

## Production browser walkthroughs

Real localhost browser walkthroughs passed for Cozy/15/Sweet, Funny/15/Flirty, Romantic/30/Flirty and Competitive/30/Sweet. All five activities were inspected, Predict Reveal used, Predict Swap applied, exact saved replacement state restored on refresh, and final Done ended completed. The routes shared some eligible warm-up content but diverged through the other activities: comfort/story exchange, absurd invention, attraction/experience creation and improvisation/rivalry were all represented. Vibe is a curated eligibility filter, not an exclusive partition or a guarantee of a Flirty card.

Actual original queues, prompts and replacement IDs are in [browser-qa.json](screenshots/phase-6-review/browser-qa.json). Longest-case state installation is separately identified, not presented as natural composition. The production version rejected the previous preview save on reload as expected.

Console errors: **0 observed**. Runtime exceptions: **0 observed**. Failed requests/HTTP errors: **0 observed**. React warnings: **0 observed**. Event buffers were checked after each flow/case without truncation.

## Screenshots

29 real browser PNGs under docs/screenshots/phase-6-review/: four completed walkthroughs; six longest cases at each of three widths; six additional mobile action-area captures; and one naturally composed production Connect preview. Native viewport screenshots preserve actual focus outlines and scroll position; no product mockups or retouching. The in-app capture surface scales slightly (mobile images around 375px wide despite the 390px layout override).

## Verification and scope

- pnpm run typecheck: PASS.
- pnpm test: PASS (450 tests: previous 425 plus 25 production checks).
- pnpm run build: PASS.
- git diff --check: PASS.
- Existing contract/action/composer tests now explicitly load the preserved test-only infrastructure fixture. Assertions and engine behavior were not weakened. Legacy tests remain untouched.
- Only runtime UI copy changed: preview/sample labels now truthfully identify 72 activities / Made for two. No redesign.
- Composer, actions, controller, storage, contracts, CSS/theme and package/lockfile fingerprints match task start. SchemaVersion remains 1.
- Original Social Game Engine was never targeted or modified. No commit, push, deployment or Phase 7 work.
- HEAD before/after remains 227ebc22704214034c5d7942109a412ae6173c4e; pre-existing uncommitted work was preserved.

## Known limitations and next review

Durations and internal quality scores are editorial estimates; no couple timing study or customer panel was conducted. Some experiences favour imagination and spoken collaboration, with quieter alternatives available via Swap. Sweet-only replay is narrower in a few configurations, explicitly quantified above. The supported 72-item inventory is ready for human editorial sign-off and separately authorized Phase 7 planning; deployment, listing assets, analytics and backend remain out of scope.

## Screenshot index

- [competitive-completed.png](screenshots/phase-6-review/competitive-completed.png)
- [cozy-completed.png](screenshots/phase-6-review/cozy-completed.png)
- [funny-completed.png](screenshots/phase-6-review/funny-completed.png)
- [longest-challenge-1440.png](screenshots/phase-6-review/longest-challenge-1440.png)
- [longest-challenge-390-actions.png](screenshots/phase-6-review/longest-challenge-390-actions.png)
- [longest-challenge-390.png](screenshots/phase-6-review/longest-challenge-390.png)
- [longest-challenge-768.png](screenshots/phase-6-review/longest-challenge-768.png)
- [longest-closer-1440.png](screenshots/phase-6-review/longest-closer-1440.png)
- [longest-closer-390-actions.png](screenshots/phase-6-review/longest-closer-390-actions.png)
- [longest-closer-390.png](screenshots/phase-6-review/longest-closer-390.png)
- [longest-closer-768.png](screenshots/phase-6-review/longest-closer-768.png)
- [longest-connect-1440.png](screenshots/phase-6-review/longest-connect-1440.png)
- [longest-connect-390-actions.png](screenshots/phase-6-review/longest-connect-390-actions.png)
- [longest-connect-390.png](screenshots/phase-6-review/longest-connect-390.png)
- [longest-connect-768.png](screenshots/phase-6-review/longest-connect-768.png)
- [longest-play-1440.png](screenshots/phase-6-review/longest-play-1440.png)
- [longest-play-390-actions.png](screenshots/phase-6-review/longest-play-390-actions.png)
- [longest-play-390.png](screenshots/phase-6-review/longest-play-390.png)
- [longest-play-768.png](screenshots/phase-6-review/longest-play-768.png)
- [longest-predict-1440.png](screenshots/phase-6-review/longest-predict-1440.png)
- [longest-predict-390-actions.png](screenshots/phase-6-review/longest-predict-390-actions.png)
- [longest-predict-390.png](screenshots/phase-6-review/longest-predict-390.png)
- [longest-predict-768.png](screenshots/phase-6-review/longest-predict-768.png)
- [longest-reveal-1440.png](screenshots/phase-6-review/longest-reveal-1440.png)
- [longest-reveal-390-actions.png](screenshots/phase-6-review/longest-reveal-390-actions.png)
- [longest-reveal-390.png](screenshots/phase-6-review/longest-reveal-390.png)
- [longest-reveal-768.png](screenshots/phase-6-review/longest-reveal-768.png)
- [production-connect.png](screenshots/phase-6-review/production-connect.png)
- [romantic-completed.png](screenshots/phase-6-review/romantic-completed.png)

## Changed files in Phase 6

- src/data/cards/date-night-v1.json
- src/data/manifests/date-night-v1.json
- src/data/defaultGame.ts
- src/App.tsx (two truthful inventory labels only)
- tests/fixtures/dateNightInfrastructure.ts
- tests/dateNightContracts.test.mjs, tests/sessionComposer.test.mjs, tests/sessionActions.test.mjs (fixture import only)
- tests/dateNightUi.test.mjs (fixture import and production-label assertions)
- tests/dateNightProductionContent.test.mjs
- tests/helpers/productionContentAudit.mjs
- scripts/audit-date-night-content.mjs
- docs/DATE_NIGHT_CONTENT_REVIEW.md
- docs/DATE_NIGHT_PHASE_6_PRODUCTION_CONTENT.md
- docs/DATE_NIGHT_PRODUCTION_QA_DATA.json
- docs/screenshots/phase-6-review/ (29 PNGs, browser-qa.json and validated longest-sessions.json)
