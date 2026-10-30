# Date Night — visual review

Status: PASS. Review date: 30 October 2026.
Local app: http://localhost:5173/
Browser: ChatGPT in-app Chromium browser.
Repository: E:\Etsy\GitHub\date-night-engine\date-night-engine
HEAD: 227ebc22704214034c5d7942109a412ae6173c4e, unchanged.

**30 real browser screenshots are saved in docs/screenshots/phase-5-review/.**
No mockups, image generation, product code, CSS, theme, test or package changes. No original Social Game Engine operations. No Phase 6 work.

## Main finding

The current interface is coherent, readable and calmer than a party game. It has a credible premium foundation, but the charcoal/sage system is visually low-energy and can read more like a boutique wellness product than a playful date. Vibes currently have no palette differentiation. The strongest next visual direction would be **B — one base theme plus restrained vibe-specific accents**, not four separate themes. This is a recommendation only; nothing was implemented.

## Capture method and scope

- Desktop viewport: 1440 × 900 CSS pixels.
- Mobile viewport: 390 × 844 CSS pixels.
- All visible states were reached through the existing UI, including Reveal, final completion, cancellation, and each vibe selection. End confirmation was captured on the Closer before cancelling confirmation and completing normally.
- Main screen sequences use Competitive / 15 min / Sweet. The four vibe comparisons hold 15 min, Sweet and the first Connect activity constant. Prompt selection remains random, so wording can differ between dates; that is not evidence of a visual theme change or of production-balanced vibe content.
- Long pages are full-page captures. A low-level full-page capture path initially produced framing defects; those files were replaced. Final long images are assembled from real native viewport captures at the top and exact bottom scroll positions. No text, colors, layout or UI content was retouched. Source captures were encoded as PNG; temporary tile files were removed.
- The browser capture surface scales scrollable frames slightly: some desktop files are 1425px wide and some mobile files 375px wide. These are actual captured pixel dimensions, not changes to the requested CSS viewport. Full-page heights naturally exceed 900/844 when the page scrolls. Exact final dimensions are below.
- Native scrollbar tracks can show a join in stitched full-page images. This is capture evidence, not an application layout defect. Keyboard focus rings are visible on headings, reveal regions or Keep Playing where the app places focus; they are not permanent card decoration.
- PNG signatures and image decoding were verified for all 30 outputs. Representative mobile Reveal/confirmation and desktop Setup images were opened and visually checked after final assembly.

## Screenshot inventory

