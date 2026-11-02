# Phase 6.11 - Final customer delivery package

Date: 2026-11-02 (Europe/Rome). Package QA status: **PASS**. This phase creates the final five-file customer package; no Etsy listing/gallery assets, title, tags, pricing, video or WebApp changes.

## Release location and files

Release directory: `release/etsy/date-night-v1/` (repository root: `E:/Etsy/GitHub/date-night-engine/date-night-engine`). Exactly five customer-facing PDFs, no other files. This directory is the Etsy upload source; internal evidence and reports remain elsewhere. No ZIP is needed.

| File | Pages | Bytes | MediaBox per page (points) | Paper |
| --- | --- | --- | --- | --- |
| 01_START_HERE_Date_Night.pdf | 2 | 77,074 | 595.2756 x 841.8898 | A4 (210 x 297 mm) |
| 02_Date_Night_A4_Color.pdf | 6 | 84,207 | 595.2756 x 841.8898 | A4 (210 x 297 mm) |
| 03_Date_Night_A4_Ink_Saver.pdf | 6 | 83,178 | 595.2756 x 841.8898 | A4 (210 x 297 mm) |
| 04_Date_Night_US_Letter_Color.pdf | 6 | 83,949 | 612.0 x 792.0 | US Letter (8.5 x 11 in) |
| 05_Date_Night_US_Letter_Ink_Saver.pdf | 6 | 82,991 | 612.0 x 792.0 | US Letter (8.5 x 11 in) |

Total: **26 pages** (START HERE 2 + printables 24), **411,399 bytes** (approximately 0.411 MB / 401.8 KiB). Each file is below 0.1 MB and well below Etsy's 20 MB-per-file limit. Etsy allows five digital files, supports PDF, and permits these filenames: [official Etsy Help](https://help.etsy.com/hc/en-gb/articles/115015628347-How-to-Manage-Your-Digital-Listings), checked 2026-11-02. Preferred delivery is all five separate PDFs, no compression/extraction step.

## START HERE

PASS: two-page A4 customer guide with light background, dark readable text, warm green/rose accents, Georgia and Segoe typography. Page 1 starts with DATE NIGHT, Stop planning / Start your date, readiness sentence, START YOUR DATE CTA and readable production URL. No installation/account/login; one phone/two people; internet required. Five concise setup steps with about 15/about 30 minute pacing and no countdown. Page 2 covers the verified app features, same-four-mini-dates printable editions, paper/ink chooser, browser-local save limits, Etsy Messages support and exact approved neutral access sentence. Footer is 10 pt, main text 10.8-12 pt, safe margins retained; filenames are secondary 9.5 pt labels.

The first-open instruction is explicit in filename 01 and the page header OPEN THIS FILE FIRST. Other filenames identify paper size and color/ink use. This was a desk-based customer simulation, not independent buyer research.

## Production URL and clickable-link verification

Target: https://date-night-game-1.netlify.app

PASS: pypdf verified two actual /Link URI annotations on the final START HERE PDF: the CTA rectangle and visible URL, both with the exact approved target. Text alone was not accepted as proof. Browser automation rejected local file: navigation under its URL security policy; no workaround was attempted. Owner then opened the exact final release PDF and confirmed: **“Sì, il CTA dal PDF apre Date Night correttamente”**. Functional click verification is owner-reported, in addition to structural annotation QA.

Independent live browser recheck: final URL https://date-night-game-1.netlify.app/, title Date Night - Build Your Night, Date Night/72 activities/Home/BUILD YOUR DATE visible, no login, password or error page. Product baseline remains frozen.

## Printable integrity and corrections

PASS: all four delivery files are byte-for-byte identical to their approved sources under output/pdf; neither regenerated nor redesigned. SHA-256 comparison proves copying/renaming preserved contents. Each has six pages: cover, how-to, Cozy, Funny, Romantic, Competitive. Actual MediaBox dimensions were checked on EVERY page, not inferred from filename.

