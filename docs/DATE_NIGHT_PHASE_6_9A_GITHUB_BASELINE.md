# Phase 6.9A — GitHub production baseline

## Identity and traceability

Repository: E:\Etsy\GitHub\date-night-engine\date-night-engine. Branch: main.
Starting HEAD: 227ebc22704214034c5d7942109a412ae6173c4e.
Production baseline: the commit referenced by annotated tag **date-night-v1-production-baseline**. Resolve its exact hash with git rev-parse date-night-v1-production-baseline^{commit}; the hash is also returned in the completion report. A commit cannot contain its own final hash, so this document uses the immutable release tag reference.

This phase creates one commit for the previously approved accumulated product work plus repository curation. No history rewrite or force push. The original Social Game Engine path was not accessed or modified.

GitHub repository / origin: not configured at preparation time. Visibility and destination were not specified. Remote creation, push and remote verification remain pending; local checks alone do not establish a remote baseline.

## Versioning decisions

| Material | Decision |
| --- | --- |
| Source, tests, public assets, scripts, manifest, production and printable JSON | Keep |
| package.json, pnpm-lock.yaml and build configuration | Keep, with no dependency churn |
| Date Night product, handoff, content, phase and audit Markdown | Keep; historical evidence can be useful |
| Production coverage JSON and synthetic-panel JSON | Keep for audit/reproduction; synthetic findings are hypotheses, not customer research |
| Four final customer PDFs in output/pdf | Commit; approximately 334 KB total, practical release deliverables; no LFS |
| Two Phase 6 production reference screenshots | Keep production-connect.png and longest-reveal-390-actions.png |
| Latest PDF verification JSON | Keep docs/printable-qa/phase-6-8/verification.json |
| Other screenshots, ZIP bundles and PDF page renders | Local only, ignored, not deleted |
| tmp, browser reports, caches, logs, dependencies and dist | Local/generated only, ignored |
| Inherited legacy reports/modules/exports | Archive/optional provenance; retain existing tracked files and regression dependencies without broad cleanup |

.gitignore also excludes environment files, common credential file types, editor/OS junk and hosting-local folders. Placeholder-only environment examples are allowed, but none is needed or invented. Ignoring is not a substitute for the secret audit. Historical report links to local-only evidence may not resolve on GitHub.

## Safety audits

Current intended files were checked for sensitive filenames, actual-token patterns, private-key headers, credential assignments and signed access URLs without printing possible values. No potential secret was found. Token/private-key scanning of all four preserved commits also found no matches. No local environment file was found. Pattern scans reduce risk but are not a guarantee against every possible secret format.

Runtime src/public text contains no hardcoded machine paths, localhost/loopback links or temporary customer URLs. No environment-variable consumers were found in current src/public. Development paths in historical documentation are provenance only. The PDF generator uses C:/Windows/Fonts for installed Georgia/Segoe UI: a documented regeneration portability limitation, not a WebApp runtime dependency.

Fresh dist audit: no source maps, sourceMappingURL, machine paths, localhost URLs, inherited customer branding, fixture/preview labels or dev-client banners in the generated application. The active default loader imports date-night-v1.json and manifest version 2.0.0; 72 active production items are bundled. Test-only infrastructure data is not the active pack. Inherited legacy regression assets remain isolated from the production entry point.

## Regression results

- pnpm run typecheck: PASS.
- pnpm test: PASS, 450 passed, 0 failed/skipped/cancelled.
- pnpm run build: PASS, Vite 8.3.0, output dist.
- git diff --check: PASS; staged whitespace audit is repeated before commit.
- package.json and pnpm-lock.yaml: unchanged from starting HEAD.

The retained PDF verification JSON received line-ending normalization only; its parsed data is unchanged.

No product functionality, engine, storage, visual system, content or PDF wording was changed by this preparation phase. Product files in the baseline are the already-approved accumulated work.

## Phase 6.9B deployment facts — no deployment performed

| Fact | Verified value |
| --- | --- |
| GitHub repository | Pending user-selected dedicated date-night-engine destination |
| Production branch | main |
| Package manager | pnpm; locally validated 12.6.0 |
| Install | pnpm install --frozen-lockfile |
| Build | pnpm run build |
| Publish directory | dist |
| SPA redirect required | No: current screens use in-page state, no pathname router |
| Environment variables | None required by current application |
| Node version declared by project | None; no engines or version file |
| Node validated locally | 24.19.0 |
| Installed Vite Node engine range | ^20.19.0 or >=22.12.0; hosting should select a validated compatible runtime |
| Package-manager pin | Not declared; hosting toolchain selection must be verified before deployment |

PDF generation is independent of hosting build and needs Python PDF libraries plus the documented fonts. Final PDFs are already committed. No Netlify site, domain, redirect file, environment configuration or customer access URL was created.

## Remaining manual actions / remote gate

1. Choose GitHub visibility and create or select a new, dedicated date-night-engine repository; do not reuse social-game-engine. For a new remote, avoid initializing a separate README/history.
2. Supply the exact repository URL and ensure authentication permits push. Neither owner nor public/private policy is inferred.
3. Verify the destination, then git remote add origin <verified-date-night-engine-url>, git push -u origin main, and git push origin date-night-v1-production-baseline. Never force push; investigate any existing remote history.
4. Verify remote main equals local HEAD, the annotated tag resolves to the same commit, intended files/README are present, and ignored sensitive/generated files are absent.
5. Only then proceed to the separate Netlify preparation/deployment task. No deployment is authorized in Phase 6.9A.

Local baseline can be complete while overall Phase 6.9A remains PARTIAL until GitHub push and verification succeed.
