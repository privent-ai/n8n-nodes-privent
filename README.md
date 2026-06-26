<img width="1920" height="540" alt="0521" src="https://github.com/user-attachments/assets/3bcb86ec-af72-4cff-b1a4-38883b17e3b3" />

# Privent - Stop Data Leaks in n8n Workflows. 

<img width="1772" height="1080" alt="privent-black" src="https://github.com/user-attachments/assets/9f221d49-6286-44fb-bf88-f0a4fc5e9341" />


> **Early Access.** Privent is currently in private rollout. API keys are issued through our access process. [Request access](https://www.privent.ai/request-access)


Official **Privent DLP** community nodes for [n8n](https://n8n.io). Tokenize PII and secrets in prompts on the way to your AI agents and detokenize them at trusted egress points — without ever exposing raw data to the LLM.

```
[Webhook] → [Privent Session] → [Privent Tokenize] → [OpenAI Chat]
                              → [Privent Detokenize] → [Respond]
```

> **n8n Cloud verified: in progress.** These nodes are zero-runtime-dependency and free of restricted globals/filesystem/network primitives; the package is being submitted for the n8n Cloud verified-community program.

---

## Why

LLM-powered workflows leak data. A naive `{{ $json.prompt }}` into ChatGPT sends customer emails, card numbers, and API keys straight to a third party.

Privent sits in the middle: it replaces sensitive values with reversible placeholders (`[EMAIL_001]`, `[CREDIT_CARD_002]`) before the LLM call, then restores them only at sinks you trust.

---

## Architecture: stateless nodes + server-side vault

The nodes hold **no state in the n8n process**. Token state, risk scoring, and audit ingest all live in a **Privent backend** (Privent Cloud or a self-hosted deployment) reached over HTTP through the `priventApi` credential's **Base URL**. Each node call uses n8n's authenticated request helper — there is no local vault, no background timer, and no environment-variable configuration.

Consequences:
- A reachable Privent backend is **required** (the credential is mandatory on every node).
- Correlation context (`sessionId`, `traceId`, `agentName`) travels on the n8n item between nodes — **Privent Session** writes it, downstream nodes read it via expression defaults.
- Entity detection for tokenization runs **in-node** (regex); ML risk scoring is server-side.

---

## Requirements

| Component | Minimum |
|---|---|
| n8n | 1.22.0 |
| Node.js | 20 |
| Privent backend | reachable Base URL + API key (Cloud or self-hosted) |

---

## Installation

In n8n: **Settings → Community Nodes → Install** → enter `n8n-nodes-privent`.

Manual install (self-hosted):

```bash
cd ~/.n8n
npm install n8n-nodes-privent
```

Restart n8n. The Privent nodes appear in the node panel.

---

## Credential: PriventApi

Create a **PriventApi** credential before using any Privent node.

| Field | Description | Default |
|---|---|---|
| API Key | Privent API key — [request access](https://www.privent.ai/request-access). Encrypted at rest by n8n. | — |
| Base URL | Privent backend endpoint (Cloud or self-hosted) | `https://api.privent.ai` |

The credential injects `Authorization: Bearer <API Key>` on every request. Point **Base URL** at your self-hosted deployment to keep all token/risk/audit traffic on-prem.

---

## `usableAsTool`

| Node | Tool? | Why |
|---|---|---|
| Privent Tokenize | ✅ | Safe for an agent to call — masks PII before egress. |
| Privent Risk Check | ✅ | Read-only scoring. |
| Privent Audit Event | ✅ | Records an event; no data exposure. |
| Privent Session | ❌ | Lifecycle/setup node, not an agent action. |
| Privent Detokenize | ❌ | Restores raw PII — agent-callable detokenization is a security footgun. |
| Privent Handoff | ❌ | Trust-graph marker, not an agent action. |

---

## Nodes

### Privent Session

Opens a Privent session. Place this **first** — downstream nodes consume its `sessionId`/`traceId`/`agentName`.

**Output:** `sessionId` (UUID), `traceId`, `startedAt` (Unix ms), `executionId`, `agentName`.

**Parameters:** **Session ID Mode** (`auto` = new UUID per execution; `manual` = supply your own, **must be a UUID**), **Agent Name** (logical agent id, written to the item and audit `metadata.agent_name`), **Framework** (`n8n`/`manual`), **Webhook Node Name** (optional; extracts client IP / User-Agent from an upstream Webhook trigger).

### Privent Tokenize

Detects PII and secrets in a text field (regex) and replaces them with `[KIND_NNN]` tokens via the server vault.

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

### Privent Detokenize

Replaces tokens with their original values (one batched vault retrieve). Use at trusted egress points **after** the LLM step.

**Parameters:** Session ID, Trace ID, Agent Name, Target Field (`*` deep-walks every string field), Strict Mode, Destination URL, Trusted Sinks, Target Agent Name (Trust Map). In strict mode, detokenization is blocked unless the Destination URL matches a Trusted Sink — the item passes through with `privent: { detokenized: false }` and a `detokenize` audit event with `reason: strict-mode-block` (it does **not** throw).

### Privent Risk Check

Scores text for data-leak risk via the server ML pipeline. **Sessionless** — no Session required.

**Parameters:** Text Field, Trace ID, Agent Name (optional, for audit correlation). Auto-batches all input items into a single call.

```json
{ "privent": { "risk_score": 0.92, "risk_level": "HIGH", "categories": { "pii": 0.95 }, "model": "...", "latencyMs": 43 } }
```

### Privent Audit Event

Emits a Privent audit event for non-tokenization steps (LLM-call cost tracking, policy decisions, egress, errors). Place after an HTTP Request to an LLM provider to record provider/model/token usage; the backend computes USD cost from your org's ModelPricing table.

**Parameters:** Session ID, Trace ID, Agent Name, Event Type (`llm_call`/`policy_decision`/`egress`/`error`), LLM Model (searchable picker, `llm_call` only), Prompt/Completion Tokens (`llm_call` only), Extra Metadata (JSON, merged into the event).

### Privent Handoff

Marks an explicit agent → agent (or agent → external sink) handoff. The backend Trust Map aggregator turns each event into an AgentInteraction edge.

**Parameters:** Session ID, Trace ID, From Agent Name (the "from" side, from the upstream Session), Target Kind (`agent`/`sink`), Target Agent Name **or** External Sink ID, Reason, Payload Token Count. Requires an upstream Session with an Agent Name set.

---

## Example workflow

```
[Webhook] → [Privent Session] → [Privent Tokenize]
         → [OpenAI Chat] → [Privent Detokenize] → [Respond to Webhook]
```

1. **Privent Session** — generates a `sessionId`, seeds correlation context.
2. **Privent Tokenize** — masks every PII / secret in the prompt.
3. **OpenAI Chat** — sees only tokens, never raw data.
4. **Privent Detokenize** — restores tokens in the LLM response at a trusted sink.

---

## Token format

```
[KIND_NNN]
```

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

## Audit emission

Every node emits a typed audit event to the Privent backend after a successful operation. Context populated by **Privent Session** (`agent_name`, `workflow_id`, `workflow_name`, `execution_id`) rides along on the item and attaches to every downstream event.

| Node | `event.type` |
|---|---|
| Privent Session | `session_open` |
| Privent Tokenize | `tokenize` |
| Privent Detokenize | `detokenize` |
| Privent Risk Check | `risk_check` |
| Privent Audit Event | `llm_call` / `policy_decision` / `egress` / `error` |
| Privent Handoff | `agent_handoff` |

`Privent Detokenize` writes `sink_id`, `sink_url_host`, and `sink_trusted` into `metadata` on both the trusted-egress and strict-mode-block paths.

Metadata never contains raw text, tokenized text, or token literals. Audit emission is best-effort — network/transport failures are swallowed and never break workflow execution. The audit wire contract requires UUID `session_id`/`trace_id`, which is why manual Session IDs must be UUIDs.

---

## Security properties

- No vault or token state is serialized into n8n execution JSON — it lives server-side.
- Tenancy is isolated by API key at the backend.
- Detokenization at egress is gated by Strict Mode + Trusted Sinks.
- Audit emission is fail-open: backend unreachable never blocks the workflow.

---

## Links

- [n8n Setup Guide](https://www.privent.ai/docs/n8n-setup)
- [Request access](https://www.privent.ai/request-access) — required to obtain a production API key

---

## License

MIT © Privent AI

Questions? Contact us at hello@privent.ai.
