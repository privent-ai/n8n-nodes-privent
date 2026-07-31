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

> **This file was written inside the N4-2 + N4-4 stack and lived only there.**
> That stack is unmerged and waits on another repository's npm publish (SDK-A),
> so `NP-K` … `NP-O` were reachable only from an open PR — a finding that lives
> on an unmerged branch is a finding that can be lost, which is the failure this
> document exists to prevent. Brought to `main` docs-only: no code, no tests.
> `main` is now canonical; when the stack merges, take this copy.

**Status:** `open` — real, not fixed, no item scheduled · `recorded` — real, not
fixed, item scheduled or deliberately declined · `closed` — fixed and verified.

## Repo-scoped (2026-07-31 onwards)

| ID | Finding | Status |
|---|---|---|
| NP-V | **The local detector masks non-routable and wildcard IPs.** Measured through the node's own local path: `0.0.0.0` and `10.0.0.5` both become `[IP_ADDRESS_nnn]`. Whether that is wrong is arguable — an IP can identify a person — but a wildcard bind address in a config snippet is not customer data, and masking it corrupts the text a downstream agent reads. Suppressing it needs a **new** false-positive rule, not the two corrections N4-7a was approved for, so it is recorded rather than folded in quietly. Excluded from the committed 18-case matrix with the reason stated in the file. | open |
| NP-U | **`aggressive` detection level is not a sensitivity setting — it masks everything.** Measured through the node's own `execute` on the 18-case matrix: `standard` scored TP=4 FN=5 TN=8 FP=1; `aggressive` scored **TP=9 FN=0 TN=0 FP=9** — every negative case failed. It reached TP=9 by masking every token in the text: `reach ayse.demir@fixture.invalid today` came back as `[XBOX_GAMERTAG_001].[PSN_ID_001][TIKTOK_USERNAME_001] [IATA_AIRPORT_CODE_001]`, so `reach` and `today` are PII and the email never received an `EMAIL` token at all — the DLP category is wrong, not just noisy. Mechanism: `aggressive` drops the `tier !== 'contextual'` filter, admitting **468** detectors written to require context, and NP-T meant no context was ever supplied. NP-T removes the cause; what `aggressive` should MEAN — curated subset, context-gated, or removed from local mode — is a product decision and is **held**, deliberately undecided here. | open |
| NP-T | **Every false-positive rule was invoked with an empty context, at every call site.** `isLocalFalsePositive(value, type)` called `r.matcher(value, '')` (`shared/local-detectors.ts:902` before this item), while every vendored matcher is written as `(value, context)`. The effect ran both ways and both were wrong: context-aware rules — "preceded by `port:`", "preceded by a currency word", "inside a comment" — could never fire, and value-aware rules fired everywhere with no way to be overruled. A second defect rode on the same rule set: the placeholder word list (`foo|bar|…|test|demo|sample|…`) was tested against the whole value, so any address whose LOCAL PART contained one was dropped — `test.user@bank.invalid`, `sample.reports@clinic.invalid`, `demo.account@insurer.invalid`, **3 of 3 undetected**. NP-L found that this filter made synthetic *fixtures* invisible; this finding is the same filter making **customer data** invisible. Closed by N4-7a: the caller passes the text preceding the match on its own line (prefix-only and line-scoped, so a stray `#` or `;` nearby cannot satisfy the comment rule), and for EMAIL the word list is applied to the **domain**, which is what actually makes an address synthetic (RFC 2606). Fixed in `scripts/gen-local-detectors.mjs` and regenerated; `shared/local-detectors.ts` is never hand-edited. | closed |
| NP-S | **A stored node with no `authentication` key means three different things, and the node was answering for all three with one guess.** n8n does not persist a parameter equal to its default — measured in `n8nio/n8n:2.28.7`: choosing `local` saves nothing, choosing `apiKey` saves `"apiKey"` — and `version` was never bumped when this package flipped the default from `apiKey` to `local` in 2.2.1 (`5d04122`). So a pre-2.1.0 node, a 2.1.0–2.2.0 node left on `apiKey`, and a 2.2.1+ node left on `local` are **byte-identical on disk at `typeVersion: 1`**. typeVersion cannot separate them; the prescribed "typeVersion-aware default" could not have worked. What the runtime actually did: `_getNodeParameter` reads `get(node.parameters, name, fallbackValue)` against the STORED parameters (n8n-core 2.28.4, `node-execution-context.js:271`) and nothing in the execution engine fills description defaults first, so the absent key fell through to this package's `'apiKey'` fallback. The harm was therefore the reverse of the one assumed: cohorts 1 and 2 were fine, and **cohort 3 — every evaluator who installed 2.2.1+ and never opened the dropdown — ran in apiKey mode and failed on "Node does not have any credentials set"**. Closed by N4-5 with credential presence as the disambiguator, read from `getNode().credentials` (what n8n itself reads) and never from `getCredentials()`, which throws `Credentials not found` when displayOptions hides the credential and would answer wrongly with confidence. Where it still has to infer, the item carries a warning naming that the mode was never set and that the run is regex-only. | closed |
| NP-R | **Version visibility is met COLLECTIVELY, by three channels, and no single channel covers all three auth modes.** Measured per mode through the node's own `execute`: `apiKey` carries `node_version` in the **audit event** and emits no telemetry (deliberate — the audit stream already reports, double-reporting is worse); `tokenless` carries it in **telemetry** and emits no audit (an anonymous visitor has no org); `local` emitted **neither**. The instruction this item started from — "`node_version` must reach telemetry and audit in every mode" — was withdrawn once measured, because in `local` it would mean network egress from the one mode that promises *"your data never leaves your n8n instance"*. A version string is not worth trading a privacy promise for. Closed by N4-8 with a channel that needs no network: `privent.nodeVersion` on the **item output**, uniformly in all three modes, with the existing channels left exactly as they are. The answer to "is the version visible?" is therefore **per-channel, not global** — recorded in that form on purpose, because the next person to ask will otherwise assume one channel answers for all. | closed |
| NP-Q | **`framework_version` fell back to a version that was never n8n's.** `session.ts` wrote `safeFrameworkVersion() ?? TRACER_VERSION`. The field means *n8n's* version; the fallback wrote core's. Its value was never even stable: with core 0.8.0 bundled it read `2.4.0` (this package), because 0.8.0's `TRACER_VERSION` read `globalThis.__SDK_VERSION__` and `tsup.config.ts:36` replaced that with this package's version; core 0.10.0 bakes its own literal in, so the same line would have started reporting `0.10.0` (core) after the bump. Same lie, new value, and the change would have arrived silently on a dependency bump. **Fourth instance of the runtime-version-invisibility class** (after NP-O and its two predecessors). The blind spot is precise and worth naming: `privent-http.ts:32` already carries the rule — *"Do NOT use core's `TRACER_VERSION`"* — and `session.ts:118` did exactly that, through a fallback, where the rule's own comment was not in view. A rule written at the definition does not travel to the call site. Closed with the bump: when the peer cannot be read the key is **absent**, not guessed. Verified against the ingest path before shipping — `framework_version` is not a DTO field, it rides inside `metadata` (`@IsOptional() @IsObject()`, `privent-backend/src/audit/dtos/audit-events-ingest.dto.ts:47`), the global pipe is `new ValidationPipe({ transform: true })` with no `whitelist`/`forbidNonWhitelisted` (`privent-backend/src/main.ts:26`), and the service reads `trunc(metaStr(meta,'framework_version','frameworkVersion'),32) ?? null` (`privent-backend/src/audit/audit-ingest.service.ts:179`). An absent key stores null; it does not reject the event. | closed |
| NP-P | **`auto` detection mode swallowed HTTP 402, and no test could have caught it.** `tokenize.ts` treated every ML failure alike: `cloud` throws, `auto` degrades to regex-only and says nothing. For a timeout that is the documented contract; for 402 Payment Required it is not — the plan or quota is exhausted, it will answer 402 for every item in the run, and `cloud` fails the run on the identical response. Downstream, an item the backend scored and an item it never saw were indistinguishable (`risk: null` is also a legitimate low-risk shape), and the audit event recorded `detection_mode: auto` either way. The second half is instrumental: the suite's only failure primitive was `failUrls`, which throws a bare `Error` carrying no status, so **no test could tell a quota rejection from a socket reset** — the very distinction at issue. Measured in `n8nio/n8n:2.28.7` (digest `sha256:74f1ef0ec73cd1b85c3b55926732c9dfaa544a66d6bb2872fd57718c557954a4`): `httpRequestWithAuthentication` wraps every failure in `NodeApiError` before the node sees it (n8n-core `.../request-helpers/authentication.js:63`), and the status survives as `httpCode`, a **string**. Closed by N4-6 — `auto` still degrades, the data path is unchanged, but the item carries `privent.mlDegraded` and the audit event carries `ml_degraded` / `ml_degraded_status`. | closed |
| NP-O | **The published artifact does not reveal which `@priventai/core` version it carries.** `tsup.config.ts:28` bundles core via `noExternal`, so the declared range (`^0.8.0`) resolves nothing at runtime and the `dist/` output is the only thing an installed user actually runs. Measured against the two candidate versions: **0 of 4** blocks unique to 0.8.0 and **0 of 12** blocks unique to 0.9.0 appear anywhere in `dist/` (120-byte block comparison) — tree-shaking removes exactly the code that would distinguish them. The lockfile pin (`0.8.0`, `registry.npmjs.org/@priventai/core/-/core-0.8.0.tgz`) is the sole evidence of what shipped, and a lockfile is a statement about a build machine, not about an artifact. Third instance of the runtime-version-invisibility class in this programme; the same reason a version signal has to be *emitted* (N4-8) rather than inferred. | open |
| NP-N | **`tokens_redeemed` was the number of placeholders FOUND, not the number redeemed.** `detokenize.ts` read it off `placeholders.length` before `retrieveBatch` ran, so an item whose tokens the vault could not resolve left the text unchanged while the audit event recorded a non-zero redemption and the output carried `detokenized: true`. Measured directly — vault returns zero entries, node reports `{"tokens_redeemed":2}` and `detokenized: true`, text byte-identical. Closed by N4-4: found and redeemed are separate numbers and success is derived from the second. The gap between them is now the signal that tokens were present and unresolvable — a distinction that turns out to be available client-side, contrary to what was assumed when the two numbers were treated as one. | closed |
| NP-M | **Adding `i` to `TOKEN_RE` would not make the node case-tolerant.** `scanForTokens` and `replaceIn` rebuild the pattern as `new RegExp(TOKEN_RE.source, 'g')` (`@priventai/core/dist/index.js:578`, `:615`; source at `privent-sdk/packages/core/src/tokenizer/detokenize.ts:22`, `:85`) and `.source` carries no flags — measured: a `/i` literal rebuilt this way yields `[]` for `[email_001]`. The change that survives the rebuild is the **character class**, `[A-Za-z][A-Za-z0-9_]{1,31}`, one line. It cannot be delivered from this repository: the grammar lives in `@priventai/core`, `tsup.config.ts:28` bundles it via `noExternal`, and `@priventai/core@0.9.0` — the published latest — carries a byte-identical grammar. Tracked as **SDK-A** in privent-sdk; nothing changes here until a fixed core is published and this package rebuilds against it. **Closed:** `@priventai/core@0.10.0` ships the widened class, this package bumped and rebuilt against it, and the grammar was verified **from `dist/`** — `/\[([A-Za-z][A-Za-z0-9_]{1,31})_(\d{1,10})(?:_[a-f0-9]{4,16})?\]/g` — not from `node_modules`. | closed |
| NP-L | **This product's own false-positive filter suppresses the standard synthetic-fixture domains.** `isLocalFalsePositive` drops any EMAIL whose value contains `example`, `test`, `demo`, `sample`, … (`shared/local-detectors.ts:765`), which is exactly the RFC 2606 reserved space — `example.com`, `.test`, `.example`. So a fixture chosen to be *safe* is invisible to the local detector, and a local-mode test written with one tests nothing. Measured while sweeping the corpus: moving fixtures to `example.invalid` turned a passing round-trip test red because the address stopped being detected at all. This repo's fixtures therefore use `@fixture.invalid` — reserved by RFC 2606 §2 and free of every suppressed word. Sharpens F-05. | open |
| NP-K | **CI cannot reach a real backend, on any of three axes.** privent-backend publishes no image to a registry this repo's CI can pull — `release.yml` ships an image bundle to S3 over OIDC, with no ghcr/dockerhub push. `privent-backend` is private while `n8n-nodes-privent` is public, and this repo's `ci.yml` uses a plain `actions/checkout@v4` whose default `GITHUB_TOKEN` cannot read another private repository. The only secret this repo holds is `NPM_TOKEN`. So a green tick here has never meant a contract verified against a real backend. | open |

