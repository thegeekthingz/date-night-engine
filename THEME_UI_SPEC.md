# THEME_UI_SPEC.md
# Spill or Sip — Girls Night Edition
Version: 1.1

## 1. Final visual direction

The final visual direction is a **hybrid dark premium / playful pink** style.

It combines:

- the premium, app-first feel of the dark nightlife concept;
- the clarity, friendliness and immediate readability of the light playful concept;
- a general Girls Night positioning rather than an After Dark / erotic identity.

The product must feel:

**modern · social · cheeky · premium · playful · confident · easy to use**

It must NOT feel:

- childish;
- overly bridal;
- overly sexual;
- nightclub-aggressive;
- kitsch;
- visually overloaded;
- like a generic Canva printable.

---

## 2. Core design principle

The interface should use a **dark plum / black-cherry base** with **clean spacing, bright pink accents, soft blush surfaces and high-contrast typography**.

The visual system should feel polished and paid, but still approachable.

The target is:

> **Dark foundation + light visual clarity + playful pink energy**

This is the official design direction for Spill or Sip — Girls Night Edition.

---

## 3. Color system

### Primary palette

```text
Background:         #160A13
Background Soft:    #1E0D19

Surface:            #26121F
Surface Elevated:   #311728
Surface Soft:       #F7EAF1

Primary Pink:       #FF3F95
Primary Pink Soft:  #FF75B2

Secondary Coral:    #FF6B72
Accent Blush:       #FFD8E8
Accent Warm:        #F4C6D8

Text Primary Dark UI:     #FFF8FC
Text Secondary Dark UI:   #D9B9CA
Text Muted Dark UI:       #A98A99

Text Primary Light UI:    #26121F
Text Secondary Light UI:  #6D4B5E

Border Dark:        #4A273D
Border Soft:        #E5C7D6
```

### Color usage

- Main application background stays dark.
- Cards and panels may use slightly lighter plum surfaces.
- Soft blush/light surfaces can be used selectively inside setup controls or media containers to increase clarity.
- Hot pink is the primary CTA/accent color.
- Coral is secondary and supports SIP or alternate actions.
- Avoid neon glow effects.
- Avoid excessive gradients.
- If gradients are used, they must be subtle and limited to CTA emphasis or decorative background accents.

---

## 4. Typography

### Direction

Use two complementary styles:

**Display / Branding**
- elegant but modern;
- slightly editorial;
- premium;
- used sparingly.

**UI / Prompt**
- highly readable sans-serif;
- clean;
- modern;
- mobile-first.

### Recommended direction

```text
Brand / Display:
DM Serif Display / Playfair Display / similar elegant display face

UI / Body / Prompt:
Inter / Manrope / system sans-serif
```

Do not use script fonts for functional UI text.

Script-like accents may be used only for very small decorative slogans, never for prompts or controls.

### Mobile sizing

```text
Brand title:          34–44px
Screen heading:       26–32px
Prompt text:          26–30px
Category label:       12–14px
Button text:          16–18px
Body/help text:       15–17px
Meta/progress:        13–15px
```

Prompt readability always wins over style.

---

## 5. Spacing system

Use a 4px base scale:

```text
4px
8px
12px
16px
24px
32px
40px
48px
```

Default page padding:

```text
Mobile: 16px
Tablet: 24px
Desktop: 32px
```

The UI should feel airy and controlled, not dense.

---

## 6. Border radius and surfaces

```text
Small controls: 10px
Buttons: 14px
Selectable chips: 14px
Cards: 20px
Large panels: 24px
```

### Gameplay card

```text
Background: Surface Elevated
Border: 1px solid Border Dark
Shadow: subtle
```

### Setup/selectable cards

Can use:
- dark surfaces with pink outline when selected;
- occasional soft blush surfaces for visual contrast.

Avoid glassmorphism-heavy styling.

---

## 7. Button hierarchy

### Primary gameplay actions

```text
SPILL
SIP
```

These must dominate the play screen. Each SPILL or SIP activation automatically
advances exactly once. Skip also advances once, without answering; the card remains
in played history. All three use the existing shared next-card handler and
exhaustion/end behavior.

Suggested layout:

```text
[      SPILL      ] [       SIP       ]
```

