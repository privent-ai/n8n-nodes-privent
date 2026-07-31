# Findings index — n8n-nodes-privent

> **This file currently exists on two lines of development.** The fuller index —
> the repo-scoped ID header and `NP-K` … `NP-O` — was written in the N4-2 + N4-4
> stack (PR #5, PR #6), which is deliberately unmerged until `privent-sdk`
> publishes the widened token grammar. Items that branch off `main` cannot cite a
> file `main` does not have, so `main` gets its own copy and the two are merged
> when the stack lands. **The index being invisible on `main` is itself the kind
> of thing this document exists to record**, so it is recorded here rather than
> resolved quietly.

One line per finding. Findings scattered across commit messages and PR bodies is
how a finding dies; this is the index that keeps them visible.

**Status:** `open` — real, not fixed, no item scheduled · `recorded` — real, not
fixed, item scheduled or deliberately declined · `closed` — fixed and verified.

Finding IDs are repo-scoped: `NP-*` here, `BE-*` in privent-backend, `SDK-*` in
privent-sdk. `NP-P` continues the sequence held in the stack — it does not
restart — so the two copies can be concatenated without a collision.

| ID | Finding | Status |
|---|---|---|
| NP-P | **`auto` detection mode swallowed HTTP 402, and no test could have caught it.** `tokenize.ts` treated every ML failure alike: `cloud` throws, `auto` degrades to regex-only and says nothing. For a timeout that is the documented contract; for 402 Payment Required it is not — the plan or quota is exhausted, it will answer 402 for every item in the run, and `cloud` fails the run on the identical response. Downstream, an item the backend scored and an item it never saw were indistinguishable (`risk: null` is also a legitimate low-risk shape), and the audit event recorded `detection_mode: auto` either way. The second half is instrumental: the suite's only failure primitive was `failUrls`, which throws a bare `Error` carrying no status, so **no test could tell a quota rejection from a socket reset** — the very distinction at issue. Measured in `n8nio/n8n:2.28.7` (digest `sha256:74f1ef0ec73cd1b85c3b55926732c9dfaa544a66d6bb2872fd57718c557954a4`): `httpRequestWithAuthentication` wraps every failure in `NodeApiError` before the node sees it (n8n-core `.../request-helpers/authentication.js:63`), and the status survives as `httpCode`, a **string**. Closed by N4-6 — `auto` still degrades, the data path is unchanged, but the item carries `privent.mlDegraded` and the audit event carries `ml_degraded` / `ml_degraded_status`. | closed |
