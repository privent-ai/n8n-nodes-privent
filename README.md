<div align="center">
  
# n8n-nodes-privent

**The DLP layer n8n's Guardrails doesn't have: reversible tokenization for AI workflows.**

Guardrails masks PII and throws it away. Privent masks it, hands it to your LLM safely, and gives you the real value back exactly where you need it.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-privent.svg)](https://www.npmjs.com/package/n8n-nodes-privent)
[![npm downloads](https://img.shields.io/npm/dw/n8n-nodes-privent.svg)](https://www.npmjs.com/package/n8n-nodes-privent)
[![n8n Cloud Verified](https://img.shields.io/badge/n8n%20Cloud-Verified-brightgreen)](https://www.privent.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/privent-ai/n8n-nodes-privent?style=social)](https://github.com/privent-ai/n8n-nodes-privent)

**[Quick Start](#-quick-start--30-seconds-no-api-key)** · **[Why Privent](#why)** · **[vs. Guardrails](#privent-vs-n8n-guardrails)** · **[Docs](https://www.privent.ai/docs)** · **[Discord](https://discord.gg/yZhFGqMS5Y)** · **[ProductHunt](https://www.producthunt.com/products/privent)**

</div>

---

```
[Webhook] → [Privent: Session] → [Privent: Tokenize] → [OpenAI Chat]
                               → [Privent: Detokenize] → [Respond]
```

Privent ships as a single node with a Resource → Operation selector. Each box above is the same node configured to a different resource (Session, Tokenize, Detokenize, Risk Check, Audit, Handoff).

If this is useful to you, **star the repo** — it helps other n8n builders find it.

---

## ⚡ Quick start — 30 seconds, no API key

```bash
cd ~/.n8n
npm install n8n-nodes-privent
```

Restart n8n, add the **Privent** node, set **Authentication = Tokenless (Visitor)**. That's it — no signup, no waiting.

```
[Privent: Session]   → opens a session (auto sessionId)
[Privent: Tokenize]   → masks PII with [EMAIL_001], [PHONE_002], etc.
[Privent: Detokenize] → restores the originals at your trusted output
```

Raw values never leave your n8n instance in this mode. See [Tokenless mode](#tokenless-visitor-mode) for exactly what's included.

Want a persistent vault, ML detection, or audit trail? See [Privent Cloud](#privent-cloud--when-youre-ready-for-more).

---

## Why

LLM-powered workflows leak data. A naive `{{ $json.prompt }}` into ChatGPT sends customer emails, card numbers, and API keys straight to a third party.

Privent sits in the middle: it replaces sensitive values with reversible placeholders (`[EMAIL_001]`, `[CREDIT_CARD_002]`) before the LLM call, then restores them only at sinks you trust.

That reversibility is the whole point. Most guardrail tools redact — the data is gone the moment it's masked. Privent tokenizes — you get it back.

**A concrete case:** you summarize a support ticket with an LLM, then write that summary back to your CRM. With redaction, the customer's name is just gone — replaced by `[REDACTED]` forever. With Privent, the summary comes back referencing `[NAME_001]`, and Detokenize restores it to the real name before it hits your CRM record.

---

## Privent vs. n8n Guardrails

n8n's built-in Guardrails node is a good default for blocking jailbreaks and masking obvious PII. Privent isn't a replacement for it — it solves a different problem: getting the real value back after the LLM step.

| | n8n Guardrails | Privent |
|---|---|---|
| Mask PII before an LLM call | ✅ | ✅ |
| Jailbreak / prompt injection detection | ✅ | ❌ (not the focus) |
| **Restore original value after the LLM call** | ❌ | ✅ |
| Deterministic tokens (`[EMAIL_001]`) | ❌ | ✅ |
| Works with zero setup, no API key | ✅ | ✅ (Tokenless mode) |
| Audit trail per token / agent handoff | ❌ | ✅ (Cloud mode) |

Use Guardrails when you only need to block or mask. Reach for Privent when you need the value back on the other side.

---

## Tokenless (Visitor) mode

The default way to try Privent, and the recommended mode for single-workflow use. Set **Authentication = Tokenless (Visitor)** on the node. It mints an anonymous, signed visitor ID against the backend (`POST /v1/visitor/credentials`) and sends it as `X-Visitor-Id` — no Bearer key, no account.

| | Available |
|---|---|
| Session, Tokenize, Detokenize (in-memory) | ✅ |
| Risk Check | ✅ |
| Audit, Handoff | ❌ (needs API key) |
| Persistent / managed Privent Cloud vault | ❌ (needs API key) |

**In-memory vault.** In tokenless mode, tokens are stored in n8n workflow static data, keyed by `sessionId` — never in the Privent Cloud vault.

- Tokenize and Detokenize must run in the **same workflow** and share the same `sessionId`.
- Raw values rest inside your own n8n and are never sent to Privent, *as long as Detection Mode is set to `Local (Regex)`*. (Risk Check and `Cloud` detection mode do send text to the backend for scoring — use `Local (Regex)` for a fully offline round-trip.)
- On multi-worker n8n Cloud setups, token sharing relies on n8n persisting static data across workers.

### Example — fully offline round-trip

1. **Privent** node → `Tokenless`, Resource `Session`, Operation `Open`.
2. **Privent** node → `Tokenless`, Resource `Tokenize` — same `sessionId`; **Detection Mode = `Local (Regex)`**.
3. **Privent** node → `Tokenless`, Resource `Detokenize` — same `sessionId` — restores the original values at your trusted output.

Nothing in this round-trip leaves your n8n instance.

---

## Privent Cloud — when you're ready for more

| | Tokenless (free) | Privent Cloud (API key) |
|---|---|---|
| Setup | `npm install`, 30 seconds | [Request access](#request-access) |
| Vault | In-memory, n8n workflow static data | Server-side, persistent |
| Cross-session detokenize | ❌ (same workflow only) | ✅ |
| ML-based risk scoring | ❌ (regex only) | ✅ |
| Audit trail / Handoff tracking | ❌ | ✅ |
| Self-hosted backend option | — | ✅ |

Create a `PriventApi` credential to switch a node to Cloud mode:

| Field | Description | Default |
|---|---|---|
| API Key | Privent API key — [request access](#request-access). Encrypted at rest by n8n. | — |
| Base URL | Privent backend endpoint (Cloud or self-hosted) | `https://api.privent.ai` |

Point **Base URL** at your self-hosted deployment to keep all token/risk/audit traffic on-prem.

### Request access

[Request access](https://www.privent.ai/request-access) for a production API key. Most n8n usage doesn't need this — start with Tokenless mode above and request Cloud access only once you need persistent vault, audit trail, or ML detection.

---

## Local (No Backend) mode

Even more offline than Tokenless: **no API key, no backend, no network at all**. Set **Authentication = Local (No Backend)** on the node — Tokenize and Detokenize run entirely inside n8n with local regex detection, so **your data never leaves your n8n instance**.

> **This is the default for newly-added nodes** — a fresh Privent node lands on Local → Tokenize with no credential needed. Switch the **Authentication** dropdown to Tokenless or API Key to opt in. (Existing nodes keep whatever mode they were saved with.)

| | Available |
|---|---|
| Tokenize, Detokenize (in-memory) | ✅ |
| Session, Risk Check, Audit, Handoff | ❌ (need a backend) |

- **No credential** — local mode requests neither the API key nor the visitor credential.
- **575 detectors** — core structured PII plus a large catalog of regex patterns vendored from [openredaction](https://github.com/sam247/openredaction) (MIT — see [`NOTICE`](./NOTICE)).
- **In-memory token map** — tokens live in n8n workflow static data, keyed by `sessionId`, same as Tokenless. Tokenize and Detokenize must run in the same workflow.
- **Session optional** — no Privent Session node needed. Leave **Session ID** empty and a fresh id is generated and written to the item; a downstream local Detokenize reads it back automatically.

**Detection Level** (Tokenize):

| Level | Masks | Trade-off |
|---|---|---|
| **Standard** (recommended) | High-precision structured PII — emails, phones, financial, government IDs with checksums, secrets, API keys | Low false positives, safe to send downstream |
| **Aggressive** | Also names, addresses, bare-number IDs, crypto addresses | Broader coverage, **more false positives — review the output first** |

### Example — local round-trip, no key, no Session

1. **Privent** node → `Local (No Backend)`, Resource `Tokenize` — set **Text Field**, leave **Session ID** empty, **Detection Level** = `Standard`. Sensitive values become `[KIND_NNN]` tokens.
2. **Privent** node → `Local (No Backend)`, Resource `Detokenize` — leave **Session ID** empty (read from the item) — restores the originals at your trusted output.

---

## ✅ Verified on n8n Cloud

Available as a verified community node — installable directly on n8n Cloud, no self-hosting required. Zero runtime dependencies, free of restricted globals/filesystem/network primitives.

## Installation

**n8n Cloud (verified node):** open the nodes panel, search **Privent**, and add it directly — no community-node install step or instance-owner approval needed.

**Self-hosted — in n8n:** Settings → Community Nodes → Install → enter `n8n-nodes-privent`.

**Manual install (self-hosted):**
```bash
cd ~/.n8n
npm install n8n-nodes-privent
```
Restart n8n. The Privent node appears in the node panel.

## Requirements

| Component | Minimum |
|---|---|
| n8n | 1.22.0 |
| Node.js | 20 |
| Privent backend | Only required for Cloud mode — reachable Base URL + API key |

---

## Architecture: stateless nodes + optional server-side vault

The nodes hold no state in the n8n process by default. In **Tokenless mode**, token state lives in n8n's own workflow static data. In **Cloud mode**, token state, risk scoring, and audit ingest live in a Privent backend (Privent Cloud or a self-hosted deployment) reached over HTTP through the `priventApi` credential's Base URL.

- Correlation context (`sessionId`, `traceId`, `agentName`) travels on the n8n item between nodes — the Session resource writes it; downstream resources read it via expression defaults.
- Entity detection for tokenization runs in-node (regex); ML risk scoring is server-side (Cloud mode only).

---

## `usableAsTool`

Tool-callability in n8n is node-level (all-or-nothing) — it cannot be gated per operation. The Privent node sets `usableAsTool: true` so agents can call the safe operations (Tokenize, Risk Check, Audit). A side effect is that every operation — including Detokenize — becomes agent-reachable.

| Operation | Agent-safe? | Why |
|---|---|---|
| Tokenize | ✅ | Masks PII before egress. |
| Risk Check | ✅ | Read-only scoring. |
| Audit | ✅ | Records an event; no data exposure. |
| Session | ➖ | Lifecycle/setup, not a meaningful agent action. |
| Handoff | ➖ | Trust-graph marker, not a meaningful agent action. |
| Detokenize | ⚠️ | Restores raw PII. Agent-reachable — guard it with Strict Mode + Trusted Sinks so an agent cannot un-mask data to an untrusted destination. The Detokenize operation description carries this warning in the UI. |

---

## The Privent node — resources & operations

One node, selected by Resource then Operation:

| Resource | Operation | Purpose |
|---|---|---|
| Session | Open | Opens a session; seeds correlation context. |
| Tokenize | Tokenize | Masks PII/secrets with `[KIND_NNN]` tokens. |
| Detokenize | Detokenize | Restores tokens at a trusted egress point. |
| Risk Check | Score | Scores text for data-leak risk (sessionless). |
| Audit | Emit | Emits an audit event (LLM cost, policy, egress, error). Cloud only. |
| Handoff | Record | Marks an agent → agent / agent → sink handoff. Cloud only. |

### Resource: Session

Opens a Privent session. Place this first — downstream nodes consume its `sessionId`/`traceId`/`agentName`.

**Output:** `sessionId` (UUID), `traceId`, `startedAt` (Unix ms), `executionId`, `agentName`.

**Parameters:** Session ID Mode (`auto` = new UUID per execution; `manual` = supply your own, must be a UUID), Agent Name (logical agent id, written to the item and audit metadata `agent_name`), Framework (n8n/manual), Webhook Node Name (optional; extracts client IP / User-Agent from an upstream Webhook trigger).

### Resource: Tokenize

Detects PII and secrets in a text field (regex) and replaces them with `[KIND_NNN]` tokens.

**Parameters:** Session ID, Trace ID, Agent Name (the last two default to the upstream Session via expressions), Text Field, Detection Mode (`auto`/`local`/`cloud` — gates whether server risk scoring runs), Flag for Review Above Risk Score.

```json
{
  "text": "Hi [EMAIL_001], your number is [PHONE_002].",
  "privent": {
    "sessionId": "...",
    "entities": [
      { "token": "[EMAIL_001]", "kind": "EMAIL", "confidence": 0.95 },
      { "token": "[PHONE_002]", "kind": "PHONE", "confidence": 0.80 }
    ],
    "risk": { "risk_score": 0.87, "risk_level": "HIGH", "categories": { "pii": 0.95 }, "model": "...", "latencyMs": 43 },
    "flaggedForReview": true
  }
}
```

`risk` is `null` when Detection Mode is `local` (server risk scoring is skipped).

### Resource: Detokenize

Replaces tokens with their original values (one batched vault retrieve in Cloud mode; in-memory lookup in Tokenless mode). Use at trusted egress points after the LLM step. Agent-reachable as a tool — pair with Strict Mode + Trusted Sinks.

**Parameters:** Session ID, Trace ID, Agent Name, Target Field (`*` deep-walks every string field), Strict Mode, Destination URL, Trusted Sinks, Target Agent Name (Trust Map). In strict mode, detokenization is blocked unless the Destination URL matches a Trusted Sink — the item passes through with `privent: { detokenized: false }` and a `detokenize` audit event with `reason: strict-mode-block` (it does not throw).

### Resource: Risk Check

Scores text for data-leak risk via the server ML pipeline. Sessionless — no Session required. **Cloud mode only.**

**Parameters:** Text Field, Trace ID, Agent Name (optional, for audit correlation). Auto-batches all input items into a single call.

```json
{ "privent": { "risk_score": 0.92, "risk_level": "HIGH", "categories": { "pii": 0.95 }, "model": "...", "latencyMs": 43 } }
```

### Resource: Audit

Emits a Privent audit event for non-tokenization steps (LLM-call cost tracking, policy decisions, egress, errors). Cloud mode only. Place after an HTTP Request to an LLM provider to record provider/model/token usage; the backend computes USD cost from your org's ModelPricing table.

**Parameters:** Session ID, Trace ID, Agent Name, Event Type (`llm_call`/`policy_decision`/`egress`/`error`), LLM Model (searchable picker, `llm_call` only), Prompt/Completion Tokens (`llm_call` only), Extra Metadata (JSON, merged into the event).

### Resource: Handoff

Marks an explicit agent → agent (or agent → external sink) handoff. Cloud mode only. The backend Trust Map aggregator turns each event into an `AgentInteraction` edge.

**Parameters:** Session ID, Trace ID, From Agent Name (the "from" side, from the upstream Session), Target Kind (`agent`/`sink`), Target Agent Name or External Sink ID, Reason, Payload Token Count. Requires an upstream Session with an Agent Name set.

---

## Example workflow (Cloud mode)

```
[Webhook] → [Privent: Session] → [Privent: Tokenize]
         → [OpenAI Chat] → [Privent: Detokenize] → [Respond to Webhook]
```

Each Privent box is the same node with a different Resource selected.

1. **Privent · Session** — generates a `sessionId`, seeds correlation context.
2. **Privent · Tokenize** — masks every PII / secret in the prompt.
3. **OpenAI Chat** — sees only tokens, never raw data.
4. **Privent · Detokenize** — restores tokens in the LLM response at a trusted sink.

---

## Token format

`[KIND_NNN]`

| Example | Meaning |
|---|---|
| `[EMAIL_001]` | Email address |
| `[PHONE_002]` | Phone number |
| `[CREDIT_CARD_003]` | Credit card number |
| `[SSN_004]` | Social Security Number |
| `[API_KEY_005]` | API key |
| `[JWT_006]` | JSON Web Token |

Tokens are session-scoped: the same value maps to the same token within one session, but token IDs do not correlate across sessions.

---

## Audit emission (Cloud mode)

Every operation emits a typed audit event to the Privent backend after a successful run. Context populated by the Session resource (`agent_name`, `workflow_id`, `workflow_name`, `execution_id`) rides along on the item and attaches to every downstream event.

| Resource | `event.type` |
|---|---|
| Session | `session_open` |
| Tokenize | `tokenize` |
| Detokenize | `detokenize` |
| Risk Check | `risk_check` |
| Audit | `llm_call` / `policy_decision` / `egress` / `error` |
| Handoff | `agent_handoff` |

The Detokenize resource writes `sink_id`, `sink_url_host`, and `sink_trusted` into metadata on both the trusted-egress and strict-mode-block paths.

Metadata never contains raw text, tokenized text, or token literals. Audit emission is best-effort — network/transport failures are swallowed and never break workflow execution. The audit wire contract requires UUID `session_id`/`trace_id`, which is why manual Session IDs must be UUIDs.

---

## Error handling

HTTP-origin failures (vault, risk scoring) surface as an n8n `NodeApiError`, so the backend HTTP status and response body are visible in the UI; validation/logic failures surface as `NodeOperationError`. Continue On Fail is honored on every resource, including the batched Risk Check. Audit emission is the one exception — it is fire-and-forget and never fails the node.

---

## Security properties

- No vault or token state is serialized into n8n execution JSON — in Tokenless mode it lives in n8n's own workflow static data; in Cloud mode it lives server-side.
- In Tokenless mode with `Detection Mode = Local (Regex)`, raw PII never leaves your n8n instance.
- Tenancy is isolated by API key at the backend (Cloud mode).
- Detokenization at egress is gated by Strict Mode + Trusted Sinks.
- Audit emission is fail-open: backend unreachable never blocks the workflow.

---

## Upgrading from 1.x

2.0 is a breaking change. The six standalone nodes (Privent Session, Tokenize, Detokenize, Risk Check, Audit Event, Handoff) are now a single Privent node with a Resource → Operation selector. Behaviour is unchanged — same fields, defaults, endpoints, outputs and audit events — but the node identity changed, so existing workflows must be updated:

1. Add the Privent node where the old node was.
2. Pick the Resource matching the old node (e.g. old Privent Tokenize → Resource `Tokenize`), then its Operation.
3. Re-enter the parameters (the field names and expression defaults are identical).
4. Delete the old node.

---

## Contributing

Issues and PRs are welcome — especially new regex patterns for region-specific PII (national IDs, local phone formats) and example workflows. Found a bug? [Open an issue](https://github.com/privent-ai/n8n-nodes-privent/issues). Built something with Privent? [Share it in Discussions](https://github.com/privent-ai/n8n-nodes-privent/discussions) — we feature community workflows.

## Links

- [n8n Setup Guide](https://www.privent.ai/docs)
- [Request Cloud access](https://www.privent.ai/request-access) — only needed for persistent vault, audit trail, or ML detection
- [Discord community](https://discord.gg/yZhFGqMS5Y)

## License

MIT © Privent AI

Questions? Contact us at hello@privent.ai.

---

<div align="center">

If Privent saved you from writing this tokenization logic yourself, **a star helps other n8n builders find it too.** ⭐

</div>
