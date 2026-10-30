# Social Game Engine — Product Specification v1.1

## 0. Document purpose

This document defines the MVP architecture and product behavior of **Social Game Engine v1.1**.

The primary goal is to build a lightweight, mobile-first web engine that can power multiple Etsy digital game products through **configuration + content packs + themes**, without rewriting the core application for every new listing.

The first production use case is **Spill or Sip — Girls Night Edition**.

The next planned use cases are:
- Foreplay / Level-Up — Couples
- Bachelorette Confessions
- Most Likely To / Group Voting
- Future party-game verticals

The engine must prioritize simplicity of use, fast load times, small payloads, clean but engaging UI, reusable architecture, AI-assisted development, and low-cost deployment.

### v1.1 precedence and source-of-truth hierarchy

This v1.1 supersedes PRODUCT_SPEC v1.0 wherever the two documents conflict.

The product now uses specialized companion specifications. In their respective areas, these documents are authoritative:

```text
PRODUCT_SPEC.md
= engine architecture, cross-product behavior, shared domain rules

Spill_or_Sip_Girls_Night_Content_DB_v1_2.xlsx
= source of truth for production card content

THEME_UI_SPEC.md
= source of truth for Spill or Sip visual/UI direction

PRINTABLE_SPEC.md
= source of truth for printable deck generation and print layout

QUICK_START_SPEC.md
= source of truth for onboarding, launcher PDF, QR/link access and customer instructions

DEPLOY_QA_CHECKLIST.md
= source of truth for release/deployment QA

ETSY_LISTING_SPEC.md
= source of truth for Etsy packaging, listing structure and commercial presentation
```

When a specialized document conflicts with an older example or assumption in this file, the specialized document takes precedence for that area.

---

## 1. Product vision

Build one reusable web game engine that can power multiple digital social games.

A new game should ideally require only:
1. a new game configuration;
2. a new content pack;
3. a new theme;
4. optional game-specific rules already supported by the engine.

The engine must be **content-driven rather than code-driven**.

Commercially, each game may appear as a separate Etsy product while technically sharing the same engine.

---

## 2. MVP scope

### In scope for v1.0
- Multiple game packs
- Game configuration
- Optional player names
- Sequential turn mode
- Free-play mode
- Text cards
- Image cards
- GIF support
- Video support
- Categories
- Intensity levels
- Random card selection
- No-repeat card selection during a session
- Optional scoring
- Optional timer
- Local session persistence
- Basic game-over screen
- Mobile-first responsive UI
- Tablet support
- Desktop support
- TV-friendly layout
- Theme configuration
- Multiple URL entry points for different games
- Lightweight analytics event hooks
- Browser-based play with no account required

### Explicitly out of scope for v1.0
- User accounts
- Cloud saves
- Realtime multiplayer
- Room codes
- Cross-device synchronization
- Backend content CMS
- Native iOS/Android apps
- In-app payments
- Complex achievements
- Global leaderboards
- Social feed
- AI-generated content during gameplay
- Heavy animation framework
- Complex admin dashboard
- User-generated public content
- Matchmaking

---

## 3. Product principles

### Zero-friction play
Preferred flow:

Open game → Start → Choose mode/category → Optional player names → Play

No sign-up. No onboarding wizard. No unnecessary confirmations.

### Mobile first
Priority:
1. smartphone
2. tablet
3. laptop
4. TV / large display

### Fast loading
- no preload of large videos;
- lazy-load media;
- optimized image formats;
- minimal third-party libraries;
- media optional;
- gameplay logic runs client-side.

### Config over code
Creating a new game should mostly involve:
- adding a `game.json`;
- adding a `cards.json`;
- adding optional assets;
- adding a theme.

### Clean but engaging UI
Modern, clear, playful, premium enough for a paid Etsy product, and uncluttered.

---

## 4. Primary v1 use case — Spill or Sip: Girls Night Edition

### Core loop
Choose category / vibe → Reveal prompt → Player chooses SPILL or SIP → Next prompt

### Categories
- Dating
- Secrets
- Funny
- Chaos
- Spicy

Optional future category:
- Hot Takes

### Intensity
- mild
- spicy
- wild

UI labels: Mild / Bold / Wild, respectively. Internal content, filtering and persisted values remain `mild` / `spicy` / `wild`.

