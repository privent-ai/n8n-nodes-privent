# R-0 — what a client needs from `evaluate`, argued from the one that already works

**Status: PROPOSAL.** Not an item this repository implements. Written for the
cross-repo round, from the surface that already ships a working half of R-0.

**Refs, because a cross-repo claim without a ref is a claim without a subject:**
`privent-backend` `origin/dev` `d606ab9` (`origin/main` `e593476`, 210 commits
behind — every backend line below was read at `origin/dev`, and the divergence is
itself relevant to §5). `privent-n8n` at its `feat/closure-e2e-rig` documents.
`n8n-nodes-privent` at `387bfde`.

---

## 0 · The claim

R-0 is not a design from scratch. **Its client half is in production, on the node
path, and has been since N4-6.** The proposal below is not "here is what a
contract could look like" — it is "here is the one that works, here is what it
cost, and here is precisely what `evaluate` would have to add for the same
reasoning to be possible there."

---

## 1 · What `privent.mlDegraded` carries today, read from the shipped code

`nodes/Privent/operations/tokenize.ts`, in the `catch` around the ML call:

```ts
const status = (err as { httpCode?: string }).httpCode ?? null;
mlDegraded = { status, reason: /* operator-facing text, 402 gets its own */ };
```

It surfaces on two channels:

- **the item** — `privent.mlDegraded = { status, reason }`
- **the audit event** — `ml_degraded: true`, `ml_degraded_status: "402"`

and a healthy run emits **neither field**, so its absence is meaningful rather
than merely quiet.

**What it cost:** 9 decision-logic lines and 2 operator-facing text lines. That is
the entire client half. It is worth stating the number because "add provenance to
the contract" sounds expensive and the client side of it is not.

**What it proves the client can then do:** distinguish *the ML layer did not run*
from *the ML layer ran and scored low* — the exact distinction
`processing_status: DEGRADED` cannot carry, and the exact hole M3 measured.

### 1.1 · The correction that makes this proposal honest

`mlDegraded` is derived from the **transport outcome** — an exception, and
`NodeApiError.httpCode`. It is **not** derived from the backend's own signal.

This package's `CloudScoreResponse` (`shared/privent-http.ts:767-774`) declares
`risk_score`, `risk_level`, `categories`, `model`, `latency_ms`, `entities` — and
**no `failOpen`**. So today the node detects *the call failed*, and is blind to
*the call succeeded and the ML layer did not run*. That second case returns HTTP
200.

That gap is `N4-6b` in this repository's register, held as contract-first. It is
also the strongest argument in this proposal: **the client-side shape is proven,
and the half it is missing is exactly the half a contract has to supply.**

---

## 2 · The backend already solved this on the scoring path — read it before designing it

`privent-backend` `origin/dev:src/risk/dtos/score-response.dto.ts:30,42`:

```ts
model: string;

/**
 * True when the ML layer did not run — timeout, transport failure, an open
 * circuit breaker, or the kill switch — and this response is the fail-open
 * fallback rather than a scoring result.
 *
 * An explicit signal rather than something to infer. Callers used to read
 * `entities === null`, which is a coincidence of the current shape: `null` also
 * means "ML ran and asked for nothing", and any future change to that field
 * would silently turn "detection did not run" into "detection found nothing" —
 * the difference a DLP pipeline exists to keep.
 */
failOpen?: boolean;
```

**`POST /v1/risk/score` already carries the signal R-0 asks for.** The comment
also already states the fifth meta-pattern, in the backend's own words, on the
backend's own field. R-0 on `evaluate` is therefore not a new principle in this
codebase — it is **applying a decision the same team already took, on a second
endpoint.**

### 2.1 · Could `evaluate` carry the same shape? Structurally yes — and it is not enough

`ToolExecEvaluateResponseV1`
(`origin/dev:src/tool-exec/types/tool-exec-evaluate-response.types.ts`) is a
typed JSON body over one request/response, exactly like `ScoreResponse`. Nothing
about the tool-exec path prevents an additive optional field; `detected_not_masked`
was added the same way.

But a `failOpen: boolean` copied across would be **insufficient**, and for a
reason specific to the difference between the two endpoints:

| | `/v1/risk/score` | `/v1/tool-exec/evaluate` |
|---|---|---|
| composes | one ML scoring layer | regex + ML + semantic + ACARS + policy + vault |
| a boolean answers | "did the one layer run?" | nothing — *which* layer? |
| already reports | `failOpen`, `model` | `processing_status`, `stages_applied` |

`stages_applied: ApeStage[]` looks like the answer and is not: it reports the
**transformation** stages that were applied, not which **detectors** contributed.
M3 measured the consequence — the client cannot tell a full run from a partial
one — and the backend's `processing_status` collapses at least four distinct
failures into one `DEGRADED`.

**So: same shape, wrong granularity.** The proposal below is `failOpen`'s
principle at `evaluate`'s composition.

---

## 3 · What a client must be able to decide: block, warn, proceed

A client acting on this response has three actions, and the field shape has to
support all three or the client picks the safest and becomes unusable (§4).

| decision | the client needs to know |
|---|---|
| **block** | detection ran, found risky PII, and left it unmasked |
| **warn** | detection ran **partially** — what was masked is masked, but coverage is unknown |
| **proceed** | detection ran **completely** and either found nothing or masked everything |

Today the client can distinguish none of these reliably. M3's measurement, which
is the case this proposal exists for:

| condition | `transform_map` | N-3 capability probe | N-11 unmasked gate | outcome |
|---|---|---|---|---|
| ML unreachable | empty (0) | **fires** | passes (empty) | caught |
| **ML fail-open, regex working** | **partially full (2 of 4)** | passes (map non-empty) | passes (empty) | **NOT caught — raw phone egresses** |

Both lights stay green while two entities, both phone numbers, leave unmasked.

**A boolean is not enough, and the measurement says why.** `detection_complete:
false` would have caught this row — a real improvement over today — but it cannot
support the **warn** decision, because it collapses "ML skipped, regex fine" and
"semantic skipped, ML fine" into one value. Those two have different residual
risk and therefore different correct actions.

### 3.1 · Proposed shape

Additive, optional, value-free — the same constraints `detected_not_masked`
already meets:

```ts
/** Which detector families contributed to THIS response. */
detectors_applied: Array<'regex' | 'ml' | 'semantic' | 'custom'>;

/** Which were expected to contribute, given org policy and configuration. */
detectors_expected: Array<'regex' | 'ml' | 'semantic' | 'custom'>;

/** Present ONLY when applied ⊊ expected. Machine-readable reason per family. */
detectors_skipped?: Record<string, 'timeout' | 'circuit_open' | 'kill_switch' | 'unauthorized' | 'error'>;
```

The client's rule is then one comparison, not an inference:

- `applied ⊇ expected` → detection complete → **block** on non-empty
  `detected_not_masked`, otherwise **proceed**
- `applied ⊊ expected` → detection partial → **warn**, and the client may escalate
  to block by policy, knowing *why* it is escalating

`detection_complete: boolean` is an acceptable minimum and should be read as the
floor, not the target: it makes the M3 row detectable, and leaves the graded
response of §4 impossible.

---

## 4 · The graded response — the product decision inside R-0

This is the part that must be designed **into** R-0 rather than after it, because
a contract that cannot express it forecloses the only usable gate.

Measured in `privent-n8n`'s round: **every prose body containing a human name
returned non-empty `detected_not_masked` — 5 of 5 on healthy (`OK`) calls.** N-11
fail-closes on non-empty. So a blanket fail-closed gate blocks **every email
containing a person's name**, which in workflow traffic is not an exception, it is
the rule.

The conclusion that round reached, recorded as N-12's input: the gate must be
**kind-aware**. `person` detected-and-unmasked and `credit_card`
detected-and-unmasked are not the same risk, and today's gate cannot tell them
apart.

**What a kind-aware gate needs FROM THE CONTRACT**, and cannot synthesise:

1. **Per-kind provenance.** `detected_not_masked` says a kind was seen and left
   raw. It does not say **which detector family** saw it, and reliability differs
   sharply by family — the backend's own coverage table records `person` as
   PARTIAL or MISSED in EN and consistently MISSED in TR. A client gating on
   `person` needs to know whether the ML family ran at all, or it is gating on
   noise.
