# Changelog

All notable changes to `n8n-nodes-privent` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

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