| Screenshot | Actual PNG dimensions |
| --- | --- |
| [01-home-desktop.png](screenshots/phase-5-review/01-home-desktop.png) | 1440 × 900 |
| [02-setup-desktop.png](screenshots/phase-5-review/02-setup-desktop.png) | 1425 × 1112 |
| [03-connect-desktop.png](screenshots/phase-5-review/03-connect-desktop.png) | 1440 × 900 |
| [04-predict-hidden-desktop.png](screenshots/phase-5-review/04-predict-hidden-desktop.png) | 1440 × 900 |
| [05-predict-revealed-desktop.png](screenshots/phase-5-review/05-predict-revealed-desktop.png) | 1425 × 950 |
| [06-play-desktop.png](screenshots/phase-5-review/06-play-desktop.png) | 1440 × 900 |
| [07-challenge-desktop.png](screenshots/phase-5-review/07-challenge-desktop.png) | 1440 × 900 |
| [08-closer-desktop.png](screenshots/phase-5-review/08-closer-desktop.png) | 1440 × 900 |
| [09-end-confirmation-desktop.png](screenshots/phase-5-review/09-end-confirmation-desktop.png) | 1425 × 1069 |
| [10-completed-desktop.png](screenshots/phase-5-review/10-completed-desktop.png) | 1440 × 900 |
| [11-cancelled-desktop.png](screenshots/phase-5-review/11-cancelled-desktop.png) | 1440 × 900 |
| [12-home-mobile.png](screenshots/phase-5-review/12-home-mobile.png) | 375 × 1154 |
| [13-setup-mobile.png](screenshots/phase-5-review/13-setup-mobile.png) | 375 × 1146 |
| [14-connect-mobile.png](screenshots/phase-5-review/14-connect-mobile.png) | 375 × 837 |
| [15-predict-hidden-mobile.png](screenshots/phase-5-review/15-predict-hidden-mobile.png) | 375 × 869 |
| [16-predict-revealed-mobile.png](screenshots/phase-5-review/16-predict-revealed-mobile.png) | 375 × 1045 |
| [17-play-mobile.png](screenshots/phase-5-review/17-play-mobile.png) | 375 × 837 |
| [18-challenge-mobile.png](screenshots/phase-5-review/18-challenge-mobile.png) | 375 × 869 |
| [19-closer-mobile.png](screenshots/phase-5-review/19-closer-mobile.png) | 375 × 837 |
| [20-end-confirmation-mobile.png](screenshots/phase-5-review/20-end-confirmation-mobile.png) | 375 × 1076 |
| [21-completed-mobile.png](screenshots/phase-5-review/21-completed-mobile.png) | 390 × 844 |
| [22-cancelled-mobile.png](screenshots/phase-5-review/22-cancelled-mobile.png) | 390 × 844 |
| [23-cozy-setup.png](screenshots/phase-5-review/23-cozy-setup.png) | 1425 × 1112 |
| [24-cozy-play.png](screenshots/phase-5-review/24-cozy-play.png) | 1440 × 900 |
| [25-funny-setup.png](screenshots/phase-5-review/25-funny-setup.png) | 1425 × 1112 |
| [26-funny-play.png](screenshots/phase-5-review/26-funny-play.png) | 1440 × 900 |
| [27-romantic-setup.png](screenshots/phase-5-review/27-romantic-setup.png) | 1425 × 1112 |
| [28-romantic-play.png](screenshots/phase-5-review/28-romantic-play.png) | 1440 × 900 |
| [29-competitive-setup.png](screenshots/phase-5-review/29-competitive-setup.png) | 1425 × 1112 |
| [30-competitive-play.png](screenshots/phase-5-review/30-competitive-play.png) | 1440 × 900 |

## Selected views

### Desktop Home

![Desktop Home](screenshots/phase-5-review/01-home-desktop.png)

### Mobile setup

![Mobile setup](screenshots/phase-5-review/13-setup-mobile.png)

### Mobile revealed activity

![Mobile revealed activity](screenshots/phase-5-review/16-predict-revealed-mobile.png)

### Mobile End confirmation

![Mobile End confirmation](screenshots/phase-5-review/20-end-confirmation-mobile.png)

## Current theme and actual values

Sources: the current date-night-warm theme JSON, date-night.css, and computed styles in the live browser. These are existing values, not proposed replacements.

| Element/token | Current value | Effect |
| --- | --- | --- |
| Page/background | #171916 | Very dark warm charcoal with a green undertone. |
| Card/surface | #222620 | Soft dark olive-neutral, close to page color. |
| Primary accent | #C6D4AE | Pale sage; filled primary buttons and Connect accent. |
| Secondary accent | #D5B69B | Warm sand/caramel; eyebrows and supporting decoration. |
| Main text | #F5F1E8 | Warm ivory. |
| Muted/helper text | #B8BCAF | Pale neutral green-grey. |
| Footer/tertiary secondary text | #AEB4A5 | Quieter but readable against the page. |
| Primary button | background/border #C6D4AE; text #1A2117 | Clear filled CTA. |
| Primary hover | #D8E3C6 | Lighter sage; hover is not a vibe change. |
| Secondary button | background #222620; text #F5F1E8; border #545C4C | Restrained outline/surface treatment. |
| Selected setup option | background #30392A; border and inset ring #C6D4AE | Selected state uses fill, outline and checked radio. |
| Unselected setup option | background #222620; border #4A5242 | Low-key separation. |
| Focus indicator | #E1D0B4 | Warm, strong outline; controls use 3px focus-visible treatment. |
| Progress: unfilled | #3B4235 | Quiet track. |
| Progress: completed | #8F9F7B | Darker sage than active stage. |
| Progress: current | current activity accent | Activity-family identity, not vibe identity. |
| Reveal region | background #313A2B; border #6D7B5E | Distinct green-tinted region within the card. |
| Reveal text | #F5F1E8; 18px, line-height 1.7 | More readable than the previous technical preview. |
| Reveal eyebrow | #D4E2BC | Small supporting label. |
| Swap | secondary-button treatment | Secondary helper row, clearly below Done. |
| End link | transparent surface; #B8BCAF text | Tertiary, separated from routine actions. |
| End confirmation | background #2B2821; border #9D7C67 | Warmer distinct confirmation panel. |
| END DATE confirmation button | background #352823; border #986B5C; text #F6D7CC | Soft danger cue without bright red dominance. |
| Completion | same page/surface system; mark #C6D4AE | Coherent but not much celebratory color change. |

