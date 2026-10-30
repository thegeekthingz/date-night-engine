# Date Night Phase 3 — session composer

Baseline: `bbd9757c4fc9223ab1dbe7b0295786f53a03bbd5`, initially clean.
Implementation is uncommitted and confined to the independent Date Night repository.
No original Social Game Engine files, dependencies, tests, Git state, storage behavior or
deployment were accessed or modified by this task. No dependencies, package scripts or hosting
configuration were changed. Phase 4 has not begun.

## Responsibilities and APIs

`src/engine/sessionComposer.ts` owns eligibility, slot pools, complete queue composition,
duration optimization, closer reservation, unique selection, injected randomness, duration
calculation, replacement selection and the 16-configuration coverage helper.

- `buildSlotPools(context, configuration)` validates content/configuration and returns eligible
  candidates per slot, without selecting anything.
- `composeSession(context, configuration, random = Math.random)` returns either
  `{ ok: true, queue, totalDurationMinutes }` or `{ ok: false, reason }`.
- `selectReplacementForSlot(context, session, slotIndex = session.currentSlot, random = Math.random)`
  returns a new candidate queue, total, replacement ID and retired ID, or `no_replacement`.
- `getQueueDuration(queue, context)` derives the duration from stable IDs and current content.
- `checkCompositionCoverage(context, random)` reports each of the 16 V1 combinations.

The context contains the manifest and content cards. These APIs do not read UI state, browser
storage, global history or a timer. Card, manifest, configuration, queue and session validators
from Phase 2 are reused. Unknown metadata is not silently stripped. Duplicate content IDs return
`no_valid_recipe`; invalid metadata/configuration and invalid RNG values are contract errors.
Successful queues always pass the canonical `parseQueue`, and start passes `parseSession`.

## Eligibility and fixed recipe

Only active items containing the configured vibe in `moods` are eligible. Multi-vibe items qualify
by membership. Missing vibe coverage never widens to another vibe. Explicit intensity ranks are
`sweet = 0`, `flirty = 1`; an item's rank must be at most the ceiling. Thus sweet accepts sweet
only; flirty accepts both sweet and flirty.

The output is always `connect`, `predict`, `play`, `challenge`, `closer`, in that exact order.
Each first-four item matches its activity category and has `isCloser = false`. The last item has
`isCloser = true` and may retain any valid activity category. Closers never enter ordinary pools,
and ordinary cards never enter the closer pool. All five IDs are unique.

## Duration policy and bounded search

| Requested duration | Inclusive allowed aggregate | Optimization target |
| --- | --- | --- |
| 15 minutes | 10–18 minutes | 15 minutes |
| 30 minutes | 20–35 minutes | 30 minutes |

Every item contributes its `durationMinutes`. Exact equality is not required. Among all valid
recipes the composer minimizes absolute distance from the requested duration. This is a pacing
budget, not a real-time guarantee; no global timer is introduced. Swap uses the same ranges and
target preference. Duration sums, bounds and replacements are evaluated in canonical queue order,
so fractional addition uses the same arithmetic on composition and restore.

The search order is closer, connect, predict, play, challenge. Each branch reserves its closer
before ordinary selections. All eligible closer choices remain searchable, so an inconvenient
initial closer cannot cause a false duration failure. Output is reordered into the canonical
recipe after selection.

Depth-first search has exactly five levels. Each candidate is considered once per prefix and
unique IDs are explicitly tracked. Remaining pool minima/maxima provide conservative duration
bounds: branches outside the allowed range or provably worse than the best known distance are
pruned. Ties are not pruned. There is no random retry loop, restart, arbitrary attempt limit or
early success that sacrifices the closest-duration objective.

For closer-first pool sizes `n1...n5`, the deterministic upper bound on visited nodes is
`1 + n1 + n1*n2 + n1*n2*n3 + n1*n2*n3*n4 + n1*n2*n3*n4*n5`, before pruning.
Memory retains the current five-item branch, best recipe, pools and exclusion set; it does not
store every solution. At the intended roughly 72-item scale this finite search is sufficient.
A 72-item equal-duration stress fixture enumerates its ties and terminates under constant RNG.
Larger future inventories may warrant revisiting the search cost; no optimization library is used.

## Randomness and failures

Candidate traversal is deterministic in pack order. Reservoir sampling chooses uniformly among
equally close complete recipes, using only the injected RNG. Swap uses the same tie strategy.
Each sample must be finite and in `[0, 1)`. Tests can inject seeded or constant random functions.
RNG is never persisted and is not called from render or restore. Recipes with different target
distances are not randomized against each other.

Controlled failures are `missing_connect`, `missing_predict`, `missing_play`, `missing_challenge`,
`missing_closer`, `duration_unavailable`, and `no_valid_recipe`. Missing closer is checked first,
then ordinary slots in recipe order. If every pool exists but no aggregate fits, the result is
`duration_unavailable`. Duplicate content IDs cannot form a canonically valid recipe and produce
`no_valid_recipe` rather than silent deduplication. Failures do not mutate inputs or persist a
partial queue. Contract errors may throw, as allowed by the Phase 3 specification.

## Start, persistence and restore

`src/engine/sessionStart.ts` provides orchestration without duplicating selection policy:

1. Compose a complete queue.
2. Create a canonical setup session using the existing factory.
3. Validate its playing state, current slot zero, hidden reveal and first displayed ID.
4. Save the complete session through the existing guarded storage adapter.
5. Return playable state only after saving succeeds.

A failed write returns `storage_unavailable`, so Play is not exposed with an unsaved new queue.
Composition failure never overwrites an earlier save. The namespace remains
`date-night-engine:v1:session`, schema version remains `1`, and only stable IDs are persisted.
No full card objects, RNG state or redundant duration total are stored.

