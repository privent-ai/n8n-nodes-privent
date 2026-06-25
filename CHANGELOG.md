# Changelog

All notable changes to `n8n-nodes-privent` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

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