### Card actions
- spill
- sip

### Navigation actions
- skip
- next (internal only; no visible gameplay control)
- back
- end game

`spill` and `sip` are gameplay actions stored on the card/content layer.

`skip`, `next`, `back`, and `end game` are navigation responsibilities of the Gameplay Shell and must not be stored as card `actionIds`.

SPILL and SIP automatically advance once to the next eligible card. Skip this card
advances once without answering. Revealed cards are already recorded in played-card
history, so skipped cards cannot repeat. Next is internal navigation only, never a
visible gameplay button. Preserve existing exhaustion/end behavior when no cards remain.

### Session behavior
- no duplicate prompts;
- random prompt selection;
- player names optional;
- no mandatory scoring;
- session continues until player chooses to end;
- simple final screen.

---

## 5. Functional architecture

Logical modules:

- Game Loader
- Game Manifest
- Content Loader
- Rule Engine
- Randomization Engine
- Session Manager
- Player Manager
- Optional Score Manager
- Optional Timer Manager
- Media Renderer
- Theme System
- Local Storage Adapter
- UI Shell
- Analytics Hooks

---

## 6. Game manifest

```ts
type IntensityLevel = "mild" | "spicy" | "wild";

type GameModeConfig = {
  id: string;
  label: string;
};

type CategoryConfig = {
  id: string;
  label: string;
};

type ActionConfig = {
  id: string;
  label: string;
};

type GameManifest = {
  id: string;
  name: string;
  edition?: string;
  version: string;

  audience: string[];
  occasion: string[];

  minPlayers: number;
  maxPlayers?: number;

  turnMode: "none" | "sequential";

  modes: GameModeConfig[];
  categories: CategoryConfig[];
  actions: ActionConfig[];

  intensityEnabled: boolean;
  allowedIntensities?: IntensityLevel[];

  scoringEnabled: boolean;
  timerEnabled: boolean;

  allowRepeats: boolean;

  endCondition: "manual" | "deck_complete" | "round_limit";

  themeId: string;

  adultContent: boolean;
  ageNotice?: string;
};
```

Example:

```json
{
  "id": "spill-or-sip-girls-night",
  "name": "Spill or Sip",
  "edition": "Girls Night Edition",
  "version": "1.0.0",
  "audience": ["adult-friends", "girls-night"],
  "occasion": ["girls-night", "girls-trip", "party"],
  "minPlayers": 2,
  "maxPlayers": 20,
  "turnMode": "none",
  "modes": [
    { "id": "choose-your-vibe", "label": "Choose Your Vibe" },
    { "id": "random-mix", "label": "Random Mix" }
  ],
  "categories": [
    { "id": "dating", "label": "Dating" },
    { "id": "secrets", "label": "Secrets" },
    { "id": "funny", "label": "Funny" },
    { "id": "chaos", "label": "Chaos" },
    { "id": "spicy", "label": "Spicy" }
  ],
  "actions": [
    { "id": "spill", "label": "SPILL" },
    { "id": "sip", "label": "SIP" }
  ],
  "intensityEnabled": true,
  "allowedIntensities": ["mild", "spicy", "wild"],
  "scoringEnabled": false,
  "timerEnabled": false,
  "allowRepeats": false,
  "endCondition": "manual",
  "themeId": "girls-night-hybrid-premium",
  "adultContent": true,
  "ageNotice": "18+"
}
```

---

## 7. Card / prompt schema

```ts
type CardType =
  | "confession"
  | "question"
  | "story"
  | "challenge"
  | "vote"
  | "most-likely"
  | "truth"
  | "dare"
  | "group-action"
  | "custom";

type TargetRule =
  | { type: "none" }
  | { type: "current-player" }
  | { type: "random-player" }
  | { type: "all-players" }
  | { type: "named-player"; playerId: string };

type MediaType = "image" | "gif" | "video";

type MediaAsset = {
  id: string;
  type: MediaType;
  src: string;
  alt?: string;
  poster?: string;
  aspectRatio?: string;
};

type Card = {
  id: string;
  text: string;
  categoryId: string;
  intensity: IntensityLevel;
  type: CardType;
  target?: TargetRule;
  actionIds?: string[];
  points?: number;
  penalty?: string;
  timerSeconds?: number;
  media?: MediaAsset[];
  tags?: string[];
  active: boolean;
};
```

