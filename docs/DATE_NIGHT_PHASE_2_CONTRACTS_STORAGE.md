# Date Night Phase 2 — contracts and storage

Implementation baseline: `cede31ee0a910e2f816839753ed1cd78f2c33dbb`.
No commit, push, deployment, dependency installation, or Phase 3 work was performed.

## Card and manifest contracts

The canonical types in `src/types` now describe the independent Date Night product.
Cards retain ID, text, activity category, type, intensity, actions, media, tags and active state.
They explicitly parse `moods`, positive finite `durationMinutes`, boolean `isCloser`, and optional
string `revealText`. Activity categories are `connect`, `predict`, `play`, `challenge`.
A closer retains one of these activity categories; `closer` is a queue slot, not a category.
Intensity is `sweet` or `flirty`; the former `mild`, `spicy`, `wild` values are rejected.
No card mode field, player targeting, points, penalties or scoring metadata is accepted.

Moods are `cozy`, `funny`, `romantic`, `competitive`. Active cards require at least one.
Inactive cards still require a moods array but may use an empty array. Duplicate moods and duplicate
pack IDs are rejected. Each item requires a positive duration, including inactive items; fractions
are allowed. IDs are nonempty opaque tokens with no whitespace or control characters.

The compact manifest declares vibes, supported durations (15 and/or 30), allowed intensities,
all four unique activity categories, actions, identity/version and the existing theme reference.
The loader checks card moods/intensity/category/action support against that manifest. The existing
theme and theme rendering are retained. New contract objects reject unknown fields, including
nested configuration, queue entries and media, rather than silently dropping metadata.

## Configuration, queue and session

Configuration contains only `vibe`, `durationMinutes: 15 | 30`, and
`intensityCeiling: sweet | flirty`. There are no manual filters, player names, length modes or targets.

`SessionQueue` is a five-entry tuple of `{ slot, itemId }` in exactly this order:
`connect`, `predict`, `play`, `challenge`, `closer`. IDs must be unique and resolve to valid active
cards. First-four items must not be closers and must match the activity of their slot. The final
item must be a closer, with any valid activity category. `parseQueue` validates caller-provided
queues; it never constructs, shuffles or selects them.

`GameSession` contains identity (`id`, `gameId`, `gameVersion`, `schemaVersion`, `startedAt`, optional
`endedAt`), status, configuration, queue, integer `currentSlot` 0–4, unique displayed/swapped ID
arrays, reveal state and optional ending reason. The current item ID derives from
`queue[currentSlot].itemId`. There are no player stats, scores, automatic turns, counters or
redundant consumed/current-card fields.

`createSession(context, configuration, queue)` requires a complete externally supplied queue and
returns a validated setup session. Identity generation does not randomize content. Setup has slot
zero, empty history and hidden reveal state. Playing and ended sessions must include the current
and previous queued items in displayed history, and must not include future queued items.
History IDs must resolve to content. Swapped IDs must have been displayed and must no longer occur
in the queue; displayed IDs outside the queue must be accounted for as swapped IDs. Duplicate
history entries are prohibited. These rules permit future replacement without implementing Swap.

Reveal state is `hidden | revealed`; an absent state defaults to hidden. An ended session may
retain either state. Ending requires `endedAt >= startedAt` and `completed | cancelled`.
Completion requires slot four. Active/setup sessions cannot contain ending metadata.
UTC timestamps must be parseable ISO dates with valid calendar dates. No Done, Reveal, Swap,
progression or end-session interaction is added in this phase.

## Persistence and compatibility

- Storage key: `date-night-engine:v1:session`.
- Schema version: numeric `1`, independently checked from game version.
- Adapter: `createLocalStorageAdapter(context, optionalStorageProvider)`.
- Both save and restore require the current manifest and content context.
- Only validated session metadata and stable IDs are persisted, never full content objects.
- Missing saves return null. Corrupt JSON and incompatible Date Night saves are rejected and
  removed when storage permits. Invalid saves do not overwrite an existing valid save.
- Access, read, write and removal exceptions are guarded. Failure to remove corrupt data never
  crashes the application.
- Game ID/version, schema version, configuration support, queue references, active flags,
  slot order, category/closer metadata, uniqueness, progress, reveal and history are checked.
- The adapter never reads, migrates, clears or writes `social-game-engine:v1:session`.
- There is no cross-session history or backward compatibility/migration layer for Girls Night saves.

## Legacy isolation and preview limitation

The previous contracts, parsers, session helpers, loader and storage adapter are retained under
`src/legacy` solely for the unused old shell and retained regression tests. Existing legacy
consumers now explicitly import these archived contracts. This avoids pretending that the old
player/filter/stat model is compatible with Date Night, while preserving regression coverage.
These modules are not imported by the active App dependency graph. The archived adapter is not
instantiated by the Date Night application and does not access browser storage there.

The App uses the new Date Night fixture loader and renders the existing Home structure and theme.
Its Start button is disabled (with an explanatory title) because no composer/start flow exists yet.
There is no new Setup/Play/End UI, content selection, reveal behavior, persistence hook or gameplay.
The five clearly labeled infrastructure fixture items are not a product content pack. Old JSON
content, old screens and components remain available for isolated regression tests, not as the
Date Night runtime session implementation. Final copy, theme and content work is deferred.

## Tests and verification

