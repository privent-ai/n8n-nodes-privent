# Changelog

All notable changes to `n8n-nodes-privent` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed — audit events from this node now always report `framework: n8n`

- **The `Framework` parameter on the Session node is removed, and `framework` is
  always `n8n`.** It offered *Manual / Custom* and *Native*, and *Manual /
  Custom* was translated to the wire value `sdk` — so a session opened in an n8n
  workflow reached the backend claiming to be from the SDK, and could not be
  identified as n8n at all. `framework` names the **orchestration engine**; a
  node that only runs inside n8n has exactly one, so the choice was the bug and
  `manual`→`sdk` was its symptom. `sdk` is a **channel** value now, carried by
  `X-Privent-Client`.

- **APPEARANCE CHANGE, if you had Framework set to *Manual / Custom*.** Sessions
  opened from that node were stored against `framework: "sdk"` and will now be
  stored against `framework: "n8n"`. In the dashboard, those sessions move from
  the *SDK* framework filter to *n8n*. **Historic rows are not rewritten**, so
  that customer's session history will show both values either side of the
  upgrade. This is a **correction, not a regression** — those events were
  mislabelled, and they were already self-contradictory on the wire, carrying
  `framework: "sdk"` beside `metadata.framework: "n8n"` in the same payload. If
  you left Framework on *Native* (the default), nothing changes.

- **No re-saving needed.** A workflow saved with the old parameter keeps it in
  storage; the node no longer reads it, so an upgraded workflow reports
  correctly without being opened or re-saved.

### Added

- **`X-Privent-Client: n8n-nodes` on every outbound Privent request.** The
  backend's `framework` field names the orchestration engine, so this package and
  the in-engine interceptor both report `n8n` and neither is identifiable from it.
  The header carries the channel instead, on the transport rather than in the
  body, because eight of the nine endpoints this node calls have no `framework`
  and no metadata to put it in. Sent on both transports (API Key and Tokenless),
  on the telemetry ping, and on both credentials' Test button. Nothing about
  detection, tokenization or audit content changes, and no request data is added
  — it identifies the client, not the caller.

## [3.0.1] - 2026-08-01

### Fixed

- **`zod` is now declared.** The package requires it at runtime and declared it
  nowhere; it worked only because n8n ships its own copy
  (`n8nio/n8n:2.28.7` carries zod 3.25.67). Anything loading this node outside an
  n8n that bundles zod failed on install with `Cannot find module 'zod'`.
  **Now bundled into the published artifact**, so the package carries what it
  needs. Declaring it was tried first and is not permitted: this package's own
  gate — `@n8n/eslint-plugin-community-nodes`, the one n8n runs — rejects `zod`
  in `peerDependencies` (*only `n8n-workflow` and `@n8n/ai-node-sdk` are
  permitted*) and rejects any `dependencies` at all (*runtime dependencies get
  bundled into the n8n instance and can conflict with other nodes or the n8n
  runtime itself*). The rule's own text names the remaining option. Measured
  cost: the node bundle goes from 221 KB to **343 KB, +121 KB**. The package
  still declares zero runtime dependencies, which is now true rather than
  true-by-omission.

### Added — build integrity

- **`npm run verify:artifact`**, wired into CI and into the release job before
  `npm publish`. It asserts the `@priventai/core` version baked into `dist/`
  matches the version the lockfile pins, and with `--against <version>` it
  compares the local build byte-for-byte against what was published to npm.
  Nothing checked either of those before, so "manifest, lockfile and artifact
  agree" was an assumption — and answering it once took three separate
  measurements.

## [3.0.0] - 2026-08-01

**This is a major version because several changes alter what the node emits, and
a stored workflow can depend on that.** A minor number here would have implied a
safety this release does not have. Read the BREAKING section before upgrading.

### BREAKING — output a stored workflow may branch on

