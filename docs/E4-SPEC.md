# E4 — closure rig cell specification

**For:** `privent-n8n`, which owns the rig. **From:** `n8n-nodes-privent`, which owns
the code E4 exercises. **This is a specification, not an implementation.**

`privent-n8n/docs/closure-rig-2026-07.md` defines the five cells and records that
E4's protection is **entirely client-side** and that in `local` mode it never
contacts the backend. That is the whole reason this spec has to come from this
repository: E1–E3 are contained by the interceptor and E5 by the document engine,
so the rig can reason about them from its own side. **E4 is contained by code
that lives here, and in one of its three modes by code that runs nowhere else.**

## Why E4 should be the SECOND cell, not the last

`docs/FINDINGS.md` in this repository now carries a programme-level observation
above the table, and it is the argument for reordering:

> Every serious detection finding this round — NP-Z (printed IBANs missed), NP-L
> (real addresses at `demo.`/`test.`/`sample.` subdomains suppressed), NP-U
> (`aggressive` measurably worse than `standard`) — lands in **local mode**, the
> only path with no backend, no ML and no second opinion.

The rig covers cells in the order that retires the most risk. On today's evidence
E4-local is the highest-risk cell in the closure condition, and it is also the
cheapest to run: **no backend, no ML, no vault, no Postgres.** A cell that is both
the weakest and the cheapest to exercise should not be scheduled last.

### The recommendation, stated plainly because it changes the schedule

> **E4-c is the only part of the closure condition that can be demonstrated in CI
> without solving the image problem first.**

The "in CI" clause has been treated as blocked on one measurement — roughly 24 GB
of images and ~22 minutes of uncached build — and that measurement is real. It is
also **not a property of the clause**. It is a property of the cells that need the
full stack. E4-c needs n8n and this package: no backend, no ML, no semantic
engine, no Qdrant, no Postgres, no Redis, no document engine.

So the clause is not all-or-nothing, and treating it as all-or-nothing has been
costing the programme a cell it could already have.

**Recommended, this week:** stand E4-c up in CI on its own, and state the coverage
ratio in the same breath as the result, every time:

> Closure condition, CI: **1 of 5 cells (E4-c) — `local` mode only, 1 of E4's 3
> sub-cells.** The other four cells and E4's two backend-bound sub-cells are
> demonstrated on Linux with the negative control, NOT in CI.

The ratio is not a caveat bolted on afterwards. It is the sentence that stops a
partial green being read as a finished one — which is this programme's own
recurring failure mode, and the reason `NOT MEASURED` replaced `INERT` in this
package's detector table.

---

## 1 · Choosing the synthetic value — measured, because a naive choice is invisible

NP-L is the cautionary instance: this package's own false-positive filter
suppressed the standard synthetic-fixture domains, so **a fixture chosen to be
*safe* was invisible to the detector, and a test written with one tested
nothing.** A rig canary is a fixture. The same trap applies.

Every row below was measured through this package's own `execute`, at
`n8n-nodes-privent` `cab4aad`, core `0.10.2`:

| candidate value | local `standard` | local `aggressive` | apiKey | tokenless |
|---|---|---|---|---|
| `privent-rig-a1@fixture.invalid` — **the rig's current value** | MASKED | MASKED | MASKED | MASKED |
| `privent-rig-a1@rig.test` | **escapes** | **escapes** | MASKED | MASKED |
| `privent-rig-a1@example.com` | **escapes** | **escapes** | MASKED | MASKED |
| `rig-test-a1@fixture.invalid` | MASKED | MASKED | MASKED | MASKED |
| `// contact privent-rig-a1@fixture.invalid` | **escapes** | **escapes** | MASKED | MASKED |
| `GB29 NWBK 6016 1331 9268 19` (IBAN, printed) | MASKED | MASKED | MASKED | MASKED |
| `93.184.216.34` (public IP) | MASKED | MASKED | MASKED | MASKED |
| `10.0.0.5` (private IP) | **escapes** | **escapes** | MASKED | MASKED |

**The rig's current value is safe.** `privent-rig-a1@fixture.invalid` is detected
in all three modes. Nothing needs to change — but the reason it is safe is not
obvious, so it is written down here rather than left to luck on the next edit.

Four rules follow from the table, and three of them are non-obvious:

1. **The domain must not be an RFC 2606 *documentation* name.** `example.com`,
   `example.net`, `example.org` and the reserved TLDs `.test`, `.example`,
   `.localhost` are suppressed on purpose in local mode. `.invalid` is
   deliberately **not** suppressed — RFC 2606 §2 reserves it for names that are
   obviously non-existent rather than for documentation — which is exactly why
   this package's own fixtures live there. **Keep `.invalid`.**
2. **Never place the canary on a line that opens a comment.** `//`, `/*` and
   `<!--` before the value suppress it in local mode. This is a live rule, not a
   dormant one: before N4-7a the false-positive filter was invoked with an empty
   context and no context-aware rule could fire. It fires now. A canary embedded
   in a JSON body is fine; a canary in a code comment inside a Code node is not.
