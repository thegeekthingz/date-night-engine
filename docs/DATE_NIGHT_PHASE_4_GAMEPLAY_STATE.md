# Date Night Phase 4 — gameplay state and persistence

Baseline: `227ebc22704214034c5d7942109a412ae6173c4e` on main, clean before implementation.
No commit, push, deployment, dependency installation or Phase 5 work is performed. All operations
target the independent Date Night repository. The original Social Game Engine is untouched.

## Modules and action results

`src/engine/sessionActions.ts` owns immutable, canonically validated Done, Reveal, current-item
Swap and confirmed End transitions. It receives time and randomness as explicit inputs. It never
reads storage, the clock or React state. Invalid/ended states and normal unavailable actions return
structured failures rather than uncaught game-state exceptions. A success contains `session` and
`changed`; repeated Reveal has `changed: false`.

`src/engine/gameplayController.ts` owns start/replay, save-before-exposure orchestration, configuration
reset and navigation. It wraps the existing Phase 3 start/restore functions and storage adapter.
It exposes defensive snapshots, not its mutable internal state. Business rules stay outside React
event handlers. No Phase 2 schema or validator and no Phase 3 composer algorithm is changed.

## Done, Reveal and progress

- Done in slots 0–3 advances exactly one slot. It adds the next queue ID once to displayed history,
  resets reveal to hidden, and preserves queue/configuration. It does not compose or draw content.
- Done in slot 4 stays at slot 4, ends with `completed`, records `endedAt`, resets reveal and retains
  the complete queue/history.
- Reveal is available only for a non-whitespace `revealText`. It changes hidden to revealed without
  changing any other session field. Repeating Reveal is a no-op with no storage write. Missing,
  empty or whitespace reveal content returns `reveal_unavailable`, with no mutation or write.
- Reveal is not a Done gate. Predict can use prompt → optional Reveal → Done, without names/turns.
- Progress is derived from slot/status only: ordinal `currentSlot + 1`, completed `currentSlot`
  while playing or cancelled, and five completed only when ended with `completed`. Total is five.
  Display history length is never progress, so Swap/Reveal cannot increment completion.

## Swap application and history

Phase 3 selects the replacement with its existing vibe, intensity ceiling, activity/closer and
aggregate-duration policy. It excludes every queued, displayed and retired ID. Phase 4 replaces
only the current entry, retains the retired ID in displayed history, appends it to swapped history,
appends the newly displayed ID, resets reveal, and preserves currentSlot/status/configuration.
The whole candidate passes canonical `parseSession` before saving. The other four entries remain
identical. A closer replacement stays in slot five with `isCloser = true` and can finish via Done.

`no_replacement` changes nothing and writes nothing. The preview gives clear feedback and disables
Swap for that session/current-item pair after an unavailable result. No constraints are relaxed.
There is no cross-session avoidance or persistent global history.

## Early End, confirmation and ended safety

The first End click only opens an inline keyboard-accessible confirmation with a labelled
`alertdialog`, Confirm End and Cancel buttons. Cancel initially receives focus. Cancel changes
only that temporary UI state, with no controller/storage operation, and restores focus to End
after the button is re-enabled. Play actions are disabled while confirmation is open.

Engine End requires literal `confirmed: true`; otherwise it returns `confirmation_required`.
Confirmation ends with `cancelled`, retaining current slot, queue, history and reveal state.
It never displays remaining items or pretends completion. Only final Done generates `completed`.
Confirmation is tied to the revision at which End was requested; an outdated confirmation cannot
end a later item. No modal framework or final visual design is introduced.

Ended sessions reject Done, Reveal, Swap and End without persistence mutation. They allow New Date,
Change Vibe and Home. Completed results show “Your Date Is Complete”; cancelled results show
“Date Ended”. Neither view exposes players, scores, counters, winners or legacy highlights.

## Atomic persistence and callback safety

Each changed action follows: validate current state → create candidate → canonical validation →
write candidate → expose it. A failed/throwing write returns `storage_unavailable`; the controller's
state and revision remain unchanged. The failure result contains no advanced candidate for the UI
to accidentally display. The same save-before-exposure policy covers Done, final completion,
Reveal, successful Swap, confirmed End, Start and New Date. The localStorage adapter continues to
write a single validated JSON value under its existing key.

Every handler supplies its rendered revision. The synchronous controller increments this
in-memory revision only after a successful change/save, or a successful Home/Change Vibe removal.
A duplicate callback from the old render returns `stale_action` and cannot advance twice, swap
twice, confirm twice or restart twice. React state updater functions perform no persistence or
business transitions. Repeated Reveal is harmless even at the latest revision and writes nothing.
Revision is controller-local and not added to the persisted schema; this is not a multi-tab lock.

