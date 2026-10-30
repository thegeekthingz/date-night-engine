# v0.10 validation record

- Frozen CSV: 125 active printable cards, 125 unique IDs, continuous unique
  print_order 1–125; 25 cards in each of Dating, Secrets, Funny, Chaos, Spicy.
- Internal intensity counts: mild 39, spicy 55, wild 31. Display labels:
  Mild, Bold, Wild. Category Spicy unchanged.
- All prompt/category/intensity values match the production runtime deck.
- Both PDFs: 14 pages; 13 pages of 9 cards, last page 8 cards + blank slot.
- Extracted PDF numbering: 001/125 through 125/125, without gaps/duplicates.
- Paper dimensions: A4 210 x 297 mm; Letter 215.9 x 279.4 mm.
- Card dimensions: 63.5 x 88.9 mm, no scaling. Actual prompt fonts: 16–20 pt.
- Pinned fonts embedded; vector text. Repeated rendering is byte-identical.
- Automated tests: 99 WebApp + 8 printable tests pass. Strict TypeScript and
  Vite production build pass. Generator run after build; PDFs remain in dist.
- Visual review using Poppler: representative first, middle and final sheets,
  including pages 4, 9 and 12 for Secrets, Chaos, Spicy and the longest prompt.
  Both paper formats reviewed; all categories and intensity labels covered.
  No observed clipping/overlaps; consistent spacing, crop marks outside artwork,
  clear category/intensity distinction and a genuinely blank final slot.
- Additional pdfplumber inspection of all 28 pages: zero characters outside
  the 4 mm card safe areas. pdfplumber is a QA-environment tool, not required
  by the generator or its automated test suite.

No digital BLOCKER/MAJOR/MINOR defect identified in the checks performed.
Physical print QA remains pending and is required before customer release:
Letter top/bottom margin is only 3.85 mm before crop marks. Printer margins and
cut accuracy must be tested on real hardware at 100% scale. Duplex is not
implemented or included in this fronts-only milestone.

No content DB, gameplay, filtering, persistence, deploy, START-HERE or Quick Start
changes. No commit or deployment performed.


## v0.10.1 visual sync

- Five deterministic vector icons: Dating heart, Secrets lock, Funny smile,
  Chaos bolt, Spicy flame. Category text remains visible independently of color.
- Accent colors: Dating #B44E67, Secrets #765184, Funny #A46A18,
  Chaos #C02F7D, Spicy #C04D42. Shared rendering for both paper formats.
- Light #F7EAF1 background and dark #26121F prompt retained. Header rule 1.2 pt,
  icon strokes about 1 pt, footer separator 0.5 pt; no heavy colored fills.
- Prompt fitting, font files and actual 16-20 pt range unchanged. Header names
  are uppercase, intensity remains Mild / Bold / Wild, footer retains NNN/125.
- Content, print_order, card geometry, gutters, crop marks and pagination unchanged.
- A4 and Letter each have 14 pages: 13 x 9, then 8 cards and one blank slot.
- Poppler visual QA: pages 1, 7, 14 in both formats; A4 4 and 9 and Letter 12
  additionally cover Secrets, Chaos and long prompts. No clipping, header/footer
  collision or crop-mark collision observed. All five icons render correctly.
- pdfplumber inspection: 11,145 non-whitespace characters per PDF, all within
  the 4 mm safe areas across all 28 pages. Embedded TrueType fonts verified.
- 9 printable tests and 134 WebApp tests pass; strict TypeScript/build pass.
- Repeat generation is byte-identical for both outputs (SHA-256):
  A4: 3912539c8c3851d6d19b3a9b892a0eebbfdb584e2f2e733e0ff8996d8e861cc0
  Letter: 5ef9ac74b5bbe5ba04478bb00d48f8085f5c81d98efa5f58b5065416f3e60ec5
- No digital BLOCKER/MAJOR/MINOR observed. Physical print/cut QA remains pending;
  the pre-existing Letter margin limitation described above is unchanged.