3. **Do not use a private, loopback, link-local, multicast or documentation IP as
   the canary.** They are suppressed in local mode by decision, not by accident
   (NP-V: they are not personal data, and masking them destroys the text). If the
   rig wants an IP canary it must be publicly routable.
4. **The value must survive the STRICTEST mode, which is local.** Rows 2, 3, 5
   and 8 escape in `local` and are masked in `apiKey`/`tokenless`, because the
   local false-positive filter runs **only on the local path**. A value chosen
   against apiKey behaviour can be invisible in local mode — which is the cell
   with no backend to catch the miss.

**Recommended canary set**, all four measured MASKED in all three modes:

```
EMAIL   privent-rig-a1@fixture.invalid
EMAIL   privent-rig-a2@fixture.invalid      (second value, for the E4-b sub-cell)
IBAN    GB29 NWBK 6016 1331 9268 19         (printed form — NP-Z's regression guard)
IP      93.184.216.34                       (publicly routable)
```

The IBAN is worth carrying even though the email is sufficient for containment:
it is the value that was **missed by every locally-detecting surface** until
core 0.10.2, so it is the rig's cheapest guard against that regression returning.

---

## 2 · Three sub-cells

E4 is one entry point with three authentication modes. They are not variants of
one path — they run different code, contact different endpoints, and emit their
evidence on different channels. Treat them as **E4-a / E4-b / E4-c**, each with
its own pass criterion.

### E4-a · `apiKey` — vault + ML + audit

**Path.** Regex over the item text, then `POST /v1/risk/score` on the ORIGINAL
text, then `POST /v1/vault/find-or-create-batch`, then audit to
`POST /v1/audit/events`. Never `tool-exec/evaluate` — E4 does not pass through the
interceptor's contract at all.

**Proves.** The value is replaced by a `[KIND_NNN]` token before the item leaves
the node; a vault row exists for it; an audit event records the operation with
`node_version`, `core_version`, `detection_mode` and the entity kinds.

**Cannot prove.** That detection ran completely — see §4. Also cannot prove
anything about the **backend's** detectors: `/v1/risk/score` contributes ML spans,
so a green E4-a is a joint statement about this package *and* a backend build,
and the rig must record which backend SHA it ran against or the assertion has no
subject.

**Requires.** Full stack. This is the expensive sub-cell.

### E4-b · `tokenless` — anonymous visitor

**Path.** Visitor resolution, then the same regex pass, then an **in-memory**
vault held in n8n's workflow static data. No audit (an anonymous visitor has no
org); telemetry only, unauthenticated, to `POST /v1/telemetry/events`.

**Proves.** Containment without an API key — the mode a trial user runs. That the
token round-trips through workflow static data rather than a vault row.

**Cannot prove.** Anything about audit, because there is none by design. A rig
assertion of the form "the block was visible to the operator" **must not** look
for an audit event here; see §5.

**Requires.** Backend reachable for visitor + telemetry, no org, no key.

### E4-c · `local` — no network, regex only

**Path.** `buildLocalDetectors()` over the item text, an in-memory vault in
workflow static data, and **zero HTTP**. No risk score, no vault call, no audit,
no telemetry.

**Proves.** That the value never leaves the n8n process in cleartext, on a path
where nothing outside this package could have helped. This is the cell that is
worth the most and costs the least.

**Cannot prove.** Detection completeness in any form. There is no ML, no semantic
pass, no backend, no second opinion — and this package's own register says
**360 of 468 local detectors are `NOT MEASURED`** (NP-X), meaning they have never
been shown to fire on anything. A green E4-c is a statement about the canary
values, and about nothing else.

**Requires.** n8n and the node. No backend, no database, no ML. **This sub-cell
can run on the 4 GB box the rig already sized and rejected**, and it can run in CI
where the full stack cannot — which is the second argument for scheduling E4
early.

---

## 3 · Negative control per sub-cell

A cell without a negative control proves the sink is quiet, not that the rig can
hear. The rig's existing NC-1 pattern — *run the base image with no interceptor
and confirm the sink receives the raw value* — does not transfer to E4, because
**in E4 the protection is not an interceptor that can be removed; it is a node the
workflow explicitly contains.**

### NC-E4-a and NC-E4-b — credentials present, protection bypassed

Same workflow, same value, `Target Field` / `Text Field` pointed at a field the
canary is **not** in. The Privent node runs, succeeds, emits its item, and the
canary flows to the sink untouched.

This is a better control than deleting the node: it proves the rig can see an
escape **while the protection is present and reporting success**, which is the
failure mode that actually happens in production — a misconfigured field name.

Assert on the red: sink received the raw value, AND the node's own output carried
`privent.entities: []`. Both, because the second is what an operator would have
had to notice.

### NC-E4-c — what "protection absent" means with no backend

The interesting one, and it needs stating precisely because the obvious answer is
wrong.