Storage remains `date-night-engine:v1:session`, schema version `1`. No currentCardId, consumed count,
scoring, player names, stats or automatic alternation is added. The current item always derives
from `queue[currentSlot].itemId`.

## New Date, Change Vibe and Home

- New Date retains configuration and calls the unchanged Phase 3 start path to freshly compose a
  complete queue and create a new identity/timestamp. It resets slot, reveal and retired history;
  displayed history contains only the first new item. It saves before publishing Play. Old
  progress/ending metadata is not copied. Across dates the same item IDs may legitimately recur.
- Change Vibe removes the Date Night save first, then exposes setup with a copy of current
  configuration and no session/history. Reading/rendering setup never composes. Explicit Start
  creates and persists a fresh session with the edited choices. A failed removal retains the old
  session/view. Setup choices are editable temporary UI state, not a new persisted draft model.
- Home removes only the Date Night key before exposing Home with no active session. It never
  clears localStorage or accesses the Social Game key or unrelated keys. Failed removal does not
  falsely show Home while leaving an active saved session behind.

## Restore guarantees and UI scope

The controller uses existing guarded restore, with no composition, RNG call or advancement. Slots
0–4 restore their exact queue, current item/slot, displayed/swapped histories and reveal state.
Revealed content stays revealed; Swap replacement stays queued and retired history stays intact.
Completed and cancelled sessions restore the corresponding ended view, without automatically
starting again. Restore does not write or reset reveal. Reveal resets on Done, Swap or New Date.

App wiring adds only the required controls to the existing theme/card/button structure: Home,
plain configuration controls, activity/ordinal/completed counts, Reveal, Done, Swap, confirmed End,
and ended actions. There are no stylesheet, branding, typography or animation changes.

The synthetic Predict fixtures gain a clearly labelled reveal so the interaction can be exercised.
Fixture game version is bumped to `1.0.2` for this metadata change, so previous fixture saves are
rejected by the existing game-version check. Schema, package versions, dependencies and lockfile
are unchanged. This is still the infrastructure pack, not the final 72-item production content.

## Tests and verification

`tests/sessionActions.test.mjs` adds **72 focused tests** covering:

- Each Done step, final completion, immutable queue/configuration and reveal reset.
- Reveal availability, no progression, repeat no-op and ended rejection.
- Swap in all five slots, retirement history, exclusions, no replacement and closer completion.
- Confirmed/cancelled End, literal confirmation, no slot cheating and ended mutation rejection.
- Save-before-exposure inspection, failed writes/removals, throwing ports, stale callback and
  stale confirmation rejection, and complete five-step persisted playthrough.
- Exact reload at every slot after Swap/Reveal, reload after Done and both ended reasons.
- Fresh replay after completed/cancelled sessions, replay failure, Change Vibe, Home key isolation,
  defensive snapshots and progress independent of growing history.

Typecheck and diff check pass. The diagnostic non-SSR test run passes **374 tests**, including all
72 Phase 4 tests, 99 Phase 2 tests, 85 Phase 3 tests and 118 retained regressions. No existing tests
are modified. Standard `pnpm test` and `pnpm run build` encounter the known environment-level
`spawn EPERM`: Node child-process test isolation is denied; Vite fails loading configuration in
`optimizeSafeRealPathSync` when spawning Windows cmd.exe for `net use`. No source, dependency or
script workaround is introduced. SSR and the full build still require unrestricted local checks.

Diagnostic command:

```powershell
$files = @(Get-ChildItem tests/*.test.mjs |
  Where-Object { $_.Name -notin @('mediaRenderer.test.mjs', 'themeUi.test.mjs') } |
  ForEach-Object FullName)
node --test --test-isolation=none @files
```

Phase 4 is PARTIAL pending unrestricted `pnpm test` and `pnpm run build` for this source tree.
The keyboard confirmation and preview controls should also receive a local browser smoke check.

## Changed files

- `src/engine/sessionActions.ts` — pure transitions, reveal availability and progress.
- `src/engine/gameplayController.ts` — revision guard, persistence and navigation orchestration.
- `src/App.tsx` — minimal action, confirmation, configuration and ended-view wiring.
- `src/data/defaultGame.ts` — synthetic Predict reveals and fixture version bump.
- `tests/sessionActions.test.mjs` — new focused tests.
- `docs/DATE_NIGHT_PHASE_4_GAMEPLAY_STATE.md` — this report.

## Known limitations and Phase 5 prerequisites

The controller handles synchronous single-tab actions, not cross-tab storage arbitration. No new
draft-configuration storage key exists; refreshing after leaving gameplay may return to Home with
defaults. Production content and final UX are deliberately absent. Run unrestricted tests/build,
review the uncommitted changes and smoke-test Start → Reveal/Swap/Done → completion, End/Cancel,
reload and ended navigation before approving Phase 5. Phase 5 must preserve these engine and
storage guarantees while implementing the real interface and product experience. It has not begun.
