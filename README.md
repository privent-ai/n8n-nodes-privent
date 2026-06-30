# n8n-nodes-privent

<img width="1772" height="1080" alt="privent-black" src="https://github.com/user-attachments/assets/9f221d49-6286-44fb-bf88-f0a4fc5e9341" />


> **Early Access.** Privent is currently in private rollout. API keys are issued through our access process. [Request access](https://www.privent.ai/request-access)


Official **Privent DLP** community nodes for [n8n](https://n8n.io). Tokenize PII and secrets in prompts on the way to your AI agents and detokenize them at trusted egress points — without ever exposing raw data to the LLM.

```
[Webhook] → [Privent: Session] → [Privent: Tokenize] → [OpenAI Chat]
                               → [Privent: Detokenize] → [Respond]
```

Privent ships as a **single node** with a **Resource → Operation** selector. Each box above is the
same **Privent** node configured to a different resource (Session, Tokenize, Detokenize, Risk Check,
Audit, Handoff).

> **✅ Verified on n8n Cloud.** Available as a verified community node — installable directly on n8n Cloud (no self-hosting required). Zero runtime dependencies and free of restricted globals/filesystem/network primitives.

---

## Why

LLM-powered workflows leak data. A naive `{{ $json.prompt }}` into ChatGPT sends customer emails, card numbers, and API keys straight to a third party.

Privent sits in the middle: it replaces sensitive values with reversible placeholders (`[EMAIL_001]`, `[CREDIT_CARD_002]`) before the LLM call, then restores them only at sinks you trust.

---

## Architecture: stateless nodes + server-side vault

The nodes hold **no state in the n8n process**. Token state, risk scoring, and audit ingest all live in a **Privent backend** (Privent Cloud or a self-hosted deployment) reached over HTTP through the `priventApi` credential's **Base URL**. Each node call uses n8n's authenticated request helper — there is no local vault, no background timer, and no environment-variable configuration.

Consequences:
- A reachable Privent backend is **required** (the credential is mandatory on the node).
- Correlation context (`sessionId`, `traceId`, `agentName`) travels on the n8n item between nodes — the **Session** resource writes it; downstream resources read it via expression defaults.
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

**n8n Cloud** (verified node): open the **nodes panel**, search **Privent**, and add it directly — no
community-node install step or instance-owner approval needed.

**Self-hosted** — in n8n: **Settings → Community Nodes → Install** → enter `n8n-nodes-privent`.

Manual install (self-hosted):

```bash
cd ~/.n8n
npm install n8n-nodes-privent
```

Restart n8n. The **Privent** node appears in the node panel.

---

## Credential: PriventApi

Create a **PriventApi** credential before using the Privent node.

| Field | Description | Default |
|---|---|---|
| API Key | Privent API key — [request access](https://www.privent.ai/request-access). Encrypted at rest by n8n. | — |
| Base URL | Privent backend endpoint (Cloud or self-hosted) | `https://api.privent.ai` |

The credential injects `Authorization: Bearer <API Key>` on every request. Point **Base URL** at your self-hosted deployment to keep all token/risk/audit traffic on-prem.

---

## Tokenless (Visitor) mode

Use Privent **without an API key**. On the node, set **Authentication = Tokenless (Visitor)**. The node
mints an anonymous, signed visitor id against the backend (`POST /v1/visitor/credentials`) and sends it as
`X-Visitor-Id` — no Bearer key, no account.

| | Tokenless |
|---|---|
| **Available** | Session, Tokenize, Detokenize (in-memory), Risk Check |
| **Not available** | Audit, Handoff, the managed Privent Cloud vault (these need an API key) |

**In-memory vault.** In tokenless mode tokens are stored in n8n **workflow static data**, keyed by
`sessionId` — never in the Privent Cloud vault. Consequences:

- Tokenize and Detokenize must run in the **same workflow** and share the same `sessionId`.
- Raw values rest **inside your own n8n** and are never sent to Privent. (Risk Check / Cloud detection still
  send text to the backend for scoring; Detection Mode = **Local (Regex)** keeps tokenization fully offline.)
- On multi-worker n8n Cloud, sharing relies on n8n persisting static data across workers.

**Backend requirement.** The Privent backend must have visitor auth enabled
(`VISITOR_AUTH_ENABLED=true` + a real signing secret). Otherwise minting — and the credential test —
returns `404`.

### Credential: PriventVisitorApi

| Field | Description | Default |
|---|---|---|
| Base URL | Privent backend base URL (visitor auth must be enabled) | `https://api.privent.ai` |

No API key field — the node attaches the minted `X-Visitor-Id` itself.

### Example — tokenless Tokenize → Detokenize

1. **Privent** node → Authentication **Tokenless**, Resource **Session**, Operation **Open**.
2. **Privent** node → Tokenless, Resource **Tokenize** — same `sessionId`; Detection Mode **Local (Regex)**
   for a fully offline round-trip (or **Auto** to add visitor-ML detection).
3. **Privent** node → Tokenless, Resource **Detokenize** — same `sessionId` — restores the original values
   at a trusted egress point.

---

## `usableAsTool`

Tool-callability in n8n is **node-level** (all-or-nothing) — it cannot be gated per operation. The
Privent node sets **`usableAsTool: true`** so agents can call the safe operations (Tokenize, Risk
Check, Audit). A side effect is that **every** operation — including Detokenize — becomes
agent-reachable.

| Operation | Agent-safe? | Why |
|---|---|---|
| Tokenize | ✅ | Masks PII before egress. |
| Risk Check | ✅ | Read-only scoring. |
| Audit | ✅ | Records an event; no data exposure. |
| Session | ➖ | Lifecycle/setup, not a meaningful agent action. |
| Handoff | ➖ | Trust-graph marker, not a meaningful agent action. |
| Detokenize | ⚠️ | Restores raw PII. **Agent-reachable** — guard it with **Strict Mode + Trusted Sinks** so an agent cannot un-mask data to an untrusted destination. The Detokenize operation description carries this warning in the UI. |

---

## The Privent node — resources & operations

One node, selected by **Resource** then **Operation**:

| Resource | Operation | Purpose |
|---|---|---|
| Session | Open | Opens a session; seeds correlation context. |
| Tokenize | Tokenize | Masks PII/secrets with `[KIND_NNN]` tokens. |
| Detokenize | Detokenize | Restores tokens at a trusted egress point. |
| Risk Check | Score | Scores text for data-leak risk (sessionless). |
| Audit | Emit | Emits an audit event (LLM cost, policy, egress, error). |
| Handoff | Record | Marks an agent → agent / agent → sink handoff. |

### Resource: Session

Opens a Privent session. Place this **first** — downstream nodes consume its `sessionId`/`traceId`/`agentName`.

**Output:** `sessionId` (UUID), `traceId`, `startedAt` (Unix ms), `executionId`, `agentName`.

**Parameters:** **Session ID Mode** (`auto` = new UUID per execution; `manual` = supply your own, **must be a UUID**), **Agent Name** (logical agent id, written to the item and audit `metadata.agent_name`), **Framework** (`n8n`/`manual`), **Webhook Node Name** (optional; extracts client IP / User-Agent from an upstream Webhook trigger).

### Resource: Tokenize

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

### Resource: Detokenize

Replaces tokens with their original values (one batched vault retrieve). Use at trusted egress points **after** the LLM step. **Agent-reachable as a tool** — pair with Strict Mode + Trusted Sinks.

**Parameters:** Session ID, Trace ID, Agent Name, Target Field (`*` deep-walks every string field), Strict Mode, Destination URL, Trusted Sinks, Target Agent Name (Trust Map). In strict mode, detokenization is blocked unless the Destination URL matches a Trusted Sink — the item passes through with `privent: { detokenized: false }` and a `detokenize` audit event with `reason: strict-mode-block` (it does **not** throw).

### Resource: Risk Check

Scores text for data-leak risk via the server ML pipeline. **Sessionless** — no Session required.

**Parameters:** Text Field, Trace ID, Agent Name (optional, for audit correlation). Auto-batches all input items into a single call.

```json
{ "privent": { "risk_score": 0.92, "risk_level": "HIGH", "categories": { "pii": 0.95 }, "model": "...", "latencyMs": 43 } }
```

### Resource: Audit

Emits a Privent audit event for non-tokenization steps (LLM-call cost tracking, policy decisions, egress, errors). Place after an HTTP Request to an LLM provider to record provider/model/token usage; the backend computes USD cost from your org's ModelPricing table.

**Parameters:** Session ID, Trace ID, Agent Name, Event Type (`llm_call`/`policy_decision`/`egress`/`error`), LLM Model (searchable picker, `llm_call` only), Prompt/Completion Tokens (`llm_call` only), Extra Metadata (JSON, merged into the event).

### Resource: Handoff

Marks an explicit agent → agent (or agent → external sink) handoff. The backend Trust Map aggregator turns each event into an AgentInteraction edge.

**Parameters:** Session ID, Trace ID, From Agent Name (the "from" side, from the upstream Session), Target Kind (`agent`/`sink`), Target Agent Name **or** External Sink ID, Reason, Payload Token Count. Requires an upstream Session with an Agent Name set.

---

## Example workflow

```
[Webhook] → [Privent: Session] → [Privent: Tokenize]
         → [OpenAI Chat] → [Privent: Detokenize] → [Respond to Webhook]
```

Each Privent box is the same node with a different **Resource** selected.

1. **Privent · Session** — generates a `sessionId`, seeds correlation context.
2. **Privent · Tokenize** — masks every PII / secret in the prompt.
3. **OpenAI Chat** — sees only tokens, never raw data.
4. **Privent · Detokenize** — restores tokens in the LLM response at a trusted sink.

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

Every operation emits a typed audit event to the Privent backend after a successful run. Context populated by the **Session** resource (`agent_name`, `workflow_id`, `workflow_name`, `execution_id`) rides along on the item and attaches to every downstream event.

| Resource | `event.type` |
|---|---|
| Session | `session_open` |
| Tokenize | `tokenize` |
| Detokenize | `detokenize` |
| Risk Check | `risk_check` |
| Audit | `llm_call` / `policy_decision` / `egress` / `error` |
| Handoff | `agent_handoff` |

The **Detokenize** resource writes `sink_id`, `sink_url_host`, and `sink_trusted` into `metadata` on both the trusted-egress and strict-mode-block paths.

Metadata never contains raw text, tokenized text, or token literals. Audit emission is best-effort — network/transport failures are swallowed and never break workflow execution. The audit wire contract requires UUID `session_id`/`trace_id`, which is why manual Session IDs must be UUIDs.

---

## Error handling

HTTP-origin failures (vault, risk scoring) surface as an n8n **`NodeApiError`**, so the backend HTTP
status and response body are visible in the UI; validation/logic failures surface as
`NodeOperationError`. **Continue On Fail** is honored on every resource, including the batched Risk
Check. Audit emission is the one exception — it is fire-and-forget and never fails the node.

---

## Security properties

- No vault or token state is serialized into n8n execution JSON — it lives server-side.
- Tenancy is isolated by API key at the backend.
- Detokenization at egress is gated by Strict Mode + Trusted Sinks.
- Audit emission is fail-open: backend unreachable never blocks the workflow.

---

## Upgrading from 1.x

**2.0 is a breaking change.** The six standalone nodes (Privent Session, Tokenize, Detokenize, Risk
Check, Audit Event, Handoff) are now a **single Privent node** with a Resource → Operation selector.
Behaviour is unchanged — same fields, defaults, endpoints, outputs and audit events — but the node
identity changed, so existing workflows must be updated:

1. Add the **Privent** node where the old node was.
2. Pick the **Resource** matching the old node (e.g. old *Privent Tokenize* → Resource **Tokenize**),
   then its **Operation**.
3. Re-enter the parameters (the field names and expression defaults are identical).
4. Delete the old node.

---

## Links

- [n8n Setup Guide](https://www.privent.ai/docs/n8n-setup)
- [Request access](https://www.privent.ai/request-access) — required to obtain a production API key

---

## License

MIT © Privent AI

Questions? Contact us at hello@privent.ai.