In E1, *protection absent* = the interceptor is not installed. In E4-c there is
nothing to uninstall: if you remove the node, you have removed the workflow step,
not the protection — you are testing an empty pipeline and the sink will of course
receive the raw value. That control passes trivially and proves nothing about
E4-c.

**The honest control is a node that runs and cannot see the value.** Three
configurations, in increasing order of what they prove:

| control | configuration | what a red proves |
|---|---|---|
| **NC-E4-c1** | `Detection Level: standard`, canary is a kind only `aggressive` carries — e.g. a MAC address `00:1B:44:11:3A:B7` | the rig sees an escape caused by a **level** choice, with the node running and reporting success |
| **NC-E4-c2** | canary at a **suppressed** domain — `privent-rig-a1@example.com` | the rig sees an escape caused by the **false-positive filter**, which is NP-L's exact failure mode reproduced deliberately |
| **NC-E4-c3** | canary inside a comment line — `// privent-rig-a1@fixture.invalid` | the rig sees an escape caused by **context suppression**, the rule N4-7a made live |

All three keep the node present, configured, and reporting success. That is the
point: E4-c's realistic failure is not "Privent was missing", it is **"Privent ran
and did not see it"**, and a control that removes the node cannot distinguish
those two.

Recommended: **NC-E4-c2** as the primary control. It is one string, it is
deterministic, and it reproduces a defect this repository actually shipped.

---

## 4 · What E4 can never assert without R-0 — stated up front

R-0 asks the backend to report detection **provenance**: which detectors
contributed, or at minimum `detection_complete: boolean`. Until it exists:

| E4 **can** assert | E4 **cannot** assert |
|---|---|
| this value, at this entry point, in this mode, did not reach the sink | that the reason was detection running **completely** |
| a token replaced it, and the vault holds the mapping (E4-a) | anything about a value the rig did not inject |
| the operator could see the block, on the channel that mode uses (§5) | that `standard` would have caught what `aggressive` catches, or the reverse |
| `core_version` and `node_version` of the artifact that ran | that the 360 `NOT MEASURED` detectors do anything at all |

**One thing E4 has that E1 does not, and the rig should use it.** N4-6 made the
node report ML degradation on the item and in the audit event: `privent.mlDegraded
= { status, reason }` and `ml_degraded` / `ml_degraded_status` in metadata. In
`auto` detection mode a backend 402 or timeout no longer degrades silently. That
is **partial R-0, already shipped, on E4's own path** — for E4-a and E4-b the rig
CAN distinguish "ML ran" from "ML was skipped", which is precisely the distinction
`processing_status: DEGRADED` cannot carry. It does not close R-0; it means E4's
gap is narrower than E1's, and the rig should assert `mlDegraded` is absent on a
positive run rather than treating its absence as unknowable.

**E4-c has no equivalent and cannot have one.** There is no second opinion to
report on. For E4-c the honest framing is: *this value was contained by regex
detection alone, and nothing in this cell speaks to any other value.*

---

## 5 · Operator visibility differs by mode — do not assert it uniformly

The closure condition requires that **every block is visible to the operator.**
E4 satisfies that on three different channels, and a rig that looks for an audit
event in all three modes will fail E4-b and E4-c for a reason that is not a
defect. This package's register states it as a finding (NP-R): version visibility
— and by the same structure, block visibility — is **per-channel, not global**.

| mode | audit event | telemetry | item output |
|---|---|---|---|
| `apiKey` | ✅ `POST /v1/audit/events` | ✗ suppressed by design (no double-report) | ✅ `privent.entities`, `privent.nodeVersion` |
| `tokenless` | ✗ none (no org) | ✅ `POST /v1/telemetry/events` | ✅ same |
| `local` | ✗ none | ✗ none (zero network is the promise) | ✅ **the only channel** |

For E4-c the item **is** the operator-visible record. Assert on
`privent.entities`, on the masked text, and — where the run infers rather than
reads its mode — on `privent.authWarning`, which names that authentication was
never set explicitly and the run is regex-only.

---

## 6 · Handover notes

- **Read-only.** This spec was written without touching `privent-n8n`. Its
  vocabulary — cells, negative control, `R-0`, `G-1` — is taken from
  `privent-n8n/docs/closure-rig-2026-07.md`.
- **Subject of the measurements.** `n8n-nodes-privent` at `cab4aad`, core
  `0.10.2`, n8n `2.28.7` (`n8nio/n8n@sha256:74f1ef0e…54a4`, the digest the rig
  already pins). Re-measure §1's table if any of the three moves — the table is a
  statement about a build, not about a product.
- **The artifact now identifies its own core** (NP-O): `dist` carries
  `CORE_VERSION` as a literal, and a running node reports `core_version` in the
  audit event. The rig can record what it ran against without inferring it from a
  lockfile.
- **What would make E4-c cheaper still.** It needs no backend, so it does not
  need the 16 GB box. If the rig wants a cell that runs in CI today, this is it —
  and CI coverage for E4-c would be the first time any part of the closure
  condition ran on every commit.