### NP-Q — the bump-safety measurement was incomplete, and how it surfaced

The 0.8.0 → 0.10.0 bump was cleared with three measurements: identical export
**names** (37, same hash), byte-identical `DEFAULT_DETECTORS`, and zero of core's
new custom-pattern code in the built bundle. All three held. The conclusion drawn
from them — "nothing else changes" — did not, because **a hash over export names
says nothing about their types**. `index.d.ts` was listed as differing in the
file-level diff and was not opened.

`typecheck` caught it on the first run after the bump: core 0.10.0 added
`category`/`sensitivity` to `RegexDetector` and typed sensitivity as
`EntitySensitivity | null`, a closed set of four strings, while this package's
`CustomDetector` extended it with an open `string` carrying whatever
`GET /v1/custom-patterns/active` returns. Resolved by omitting the two fields
from the inherited shape rather than adopting a guarantee nothing on the wire
enforces (`shared/privent-http.ts:253`).

Recorded because the runtime surface and the type surface are two surfaces, and
a bump can be clean on one and not the other. The gate caught it; the
measurement should have.

### NP-S — the first answer was measured with the wrong resolver

Before N4-5 was implemented, this programme was told that a stored pre-2.1.0
node "silently drops to local on upgrade" and that the `'apiKey'` fallback in
`getAuthMode` was **dead code**. That was measured — with
`NodeHelpers.getNodeParameters(...)`, which is the resolver n8n uses in the
**editor**, when loading and saving a workflow. It fills description defaults,
so it answered `local`, and the answer was reported as what the node sees at
execution time.

The runtime uses a different function. `_getNodeParameter` reads
`get(node.parameters, name, fallbackValue)` — stored parameters, our fallback,
no defaults — and nothing in the execution engine fills defaults beforehand.
The fallback was live the whole time.

Right file, right question, wrong instrument: the same failure this programme
has been cataloguing, committed while cataloguing it. The correction inverted
which users were harmed, and the fix that shipped is the one the corrected
premise calls for, not the one the original premise called for.

### NP-O — the first fingerprint was wrong, and how it was caught

The first attempt to identify the bundled version searched `dist/` for words
present only in 0.9.0's source and reported a hit on `authoritative`. That was a
**false signal**: the word comes from this node's own
`nodes/Privent/operations/tokenize.ts:29`, not from core at all. A single-token
search over a bundle cannot tell you which package a string came from.

It was discarded and re-measured at 120-byte block granularity, which is what
produced the `0 of 4` / `0 of 12` result above. Recorded because the discarded
measurement was the *convenient* one — it would have answered the question — and
because a fingerprint that matches your own code is the same defect class as a
citation nothing verifies.

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