- **`privent.detokenized` now means "values came back", not "the operation ran".**
  It used to be `true` unconditionally. It is now `true` only when every
  placeholder found was resolved, and the item carries `privent.reason` when it
  is not. An IF node branching on `privent.detokenized` will take a different
  path for items whose tokens the vault could not resolve — which previously
  reported success while leaving the text unchanged. The audit event also now
  carries `tokens_found` alongside `tokens_redeemed`; the gap between the two
  numbers is the signal that tokens were present and unresolvable.
- **Detection Level "Aggressive" no longer masks names, social usernames,
  gamertags, or bare-number IDs.** Those patterns matched ordinary English words —
  `reach` was a gamertag, `today` an airport code — so a sentence containing an
  email address came back with the email intact and four junk tokens around it.
  Aggressive is now Standard plus a measured set: street addresses, Bitcoin and
  Ethereum wallet addresses, IPv4 and MAC addresses, DEA numbers, UPS tracking
  numbers and VAT numbers. Every one of them was measured against a
  false-positive corpus before admission; the table ships in
  `docs/detector-fp-table.md`. **If you selected Aggressive to mask personal
  names, it no longer does, and it never did so reliably.**
- **Private, loopback, link-local, multicast and documentation IP addresses are
  no longer masked.** `10.0.0.5` and `0.0.0.0` come through as written. A private
  address is not linkable to a person by a recipient outside the network, and
  masking it made config snippets unusable to the agent downstream. Public
  addresses are still masked.
- **A stored node with no explicit Authentication now resolves by credential
  presence.** If a Privent credential is attached, it runs as API Key exactly as
  before. If none is attached, it runs as Local instead of failing with
  "Node does not have any credentials set" — which is what an evaluation
  install hit on its first execution. Where the mode is inferred, the item says
  so in `privent.authWarning`.

### Fixed — detection

- **IBANs written the way they are printed are now detected.** `GB29 NWBK 6016
  1331 9268 19` — groups of four, as it appears on an invoice or in an email —
  used to come back as `GB29 NWBK [PHONE_001] 19`: the middle digits masked as a
  phone number, the country and bank codes left in cleartext. Twelve written
  forms were measured; two were detected before this release, twelve are now.
  Hyphenated, non-breaking-space, lower-case and mixed-case forms are included.
- **Addresses at `demo.`, `test.`, `sample.` and `staging.` subdomains are no
  longer suppressed.** The false-positive filter matched those words as
  substrings anywhere in the address, so `ayse@demo.acme.com` and
  `it@test.bank.co.uk` — ordinary corporate mailboxes — were detected as
  fixtures and left unmasked. RFC 2606 reserves exact names, so the check is now
  exact: `example.com`/`.net`/`.org` and the reserved `.test`, `.example`,
  `.localhost` TLDs.
- **Addresses whose LOCAL PART contains `test`, `demo` or `sample` are no longer
  suppressed** — `test.user@`, `demo.account@`, `sample.reports@` were all
  invisible.
- **Street addresses with an alphanumeric house number are detected.**
  `221B Baker Street` was not an address; it is now.
- **Context-aware false-positive rules actually run.** Every rule was invoked
  with an empty context, so rules like "preceded by `port:`" or "inside a
  comment" could never fire while value-based rules fired everywhere.

### Fixed — honesty

- **`auto` detection mode no longer swallows HTTP 402.** It still degrades to
  regex-only when the ML backend is unreachable, but the item now carries
  `privent.mlDegraded` and the audit event carries `ml_degraded` /
  `ml_degraded_status`. Payment Required is a plan decision, not a blip, and
  `cloud` fails the run on the same response.
- **Strict Mode with an empty Trusted Sinks list now blocks instead of allowing.**
  An empty list was read as "everything is trusted", so Strict Mode was a no-op
  for anyone who switched it on without filling the list in.
- **`framework_version` is absent rather than wrong when n8n's version cannot be
  read.** It used to report this package's version, and after the core bump would
  have reported core's — neither is n8n's.

### Added

