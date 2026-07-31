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

Rules learned from these findings live in [METHOD.md](METHOD.md).

> **OUR WEAKEST DETECTION IS ON THE PATH CHOSEN BY THE MOST SECURITY-CONSCIOUS
> CUSTOMERS.** Every serious detection finding this round — NP-Z (printed IBANs
> missed), NP-L (real addresses at `demo.`/`test.`/`sample.` subdomains
> suppressed), NP-U (`aggressive` measurably worse than `standard`) — lands in
> **local mode**, the only path with no backend, no ML and no second opinion, so
> a defect there has nothing to correct it and nothing to reveal it. It is also
> the mode customers choose precisely because they care most about their data
> leaving, which is why this is recorded here rather than inside any one finding.

**Status:** `open` — real, not fixed, no item scheduled · `recorded` — real, not
fixed, item scheduled or deliberately declined · `closed` — fixed and verified.

## Repo-scoped (2026-07-31 onwards)

| ID | Finding | Status |
|---|---|---|
| NP-AA | **The published package requires `zod` at runtime and does not declare it.** `tsup.config.ts:29` marks `zod` external alongside `n8n-workflow` and `@opentelemetry/api`, but `package.json` declares only `n8n-workflow` as a peer. Measured on a clean install of the published tarball: `require('n8n-nodes-privent/dist/nodes/Privent/Privent.node.js')` fails with `Cannot find module 'zod'` until `zod` is installed alongside it. It works in practice because n8n ships zod itself — verified inside `n8nio/n8n:2.28.7` at `/usr/local/lib/node_modules/n8n/node_modules/zod`, version 3.25.67 — so the requirement is satisfied by the host by coincidence of packaging rather than by declaration. Same class as F-E: the package works in the environment it was tested in, and the reason is not written down anywhere a resolver can read. Not fixed in 3.0.0; found while verifying the release from a clean install, which is exactly the check that surfaces it. | open |
| NP-Z | **An IBAN written the way it is printed is not detected, and PHONE takes the span under the wrong kind.** ISO 13616 defines a printed form — groups of four, separated — which is how an IBAN appears on an invoice or in an email. Core's detector is `\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b`: no separators, no `i` flag. Measured through this package's own local path across a 12-form space: **2 of 12**, and in **9 of the 12** the PHONE detector took the digit run in the middle — `pay GB29 NWBK 6016 1331 9268 19 now` → `pay GB29 NWBK [PHONE_001] 19 now`, country and bank codes in cleartext. Two failures in one span: a miss and a misclassification. The finding underneath is why this outranked the other open items: **every surface that detects locally misses the printed form** (SDK-H measures core 2/12, this package 3/12 in isolation, privent-mcp 0/12; the backend catches it), and local mode is what a customer chooses for data minimisation — the product is weakest on its most-cited PII type exactly where no backend is watching. Closed in two steps. First a local override emitting the SAME kind as core — **12 of 12**, PHONE no longer involved — which reached `authentication: local` only: measured, `apiKey` mode still produced `pay GB29 NWBK [PHONE_001] 19 now`, because that path uses core's detectors directly. Then `@priventai/core@0.10.2` landed the upstream fix (privent-sdk `ff9e305`, `packages/core/src/tokenizer/patterns.ts:109`), this package bumped, and **the override was deleted**: the duplication was no longer forced, and a copy that can be deleted needs no spanning test to keep it honest (METHOD §6). After the bump every auth mode detects it. Reconciled before deleting: the two independently authored patterns agreed on **all twelve forms**, differing on exactly one form outside the space — dot separators, which mine accepted — and theirs is tighter before the validator (65 raw hits against my 443 over the same 72.45 MB, both zero survivors). False-positive surface measured before adding: **443 raw regex hits across 72.6 MB, zero survivors** — the MOD-97 + per-country-length `validateIBAN` this package already carried is what makes the wider regex safe. The real fix is core's (**SDK-H**); this override is what this repository can deliver alone, and it is the single documented exception to "never duplicate a core kind". | closed |
| NP-Y | **`ADDRESS_STREET` does not match an alphanumeric house number.** `221B Baker Street` is not detected; `742 Evergreen Terrace` and `18 Larkspur Lane` are. This is not an edge case — alphanumeric house numbers are standard in the UK (`221B`, `14A`) and common elsewhere, so the detector misses a whole national addressing convention rather than an unusual string. It surfaced from N4-7b's own positive corpus: the detector was admitted on two of three positive cases, and the third failing is the measurement doing its job rather than a footnote to the admission. Belongs with N4-7a's recall gaps — international phone, IBAN detected as two `PHONE` fragments — which are the same axis: patterns that are missing or wrong, not filters that misfire. Closed: the pattern's opening `\d{1,5}\s+` becomes `\d{1,5}[A-Za-z]?\s+` in the generator, and the detector now scores 3 of 3 positive cases at zero false positives on its declared corpus. Deliberately not wider — `[A-Za-z]{0,2}` would start matching version strings and part numbers, which is the false-positive class this level was just cleaned of. | closed |
| NP-X | **361 of 468 local detectors have never been measured, and the table used to call that "inert".** They produce zero false positives across the negative corpora *and* zero hits across the positive corpus, so a zero-FP-only admission rule would have admitted them for looking harmless. **DECIDED.** The word was the defect: "inert" reads as *vetted* to anyone scanning the table, and it had not earned that — a detector that fires on nothing has not been shown to be safe, only to be untested against anything it matches. The third state is now **`NOT MEASURED (no positive case exists for this kind)`**, generated into `docs/detector-fp-table.md` alongside `MEASURED — admitted` and `MEASURED — rejected`. **Exit B — drop the unmeasured set from the package — was REJECTED**, recorded here so it is not re-proposed as an obvious size win: it is cheap and **one-way**, because a detector that is not shipped can never be measured into a tier, so it forecloses the only exit that resolves the question; and 65.8 KB inside a 214 KB community node is not a cost anyone is paying attention to. **Exit A adopted incrementally, as a standing rule:** every future item that touches a detector adds positive cases for the kinds it touches, and those kinds move out of the unmeasured row. Not one heroic pass — the corpus grows with the work. | recorded |
| NP-W | **The admission measurement reads this repository's own source, so it can be perturbed by unrelated edits — and it oscillated until it was made a fixed point.** Two failures, both caught by running it twice rather than once. (a) Corpus A originally included `scripts/`, which holds the measurement's own code, so running the measurement changed its own input. `scripts/` and `docs/` are now excluded; the remaining corpus is prose and product source. (b) The candidate pool was `tier === 'contextual'`, so once the generator promoted a detector to `aggressive-only` the next run stopped considering it and the run after demoted it again — the admission list was a function of the last generation instead of a fixed point of (measure → generate). Candidates are now everything outside `standard`, and two full cycles converge to the same list. **Closed:** corpus A is now a frozen snapshot, `__tests__/fixtures/negative-corpus-repo-snapshot.txt`, refreshed only by an explicit `npm run measure:fp -- --refresh-corpus`. A corpus change can no longer arrive as a side effect of unrelated work — it lands as a reviewable diff next to the admission diff it causes. Absence of the snapshot throws rather than falling back to the live walk, because falling back would silently restore the behaviour the snapshot exists to remove. Verified: the snapshot reproduces the live walk's verdict exactly — 8 admitted, 99 rejected, 361 not measured. Cost: 140 KB of duplicated repository text, recorded rather than hidden. | closed |
| NP-V | **The local detector masks non-routable and wildcard IPs.** Measured through the node's own local path: `0.0.0.0` and `10.0.0.5` both become `[IP_ADDRESS_nnn]`. Whether that is wrong is arguable — an IP can identify a person — but a wildcard bind address in a config snippet is not customer data, and masking it corrupts the text a downstream agent reads. **DECIDED and closed: suppress non-routable addresses — they are not personal data.** The reasoning, recorded for the next person who asks: a private address identifies a device only inside a network the reader is already on, and to an external sink — the thing this product protects — `10.0.0.5` carries no information about a person, because a recipient who cannot obtain the additional information required cannot link it to an individual. Public IPs are personal data; these are not. And masking them destroys utility: a config snippet with `0.0.0.0` masked is text the downstream agent can no longer act on — N4-7's aggressive failure in miniature, masking that costs more than it protects. Suppressed: `0.0.0.0/8`, `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `255.255.255.255`, multicast `224.0.0.0/4`, and the documentation ranges `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`. Proven not to have eaten what matters: public addresses are still masked, asserted in the same file. **Recorded, deliberately NOT built:** internal-IP masking as a customer requirement is **infrastructure secrecy, not PII** — a feature request with a different justification, not a default this product should carry. | closed |
| NP-U | **`aggressive` detection level was not a sensitivity setting — it masked everything.** Measured through the node's own `execute` on the 18-case matrix: `standard` scored TP=4 FN=5 TN=8 FP=1; `aggressive` scored **TP=9 FN=0 TN=0 FP=9** — every negative case failed. It reached TP=9 by masking every token: `reach ayse.demir@fixture.invalid today` came back as `[XBOX_GAMERTAG_001].[PSN_ID_001][TIKTOK_USERNAME_001] [IATA_AIRPORT_CODE_001]`, so `reach` and `today` were PII and the email never received an `EMAIL` token — the DLP category was wrong, not merely noisy. Mechanism: `aggressive` dropped the `tier !== 'contextual'` filter, admitting **468** detectors written to require context, and NP-T meant no context was ever supplied. Closed by N4-7b with an admission rule that is a **measurement, not a judgement**: a detector enters `aggressive` only with **zero false positives across two negative corpora** (2,714 lines) **and at least one positive hit under the right kind** — right value, wrong label counts as a false positive, which is how `SOCIAL_MEDIA_HANDLE` firing on `hello@privent.ai` is scored. Result: **8 admitted, 99 rejected, 361 inert**. `ADDRESS_STREET` is the one detector measured on a narrowed corpus scope: it was rejected on a single false positive — the phrase `0 bakes its own literal in place`, from a comment in this package's own source — and corpus A is engineering prose written *about detection*, which is adversarial for a street-address pattern in a way customer text is not. Re-measured against corpus B with positive cases added: zero false positives, two hits, admitted. The threshold did not move; the scope is declared and published in the table. See METHOD §2. Acceptance was case-by-case across all 18, never aggregate — aggregate is what made TP=9/FP=9 look like success. | closed |
| NP-T | **Every false-positive rule was invoked with an empty context, at every call site.** `isLocalFalsePositive(value, type)` called `r.matcher(value, '')` (`shared/local-detectors.ts:902` before this item), while every vendored matcher is written as `(value, context)`. The effect ran both ways and both were wrong: context-aware rules — "preceded by `port:`", "preceded by a currency word", "inside a comment" — could never fire, and value-aware rules fired everywhere with no way to be overruled. A second defect rode on the same rule set: the placeholder word list (`foo|bar|…|test|demo|sample|…`) was tested against the whole value, so any address whose LOCAL PART contained one was dropped — `test.user@bank.invalid`, `sample.reports@clinic.invalid`, `demo.account@insurer.invalid`, **3 of 3 undetected**. NP-L found that this filter made synthetic *fixtures* invisible; this finding is the same filter making **customer data** invisible. Closed by N4-7a: the caller passes the text preceding the match on its own line (prefix-only and line-scoped, so a stray `#` or `;` nearby cannot satisfy the comment rule), and for EMAIL the word list is applied to the **domain**, which is what actually makes an address synthetic (RFC 2606). Fixed in `scripts/gen-local-detectors.mjs` and regenerated; `shared/local-detectors.ts` is never hand-edited. | closed |
| NP-S | **A stored node with no `authentication` key means three different things, and the node was answering for all three with one guess.** n8n does not persist a parameter equal to its default — measured in `n8nio/n8n:2.28.7`: choosing `local` saves nothing, choosing `apiKey` saves `"apiKey"` — and `version` was never bumped when this package flipped the default from `apiKey` to `local` in 2.2.1 (`5d04122`). So a pre-2.1.0 node, a 2.1.0–2.2.0 node left on `apiKey`, and a 2.2.1+ node left on `local` are **byte-identical on disk at `typeVersion: 1`**. typeVersion cannot separate them; the prescribed "typeVersion-aware default" could not have worked. What the runtime actually did: `_getNodeParameter` reads `get(node.parameters, name, fallbackValue)` against the STORED parameters (n8n-core 2.28.4, `node-execution-context.js:271`) and nothing in the execution engine fills description defaults first, so the absent key fell through to this package's `'apiKey'` fallback. The harm was therefore the reverse of the one assumed: cohorts 1 and 2 were fine, and **cohort 3 — every evaluator who installed 2.2.1+ and never opened the dropdown — ran in apiKey mode and failed on "Node does not have any credentials set"**. Closed by N4-5 with credential presence as the disambiguator, read from `getNode().credentials` (what n8n itself reads) and never from `getCredentials()`, which throws `Credentials not found` when displayOptions hides the credential and would answer wrongly with confidence. Where it still has to infer, the item carries a warning naming that the mode was never set and that the run is regex-only. | closed |
| NP-R | **Version visibility is met COLLECTIVELY, by three channels, and no single channel covers all three auth modes.** Measured per mode through the node's own `execute`: `apiKey` carries `node_version` in the **audit event** and emits no telemetry (deliberate — the audit stream already reports, double-reporting is worse); `tokenless` carries it in **telemetry** and emits no audit (an anonymous visitor has no org); `local` emitted **neither**. The instruction this item started from — "`node_version` must reach telemetry and audit in every mode" — was withdrawn once measured, because in `local` it would mean network egress from the one mode that promises *"your data never leaves your n8n instance"*. A version string is not worth trading a privacy promise for. Closed by N4-8 with a channel that needs no network: `privent.nodeVersion` on the **item output**, uniformly in all three modes, with the existing channels left exactly as they are. The answer to "is the version visible?" is therefore **per-channel, not global** — recorded in that form on purpose, because the next person to ask will otherwise assume one channel answers for all. | closed |
| NP-Q | **`framework_version` fell back to a version that was never n8n's.** `session.ts` wrote `safeFrameworkVersion() ?? TRACER_VERSION`. The field means *n8n's* version; the fallback wrote core's. Its value was never even stable: with core 0.8.0 bundled it read `2.4.0` (this package), because 0.8.0's `TRACER_VERSION` read `globalThis.__SDK_VERSION__` and `tsup.config.ts:36` replaced that with this package's version; core 0.10.0 bakes its own literal in, so the same line would have started reporting `0.10.0` (core) after the bump. Same lie, new value, and the change would have arrived silently on a dependency bump. **Fourth instance of the runtime-version-invisibility class** (after NP-O and its two predecessors). The blind spot is precise and worth naming: `privent-http.ts:32` already carries the rule — *"Do NOT use core's `TRACER_VERSION`"* — and `session.ts:118` did exactly that, through a fallback, where the rule's own comment was not in view. A rule written at the definition does not travel to the call site. Closed with the bump: when the peer cannot be read the key is **absent**, not guessed. Verified against the ingest path before shipping — `framework_version` is not a DTO field, it rides inside `metadata` (`@IsOptional() @IsObject()`, `privent-backend/src/audit/dtos/audit-events-ingest.dto.ts:47`), the global pipe is `new ValidationPipe({ transform: true })` with no `whitelist`/`forbidNonWhitelisted` (`privent-backend/src/main.ts:26`), and the service reads `trunc(metaStr(meta,'framework_version','frameworkVersion'),32) ?? null` (`privent-backend/src/audit/audit-ingest.service.ts:179`). An absent key stores null; it does not reject the event. | closed |
| NP-P | **`auto` detection mode swallowed HTTP 402, and no test could have caught it.** `tokenize.ts` treated every ML failure alike: `cloud` throws, `auto` degrades to regex-only and says nothing. For a timeout that is the documented contract; for 402 Payment Required it is not — the plan or quota is exhausted, it will answer 402 for every item in the run, and `cloud` fails the run on the identical response. Downstream, an item the backend scored and an item it never saw were indistinguishable (`risk: null` is also a legitimate low-risk shape), and the audit event recorded `detection_mode: auto` either way. The second half is instrumental: the suite's only failure primitive was `failUrls`, which throws a bare `Error` carrying no status, so **no test could tell a quota rejection from a socket reset** — the very distinction at issue. Measured in `n8nio/n8n:2.28.7` (digest `sha256:74f1ef0ec73cd1b85c3b55926732c9dfaa544a66d6bb2872fd57718c557954a4`): `httpRequestWithAuthentication` wraps every failure in `NodeApiError` before the node sees it (n8n-core `.../request-helpers/authentication.js:63`), and the status survives as `httpCode`, a **string**. Closed by N4-6 — `auto` still degrades, the data path is unchanged, but the item carries `privent.mlDegraded` and the audit event carries `ml_degraded` / `ml_degraded_status`. | closed |
| NP-O | **The published artifact does not reveal which `@priventai/core` version it carries.** `tsup.config.ts:28` bundles core via `noExternal`, so the declared range (`^0.8.0`) resolves nothing at runtime and the `dist/` output is the only thing an installed user actually runs. Measured against the two candidate versions: **0 of 4** blocks unique to 0.8.0 and **0 of 12** blocks unique to 0.9.0 appear anywhere in `dist/` (120-byte block comparison) — tree-shaking removes exactly the code that would distinguish them. The lockfile pin (`0.8.0`, `registry.npmjs.org/@priventai/core/-/core-0.8.0.tgz`) is the sole evidence of what shipped, and a lockfile is a statement about a build machine, not about an artifact. Third instance of the runtime-version-invisibility class in this programme; the same reason a version signal has to be *emitted* (N4-8) rather than inferred. **Closed:** `tsup.config.ts` now resolves the installed core's version at bundle time and bakes it in as `__CORE_VERSION__`, so `dist/` states what it carries. Two assertions at two layers, because they answer different questions: the bundle holds the version as a **literal**, readable by anyone inspecting a published tarball without executing it, and a running node reports it as `core_version` in the audit event beside `node_version`. The test does not skip when `dist/` is absent — "could not check" is not "checked". | closed |
| NP-N | **`tokens_redeemed` was the number of placeholders FOUND, not the number redeemed.** `detokenize.ts` read it off `placeholders.length` before `retrieveBatch` ran, so an item whose tokens the vault could not resolve left the text unchanged while the audit event recorded a non-zero redemption and the output carried `detokenized: true`. Measured directly — vault returns zero entries, node reports `{"tokens_redeemed":2}` and `detokenized: true`, text byte-identical. Closed by N4-4: found and redeemed are separate numbers and success is derived from the second. The gap between them is now the signal that tokens were present and unresolvable — a distinction that turns out to be available client-side, contrary to what was assumed when the two numbers were treated as one. | closed |
| NP-M | **Adding `i` to `TOKEN_RE` would not make the node case-tolerant.** `scanForTokens` and `replaceIn` rebuild the pattern as `new RegExp(TOKEN_RE.source, 'g')` (`@priventai/core/dist/index.js:578`, `:615`; source at `privent-sdk/packages/core/src/tokenizer/detokenize.ts:22`, `:85`) and `.source` carries no flags — measured: a `/i` literal rebuilt this way yields `[]` for `[email_001]`. The change that survives the rebuild is the **character class**, `[A-Za-z][A-Za-z0-9_]{1,31}`, one line. It cannot be delivered from this repository: the grammar lives in `@priventai/core`, `tsup.config.ts:28` bundles it via `noExternal`, and `@priventai/core@0.9.0` — the published latest — carries a byte-identical grammar. Tracked as **SDK-A** in privent-sdk; nothing changes here until a fixed core is published and this package rebuilds against it. **Closed:** `@priventai/core@0.10.0` ships the widened class, this package bumped and rebuilt against it, and the grammar was verified **from `dist/`** — `/\[([A-Za-z][A-Za-z0-9_]{1,31})_(\d{1,10})(?:_[a-f0-9]{4,16})?\]/g` — not from `node_modules`. | closed |
| NP-L | **This product's own false-positive filter suppresses the standard synthetic-fixture domains.** `isLocalFalsePositive` drops any EMAIL whose value contains `example`, `test`, `demo`, `sample`, … (`shared/local-detectors.ts:765`), which is exactly the RFC 2606 reserved space — `example.com`, `.test`, `.example`. So a fixture chosen to be *safe* is invisible to the local detector, and a local-mode test written with one tests nothing. Measured while sweeping the corpus: moving fixtures to `example.invalid` turned a passing round-trip test red because the address stopped being detected at all. This repo's fixtures therefore use `@fixture.invalid` — reserved by RFC 2606 §2 and free of every suppressed word. Sharpens F-05. **Closed in two steps, and the second was the one that mattered.** N4-7a narrowed the check from the whole value to the domain, fixing the local-part half — `test.user@`, `sample.reports@`, `demo.account@`, 3 of 3. Measured again on `main` afterwards, the domain half was still matching those words as **substrings**: `ayse@demo.acme.com`, `it@test.bank.co.uk` and `ops@sample.acme.io` were all suppressed. Those are ordinary corporate subdomains, so a customer whose staff use `demo.`, `test.` or `staging.` had **nothing masked, silently, on real data rather than on our fixtures**. RFC 2606 reserves exact names, so the check is now exact: `example.com`/`.net`/`.org` and their subdomains, and the reserved TLDs `.test`, `.example`, `.localhost`. `.invalid` is deliberately absent — §2 reserves it for names that are obviously non-existent rather than for documentation, and this repository's fixtures depend on it staying detectable, which is this finding's own original point. | closed |
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
