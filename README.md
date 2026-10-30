Independent Date Night repository. Spill or Sip baseline behavior is unchanged. See docs/DATE_NIGHT_FORK_BASELINE.md. No Phase 2 implementation started.

# Date Night Engine V1 — Independent Fork Baseline

Step 5 provides a simple Home → Setup → Play → End gameplay shell based on
PRODUCT_SPEC.md. Run with Node.js 24 LTS and pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

## Gameplay shell

`src/components/GameplayShell.tsx` connects the four screens to the existing
session manager and localStorage adapter. A compatible saved session restores
its setup, playing, or ended screen. Without a saved session the app opens Home.
Returning Home removes only the app's saved session. Storage failures show a warning.

- Home displays manifest name, edition, age notice, and Start.
- Setup stores mode, categories, enabled intensities, and optional player names.
  At least one available category/intensity must be selected. Empty matching
  decks and excessive named players show a message instead of starting.
- Play displays the category, prompt, optional media, manifest/card actions,
  Skip this card, played count, and End Game. Actions and Skip advance once using
  the existing selector. No action outcomes, scores, or timer effects are tracked.
- End displays cards played, Play Again, Change Mode, and Return Home.
  Play Again retains settings and names, resets history, and draws a first card.
  Change Mode resets progress and returns to Setup.

`src/engine/gameplayShell.ts` owns setup validation, flow operations, restoration,
and play-view derivation. React components do not implement selection rules.
For manual-ending games an exhausted deck stays on Play with Restart Deck,
Change Mode, and End Game. For deck-complete games advancing past the final card
ends the session, allowing the final prompt to be read first.

Shared components are GameCard, ActionButtons, CategorySelector,
IntensitySelector, PlayerSetup, and MediaRenderer. Media is only mounted for the
current card: images/GIFs use lazy loading and videos use controls, no autoplay,
and preload="none". Failed media leaves the prompt usable. System fonts, plain
borders, wrapping controls, and 48px button targets provide a basic mobile layout.
The approved v1.1 hybrid theme is applied through CSS variables.

The existing manifest has no required-player-names field or mode-specific rule
configuration. Names therefore remain optional, and modes are stored as selected
configuration without inventing additional behavior. Spill or Sip's free-play,
no-scoring, and no-timer configuration is unchanged. No player-turn behavior is
implemented.

## Existing engine and data

- `src/types/`: unchanged manifest, card/media, session/player, and theme models.
- `src/data/defaultGame.ts`: loads the manifest, production card pack, and existing theme JSON.
- `src/engine/gameLoader.ts` and validation modules: validate data at runtime and
  check theme/category/action references without fetching media or mutating input.
- `src/engine/cardSelector.ts`: filters inactive cards, categories, intensities,
  and played IDs, then selects one eligible card. Empty filter lists mean no
  restriction at the selector API; setup explicitly requires available choices.
  Randomness is injectable, uses [0, 1), and no eligible cards returns null.
- `src/engine/sessionManager.ts`: immutable session creation, setup updates,
  card recording, ending, and restart. IDs and ISO timestamps are generated on
  creation. Restart retains settings/names and clears all progress.
- `src/engine/gameSession.ts`: existing session/selector integration and
  compatibility checks. Its earlier preview initialization helper is retained
  for compatibility but is not used by the new shell.
- `src/engine/sessionValidation.ts`: checks persisted fields and consistency.
- `src/storage/localStorageAdapter.ts`: saves, loads, and removes the single key
  `social-game-engine:v1:session`; invalid data is discarded safely. Storage access
  and quota failures do not crash the app. Persistence is browser/origin local.

## Verification and scope

Tests use Node's built-in test runner and TypeScript stripping, with no new
packages. They cover loaders, selector filters/no-repeat behavior, immutable
sessions, storage failures, setup-to-play flow, restoration, end/replay, action
availability, and exhaustion. Browser checks exercise the actual screens.

No routing, scoring, timers, player turns, backend, authentication, analytics,
multiplayer, or animation framework is implemented.

## Production content

The runtime pack at `src/data/cards/spill-or-sip-girls-night.json` is an unchanged
copy of the frozen v1.2 export under `docs/content/exports/`: 125 active cards,
25 per category, with 39 mild, 55 spicy, and 31 wild prompts. Editorial wording
was checked against the v1.2 workbook. Print metadata remains in the workbook.
SPILL and SIP automatically advance; Skip advances without answering. Next is
internal shell navigation only and is not a visible gameplay control.

The five former development cards live in `tests/fixtures/media-cards.json`.
Only that test fixture references the three small assets in `public/media/`;
production cards contain no media. Media rendering tests remain independent of
production content. No theme or gameplay engine changes are included.