- **`privent.nodeVersion` on every item, in all three auth modes**, with no
  network. Version visibility is per channel: API Key reports in the audit event,
  Tokenless in telemetry, Local on the item only — and Local stays offline, which
  is the promise that mode exists for.
- **The published bundle now states which `@priventai/core` it contains**, as a
  literal readable from the tarball without executing it, and as `core_version`
  in the audit event.

### Changed

- `@priventai/core` 0.8.0 → 0.10.2. Carries the widened token grammar (lower-case
  tokens now detokenize) and the IBAN printed form upstream.

## [2.4.0] - 2026-07-20

### Added
- **Org custom patterns in Tokenize** — API Key mode now fetches the org's active custom regex patterns
  (`GET /v1/custom-patterns/active`, cached ~5 min per credential) and masks matching values to
  `[KIND_NNN]`, so org-defined masking applies in the local tokenizer path — including `local` detection
  and when the ML/risk pass is skipped or unreachable. Custom matches are **authoritative**: they win
  overlap resolution over any built-in or backend/ML span, and their `category`/`sensitivity` are surfaced
  on `privent.entities`. **Fail-open**: a patterns-fetch error never breaks tokenize (built-ins still run).
  Tokenless and Local (No Backend) modes are unaffected — the serve endpoint needs an API key, so they get
  built-ins only. No new runtime dependency (native `RegExp` + the existing authenticated HTTP helper).

## [2.3.1] - 2026-07-04

### Fixed
- API Key audit events now report per-op `latency_ms` (tokenize, detokenize, risk_check) at the top level,
  so backend latency analytics (avg/p95) populate instead of showing 0. No behavior change; tokenless/local
  unaffected (they emit no audit).

## [2.3.0] - 2026-07-04

### Added
- **Anonymous tokenless telemetry** — Tokenless mode now sends one fire-and-forget, anonymous event per
  node execution to the configured Tokenless Base URL (`POST /v1/telemetry/events`), so tokenless adoption
  and health are visible. The only identifier is a random per-install `install_id`; the payload is a fixed
  allowlist (`operation`, `auth_mode`, `node_version`, `n8n_version`, `item_count`, `status`, `error_type`
  class name, `timestamp`) — never raw text, tokens, entities, org, key, sink, IP, or workflow/node names.
  **API Key** mode sends nothing here (it already reports via the audit stream); **Local (No Backend)** mode
  sends nothing at all (its zero-network guarantee is unchanged). A telemetry failure never affects the
  workflow. See the README **Telemetry** section — there is no opt-out, so the exact fields are documented.

## [2.2.2] - 2026-07-03

### Changed
- API Key audit events now carry two diagnostic fields in `metadata`: **`node_version`** (the build of
  `n8n-nodes-privent` that produced the event) and **`vault_backend`** (`memory` or `cloud`, from the
  Privent API credential). No new network call, no behavior change, no migration — the fields ride the
  existing audit event. Tokenless and Local mode are unaffected (they emit no audit events).

## [2.2.1] - 2026-06-30

### Changed
- Newly-added Privent nodes now default to **Local (No Backend)** Authentication (zero-setup: no API key,
  no backend). Existing nodes — including pre-2.1.0 nodes that store no Authentication value — are
  unaffected and keep their current mode; API Key and Tokenless remain selectable from the dropdown.

## [2.2.0] - 2026-06-30

