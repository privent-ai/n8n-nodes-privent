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