`restoreDateNight` loads and validates the saved session. It has no composition or RNG call and
does not save/reorder/replace the queue. Total duration is derived from the same versioned
content, so rerenders and reloads preserve queue IDs, order, closer and pacing. Content metadata
changes require a game-version bump; incompatible saves continue to be rejected by the adapter.

App wiring is deliberately minimal: existing Home and theme, three plain configuration selects,
the existing Start action, and a passive first-item preview with derived slot/total duration.
Only a playing session displays an activity. Restore happens in the state initializer; composition
happens only in the Start event handler, never during rendering. Storage denial keeps the user
on Home with an error. No final Setup redesign, branding, stylesheet change, Reveal, Done, Swap
button, progression, end behavior or New Date flow is included.

## Swap and no-repeat rules

Replacement selection first canonically validates the playing session and explicit slot index.
It uses that same slot's eligible pool and rejects every current queue ID, every displayed ID and
every swapped/retired ID. The current item is therefore excluded too. Candidate replacement must
fit the aggregate duration range after substituting only that item. Closest target wins; equal
targets use injected RNG. The other four queue entries are unchanged. Closer replacement is
restricted to closer items, with any valid activity category, still in the fifth position.

This API selects a candidate and returns `retiredItemId`; it does not apply history, reveal or
storage changes. This permits explicit future-slot planning without falsely marking unseen
items displayed. When applying a current-item Swap in Phase 4, retain the retired ID in displayed
history, append it to swapped history, append the newly shown ID to displayed history, reset reveal
and validate/persist the updated session. A focused test demonstrates that this state passes the
existing Phase 2 validator. Actual atomic Swap application and its UI are deferred to Phase 4.

No candidate yields `{ ok: false, reason: 'no_replacement' }`, with no mutation, slot removal or
constraint widening. The no-repeat guarantee is session-local. New sessions have no global
avoidance history and may reuse content from earlier sessions.

## Infrastructure fixture

`src/data/defaultGame.ts` now provides 40 clearly labeled infrastructure cards. Each slot has two
alternatives for each sweet/flirty and 3-/6-minute combination. The original first-five IDs/order
are retained for Phase 2 tests. All four moods are deliberately attached to these synthetic items
to provide complete structural coverage; these are not customer-facing prompts or a claim about
the future final 72-item content pack.

Fixture manifest game version is bumped from `1.0.0` to `1.0.1` because duration/mood metadata and
inventory changed. The schema version, package.json version, dependencies and lockfile do not
change. Older fixture saves are rejected by the existing version check, not migrated. The original
Social Game storage namespace remains untouched. Production composition and replacement coverage
must be measured again when real content exists.

## Tests and verification

`tests/sessionComposer.test.mjs` adds **85 tests** covering ceiling/mood/activity eligibility,
inactive items, closer-first selection, canonical order and IDs, inclusive duration boundaries,
global closest-target preference (including an independent fractional-duration oracle), duration
gaps, controlled pool failures, duplicate-ID recipes, injected/invalid RNG, bounded 72-item search,
full-queue save-before-Play, write failure, storage round trip, repeated restore without RNG,
same-slot replacements and exclusions, no-mutation failures, representable retirement history,
and all 16 configurations. Coverage tests also check replacement capacity in every fixture slot.
No retained legacy tests or Phase 2 validators/tests are modified.

The standard commands are `pnpm run typecheck`, `pnpm test`, `pnpm run build`, and `git diff --check`.
Typecheck and diff check pass in this task environment. Standard tests and Vite build encounter
the known environment-level `spawn EPERM`. Build fails in Vite's Windows `optimizeSafeRealPathSync`
while spawning `cmd.exe` for `net use`; no source or dependency workaround is introduced.

Diagnostic tests use Node's existing no-process-isolation option. The new 85 tests pass. The full
non-SSR selection passes 302 tests (85 composer/start tests, 99 Phase 2 contract/storage tests,
118 retained regressions). SSR verification still requires unrestricted execution because Vite
initialization encounters the same spawn restriction. This is not a full standard-suite pass.

```powershell
$files = @(Get-ChildItem tests/*.test.mjs |
  Where-Object { $_.Name -notin @('mediaRenderer.test.mjs', 'themeUi.test.mjs') } |
  ForEach-Object FullName)
node --test --test-isolation=none @files
```

Phase 3 status is PARTIAL pending `pnpm test` and `pnpm run build` in unrestricted local
PowerShell against this changed source tree. Existing Phase 2 local results do not certify Phase 3.

## Changed files

- `src/engine/sessionComposer.ts` — pure composition, eligibility, pacing, replacement and coverage.
- `src/engine/sessionStart.ts` — validated save-before-Play orchestration and restore.
- `src/data/defaultGame.ts` — infrastructure alternatives and fixture game-version bump.
- `src/App.tsx` — minimal configuration/start and restored first-item preview.
- `tests/sessionComposer.test.mjs` — 85 focused tests.
- `docs/DATE_NIGHT_PHASE_3_SESSION_COMPOSER.md` — this implementation report.

## Phase 4 prerequisites and limitations

Run the standard suite and build in unrestricted PowerShell and review these uncommitted changes.
The final product content and its coverage are still absent. This preview intentionally has no
activity advancement or new-session UI after entering Play. Phase 4 must implement canonical,
atomic transitions for Done, Reveal, current-item Swap, ending and restart, including history,
reveal reset, validation and persistence. It must consume the already composed queue rather than
compose during render, restore or normal progression. Do not begin Phase 4 until separately authorized.