2. **A reliability statement the client does not have to hard-code.** If the
   contract does not carry it, every client re-implements a copy of the backend's
   coverage table — five copies of one rule, which is the class
   `privent-sdk/docs/METHOD.md §6` exists to prevent, and which this programme has
   already paid for once in the value-normalisation drift.
3. **Span counts kept as span counts.** `detected_not_masked` already documents
   that its values are SPAN counts, not entity counts (one fragmented address
   produced `street_address: 3`). A kind-aware threshold that treats them as
   entity counts will mis-gate. The contract should say so in the type, not only
   in a comment.

Minimal addition that makes N-12 possible:

```ts
/** Per kind: which family produced the detection, so a client can gate by
 *  reliability rather than by kind name alone. Value-free. */
detected_not_masked_by: Record<string, Array<'regex' | 'ml' | 'semantic' | 'custom'>>;
```

Without it, "kind-aware gating" means "client guesses which kinds are trustworthy",
and the guess will be wrong in exactly the language where it matters most.

---

## 5 · The contract requirement that stops "we did not detect" reading as "there is nothing"

The backend already knows this. `detected_not_masked`'s own comment says it:

> *Empty (`{}`) = nothing we DETECTED was left unmasked. This does NOT mean the
> payload is clean … There is no "clean" signal on this response, because we
> cannot compute one.*

**That paragraph is correct, load-bearing, and unenforceable.** It is a comment.
It does not appear in the wire type, it does not appear in generated clients, and
it did not stop N-11 from being built on the assumption it warns against — which
is the whole of F-09/M3.

So the fifth meta-pattern belongs in the contract as a **requirement**, not an
observation:

> **R-0.5 — No field may be overloaded to mean both "zero" and "absent".**
> For every field a client could read as a safety signal, the response must make
> three states distinguishable **by value, not by inference**:
>
> 1. the check ran and found nothing,
> 2. the check ran partially,
> 3. the check did not run.
>
> A client must never have to reach state (1) by observing that a field is empty.

Two concrete consequences for `evaluate`:

- `detected_not_masked: {}` must never be the only evidence a client has. Paired
  with `detectors_applied`, `{}` becomes readable: *empty AND complete* is state
  (1); *empty AND partial* is state (2) and is the M3 hole.
- **`detection_complete: false` must be present, not inferred from a missing
  field.** An optional field that is absent on failure is the same defect wearing
  a different shape — the client cannot distinguish "false" from "this backend
  version does not send it", and `origin/main` being 210 commits behind
  `origin/dev` is exactly the situation where that ambiguity is live.

### 5.1 · This package already carries the same requirement, at a smaller scale

`n8n-nodes-privent` shipped it in N4-4 and the shape generalises: `tokens_found`
and `tokens_redeemed` are reported as **two numbers**, and success is derived from
the second. The node previously reported the first under the second's name, so an
item whose tokens the vault could not resolve recorded a non-zero redemption and
`detokenized: true` while the text was byte-identical.

**The gap between the two numbers is the signal.** One number could not carry it,
and no comment could have made one number carry it. That is R-0.5 in one field
pair, already in production, and it is the same argument as `failOpen` and the
same argument as `detectors_applied ⊆ detectors_expected`.

---

## 6 · Summary of what is being asked for

| field | why | precedent |
|---|---|---|
| `detectors_applied` + `detectors_expected` | block / warn / proceed cannot be decided without it; a boolean cannot express **warn** | `failOpen` on `/v1/risk/score` |
| `detectors_skipped` (reason per family) | four failures collapse into one `DEGRADED` today | `failOpen`'s comment names the four causes |
| `detected_not_masked_by` | kind-aware gating (N-12) is impossible without per-kind provenance | `detected_not_masked` itself |
| `detection_complete` **present, not optional-absent** | absence and false are indistinguishable across backend versions | `origin/main` is 210 commits behind `origin/dev` |
| R-0.5 as a stated contract rule | the correct paragraph exists as a comment and did not prevent the defect it warns about | `tokens_found` / `tokens_redeemed`, N4-4 |

**The client half of all of this costs about a dozen lines.** That is measured,
not estimated: it is what `mlDegraded` cost, on the one path where the signal
already exists.
