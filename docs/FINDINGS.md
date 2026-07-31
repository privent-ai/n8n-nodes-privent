# Findings index — n8n-nodes-privent

> **ID scheme changed on 2026-07-31. Finding IDs are repo-scoped from here on:**
> `NP-*` in this repository, `BE-*` in privent-backend, `N8N-*` in privent-n8n,
> `DE-*` in privent-document-engine, `SDK-*`, `MCP-*`. **Pre-existing unprefixed
> IDs (`F-…`) belong to the repository whose document holds them** and are not
> renamed — renaming them would break every citation already merged.
>
> The change was forced by a real collision: `F-K` here and `F-K` in
> privent-backend were two different findings under one identifier, in two
> repositories. privent-backend's own index already carried the other half of
> that collision, recording that "F-C through F-F are not present in this
> repository". An ID scheme that silently overlaps is the same class of defect as
> a citation nothing verifies.
>
> ⏳ **Counterpart note PENDING in privent-backend.** That repository's
> `docs/FINDINGS.md` needs the same header, and this session cannot write to it —
> reference repositories are read-only here. Until it lands the scheme is adopted
> on one side only; recorded so a half-adopted scheme is not mistaken for a
> finished one.

One line per finding. Findings scattered across commit messages and PR bodies is
how a finding dies; this is the index that keeps them visible.

**Status:** `open` — real, not fixed, no item scheduled · `recorded` — real, not
fixed, item scheduled or deliberately declined · `closed` — fixed and verified.

## Repo-scoped (2026-07-31 onwards)

| ID | Finding | Status |
|---|---|---|
| NP-N | **`tokens_redeemed` was the number of placeholders FOUND, not the number redeemed.** `detokenize.ts` read it off `placeholders.length` before `retrieveBatch` ran, so an item whose tokens the vault could not resolve left the text unchanged while the audit event recorded a non-zero redemption and the output carried `detokenized: true`. Measured directly — vault returns zero entries, node reports `{"tokens_redeemed":2}` and `detokenized: true`, text byte-identical. Closed by N4-4: found and redeemed are separate numbers and success is derived from the second. The gap between them is now the signal that tokens were present and unresolvable — a distinction that turns out to be available client-side, contrary to what was assumed when the two numbers were treated as one. | closed |
| NP-M | **Adding `i` to `TOKEN_RE` would not make the node case-tolerant.** `scanForTokens` and `replaceIn` rebuild the pattern as `new RegExp(TOKEN_RE.source, 'g')` (`@priventai/core/dist/index.js:578`, `:615`; source at `privent-sdk/packages/core/src/tokenizer/detokenize.ts:22`, `:85`) and `.source` carries no flags — measured: a `/i` literal rebuilt this way yields `[]` for `[email_001]`. The change that survives the rebuild is the **character class**, `[A-Za-z][A-Za-z0-9_]{1,31}`, one line. It cannot be delivered from this repository: the grammar lives in `@priventai/core`, `tsup.config.ts:28` bundles it via `noExternal`, and `@priventai/core@0.9.0` — the published latest — carries a byte-identical grammar. Tracked as **SDK-A** in privent-sdk; nothing changes here until a fixed core is published and this package rebuilds against it. | open |
| NP-L | **This product's own false-positive filter suppresses the standard synthetic-fixture domains.** `isLocalFalsePositive` drops any EMAIL whose value contains `example`, `test`, `demo`, `sample`, … (`shared/local-detectors.ts:765`), which is exactly the RFC 2606 reserved space — `example.com`, `.test`, `.example`. So a fixture chosen to be *safe* is invisible to the local detector, and a local-mode test written with one tests nothing. Measured while sweeping the corpus: moving fixtures to `example.invalid` turned a passing round-trip test red because the address stopped being detected at all. This repo's fixtures therefore use `@fixture.invalid` — reserved by RFC 2606 §2 and free of every suppressed word. Sharpens F-05. | open |
| NP-K | **CI cannot reach a real backend, on any of three axes.** privent-backend publishes no image to a registry this repo's CI can pull — `release.yml` ships an image bundle to S3 over OIDC, with no ghcr/dockerhub push. `privent-backend` is private while `n8n-nodes-privent` is public, and this repo's `ci.yml` uses a plain `actions/checkout@v4` whose default `GITHUB_TOKEN` cannot read another private repository. The only secret this repo holds is `NPM_TOKEN`. So a green tick here has never meant a contract verified against a real backend. | open |

