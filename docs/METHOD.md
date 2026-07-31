# Method

Rules extracted from defects this repository's items actually hit. Each carries
the instance it came from — a rule without an instance is a preference.

Companion to [FINDINGS.md](FINDINGS.md). `privent-sdk/docs/METHOD.md` and
`privent-backend/docs/METHOD.md` hold the same kind of register for those
repositories. This file starts here because the rule below was learned here.

---

## 1. A measurement that feeds its own input must be shown to converge, and one run cannot show it

A measurement whose output changes its next input is not a measurement until it
has a fixed point. Running it once produces a number. Running it twice tells you
whether that number means anything.

**Instance — NP-W, two defects in one instrument, both found by a second run.**

The instrument decides which detectors may enter the `aggressive` detection
level: a detector is admitted on zero false positives across a negative corpus
plus at least one positive hit. It writes an admission list, which a generator
consumes to set each detector's tier, which the next measurement reads.

*(a) The corpus contained the instrument.* Corpus A was "this repository's prose
and source", which included `scripts/` — where the measurement's own code lives.
Editing the measurement changed the corpus, which changed the admission list. The
measurement was measuring itself.

*(b) The candidate pool was a function of the last generation.* Candidates were
`tier === 'contextual'`. Once the generator promoted a detector to
`aggressive-only`, the next run stopped considering it, so it fell out of the
admission list, so the run after that demoted it again. The list oscillated
between two states, and either state looked like a settled answer if you stopped
after one run.

Defect (b) produced a real, reported number: an interim report said "5 admitted,
then 2 admitted, so adding a positive case rejected five detectors". It had not.
The five had been promoted out of the candidate pool. The corpus explanation was
plausible, and it was wrong, and only running the cycle twice distinguished them.

**Rule.** When a measurement's output can reach its own input — a generated file
it later reads, a corpus that includes its own source, a cache it warms — run the
full cycle at least twice and show that the result is unchanged. Report the
convergence, not just the number. If it does not converge, the instrument is
broken and the number is an artifact of when you stopped.

**Corollary.** Exclude the instrument from its own corpus, and make candidacy a
property of the input rather than of the previous output.

---

## 2. The instrument's scope is part of its result

A corpus is an instrument. A verdict measured on it carries the corpus's blind
spots, and reporting the verdict without the scope reports a smaller fact than
the one you have.

**Instance — `ADDRESS_STREET`, NP-U.** The detector was rejected from
`aggressive` on exactly one false positive: it matched the phrase
`0 bakes its own literal in place`, a sentence from a comment in this package's
own source. Corpus A is 3,082 lines of engineering prose written *about
detection* — for a street-address pattern, that is not merely a narrow corpus, it
is adversarial in a way customer text is not.

Re-measured against corpus B (business-shaped prose) with positive street-address
cases added, it scored zero false positives and two positive hits and was
admitted. The **threshold did not move**. Loosening an admission rule to readmit
a detector you want back is how the rule stops meaning anything.

**Rule.** Declare corpus scope per subject, publish it alongside the verdict with
its reason, and change scope only where the corpus is demonstrably unrepresentative
of the subject — never the threshold. A narrowed scope removes an argument for
rejection; it never removes the requirement to pass.

---

## 3. Grow the corpus with the work, and never let a missing measurement read as a passing one

A measurement register has three states, not two, and the third one is the
dangerous one: *not measured*. Naming it after its symptom — "inert", "no hits",
"quiet" — turns an absence of evidence into an appearance of evidence.

**Instance — NP-X.** 361 of 468 detectors produced zero false positives and zero
positive hits. The table called them `INERT`, which reads as *vetted* to anyone
scanning it, and the admission rule that would have accepted them on zero-FP
alone would have been admitting them for looking harmless. They are now
`NOT MEASURED (no positive case exists for this kind)`.

Dropping them from the package was considered and rejected: it is cheap and
**one-way**, because a detector that is not shipped can never be measured into a
tier. The cheap exit foreclosed the only exit that resolves the question.

**Rule.** Label the unmeasured as unmeasured, in the generated artifact, where
the reader looks. And grow the corpus incrementally: every item that touches a
detector adds positive cases for the kinds it touches. A standing rule beats a
heroic pass, because the heroic pass never happens and the standing rule
compounds.

**Instance — NP-V, one item after this rule was written.** Writing the
non-routable-IP tests surfaced `DEA_NUMBER` masking `at 172.16.4.1` and
`at 51.15.20.7` under `aggressive`. It had been admitted honestly: zero false
positives, one positive hit — because **no corpus line had ever shown it that
shape**. Adding the infrastructure lines to the negative corpus and a public-IP
case to the positive corpus rejected it, 8 admitted → 7. The rule paid for itself
on its first use, which is the argument for standing rules over heroic passes.

**Instance — the same item, sharper.** The positive case proving `IPV4` alive was
`203.0.113.42`, and the same item added TEST-NET-3 to the suppression list. **A
positive corpus that proves a detector live using a value the product
deliberately ignores proves nothing** — it certifies a detector against input the
product will never let it see. The case moved to two routable addresses.

**Corollary.** When a change alters what the product ignores, re-read the
positive corpus for cases that the change just made meaningless. The corpus and
the suppression list are two halves of one statement, and they can contradict
each other silently.

