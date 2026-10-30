# Phase 7 - Printable companion pack

> Historical initial-edition report. Current printable content revision 2 was regenerated in Phase 6.8 without visual/layout changes; Romantic Challenge is now DN-CHA-013. See [the current correction report](DATE_NIGHT_PHASE_6_8_TARGETED_FIXES.md) and [content map](DATE_NIGHT_PRINTABLE_CONTENT_MAP.md).

Status: **PASS**. Four curated offline mini-dates, exactly 20 activities. The WebApp remains the primary product. No Etsy launch assets, listing work, deployment, pricing, analytics or subsequent phase work was started.

## Positioning and value

**Interactive Date Night WebApp + bonus printable offline date nights.** The printable is independently useful when a customer cannot access the app: one page contains a complete journey with instructions and Predict comparison text. It does not replace the WebApp: only 20 of 72 activities appear, in four fixed recipes, without personalization, automated timing selection, randomized combinations, interactive Reveal, Swap or restore.

Offline usefulness: YES. Replacement of the full WebApp value: NO.

## Curated journeys

| Date | Opening / discovery / centerpiece / energy shift / ending | Production IDs |
|---|---|---|
| Cozy Date | From a small comfort to an imaginary shared haven, then a gentle celebration and a memory to keep. | DN-CON-001, DN-PRE-001, DN-PLY-007, DN-CHA-003, DN-CLO-001 |
| Funny Date | Warm up with an everyday story, get wonderfully impractical, try a tiny debate and finish with your own sign-off. | DN-CON-002, DN-PRE-002, DN-PLY-002, DN-CHA-008, DN-CLO-003 |
| Romantic Date | Notice the attraction in small details, discover anticipation, create chemistry and finish with an ending you both welcome. | DN-CON-015, DN-PRE-013, DN-PLY-013, DN-CHA-012, DN-CLO-006 |
| Competitive Date | Recognize each other’s strengths, test predictions, solve an invented mystery and try a shared memory challenge before choosing another date. | DN-CON-004, DN-PRE-010, DN-PLY-010, DN-CHA-005, DN-CLO-004 |

Each sequence is Connect -> Predict -> Play -> Challenge -> Closer. All 20 source IDs are distinct, active production items and support their selected vibe. Cozy, Funny and Competitive are Sweet. Romantic contains tasteful Flirty choices and is labeled as a little more spark. No scoring, required physical affection, purchases, alcohol or printing props are introduced.

See [DATE_NIGHT_PRINTABLE_CONTENT_MAP.md](DATE_NIGHT_PRINTABLE_CONTENT_MAP.md) for all 20 printable texts, source IDs, intensities and individual selection rationales. Only two wording adaptations replace role-related “swap” with “change”; typographic punctuation is normalized for print. The production pack is unchanged.

## Sources and generation

- Single content source: src/data/printable/date-night-mini-dates.json. It is not imported by the WebApp.
- Generator: scripts/generate-date-night-printables.py.
- Rebuild: **python scripts/generate-date-night-printables.py** from the repository directory.
- Existing installed tools: ReportLab, pypdf, Windows Georgia/Segoe UI fonts and Poppler. No dependencies or package files were installed or changed.
- Typography and geometry are shared by all four editions; only page dimensions and the color/ink-saver palette differ. This avoids four separate layouts to maintain.

## Final editions

| File | Dimensions | Pages | Result |
|---|---|---|---|
| [A4 Color](../output/pdf/Date-Night-Mini-Dates_A4_Color.pdf) | 210 x 297 mm; 595.2756 x 841.8898 pt | 6 | PASS |
| [A4 Ink-Saver](../output/pdf/Date-Night-Mini-Dates_A4_Ink-Saver.pdf) | 210 x 297 mm | 6 | PASS |
| [US Letter Color](../output/pdf/Date-Night-Mini-Dates_US-Letter_Color.pdf) | 8.5 x 11 in; 612 x 792 pt | 6 | PASS |
| [US Letter Ink-Saver](../output/pdf/Date-Night-Mini-Dates_US-Letter_Ink-Saver.pdf) | 8.5 x 11 in | 6 | PASS |

Page architecture: 1 Cover, 2 Quick Start, 3 Cozy, 4 Funny, 5 Romantic, 6 Competitive. Every date fits on one page without shrinking type. No accidental blank pages or additional workbook pages.

## Visual and print design

Light paper surfaces replace screen darkness. Georgia headings and Segoe UI text retain the WebApp family identity. Color editions use subtle tinted headers, small accent rules, stage labels and large amounts of white space. The cover has a nearly white warm tone, not a dark full-bleed surface. There are no raster backgrounds, QR placeholders or large saturated panels.