### NP-K — the shortcut that was available and declined

Adding a private-repo read credential to this repository's CI would have made a
live-backend job runnable. It was declined: this repository is **public**, so
that identity would be exposed to fork and PR contexts. The cheap green was
available and was refused for that reason, not for effort.

**What is done instead** — the shape privent-backend adopted for the same problem
(`a8a1cb1`): every test run prints its two modes and, in plain words, what a
green run proves. Neither axis falls back silently; an undeterminable mode fails
the run.

```
[privent-test-modes]
  grammar mode=CORE_PACKAGE  token pattern: \[([A-Z][A-Z0-9_]{1,31})_…
  backend mode=MOCK_ONLY
  A green suite here proves agreement with the installed core grammar and a
  SIMULATION of the backend.
  CI never reaches a real backend — see NP-K.
```

**Live backend, locally only.** There is no CI job and there deliberately is not
one. To run the suite against a real backend on a developer machine:

```bash
PRIVENT_TEST_BACKEND_URL=http://127.0.0.1:3100 npm test
```

The run then reports `backend mode=BACKEND_LIVE` with the URL. That is the only
context in which this suite has ever spoken to a backend, and the mode line says
so on every run rather than leaving it implied by a green tick.

## Pre-existing, unprefixed — this repository's own sequence

These predate the scheme change and keep their original IDs.

| ID | Finding | Status |
|---|---|---|
| F-C | Our lint is not n8n Cloud's verification: `eslint-plugin-n8n-nodes-base` was absent entirely and `@n8n/eslint-plugin-community-nodes` was six releases behind the version the official scanner pins. Both now aligned, but the scanner's source leg still reports 3 errors (1 icon + 2 token-count), so the package does not pass it — and whether that scanner is what n8n Cloud actually runs is still UNKNOWN. | recorded |
| F-D | 26 lines in the 3.6 GB customer bundle contain this package's name; resolved by a full nested scan (162,457 files, 7.84 GB): all 26 are frontend Next.js build output, **0** dependency-position installs and **0** git-URL installs. | closed |
| F-E | With `dist` untracked and lifecycle scripts forbidden for community nodes, installing this package from a git URL yields a package with no `dist/`. Measured against a real `git+file://` install. Documented in the README as unsupported. | recorded |
| F-F | 944 lines of transport code in `shared/` sat outside both the official scanner's `SOURCE_FILE_PATTERNS` (`scanner.mjs:222`) and this repo's own lint scope. Now inside ours; still outside the scanner's. | recorded |
| F-G | `shared/privent-http.ts` carries a dynamic `require` for the `n8n-workflow` peer whose `package.json` is not in that package's `exports` map. The `eslint-disable` that used to sit there named an unregistered rule. If `@typescript-eslint` is ever registered, that line needs a real answer. | open |
| F-H | A check that can never go green trains everyone to ignore it — and suppressing it is the same disease wearing green. The reason the two accepted deviations are line-scoped disables rather than rule downgrades. | recorded |
| F-I | There is no vector brand asset anywhere in the product. The node's icon and `privent-frontend/public/og/privent-main-logo.png` are byte-identical; the frontend's own logo component renders a PNG (`components/custom/logo.tsx:12`); no light/dark variant of the mark has ever existed. Tracing the PNG was measured and rejected. Decision: the PNG stays. | recorded |
| F-J | `node-param-type-options-password-missing` matches on `paramName.toLowerCase().includes('token')`, so it fires on `promptTokens` / `completionTokens`, which hold a token COUNT expression. n8n's own exception list already carries the class (`FALSE_POSITIVE_NODE_SENSITIVE_PARAM_NAMES = ["maxTokens", …]`, `constants.js:125`). The upstream fix is n8n adding these names or narrowing the match; no issue filed. | recorded |