Fonts: Georgia/Times New Roman for display and prompt text; system-ui/-apple-system/BlinkMacSystemFont/Segoe UI for body and controls. No external font is required. Card radius: 24px; primary/secondary buttons: 13px; selectable controls: 14px.

### Existing activity-stage accents

| Stage | Current accent |
| --- | --- |
| Connect | #C6D4AE |
| Predict | #CBBBDC |
| Play | #D9C78C |
| Challenge | #D7AE92 |
| Closer | #B5C9C1 |

These currently change the small stage marker, active progress segment and card top border. They should not be confused with vibe-specific styling.

### Sampled contrast

Computed from the actual sRGB hex values using relative luminance:

| Pair | Contrast ratio |
| --- | --- |
| Main text / page | 15.69:1 |
| Main text / card | 13.64:1 |
| Muted text / page | 9.14:1 |
| Primary button text / fill | 10.54:1 |
| Reveal text / region | 10.52:1 |
| Secondary border / secondary surface | 2.20:1 |

Sampled text contrast is strong, including helper text and Reveal. This does not certify every UI state against every accessibility criterion. Some outline/surface edges are intentionally subtle; secondary controls whose boundary is needed for identification deserve a separate non-text contrast check. Do not weaken the strong text contrast to introduce more color.

## Visual questions

| Question | Assessment |
| --- | --- |
| 1. Visually engaging? | Moderately. Home has a strong serif promise and clear CTA. Activity screens are composed and readable, but color does not add much anticipation. |
| 2. Too muted/flat/low-energy? | Somewhat. Page and card are very close in hue; nearly all accents are desaturated. Suitable for Cozy, less expressive for Funny or Competitive. |
| 3. Premium? | Yes, as a foundation. Warm ivory, restrained spacing, serif/system pairing and consistent surfaces feel intentional. It is closer to quiet editorial premium than high-energy entertainment. |
| 4. Romantic without cliché? | Mostly yes. It avoids neon pink, hearts everywhere and overtly suggestive styling. The trade-off is that it can feel neutral/wellness-oriented rather than emotionally intimate. |
| 5. Strong enough contrast? | Yes for the sampled text and primary actions. The muted appearance is caused by low saturation and similar surfaces, not unreadable main text. Subtle control edges still merit review. |
| 6. Primary actions obvious? | Yes. Filled pale-sage Build/Done/New Date buttons contrast clearly against the dark page; secondary Swap/Reveal and tertiary End are differentiated. |
| 7. All screens too similar? | Layouts differ meaningfully between Home, setup, Play and results. Their palette is almost entirely shared. The five activity screens intentionally share architecture, with accents so restrained that their emotional differences can be missed. |
| 8. Does changing vibe differentiate visuals now? | No palette differentiation. Setup changes which radio card is selected. All first Connect views share the same colors and styling. Random prompt variation is independent evidence, not visual theming. |
| 9. Would vibe accents improve it? | Yes, if a small coherent layer rather than a wholesale recolor. They could make the user's choice feel acknowledged and add energy where appropriate. |
| 10. Are four full themes excessive? | Yes at this stage. Four palettes, surfaces and visual systems multiply contrast/state QA and weaken recognition without a demonstrated product need. |

## Vibe comparison evidence

For Cozy, Funny, Romantic and Competitive, live computed first-activity values were identical:

- Page: rgb(23,25,22), #171916.
- Card: rgb(34,38,32), #222620.
- Connect card accent: rgb(198,212,174), #C6D4AE.
- Resting primary button: rgb(198,212,174), #C6D4AE.
- Text: rgb(245,241,232), #F5F1E8.

The screenshot pairs 23–30 show the current truth: one static theme. The selected setup card moves, but its selected treatment is the same sage. There is no vibe-specific background, motif or card surface. Existing stage accent changes are based on Connect/Predict/etc., not Cozy/Funny/etc.

