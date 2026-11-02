# Phase 6.10 — Commercial handoff decisions

Date: 2026-11-02 (Europe/Rome). Scope: documentation/commercial handoff only, inside this repository. Production WebApp is frozen. Starting commit: 75e61cf2478fa6d30dbe4b7861aae8d96ac397aa.

Commercial decisions and documentation: **PASS**. Regression: **PASS** — typecheck, 450/450 tests (0 failed/skipped/cancelled), build and diff whitespace check. Publication verification is performed after the single commit/push; its observed result is supplied in the final handoff. Resolve this report's final commit with git log -1 --format=%H -- docs/DATE_NIGHT_PHASE_6_10_COMMERCIAL_HANDOFF.md; the commit cannot embed its own hash.

## Owner decisions — all resolved

| Decision | Approved V1 policy |
| --- | --- |
| Support | ETSY MESSAGES. “Need help? Send us a message through Etsy and we’ll help you get started.” No separate email or response-time promise. |
| Delivery | ETSY DIGITAL DOWNLOAD → START HERE → WebApp production link + four printable PDF files. |
| Primary product | Interactive browser-based WebApp: https://date-night-game-1.netlify.app |
| Access duration language | “Access the interactive Date Night experience using the link provided with your purchase.” No lifetime, forever, permanent access, perpetual hosting or uptime guarantee. No fixed duration invented. |
| Hosting copy | Customer sees the browser link; no technical host/platform discussion. |
| Gift positioning | NOT OFFERED AS A FEATURE IN V1. No gift-ready access, recipient delivery/account/transfer or recipient-specific instructions. Generic “Fun for couples” is allowed. |

## Customer package

1. 01_START_HERE_Date_Night.pdf
2. 02_Date_Night_A4_Color.pdf
3. 03_Date_Night_A4_Ink_Saver.pdf
4. 04_Date_Night_US_Letter_Color.pdf
5. 05_Date_Night_US_Letter_Ink_Saver.pdf

START HERE is first. It contains the production link, setup flow, approximate pacing, Reveal/Swap qualifications, local save note, printable chooser, support and neutral access sentence. Four printable editions contain the SAME four mini-dates / 20 activities; use only the matching paper/ink edition. No phone required once printed; downloaded PDFs work offline. WebApp requires internet.

The package is defined, not assembled by this phase. Existing production PDF content and page design remain unchanged. The manifest maps original printable filenames to future delivery copies and records a ZIP fallback. Etsy's five-file / 20 MB-per-file limits were checked against its official Help page on 2026-11-02; five direct PDFs are the default.

## Approved copy and claims

Updated DATE_NIGHT_START_HERE_COPY.md, DATE_NIGHT_CUSTOMER_HANDOFF.md and DATE_NIGHT_LAUNCH_CLAIMS_MATRIX.md; added DATE_NIGHT_CUSTOMER_PACKAGE_MANIFEST.md and this report. Current handoff documents supersede unresolved commercial placeholders in the historical Phase 6.9B report; historical QA evidence is preserved.

Safe claims: interactive browser WebApp; instant Etsy digital download under the approved delivery model; no app installation, app account or login; works on tested Samsung A55/Chrome and desktop browser; 72 activities; four vibes; Quick/Full Date; Sweet/Flirty; five guided stages; dynamically composed dates; eligible Reveal/Swap; browser-local current-session save; printable bonus with four offline mini-dates in A4/US Letter and Color/Ink-Saver editions.

Qualify time as **about 15 minutes / about 30 minutes; go at your own pace**. No exact-duration promise. Save is same-browser/device and storage-dependent, no cloud sync; clearing data/private browsing may lose saves. Activities may repeat across sessions. Instant download refers to the customer files, not an installed WebApp. No verified tablet claim is approved without physical tablet QA.

Prohibited: lifetime/forever/permanent access or hosting; uptime guarantees; unlimited unique dates; never repeats; cloud sync; offline WebApp mode; editable/fillable PDFs; dedicated gift workflow; support response-time guarantees. No customer-facing host details.

## Verification and version control

Completed: pnpm run typecheck PASS; pnpm test PASS (450/450); pnpm run build PASS; git diff --check PASS. Build output remains index-Dxe1fYEz.js and index-CLAXrJ45.css, matching the approved production assets. Documentation-only diff inspection confirms no product/config/PDF changes. Create exactly one documentation-only commit: docs: finalize customer delivery and access handoff. Push normally to main; verify existing date-night-game-1 auto-deploy reaches READY for that commit. No new site or manual deploy. Final published metadata and clean main/origin equality are checked after push and reported in the final handoff rather than creating an extra self-referential commit.

Only the five Markdown documents named above may change. No src, activities, engine, storage, CSS, themes, visual design, printable content/PDF design, dependencies or config changes. Product behavior remains the approved frozen baseline.

## Remaining launch blockers

No unresolved owner-controlled decision from this phase remains. Ready for Etsy launch asset work once verification passes; **not ready to publish the listing** yet. Before publication: generate/verify the START HERE PDF, assemble the five-file customer package without altering printable content, verify links/filenames/sizes and attach it, then separately create/review the Etsy launch assets and complete listing setup. Those tasks are outside this phase and have not been started. No title/tags/price/description/FAQ graphics/video/listing images are created.