## Theme/UI v1.1

The single Girls Night theme is `girls-night-hybrid-premium`. Its existing model
maps to CSS variables through `src/theme/themeStyle.ts`; additional palette and
layout tokens live in `src/styles.css`. Georgia provides display typography and
Inter/system sans-serif provides UI text, without font downloads or dependencies.
SIP uses dark text on the approved coral fill for contrast; pink CTAs use large,
bold white text. Selected tiles retain native inputs, checkmarks and focus rings.

The developer-only `/tests/fixtures/theme-preview.html` page exercises the actual
PlayScreen with the existing five media fixture cards, including a missing-media
control. It is not imported by the production entry point or included in the
production build. Production content and media-loading logic remain unchanged.

Responsive QA covers Home, Setup, text/media Play and End at 320, 375, 390, 414,
768 and 1280px. Setup scrolls vertically on phones; gameplay stays compact with
27–38px prompt tiers and a 680px maximum desktop card width. Reduced-motion preference
disables press transitions. Setup shows the live matching-card count and non-blocking guidance for small pools.
Progress uses the matching session pool, ignoring played history so its total stays
stable. Saved filters restore that total; 125 remains the product library size.

### v0.9.1 optional turns and card refinement

Names are trimmed, blank lines ignored and entry order preserved. With names,
the existing optional `GameSession.currentPlayerIndex` starts at zero. SPILL/SIP
draw through the same selector/history path and advance the player once; Skip
draws another card while retaining the current player. Without names no index or
turn label is introduced. The manifest's free-play default remains unchanged.

The unchanged localStorage schema/key saves index, current card, filters and
history together. Legacy named sessions without an index resume at player zero;
anonymous sessions remain compatible. Restart Deck/Play Again reset progress and
start with the first name. Change Vibe retains names/settings; starting again
begins with the first name. Existing manual exhaustion behavior is preserved:
the final revealed card remains displayed and actions are disabled, with End Game
and restart available. No turn advances without another eligible card.

Play now has a taller framed card, palette-based category accents and decorative
inline SVG icons. Prompt length tiers are <=65, <=100 and >100 characters; no
continuous shrinking or clipping. Controls remain outside the card. No stats,
skip limits, scoring, session-length presets, new content or dependencies added.

Browser QA (local Chromium): 320/375/390/414/768/1280px, short and longest production
prompts, no horizontal overflow; 48px+ targets and visible focus. Verified
Pamela SPILL -> Jessica SIP -> Sarah Skip -> Sarah, refresh retaining Sarah/card/
progress, then SPILL -> Pamela. Checked restart, Change Vibe, exhaustion and media
fixture rendering. Physical devices/Safari were not tested in this run.

### v0.9.1 guided microinteractions

UI-only motion: centered 20px/700 player cue with 200ms fade/6px entrance on
player change, followed by a 320ms soft pink halo/1.02 scale (520ms total);
new card 250ms fade/6px entrance from scale .985, delayed 560ms when a player
cue is present (40ms after emphasis settles); progress fill
250ms transition. End Game is quieter (13px, normal weight), retaining 48px target.
Primary press feedback scales to .98 without delaying the action.

For an active, non-exhausted card, idle hints fire at 5500ms and 15500ms: one
500ms composed pulse to 1.045 scale/-2px, then .995 and back to 1, with a
temporary soft ring/shadow; then one softer 400ms pulse to 1.025 with subtle glow.
Both buttons animate together with identical timing/effects; no third pulse.
Pointer, keyboard, click, focus, input and wheel interactions reset the idle cycle.
Session/card identity changes dispose the previous timers and start a fresh cycle,
including Skip with the same player. Unmount clears timers/listeners. Hidden tabs
pause hints and start a fresh cycle on return. Ordinary renders do not re-register.
Reduced motion disables entrances, press scaling, progress transition and hint
timers; changing the preference live also cancels pending hints. No persisted state
or gameplay timing is added. The native progress element remains accessible while
an aria-hidden visual fill supplies the transition consistently.

Validation: 110 WebApp tests + 8 printable tests pass, strict TypeScript/build pass.
Fake-clock tests verify exact trigger times, no third hint, reset/disposal and the
reduced-motion/visibility listener path. Local browser checks verify turn flow,
idle reset/second-hint settled state, computed motion durations, 320–1280px layout,
centered label, 48px+ controls, and longest prompt at 375px with no overflow.
OS reduced-motion was verified through automated preference-event tests and CSS
review, not by changing the user's operating-system preference.