## Scores for the current product

These are visual review judgments, not measured customer outcomes.

| Dimension | Score | Reason |
| --- | --- | --- |
| Color energy | 4/10 | Calm and controlled, but desaturated throughout. |
| Premium feel | 7/10 | Consistent editorial foundation with good restraint. |
| Date Night emotion | 6/10 | Warm and couple-oriented in copy; palette alone is more neutral than intimate. |
| Visual hierarchy | 8/10 | Clear promise, grouped setup, strong prompt and Done, separated End. |
| Mobile visual quality | 7/10 | Readable cards and generous choices; long setup/Reveal require significant scrolling. |
| Desktop visual quality | 7/10 | Balanced hero and readable content widths; activity/result screens remain visually quiet. |
| Vibe differentiation | 1/10 | Selection state changes; the theme does not. |

## Recommendation: B — one base theme plus vibe-specific accents

Retain a recognizable Date Night identity and introduce a restrained mood layer. Do not build four full themes. Also do not erase the existing activity-family cues: stage identity and vibe are different dimensions, so two competing color systems should not fight for the same visual element.

### Conceptual directions only — not implemented

| Vibe | Suggested direction | Possible scope | Avoid |
| --- | --- | --- | --- |
| Cozy | Amber, soft caramel, warm linen | A subtle warm surface wash, selected-choice tint and supporting eyebrow accent. | Brown-on-brown low contrast or a dull sepia filter. |
| Funny | Buttery gold or light apricot | Slightly brighter supporting accents and a livelier selected state, with the same restrained layout. | Neon yellow, confetti, game-show graphics or childish shapes. |
| Romantic | Dusty rose, muted terracotta or a soft wine accent | A warmer intimate tint around supporting surfaces and the chosen-vibe cue. | Pink-heavy party styling, cliché hearts or reduced text contrast. |
| Competitive | Muted teal or a clean cool blue | Crisp supporting accent and clearer selected-state energy. | Casino colors, scoreboards, flashing effects or adversarial cues. |

These are palette families rather than approved final hex values. Any future values should be checked against actual backgrounds, text and disabled/focus states before implementation.

### Keep consistent across vibes

- Product mark, typography, scale, radii, content widths and spacing rhythm.
- Home/setup/Play/result hierarchy and responsive behavior.
- Primary/secondary/tertiary action hierarchy; retaining the recognisable sage Done action is a reasonable baseline.
- Functional stage/progress semantics, clear focus indicators and safe End/danger semantics.
- High text contrast, readable Reveal and accessible selected states.
- All engine behavior, persistence and no-repeat guarantees.

### May vary across vibes

- A small selected-vibe cue in setup or the activity header.
- Supporting eyebrow/accent color, subtle ambient/surface tint, or a restrained decorative rule.
- A slightly warmer/cooler neutral surface wash that still keeps the same base structure.

Do not recolor every button, overwrite stage identity with vibe identity, or add multiple overlapping badges just to prove the theme changed. A person should still recognize the same product immediately.

## Strengths to preserve

Clear editorial typography; strong text contrast; obvious primary actions; intentional action separation; readable revealed area; large setup targets; coherent stage recipe; distinct completed/cancelled copy; keyboard focus visibility. The current restraint is valuable—add emotional range rather than replacing it with decoration.

## Weaknesses to discuss during human review

The color energy is low for three of the four vibes; card/page separation is subtle; stage accents are easy to overlook; completion is emotionally quiet; setup and revealed activities can be long on mobile. Large heading focus outlines are expected keyboard evidence, but their styling can look like a permanent frame in a still image. Keep accessible focus while reviewing its visual refinement.

## Integrity and limits

Thirty PNG files and this Markdown report are the only outputs of this task. SHA-256 fingerprints of 138 pre-existing non-document repository files matched before and after capture. No source, index.html, theme, CSS, tests, package files or source assets changed. Existing uncommitted Phase 4/5 changes were left in place. No tests or builds were needed for screenshot-only documentation.

This set shows synthetic preview activities, not the final production pack. It does not establish production content quality or real-world emotional outcomes. The recommendation is for later design consideration only. Phase 6 was not started.