For **Spill or Sip — Girls Night Edition v1**:

```json
{
  "target": { "type": "none" },
  "actionIds": ["spill", "sip"]
}
```

Rationale:
- the pack uses `turnMode = "none"` and does not require a structured current-player target;
- `spill` and `sip` are the actual card/gameplay responses;
- `skip` and `next` belong to the Gameplay Shell navigation layer.

The schema still supports `current-player`, `random-player`, `all-players`, and named-player targeting for future game packs.

---

## 8. Media support

Supported:
- image
- GIF
- video

Rules:
- media must never be required for engine functionality;
- lazy-load only when card is shown;
- videos do not autoplay with sound;
- large files do not preload;
- use optimized image formats;
- prefer short compressed video over heavy GIF when smaller;
- video should have poster image where possible;
- provide graceful fallback if media fails.

---

## 9. Session model

```ts
type Player = {
  id: string;
  name: string;
  score?: number;
};

type GameSession = {
  id: string;
  gameId: string;
  gameVersion: string;
  startedAt: string;
  endedAt?: string;
  modeId: string;
  selectedCategoryIds: string[];
  selectedIntensities: IntensityLevel[];
  players: Player[];
  currentPlayerIndex?: number;
  playedCardIds: string[];
  scores?: Record<string, number>;
  currentCardId?: string;
  status: "setup" | "playing" | "ended";
};
```

Player names are optional unless required by the game.

---

## 10. Persistence

For v1.0:
- use browser `localStorage`;
- no cloud persistence;
- no account required.

Store:
- current game;
- selected settings;
- players;
- played cards;
- current card;
- optional scores.

Expected behavior:
- refresh preserves active session;
- changing device does not preserve session;
- clearing browser storage removes session.

---

## 11. Rule engine

Card-selection flow:

Load active cards
→ filter by selected categories
→ filter by selected intensities
→ remove played cards if `allowRepeats=false`
→ apply optional target/type rules
→ randomly select one candidate
→ store selected card as played
→ return card

If no cards remain:
- if `endCondition = deck_complete`, end;
- otherwise show:
  - Restart Deck
  - Change Mode
  - End Game

Use simple unbiased random selection in v1.

---

## 12. Turn system

### Free play
`turnMode = "none"`

Use for:
- Spill or Sip
- confession games
- general group prompts

### Sequential
`turnMode = "sequential"`

Behavior:
- card completion advances current player;
- wraps to first player after final player.

Use for:
- couples games;
- challenge games;
- player-targeted modes.

---

## 13. Timer module

Optional.

Rules:
- show only when card has `timerSeconds`;
- support 15 / 30 / 60 seconds or custom per-card value;
- no heavy animation;
- readable on mobile;
- sound cue optional and off by default.

---

## 14. Scoring module

Optional.

If `scoringEnabled = false`:
- no score UI.

If true:
- card may award points;
- points assigned to players;
- final screen may show winner.

No complex ranking engine in v1.

---

## 15. State machine

Primary flow:

HOME
→ optional AGE_NOTICE
→ MODE_SELECT
→ CATEGORY_SELECT
→ optional PLAYER_SETUP
→ optional INTENSITY_SELECT
→ PLAY
→ optional DECK_COMPLETE
→ END

Future states not required in v1:
- LEVEL_UP
- SCORE_REVIEW
- CHALLENGE_PROOF
- VOTE_RESULT

---

## 16. UI shell

### Home
- game title/logo
- edition
- short subtitle
- Start button
- optional age notice
- optional How to Play

### Setup
Render only relevant controls:
- mode
- categories
- intensity
- players

Setup displays a live eligible-card count. Fewer than 5 matching cards shows
non-blocking guidance to add categories or intensities; zero matches disables
Start and asks the user to adjust filters.

### Play screen

```text
[ Game / Category label ]

[ Optional media ]

[ Prompt text ]

[ Optional target player ]

[ Primary card actions: SPILL / SIP ]

[ Shell navigation: Skip this card ]

[ Optional timer / score / progress ]

125 is the product library size. Gameplay progress uses the active card pool
matching the session categories and intensities, without excluding played IDs.
This session total stays stable as cards are played, restores from saved filters,
and is recalculated for restart. Exhaustion reaches TOTAL / TOTAL.
```