All 20 printable prompts and Predict comparison instructions were normalized and matched against the current approved src/data/printable/date-night-mini-dates.json. This includes Phase 6.8 corrected Cozy spoken-postcard wording (Share your versions), Funny playful-or-quiet sign-off and Romantic Challenge DN-CHA-013. Stale Read your versions / two ridiculous voices wording is absent. WebApp corrections not selected for the 20-item printable pack are not falsely claimed to be printed. Current four-edition content is the SAME four mini-dates, not four distinct packs or all 72 app items.

Ink-Saver PASS: visually light, white backgrounds and readable; explicit CMYK color operators checked for K-only values. Color editions retain approved warm vibe accents. No page-design changes.

## Visual and content QA

Rendered all 26 pages with Poppler at 100 dpi and inspected every page in 13 paired review images. PASS: no clipping, overlap, missing text, broken glyphs, unintended blank pages or hierarchy defects. Additional pdfplumber character-bound checks confirm text within page safe bounds. START HERE uses embedded TrueType fonts. Temporary renders, extracted text and machine QA records are under ignored tmp/pdfs/phase-6-11, outside the customer release and not committed.

Internal reference audit PASS: no localhost, loopback IP, GitHub, Vite, Codex, phase labels, QA, synthetic personas, tests or repository/machine paths in extracted customer text. The required production URL necessarily contains netlify.app; this approved URL is the sole allowed hostname occurrence, not a customer-facing discussion of the host. No other host/platform references found.

Placeholder audit PASS: no TO BE DEFINED, TODO, PLACEHOLDER, TBD or example.com. Claims audit PASS: no lifetime/permanent access, perpetual hosting guarantee, unlimited unique dates, never-repeat, cloud sync, offline WebApp mode, editable PDF, dedicated gift functionality, AI personalization or exact elapsed-duration promise. Offline claims refer to downloaded/printed bonus pages only. Existing printable setup wording names 15/30 options without a completion guarantee; START HERE explicitly qualifies about/go at your own pace. Support is Etsy Messages with no email or response-time promise.

## SHA-256 (internal evidence only)

- `01_START_HERE_Date_Night.pdf`: `34adf5a43062604d21085e865e7e62db7af2cdf41aaa20ee83a14575004bdd2a`
- `02_Date_Night_A4_Color.pdf`: `481a78b0644b9a019eb15a2775ccdefff27bd9383026c75185f657d609e60b73`
- `03_Date_Night_A4_Ink_Saver.pdf`: `4fd499903bc86e929d56ebce4f0a0d431862279dd9e2ae6c9524d36136b6576a`
- `04_Date_Night_US_Letter_Color.pdf`: `23cb8f337525949e640bb3b56626e27bc86551dcc9c78ae2a101928c89382f66`
- `05_Date_Night_US_Letter_Ink_Saver.pdf`: `766fcdba3208ba9e05014769e0d00db175bd08f1ed6d6c763e04cd0dc16eb44e`

## Regression, Git and release readiness

PASS: pnpm run typecheck; pnpm test (450 passed, 0 failed/skipped/cancelled); pnpm run build; git diff --check. Build produces the same approved index-Dxe1fYEz.js and index-CLAXrJ45.css assets. No changes to src, production activities, engine, storage, CSS/themes, WebApp visual design, original PDFs, dependencies or build configuration. Work was confined to this repository; original Social Game Engine was not accessed or modified in this phase.

Repository policy already versions final customer PDFs. Only these five final release PDFs are explicitly added from ignored release/; no ignore-rule expansion, renders, QA screenshots or temporary artifacts are committed. Generator scripts/generate-date-night-delivery.py is retained for reproducible START HERE generation and byte-preserving copies. It uses the existing Windows fonts and bundled Python PDF packages; it is not part of the WebApp runtime.

Commit message: release: assemble Date Night Etsy customer package. Normal main push and existing-site auto-deploy health are verified after commit and reported in the final handoff; resolve the release commit with git log -1 --format=%H -- docs/DATE_NIGHT_PHASE_6_11_DELIVERY_PACKAGE.md. A commit cannot contain its own final hash.

Ready for Etsy asset creation: YES. Ready for Etsy package upload: YES. Ready to publish listing: NO - listing assets and listing setup/review are still separate work. No package blocker remains; no customer upload or listing publication performed.