| Vibe | Print accent | Header tint | Accent/header contrast |
|---|---|---|---|
| Cozy | #805512 | #FAF1DF | 5.80:1 |
| Funny | #A5422D | #FCF0E8 | 5.49:1 |
| Romantic | #873B63 | #F9EDF3 | 6.50:1 |
| Competitive | #914316 | #FBEEE3 | 6.11:1 |

Body text is dark #242722, with #55594F supporting text in color editions. Print accents are deliberately darker than screen accents for paper contrast. Ink-saver editions retain the exact content and hierarchy with white backgrounds, neutral text, small rules, and no filled header panels. Drawing colors use CMYK with C=M=Y=0 (K only); no RGB drawing operators remain in either ink-saver PDF.

Activity body: **13 pt / 18.5 pt leading**. Predict comparison body: **12.3 pt / 17.5 pt leading**. Quick Start body is 11.8-12.5 pt; print settings note is 10.8 pt. Footer metadata is 8.5 pt. All important instructions remain readable rather than being reduced to tiny type.

Main left/right margins: 54 pt (19.05 mm), with header tint edge 44 pt (15.52 mm). Footer baseline is 28 pt (9.88 mm), clear of typical home-printer non-printable edges. Lowest activity block bottom is 105.5 pt. No trim, bleed or cutting is required. Print at Actual Size / 100% using the matching paper size; single-sided is simplest. Individual date pages may be printed alone.

## Quick Start and WebApp reminder

The Quick Start explains choosing a vibe, starting with Connect, following five stages, going at your own pace, and keeping things kind with no prep or score. Predict prompts include “NOW COMPARE YOUR ANSWERS” directly beneath the prompt, with the production comparison instruction. No hidden answers, app controls or online access are required to complete a printed date.

One short Quick Start paragraph explains the WebApp advantages: personalized vibe, 15/30 minutes, Sweet/Flirty, randomized dates, Swap and Reveal. These names occur as feature descriptions only, not printable controls. No unverified production URL or temporary LAN address is printed.

## Content and PDF QA

- 4 dates x 5 entries = 20 activities, 20 unique source IDs.
- Exact slot order validated on each date and in extracted PDF page text.
- All 20 prompts and all 4 Predict comparison instructions extracted and matched to the structured print source in every edition.
- No tap, swipe, click, refresh, Swap, Done or Build My Date controls in activity prompts.
- No old branding or fixture text in PDFs.
- All four PDF MediaBoxes and six-page counts validated with pypdf.
- Geometry assertions guard margins and block fit; all 80 rendered activity blocks across four PDFs fit without overflow.
- All **24 pages rendered with Poppler at 110 dpi and visually inspected**, including four complete page overviews and a full-page Romantic typography review. No overlapping text, orphan headings, missing glyphs, clipped lines, accidental blanks or inconsistent page numbering were observed.
- Typography was increased from the first draft to 13 pt activity body before final review. Ink-saver colors were then refined to K-only output and the final pages re-rendered and reviewed.

QA evidence: docs/printable-qa/ contains 24 rendered page PNGs, four overview sheets, layout-metrics.json and pdf-verification.json. These are review artifacts, not customer marketing assets.

## WebApp regression and isolation

- pnpm run typecheck: PASS.
- pnpm test: PASS, **450/450**.
- pnpm run build: PASS. Existing production CSS/JS asset hashes remain index-CLAXrJ45.css and index-z4_OyBhE.js.
- git diff --check: PASS.
- SHA-256 task-start/final checks confirm unchanged composer, actions, controller, storage, schema/contracts, 72-item pack, active manifest/loader, App, CSS and vibe tokens, plus package.json and lockfile.
- Original Social Game Engine was never targeted or modified.
- HEAD remains 227ebc22704214034c5d7942109a412ae6173c4e. No commit or push. Pre-existing uncommitted work was preserved.

New task files: structured printable JSON, Python generator, content map, this report, four PDFs in output/pdf/, and PDF QA artifacts in docs/printable-qa/. No WebApp runtime integration was added.

## Known limitations and recommendation

Print QA is digital preflight and rendered inspection, not a physical printer proof. Printer profiles, paper and ink can alter colors; an actual-size test print is recommended before distribution. Ink-saver provides a white-background fallback. Regeneration currently assumes Windows Georgia/Segoe UI font paths and the installed Python libraries; PDF readers do not need those fonts because the fonts are embedded.

The user reports real-smartphone testing completed with no blocking issue; this phase does not invent missing phone model or test details. Final launch links can be supplied separately when authorized. The companion is ready for human print review and subsequent Etsy launch-asset work, which has not begun.