---

## 4. The instrument must not live inside the corpus

One sentence, trivially obvious in hindsight, and it happened three times in one
day in three different measurements. That is why it is written down.

**Instances.**

- **NP-W (a).** Corpus A was "this repository's prose and source" and the walk
  included `scripts/` — where the measurement's own code lives. Editing the
  measurement changed the corpus, which changed the admission list.
- **NP-Z, the reconciliation.** The comparison script sat in the repository root
  as a `.mjs` file, inside the corpus it was walking. It reported **12 surviving
  false positives on corpus A. All twelve were itself** — the IBAN examples in
  its own source. The corrected number was zero.
- **NP-W (b), the same shape one level up.** The candidate pool was read from the
  previous generation's output, so the instrument's own result fed its next
  input. It oscillated between two states.

**Rule.** Before reporting a corpus measurement, name what is in the corpus and
confirm the instrument is not. Probe scripts go outside the walked tree or the
walk excludes them explicitly; a snapshot beats a live walk because it makes the
corpus a reviewable artifact rather than whatever the directory held that minute.

**Tell.** A finding whose examples look like your own test data probably is your
own test data. Print the matches, not just the count — the count cannot tell you
whose text it found.

---

## 5. A negative control that removes the mechanism tests an empty pipeline

A control proves the rig can hear. If the way you make protection "absent" is to
delete the thing that protects, the run passes for free and proves only that a
pipeline with no protection has no protection. The honest control is **the
product running, reporting success, and failing to see the value.**

**Instance — E4-c, local mode.** In `local` mode this package IS the protection:
no interceptor to uninstall, no backend to switch off. Removing the Privent node
from the workflow leaves a workflow with one fewer step, and of course the canary
reaches the sink. Nothing is learned. The controls that do teach something keep
the node in place and configured: a canary of a kind only `aggressive` carries, a
canary at a suppressed domain, a canary inside a comment line. All three end with
the node reporting success while the value walks past it — which is also the
failure mode that actually happens in production, where nobody uninstalls
anything and a field name is simply wrong.

**Same correction, reached twice, independently.** `privent-n8n` redesigned NC-1
for the interceptor cell in the same round and arrived at the same place from a
different mode. Two sessions, two mechanisms, one conclusion: **absence of the
mechanism is the weakest control available, and it is the one that suggests
itself first.**

**Rule.** Write the negative control as a *misconfiguration*, not a *deletion*.
If the only way you can make the control red is to remove the product, the
control is not measuring the product.

---

## 6. A marker shared by the alternatives cannot select between them

An identification is a statement about what is **excluded**. A feature present in
every candidate excludes nothing, and reading it as an identification produces a
confident answer with no evidence behind it.

**Instance — NP-AB.** The published `n8n-nodes-privent@2.4.0` bundle was read for
`@priventai/core` version markers, and the markers cited were the uppercase-only
`TOKEN_RE` and the compact-only IBAN regex. **Both are present in 0.8.0 and in
0.9.0.** What the read established was *"not 0.10.x"*. What was reported, and
then acted on, was *"is 0.9.0"* — and a directive was issued from it.

**The contrast is the teaching.** The measurement that settled it did the same
job correctly: `diff` the two candidate artifacts, find that they differ in
**exactly three places**, and check all three. The published bundle carried
0.8.0's shape at each — the `typeof v === "string"` guard 0.9.0 dropped was
present, 0.9.0's baked version literal was absent, and core's custom-pattern
code was absent. That fingerprint could name what it ruled out. The first one
could not.

**Rule.** Before using a feature to identify a version, a build, or a code path,
check whether the alternatives also have it. State the identification as what it
excludes: *"this is 0.8.0 and not 0.9.0, because 0.9.0 dropped the guard that is
present here."*

**Corollary.** A fingerprint that cannot name what it rules out is a
**resemblance**. Resemblance is a reason to measure, never a result.

**Third check, when the artifact allows it.** The strongest answer here was
neither fingerprint: `git checkout v2.4.0 && npm ci && npm run build` produced a
bundle byte-identical to the published one. Manifest, lockfile and markers can
argue; a byte-identical rebuild ends the argument. Reach for it first when the
artifact is reproducible.

---

## 7. A gate's refusal can carry the design

A gate that rejects a design is usually read as an obstacle to route around. It
is also a statement of the constraint set, and the remaining option is sometimes
written inside the refusal.

**Instance — NP-AA.** `zod` was required at runtime and declared nowhere. Two
designs were derived from principle and written before either was run:
`peerDependencies` (matching how `n8n-workflow` is declared, avoiding a second
copy of something the host provides) and `dependencies` (always resolvable). The
package's own gate rejected both — *"only `n8n-workflow` and `@n8n/ai-node-sdk`
are permitted"*, then *"the `dependencies` field must be empty or absent in
community node packages"*. The second refusal ends: **"or bundle them into your
build artifact."** That was the answer, in the error message, before either
design was written.

**Rule.** When a gate refuses, read the refusal for its remainder before
designing around it. The constraint set it enforces is usually narrower than the
one being reasoned from, and the option it leaves is the one that survives
review.