### Added
- **Local (No Backend) mode** — a third Authentication option alongside API Key and Tokenless. Tokenize
  and Detokenize run entirely inside n8n with local regex detection: **no API key, no backend, zero
  network — your data never leaves your n8n**. Adds 575 detectors (core structured PII plus a catalog
  vendored from [openredaction](https://github.com/sam247/openredaction), MIT — see `NOTICE`), tier-gated
  by a **Detection Level** toggle (Standard = high-precision structured PII; Aggressive = also names,
  addresses, bare-number IDs and crypto). Tokens live in an in-memory vault (n8n workflow static data) and
  the Privent **Session** node is optional (session id is auto-managed and rides on the item). Session,
  Risk Check, Audit and Handoff remain backend-only. API Key and Tokenless behavior is unchanged.

## [2.1.1] - 2026-06-30

### Docs
- README: mark the package as verified + live on n8n Cloud (direct nodes-panel install); split
  Cloud vs self-hosted install steps. Docs-only; no code or API change.

## [2.1.0] - 2026-06-30

### Added
- **Tokenless (Visitor) mode** — use Privent with no API key. A new **Authentication** switch (API Key |
  Tokenless) on the node and a **Privent Tokenless** credential (base URL only). In tokenless mode the node
  mints an anonymous signed visitor id (`X-Visitor-Id`) and supports Session, Tokenize, Detokenize
  (in-memory vault in n8n workflow static data, keyed by `sessionId`) and Risk Check. Audit, Handoff and the
  managed cloud vault remain API-key only. Requires backend visitor auth (`VISITOR_AUTH_ENABLED=true`).
  apiKey behavior is unchanged.

## [2.0.0] - 2026-06-27

### Changed
- **BREAKING — consolidated the 6 Privent nodes into a single `Privent` node** using the
  Resource → Operation pattern (Session, Tokenize, Detokenize, Risk Check, Audit, Handoff are now
  resources of one node). n8n Cloud verification allows one regular node per package. Field names,
  defaults, options, endpoints, request bodies, outputs and audit events are unchanged — only the
  node identity changed. **Migration:** re-add the **Privent** node in existing workflows and pick the
  Resource/Operation that matches the old node.
- HTTP-origin failures (vault find-or-create/retrieve, risk score, risk batch) now surface as
  `NodeApiError` (HTTP status + response body reach the UI) instead of raw/uncaught errors;
  validation/logic failures remain `NodeOperationError`. Continue-On-Fail is honored everywhere,
  including the batched Risk Check. Audit emission stays fire-and-forget (never fails the node).
- `usableAsTool: true` on the single node (tool gating is node-level in n8n). The Detokenize
  operation description now warns that it is agent-reachable — use Strict Mode + Trusted Sinks.

## [1.1.4] - 2026-06-26

### Docs
- Update README demo image. Docs-only; no code or API change. Republished so the npm
  package page reflects the new image.

## [1.1.3] - 2026-06-26

### Docs
- Add demo screenshot to README. Docs-only; no code or API change. Republished so the
  npm package page reflects the updated README.

## [1.1.2] - 2026-06-26

### Changed
- Align source layout to n8n-nodes-starter (root `credentials/` + `nodes/` instead of
  under `src/`) for verified-node vetting. Build output paths under `dist/` are unchanged;
  no API change.

## [1.1.1] - 2026-06-26

### Packaging
- Commit the built `dist/` to the repo so the n8n verified-node pre-check can find
  the credential file (`dist/credentials/PriventApi.credentials.js`) in the GitHub
  repo at the path declared in `package.json` → `n8n.credentials`. No functional or
  API change.

## [1.1.0] - 2026-06-25

### Added
- **ML PII masking** in Privent Tokenize (`auto`/`cloud` modes): person names,
  dates of birth and street addresses are now detected via the backend ML pass
  (`/v1/risk/score` with `include_entities`) and tokenized alongside the existing
  regex-detected structured PII. Detection + risk now come from a single call on
  the original text; the external LLM still only ever receives tokenized text.
- Explicit 200s request timeout so the backend's 180s ML budget (cold start)
  wins over n8n's default timeout, preventing a silent fall back to regex-only
  masking in `auto` mode.

### Changed
- `local` mode remains regex-only (no network, no risk); its description now
  states that names/DOB/address are not masked there — use `auto`/`cloud` for
  full PHI coverage.

## [1.0.0]

### Added
- Initial n8n Cloud-verified release: session-scoped tokenization, risk scoring,
  and safe detokenization for AI agent workflows.