### End
- cards played
- optional duration
- optional winner
- Play Again
- Change Mode
- Exit

---

## 17. Theme system

```ts
type GameTheme = {
  id: string;

  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    mutedText: string;
  };

  typography: {
    headingFont: string;
    bodyFont: string;
  };

  borderRadius: string;

  logo?: string;
  backgroundAsset?: string;

  buttonStyle: "solid" | "soft" | "outline";
  cardStyle: "flat" | "elevated" | "glass";
};
```

Examples:
- Girls Night → dark premium + playful pink (hybrid theme)
- Bachelorette → bridal/pink/red
- Couples → dark/red/burgundy
- Foreplay → elegant/dark/premium

---

## 18. Performance requirements

- avoid unnecessary third-party UI libraries;
- code-split where useful;
- lazy-load media;
- do not load all game media at startup;
- optimize images;
- keep initial JS bundle small;
- no heavy animation framework unless justified;
- no autoplay-heavy content;
- usable on average mobile connection.

Preferred media:
- WebP / AVIF images
- short compressed MP4/WebM
- GIF allowed only when appropriate

---

## 19. Accessibility and usability

- readable font sizes
- strong contrast
- large touch targets
- semantic buttons
- alt text for images
- video should not require audio to understand gameplay
- no tiny controls
- no forced landscape orientation

---

## 20. Route structure

Preferred:

```text
/games/spill-or-sip
/games/foreplay-level-up
/games/bachelorette-confessions
```

Each route loads:
- manifest
- cards
- theme

---

## 21. Suggested project structure

```text
src/
  engine/
    gameEngine.ts
    cardSelector.ts
    ruleEngine.ts
    sessionManager.ts
    turnManager.ts
    scoreManager.ts
    timerManager.ts

  types/
    game.ts
    card.ts
    session.ts
    theme.ts

  data/
    games/
      spill-or-sip.json
    cards/
      spill-or-sip-girls-night.json
    themes/
      girls-night-hybrid-premium.json

  components/
    GameCard.tsx
    MediaRenderer.tsx
    ActionButtons.tsx
    CategorySelector.tsx
    IntensitySelector.tsx
    PlayerSetup.tsx
    Timer.tsx
    ScoreDisplay.tsx

  screens/
    HomeScreen.tsx
    SetupScreen.tsx
    PlayScreen.tsx
    EndScreen.tsx

  storage/
    localStorageAdapter.ts

  analytics/
    events.ts

  App.tsx
```

---

## 22. Analytics hooks

Suggested events:
- game_opened
- game_started
- mode_selected
- category_selected
- intensity_selected
- card_viewed
- action_clicked
- card_skipped
- game_ended
- game_restarted

No personally identifying information required.

---

## 23. Error handling

Graceful behavior:
- missing media → show card without media;
- broken media URL → fallback;
- missing optional field → ignore;
- empty category → friendly message;
- no eligible cards → deck-complete state;
- malformed game config → safe error screen;
- corrupted local session → discard and restart.

---

## 24. First content pack target

Spill or Sip — Girls Night Edition:

Production target:
- **125 cards total**
- **25 cards per category**
- production content is maintained in `Spill_or_Sip_Girls_Night_Content_DB_v1_2.xlsx`

Category distribution:
- Dating: 25
- Secrets: 25
- Funny: 25
- Chaos: 25
- Spicy: 25

Supported intensity display labels:
- Mild
- Bold
- Wild

The exact intensity distribution does not need to be artificially balanced across categories. Each category may use a different mix if that better matches the intended experience.

For the production pack:
- `target.type = "none"`
- `actionIds = ["spill", "sip"]`
- `skip` advances without answering; `next` remains internal navigation only
- all 125 production cards must load without rewriting engine logic

---

## 25. Acceptance criteria

Engine v1 is ready when:

### Core
- manifest loads;
- card pack loads;
- theme loads;
- game starts without account;
- category selection works;
- intensity selection works when enabled;
- optional player names work;
- random cards work;
- no-repeat works;
- text cards render;
- image cards render;
- GIF cards render;
- video cards render;
- media lazy-loads;
- SPILL/SIP card actions automatically advance exactly once;
- Skip advances exactly once without answering and preserves no-repeat history;
- no visible Next gameplay control;
- game can end manually;
- refresh preserves active session;
- restart clears played-card history;
- end screen works.

### Responsive
- works on common phone widths;
- works on tablet;
- works on desktop;
- text remains readable;
- buttons remain touch-friendly;
- no horizontal scroll during gameplay.

### Performance
- initial page does not preload all media;
- game remains responsive;
- large media does not block startup.

### Reusability
A second game pack can be created without rewriting the core engine.

This is a critical acceptance criterion.

---

## 26. Reusability test

After Spill or Sip works, create a second test game using the same engine.

Preferred test:
- Foreplay / Level-Up — Couples

The second game should primarily require:
- new manifest;
- new cards;
- new theme;
- existing turn/intensity features.

If significant core rewrites are required, review the architecture before expanding.

---

## 27. Technical implementation constraints

Initial implementation:
- TypeScript
- React
- Vite
- static JSON content
- localStorage
- GitHub repository
- static/low-cost hosting
- no backend unless proven necessary

The implementation should remain simple enough for AI-assisted maintenance.

---

## 28. Recommended Codex implementation order

1. Create project skeleton and TypeScript types.
2. Add sample manifest, sample cards, and sample theme.
3. Build game/config loader.
4. Build card selector and no-repeat logic.
5. Build session manager + localStorage.
6. Build UI shell.
7. Add media renderer.
8. Add optional timer.
9. Add optional scoring.
10. Add responsive design and theme support.
11. Load the full 125-card Spill or Sip production content pack.
12. Apply the approved `THEME_UI_SPEC.md`.
13. Deploy and complete production QA.
14. Implement the reusable printable generator from `PRINTABLE_SPEC.md`.
15. Generate the full printable deck and Quick Start / launcher outputs.
16. Perform second-game reuse test.

Each step should be tested before moving to the next.

---

## 29. Instructions for Codex

1. Do not add backend services unless explicitly requested.
2. Do not add authentication.
3. Do not add realtime multiplayer.
4. Do not add large dependencies without a clear reason.
5. Prefer small, readable modules.
6. Keep game logic separate from React UI.
7. Keep content separate from game logic.
8. Keep themes separate from game logic.
9. Use TypeScript strictly.
10. Avoid premature abstraction beyond this spec.
11. Do not rewrite working modules unnecessarily.
12. Add tests for card-selection logic, no-repeat behavior, and session persistence.
13. Preserve backward compatibility of the game manifest whenever possible.
14. Treat performance and mobile usability as first-class requirements.

---


## 29A. Product packaging — Spill or Sip v1

The first Etsy product is not WebApp-only.

The launch package is:

```text
Complete WebApp
+
Full 125-card Printable Edition
+
Quick Start PDF
+
START-HERE mobile launcher PDF
```

Commercial framing:

**1 Game — 2 Ways to Play**

The printable edition is a complete second play format, not a reduced bonus.

The printable deck and WebApp must derive from the same master content database so card content is not maintained manually in two places.

The mobile launcher PDF must provide:
- a large tappable WebApp link;
- a visible clickable fallback URL;
- a QR code for desktop/printed access.

The final customer-delivery details are governed by `PRINTABLE_SPEC.md`, `QUICK_START_SPEC.md`, and `ETSY_LISTING_SPEC.md`.

---

## 30. Definition of Done — MVP

The MVP is complete when:

- Spill or Sip — Girls Night Edition is playable end-to-end on a phone;
- startup requires only a few interactions;
- gameplay is understandable without explanation;
- all 125 production cards are supported;
- images/GIFs/video work;
- session survives refresh;
- no card repeats;
- UI follows the approved hybrid dark-premium / playful-pink direction;
- no account is required;
- a stable production URL can be used from customer-facing PDFs;
- full printable generation is supported from the same master content source;
- Quick Start and START-HERE launcher outputs can point to the production WebApp;
- a second game can be loaded using the same engine with minimal core changes.

At that point the WebApp engine is technically reusable and Spill or Sip is ready for deployment, printable generation, Etsy packaging, and real-world validation rather than further speculative development.
