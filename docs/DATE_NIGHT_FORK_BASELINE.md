# Date Night Engine V1 — Independent Fork Baseline

DATE CREATED: 30 October 2026 (Europe/Rome)
ORIGINAL PROJECT: Spill or Sip — Girls Night / Original Social Game Engine
ORIGINAL REPOSITORY: social-game-engine
ORIGINAL REMOTE: https://github.com/thegeekthingz/social-game-engine.git
ORIGINAL PATH: E:\Etsy\GitHub\social-game-engine\social-game-engine
ORIGINAL BRANCH: main
ORIGINAL BASELINE COMMIT: 3de5d604445379b0a9b56facae9579c0cd0afad9
AUDITED COMMIT: 3de5d604445379b0a9b56facae9579c0cd0afad9
ORIGINAL HEAD AT FORK: 3de5d604445379b0a9b56facae9579c0cd0afad9
DIFFERENCE: same; zero ahead/behind.
DATE NIGHT REPOSITORY: date-night-engine-v1
DATE NIGHT PATH: C:\Users\italo\AppData\Local\Temp\date-night-engine-v1
DATE NIGHT REMOTE: NONE
DATE NIGHT BRANCH: main (new independent history)
DATE NIGHT BASELINE COMMIT: PENDING_INITIAL_COMMIT
PURPOSE: Independent fork for Date Night Engine V1.
RULE: The original Spill or Sip repository must never receive Date Night implementation changes.

## Method and isolation

Exported committed files ONLY from the verified source commit via git archive. Initialized fresh .git outside the original: no shared Git history/objects, alternates, worktree links, remote or upstream. No original branch/config/commit was changed. No push, external repository, deployment or Netlify action.

Only package name, README identity and this document differ from baseline. Baseline files were verified against original Git blob hashes before identity edits. Export used a command-local core.autocrlf=false to retain exact committed bytes; new repository also uses core.autocrlf=false. The original Git config was not changed. All application/content/theme/configuration files remain unchanged. No Date Night implementation.

E:\workspace creation was denied by filesystem access. This writable temporary-directory fallback is independent, but should be transferred to durable storage before sustained development. No Date Night remote URL was supplied; no push remote is configured. Create a dedicated remote manually later if needed; never use the Spill or Sip remote for Date Night pushes.

## Existing original work

The original had no staged files. All dirty/untracked files listed below were preserved there and EXCLUDED from this fork baseline. No unrelated uncommitted package/lockfile/marketing edits were imported or committed. Inherited committed marketing tooling remains at its source revision, not a new Date Night deliverable. New pnpm-lock.yaml is unchanged from committed baseline.

```
 M marketing-assets/QA.md
 M marketing-assets/README.md
 M marketing-assets/config/spill-or-sip-girls-night.etsy.json
 M marketing-assets/generate.mjs
 M marketing-assets/templates/base.css
 M marketing-assets/templates/feature-spotlight.mjs
 M marketing-assets/templates/helpers.mjs
 M marketing-assets/templates/hero.mjs
 M marketing-assets/templates/multi-screenshot.mjs
 M marketing-assets/templates/what-is-included.mjs
 M marketing-assets/tests/config.test.mjs
 M package.json
 M pnpm-lock.yaml
?? DATE_NIGHT_SOURCE_REUSE_AUDIT.md
?? marketing-assets/image-validation.mjs
?? marketing-assets/render.mjs
?? marketing-assets/source/end-highlights.jpeg
?? marketing-assets/source/home.jpeg
?? marketing-assets/source/play-funny.jpeg
?? marketing-assets/source/play-wild.jpeg
?? marketing-assets/source/setup-choose.jpeg
?? marketing-assets/source/setup-names.jpeg
?? marketing-assets/source/setup-surprise.jpeg
```

## Dependencies

No installation or upgrade was performed. Existing node_modules package bytes were copied for offline validation. pnpm junctions were recreated only inside the new project and checked not to point to the original. Hardlinked package files were copied as independent files, not reused as hardlinks. node_modules/dist are ignored and uncommitted. Installed bytes include unrelated tooling already present in the original environment, but committed dependency declarations/lockfile remain baseline. This is not a clean-install reproducibility test.

## Verification

TYPECHECK: PASS — node node_modules/typescript/bin/tsc --noEmit.

ENGINE TESTS: PASS — 118 passed, 0 failed, rerun in this new copy, agreeing with the audit count. Command:

node --test --experimental-test-isolation=none tests/cardSelector.test.mjs tests/createId.test.mjs tests/gameLoader.test.mjs tests/gameplayShell.test.mjs tests/idleHints.test.mjs tests/localStorageAdapter.test.mjs tests/playerStats.test.mjs tests/playerTurns.test.mjs tests/productionPack.test.mjs tests/sessionLength.test.mjs tests/sessionManager.test.mjs

The two existing Vite SSR suites themeUi/mediaRenderer were not rerun. Full-suite/browser verification is not claimed. No new tests written.

BUILD: PASS — typecheck followed by node node_modules/vite/bin/vite.js build --configLoader native. 52 modules transformed; dist/index.html plus JS/CSS produced. pnpm build was blocked by pnpm store-lock access; direct default Vite configuration bundling hit spawn EPERM. The existing native config loader succeeded without changing config/dependencies/lockfile. No deployment.

Behavior: source/content/config unchanged, engine tests and build support baseline equivalence. Interactive browser smoke testing and live-source parity remain unverified. No product changes started.

Original verification: before/after HEAD, branch, refs, remotes, index/config hashes, porcelain status and 128 tracked/nonignored untracked file hashes were unchanged. Original HEAD after: 3de5d604445379b0a9b56facae9579c0cd0afad9. No new Date Night files in original. Ignored caches/dependencies/build directories were not exhaustively hashed; all test/build work ran in the new copy with independent dependency links.

Phase 1 only. No Sweet/Flirty, new vibes, queue/composer/schema/content/UI/theme/persistence implementation. Phase 2 requires explicit later instruction.