### SPILL

- Primary Pink
- solid fill
- white text
- optional soft highlight

### SIP

- Secondary Coral or lighter pink-coral
- solid fill
- white text

### Secondary actions

```text
SKIP THIS CARD
END GAME
BACK
```

Rules:

- Next is internal navigation only; do not display a Next gameplay button.
- Skip this card: text/low emphasis; advances without answering.
- End Game: low emphasis
- Back: icon or subtle text
- minimum touch height: 44px

---

## 8. Home screen

### Objective

Immediately communicate:
- game identity;
- Girls Night mood;
- fast start.

### Recommended layout

```text
SPILL OR SIP
Girls Night Edition

Secrets. Stories. Chaos.

How honest are you feeling tonight?

[ START GAME ]

18+
```

### Visual style

- dark background;
- clean central composition;
- pink brand title;
- one subtle decorative cocktail/heart element;
- no clutter;
- no carousel;
- no long onboarding.

---

## 9. Setup screen

### Objective

Configuration must feel playful, not like a settings form.

### Order

1. Choose mode
2. Choose categories
3. Choose intensity
4. Optional player names
5. Start

### UI style

Use selectable tiles/chips.

Example:

```text
Choose Your Vibe

[ Dating ]   [ Secrets ]
[ Funny ]    [ Chaos   ]
[ Spicy  ]
```

Selected state:
- pink border/fill;
- clear checkmark or state change.

Intensity:

```text
[ Mild ] [ Bold ] [ Wild ]
```

Each intensity may include a short descriptor:

```text
Mild   — Keep it light
Bold   — Turn up the heat
Wild   — No limits
```

Player names remain optional.

Intensity display labels are Mild / Bold / Wild in Setup and card metadata. Internal values remain `mild` / `spicy` / `wild`; the Spicy category label is unchanged.

Show a subtle live count: "X cards in this vibe". For 1–4 cards, show
non-blocking guidance to broaden the selections; for zero matches, disable Start
and ask the user to adjust filters.

---

## 10. Play screen

This is the highest-priority screen.

### Layout

```text
[ Back ]      Spill or Sip      [ Menu ]

[ Progress bar ]            played / session total

[ Category · Intensity ]

[ Optional media ]

[ Prompt text ]

[ SPILL ] [ SIP ]

[ Skip this card ]
```

125 is the total product library, not the denominator for every session.
Progress uses the active pool matching the session categories and intensities;
the denominator must not shrink as cards are played.

### Visual hierarchy

1. Prompt
2. SPILL / SIP
3. Optional media
4. Category / intensity
5. Progress / navigation

### Hybrid-style rules

- dark outer shell;
- prompt card may use a dark plum surface with a soft pink border;
- prompt text high-contrast;
- occasional soft blush highlights can be used in badges or media frames;
- keep the card visually clean even when media is present.

---

## 11. Text-only gameplay card

```text
┌──────────────────────────────┐
│ DATING · SPICY               │
│                              │
│ What's the biggest red flag  │
│ you ignored because they     │
│ were attractive?             │
│                              │
│ [ SPILL ]      [ SIP ]       │
│                              │
│       Skip this card         │
└──────────────────────────────┘
```

Text-only cards must feel complete and intentional, not empty.

---

## 12. Media gameplay card

Media is secondary to the prompt.

Recommended structure:

```text
[ FUNNY · MILD ]

[ media area ]

Prompt text

[ SPILL ] [ SIP ]

Skip this card
```

Media must not push key controls too far below the fold.

---

## 13. End screen

Suggested copy:

```text
THAT WAS JUICY.

32 cards played
48 minutes

[ PLAY AGAIN ]
[ CHANGE VIBE ]
[ BACK TO HOME ]
```

Visual tone:
- celebratory;
- polished;
- pink accents;
- no heavy confetti animation.

---

## 14. Menu / How to Play

A lightweight menu can include:

```text
Home
New Game
How to Play
Categories
Settings
About
```

How to Play should be short:

```text
1. Set your vibe
2. Take turns
3. Spill or sip
4. Keep going
```

No long rules wall.

---

## 15. Media rules

Recommended content mix:

```text
Text-only:       ~80%
Image/GIF:       ~15%
Video:           ~5%
```

### Images
- WebP / AVIF preferred;
- lazy loaded;
- preserve aspect ratio.

### GIF
- use sparingly;
- avoid heavy assets;
- prefer compressed video if smaller.

### Video
- no autoplay with sound;
- metadata preload only;
- controls available;
- poster preferred.

### Failure behavior
If media fails:
- prompt stays visible;
- actions remain usable;
- game continues normally.

---

## 16. Motion and micro-interactions

Allowed:

- quick fade-in;
- subtle card transition;
- button press scale;
- pink selection glow/border;
- lightweight progress animation.

Avoid:

- 3D transitions;
- large animation frameworks;
- looping decorative motion;
- confetti spam;
- slow screen transitions.

Target:

**fast, polished, satisfying**

---

## 17. Responsive rules

### Mobile

Primary target.

- single-column;
- max width ~560px;
- large touch targets;
- no horizontal overflow;
- prompt visible comfortably;
- minimal scroll during play.

### Tablet

- same hierarchy;
- more spacing;
- larger card width.

### Desktop

- centered shell;
- max gameplay width ~680px;
- do not turn into a dashboard.

### Large screen / TV

- preserve readability;
- scale carefully;
- maintain mobile game composition.

---

## 18. Accessibility

Required:

- strong contrast;
- keyboard focus;
- visible active/selected states;
- alt text;
- no flashing;
- large touch targets;
- no forced orientation;
- video must not require audio.

---

## 19. Theme configuration target

```json
{
  "id": "girls-night-hybrid-premium",
  "colors": {
    "background": "#160A13",
    "surface": "#26121F",
    "primary": "#FF3F95",
    "secondary": "#FF6B72",
    "text": "#FFF8FC",
    "mutedText": "#A98A99"
  },
  "typography": {
    "headingFont": "DM Serif Display",
    "bodyFont": "Inter"
  },
  "borderRadius": "20px",
  "buttonStyle": "solid",
  "cardStyle": "elevated"
}
```

Implementation may use a system fallback if web font loading affects performance.

---

## 20. Brand copy direction

Tone:

- playful;
- confident;
- cheeky;
- social;
- not vulgar by default.

Recommended:

```text
Secrets. Stories. Chaos.
How honest are you feeling tonight?
Choose your vibe.
Turn up the heat.
Ready to spill?
```

Avoid:
- explicit erotic branding;
- bridal-only language;
- childish slang;
- long explanations.

---

## 21. Performance constraints

Do not compromise engine performance for visuals.

Avoid:

- large UI libraries solely for styling;
- heavy animation packages;
- large decorative image sets;
- background video;
- unnecessary custom font weights.

Prefer:

- CSS variables;
- CSS transitions;
- lightweight SVG;
- optimized assets;
- one or two font families maximum.

---

## 22. Codex implementation rules

When implementing this UI:

1. Preserve existing gameplay logic.
2. Do not rewrite engine modules.
3. Implement primarily through CSS/theme configuration.
4. Keep components game-agnostic.
5. Do not hardcode layout to one category.
6. Preserve lazy media loading.
7. Preserve accessibility.
8. Preserve mobile responsiveness.
9. Do not add backend.
10. Do not add large dependencies.
11. Keep the interface clean.
12. Use the hybrid dark-premium / playful-pink direction consistently.

---

## 23. Acceptance criteria

The theme is complete when:

- Home looks like a paid consumer product.
- Setup looks like a game configuration experience, not a form.
- Play screen works comfortably on a normal smartphone.
- Prompt is visually dominant.
- SPILL and SIP are immediately identifiable.
- Text-only cards feel complete.
- Media cards remain balanced.
- Dark theme feels premium but not overly sexual.
- Pink accents keep the Girls Night tone approachable.
- End screen feels polished and celebratory.
- No horizontal overflow.
- No heavy layout shifts.
- No heavy visual dependency added.
- Existing gameplay tests still pass.

---

## 24. Final visual statement

**Spill or Sip — Girls Night Edition should feel like a polished digital party game for a modern night with friends: dark and premium at its foundation, but softened by clean spacing, playful pink accents and approachable Girls Night energy.**