`tests/dateNightContracts.test.mjs` adds **99 tests** for card/configuration parsing, strict unknown
fields, manifest support, five-slot queues, valid setup/playing/completed/cancelled sessions,
history consistency, reveal defaults, calendar dates, identity/schema compatibility, storage
round trips, invalid-save preservation, corrupt/stale saves, inactive references, storage denial
and separation from the Social Game storage key. The old regression tests intentionally import
the archived legacy implementations; their permissive-parser expectations do not apply to the
new strict Date Night parsers.

Validation in the Codex task environment:

| Check | Result |
| --- | --- |
| `pnpm run typecheck` | PASS |
| `pnpm test` | Blocked by Node test-runner child-process `spawn EPERM` |
| Diagnostic non-SSR tests, process isolation disabled | 217 passed, zero failed (99 new + 118 retained) |
| Diagnostic SSR suites, process isolation disabled | 26 blocked by Vite initialization `spawn EPERM` |
| `pnpm run build` | Blocked loading Vite config: `spawn EPERM` |
| `git diff --check` | PASS |
| package.json / pnpm-lock.yaml | Unchanged |

The non-SSR diagnostic command is:

```powershell
$files = @(Get-ChildItem tests/*.test.mjs |
  Where-Object { $_.Name -notin @('mediaRenderer.test.mjs', 'themeUi.test.mjs') } |
  ForEach-Object FullName)
node --test --test-isolation=none @files
```

The build stack identifies Vite's `optimizeSafeRealPathSync`, which executes `net use` through
Windows `cmd.exe`. This is the same established environment limitation as Phase 1B. No source,
script, dependency or configuration workaround was introduced. Standard tests and build must
still be run in unrestricted PowerShell for this changed source tree; prior Phase 1B results
do not certify Phase 2. Phase 2 is therefore PARTIAL pending those checks.

Read-only original-repository safety verification matches the recorded baseline: HEAD
`3de5d604445379b0a9b56facae9579c0cd0afad9`, zero file-hash differences (excluding generated
node_modules), zero worktree-status differences, and zero remote differences. No operations in
this task wrote to that repository. Its existing unrelated uncommitted changes remain intact.

## Phase 3 prerequisites

Run `pnpm test` and `pnpm run build` in unrestricted PowerShell inside this Date Night repository.
Review the new contracts and the intentionally disabled preview start flow before approving the
next phase. A future composer must provide five valid entries and enforce vibe/intensity/duration
selection rules; this phase validates structure and referential integrity, not selection policy or
aggregate time budgeting. No composer, random five-slot construction, no-repeat selection,
replacement algorithm, final dataset or new UI has been implemented. Phase 3 has not begun.

## Files changed

The following list includes import-only changes needed to isolate the old model, new contracts,
archived modules, fixture, tests and this document.

- `docs/DATE_NIGHT_PHASE_2_CONTRACTS_STORAGE.md`
- `src/App.tsx`
- `src/components/ActionButtons.tsx`
- `src/components/CategorySelector.tsx`
- `src/components/GameCard.tsx`
- `src/components/GameplayShell.tsx`
- `src/components/IntensitySelector.tsx`
- `src/components/MediaRenderer.tsx`
- `src/components/PlayerSetup.tsx`
- `src/components/SessionLengthSelector.tsx`
- `src/components/intensityLabels.ts`
- `src/data/defaultGame.ts`
- `src/engine/cardSelector.ts`
- `src/engine/cardValidation.ts`
- `src/engine/gameLoader.ts`
- `src/engine/gameSession.ts`
- `src/engine/gameplayShell.ts` (relocated into src/legacy/engine/gameplayShell.ts)
- `src/engine/manifestValidation.ts`
- `src/engine/modeFilters.ts`
- `src/engine/nightHighlights.ts`
- `src/engine/sessionLength.ts`
- `src/engine/sessionManager.ts`
- `src/engine/sessionValidation.ts`
- `src/engine/validation.ts`
- `src/legacy/data/defaultGame.ts`
- `src/legacy/engine/cardValidation.ts`
- `src/legacy/engine/gameLoader.ts`
- `src/legacy/engine/gameSession.ts`
- `src/legacy/engine/gameplayShell.ts`
- `src/legacy/engine/manifestValidation.ts`
- `src/legacy/engine/sessionManager.ts`
- `src/legacy/engine/sessionValidation.ts`
- `src/legacy/engine/validation.ts`
- `src/legacy/storage/localStorageAdapter.ts`
- `src/legacy/types/card.ts`
- `src/legacy/types/game.ts`
- `src/legacy/types/session.ts`
- `src/screens/EndScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/PlayScreen.tsx`
- `src/screens/SetupScreen.tsx`
- `src/storage/localStorageAdapter.ts`
- `src/types/card.ts`
- `src/types/game.ts`
- `src/types/session.ts`
- `tests/cardSelector.test.mjs`
- `tests/dateNightContracts.test.mjs`
- `tests/gameLoader.test.mjs`
- `tests/gameplayShell.test.mjs`
- `tests/localStorageAdapter.test.mjs`
- `tests/mediaRenderer.test.mjs`
- `tests/playerStats.test.mjs`
- `tests/playerTurns.test.mjs`
- `tests/productionPack.test.mjs`
- `tests/sessionLength.test.mjs`
- `tests/sessionManager.test.mjs`
- `tests/themeUi.test.mjs`
