// Dev-only codegen. Regenerates `shared/local-detectors.ts` from openredaction's
// MIT pattern catalog (devDependency only — NEVER a runtime dep, NEVER bundled).
// The emitted file is fully self-contained: it imports NOTHING from openredaction.
//
//   npm run gen:detectors
//
// See /NOTICE for attribution. Plan: Step 2 (REVISED).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const orx = require('openredaction');

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'shared', 'local-detectors.ts');

// ── @priventai/core's built-in kinds — never duplicate these ──
const CORE_KINDS = new Set([
  'EMAIL', 'PHONE', 'SSN', 'CREDIT_CARD', 'IBAN',
  'IP_ADDRESS', 'URL', 'API_KEY', 'AWS_KEY', 'JWT',
]);

// ── Category map via getPatternsByCategory (PIIPattern has no `category` field).
// Primary-first so synonyms collapse to a stable label; first claim wins. ──
const CATEGORY_KEYS = [
  'personal', 'financial', 'government', 'contact', 'network', 'healthcare',
  'legal', 'education', 'hr', 'technology', 'insurance', 'retail', 'telecoms',
  'manufacturing', 'transportation', 'media', 'charitable', 'procurement',
  'emergency', 'aviation', 'maritime', 'automotive', 'logistics', 'gaming',
  'hospitality', 'gig-economy', 'real-estate', 'environmental', 'international',
  'digital-identity', 'professional-certifications', 'utilities', 'vehicles',
  'certifications', 'compliance', 'crypto', 'social-media',
];
const categoryOf = new Map();
for (const key of CATEGORY_KEYS) {
  let arr;
  try { arr = orx.getPatternsByCategory(key); } catch { continue; }
  if (!Array.isArray(arr)) continue;
  for (const p of arr) if (!categoryOf.has(p)) categoryOf.set(p, key);
}

// ── Validator mapping: reference-equality first (dist is NOT a guaranteed-stable
// build — never rely on .toString()), then a static type-table fallback. ──
const VALIDATOR_NAMES = [
  'validateLuhn', 'validateIBAN', 'validateNINO', 'validateNHS', 'validateUKPassport',
  'validateSSN', 'validateSortCode', 'validateRoutingNumber', 'validateSWIFTBIC',
  'validateCanadianSIN', 'validateAustralianTFN',
];
const fnToName = new Map();
for (const name of VALIDATOR_NAMES) if (typeof orx[name] === 'function') fnToName.set(orx[name], name);

// Match on underscore-delimited SEGMENTS (not substrings) + country qualification,
// so e.g. WISCONSIN/ISIN/NURSING don't get SIN's Luhn, and only UK passports get
// validateUKPassport. Conservative: assign only where we're confident.
function staticValidator(type) {
  const seg = new Set(type.toUpperCase().split('_'));
  const has = (...xs) => xs.every((x) => seg.has(x));
  const any = (...xs) => xs.some((x) => seg.has(x));
  if (seg.has('NHS')) return 'validateNHS';
  if (seg.has('NINO') || has('NATIONAL', 'INSURANCE')) return 'validateNINO';
  if (any('SWIFT', 'BIC')) return 'validateSWIFTBIC';
  if (seg.has('ROUTING') && any('US', 'ABA')) return 'validateRoutingNumber';
  if (has('SORT', 'CODE')) return 'validateSortCode';
  if (seg.has('SIN') && any('CA', 'CANADIAN')) return 'validateCanadianSIN';
  if (seg.has('TFN')) return 'validateAustralianTFN';
  if (seg.has('PASSPORT') && any('UK', 'GB')) return 'validateUKPassport';
  return undefined;
}

// ── kind: p.type → TOKEN_RE-safe (^[A-Z][A-Z0-9_]{1,31}$), collisions deduped ──
function sanitizeKind(type) {
  let k = String(type).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!/^[A-Z]/.test(k)) k = 'X_' + k;          // must start with a letter
  k = k.slice(0, 32);
  k = k.replace(/_+$/g, '');
  if (k.length < 2) k = (k + '_X').slice(0, 32);
  return k;
}

function confidenceOf(p) {
  const base = { critical: 0.95, high: 0.85, medium: 0.6, low: 0.4 }[p.severity ?? 'medium'] ?? 0.6;
  // tiny deterministic nudge by priority so equal-severity detectors order stably
  const nudge = Math.min(Math.max(p.priority ?? 0, 0), 100) / 10000;
  return Math.round(Math.min(base + nudge, 0.99) * 1000) / 1000;
}

const CONTEXTUAL_TYPE = /NAME|ADDRESS|DOB|BIRTH|POSTCODE|ZIP|EMERGENCY_CONTACT|NEXT_OF_KIN/;
function tierOf(p, validatorName) {
  if (validatorName) return 'high';
  if (CONTEXTUAL_TYPE.test(String(p.type).toUpperCase())) return 'contextual';
  if (typeof p.validator === 'function') return 'contextual'; // had a context validator we couldn't port
  return 'medium';
}

// ── Build detector records ──
const seenKinds = new Map();
const detectors = [];
let skippedUnsafe = 0, skippedCore = 0;

for (const p of orx.allPatterns) {
  if (orx.isUnsafePattern(p.regex.source)) { skippedUnsafe++; continue; }
  let kind = sanitizeKind(p.type);
  if (CORE_KINDS.has(kind)) { skippedCore++; continue; }
  // dedup collisions
  if (seenKinds.has(kind)) {
    const n = seenKinds.get(kind) + 1;
    seenKinds.set(kind, n);
    const suffix = '_' + n;
    kind = (kind.slice(0, 32 - suffix.length)) + suffix;
  } else {
    seenKinds.set(kind, 1);
  }
  const validatorName = (p.validator && fnToName.get(p.validator)) || staticValidator(p.type);
  detectors.push({
    kind,
    source: p.regex.source,
    flags: p.regex.flags,
    confidence: confidenceOf(p),
    category: categoryOf.get(p) ?? 'other',
    tier: tierOf(p, validatorName),
    ...(validatorName ? { validatorName } : {}),
  });
}

detectors.sort((a, b) => a.kind.localeCompare(b.kind));

// ── FP rules: serialize the self-contained matchers (called context-free in the
// emitted helper). patternType + matcher source only. ──
const fpRules = orx.commonFalsePositives.map((r) => ({
  patternType: Array.isArray(r.patternType) ? r.patternType : [r.patternType],
  matcher: r.matcher.toString(),
}));

// ── Emit ──
const VALIDATORS_BLOCK = `// ── Vendored standalone validators (ported from openredaction validators/index.ts, MIT — see /NOTICE).
// Pure math / format checks; context-free. ──

function luhnDigits(digits: string): boolean {
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i]!, 10);
    if (Number.isNaN(d)) return false;
    if (isEven) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function mod97(s: string): number {
  let remainder = 0;
  for (let i = 0; i < s.length; i++) remainder = (remainder * 10 + parseInt(s[i]!, 10)) % 97;
  return remainder;
}

const VALIDATORS: Record<string, (raw: string) => boolean> = {
  validateLuhn(raw) {
    const c = raw.replace(/[\\s-]/g, '');
    return /^\\d{13,19}$/.test(c) && luhnDigits(c);
  },
  validateIBAN(raw) {
    const c = raw.replace(/[\\s\\u00A0.-]/g, '').toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(c)) return false;
    const lengths: Record<string, number> = {
      AD:24,AE:23,AL:28,AT:20,AZ:28,BA:20,BE:16,BG:22,BH:22,BR:29,CH:21,CR:21,CY:28,CZ:24,DE:22,DK:18,
      DO:28,EE:20,ES:24,FI:18,FO:18,FR:27,GB:22,GE:22,GI:23,GL:18,GR:27,GT:28,HR:21,HU:28,IE:22,IL:23,
      IS:26,IT:27,JO:30,KW:30,KZ:20,LB:28,LI:21,LT:20,LU:20,LV:21,MC:27,MD:24,ME:22,MK:19,MR:27,MT:31,
      MU:30,NL:18,NO:15,PK:24,PL:28,PS:29,PT:25,QA:29,RO:24,RS:22,SA:24,SE:24,SI:19,SK:24,SM:27,TN:24,
      TR:26,UA:29,VA:22,VG:24,XK:20,
    };
    const len = lengths[c.substring(0, 2)];
    if (!len || c.length !== len) return false;
    const rearranged = c.substring(4) + c.substring(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, (ch) => (ch.charCodeAt(0) - 55).toString());
    return mod97(numeric) === 1;
  },
  validateNINO(raw) {
    const c = raw.replace(/[\\s\\u00A0.-]/g, '').toUpperCase();
    if (!/^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]$/.test(c)) return false;
    return !['BG','GB','NK','KN','TN','NT','ZZ'].includes(c.substring(0, 2));
  },
  validateNHS(raw) {
    const c = raw.replace(/[\\s\\u00A0.-]/g, '');
    if (!/^\\d{10}$/.test(c)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(c[i]!, 10) * (10 - i);
    const check = 11 - (sum % 11);
    const expected = check === 11 ? 0 : check;
    return expected === parseInt(c[9]!, 10) && check !== 10;
  },
  validateUKPassport(raw) {
    const c = raw.replace(/[\\s\\u00A0.-]/g, '').toUpperCase();
    return /^\\d{9}$/.test(c);
  },
  validateSSN(raw) {
    const c = raw.replace(/[\\s\\u00A0.-]/g, '');
    if (!/^\\d{9}$/.test(c)) return false;
    const area = c.substring(0, 3), group = c.substring(3, 5), serial = c.substring(5, 9);
    if (area === '000' || area === '666' || parseInt(area, 10) >= 900) return false;
    if (group === '00' || serial === '0000') return false;
    return !['111111111','222222222','333333333','444444444','555555555','666666666','777777777','888888888','999999999'].includes(c);
  },
  validateSortCode(raw) {
    return /^\\d{6}$/.test(raw.replace(/[\\s-]/g, ''));
  },
  validateRoutingNumber(raw) {
    const c = raw.replace(/[\\s\\u00A0.-]/g, '');
    if (!/^\\d{9}$/.test(c)) return false;
    const d = c.split('').map(Number);
    return (3 * (d[0]! + d[3]! + d[6]!) + 7 * (d[1]! + d[4]! + d[7]!) + (d[2]! + d[5]! + d[8]!)) % 10 === 0;
  },
  validateSWIFTBIC(raw) {
    const c = raw.replace(/\\s/g, '').toUpperCase();
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(c);
  },
  validateCanadianSIN(raw) {
    const c = raw.replace(/[\\s-]/g, '');
    if (!/^\\d{9}$/.test(c) || c === '000000000') return false;
    return luhnDigits(c);
  },
  validateAustralianTFN(raw) {
    const c = raw.replace(/\\s/g, '');
    if (!/^\\d{8}$/.test(c) && !/^\\d{9}$/.test(c)) return false;
    const weights = c.length === 8 ? [1,4,3,7,5,8,6,9] : [1,4,3,7,5,8,6,9,10];
    let sum = 0;
    for (let i = 0; i < c.length; i++) sum += parseInt(c[i]!, 10) * weights[i]!;
    return sum % 11 === 0;
  },
};

/** Run a named checksum/format validator against a raw match (no surrounding context). */
export function runValidator(name: string, raw: string): boolean {
  const fn = VALIDATORS[name];
  return fn ? fn(raw) : true;
}`;

const fpLiteral = fpRules
  .map((r) => `  { patternType: ${JSON.stringify(r.patternType)}, matcher: ${r.matcher} },`)
  .join('\n');

const detectorLiteral = detectors
  .map((d) => {
    const parts = [
      `kind: ${JSON.stringify(d.kind)}`,
      `source: ${JSON.stringify(d.source)}`,
      `flags: ${JSON.stringify(d.flags)}`,
      `confidence: ${d.confidence}`,
      `category: ${JSON.stringify(d.category)}`,
      `tier: ${JSON.stringify(d.tier)}`,
    ];
    if (d.validatorName) parts.push(`validatorName: ${JSON.stringify(d.validatorName)}`);
    return `  { ${parts.join(', ')} },`;
  })
  .join('\n');

const tierCounts = detectors.reduce((a, d) => ((a[d.tier] = (a[d.tier] ?? 0) + 1), a), {});

const header = `/**
 * GENERATED FILE — do not edit by hand. Run \`npm run gen:detectors\`.
 *
 * Local (no-backend) PII/secret detectors, generated from openredaction's MIT
 * pattern catalog (\`allPatterns\` / \`validators\` / \`commonFalsePositives\`,
 * github.com/sam247/openredaction — see /NOTICE). openredaction is a
 * devDependency of the codegen ONLY; this file imports nothing from it and is
 * never bundled with it.
 *
 * Coverage: ${detectors.length} detectors (high ${tierCounts.high ?? 0} / medium ${tierCounts.medium ?? 0} / contextual ${tierCounts.contextual ?? 0}).
 * Skipped: ${skippedUnsafe} ReDoS-unsafe, ${skippedCore} @priventai/core overlaps.
 *
 * Each \`kind\` is TOKEN_RE-safe (\`^[A-Z][A-Z0-9_]{1,31}$\`) so Step-3 \`[KIND_NNN]\`
 * tokens round-trip. \`flags\` are preserved verbatim (Step 3's detectMatches keeps
 * them and ensures \`g\`). \`tier:'contextual'\` detectors are FP-prone without
 * surrounding context — Step 3 defaults them OFF.
 */

export interface LocalDetector {
  /** Entity kind — TOKEN_RE-safe, unique. */
  kind: string;
  /** Regex source string (build with \`new RegExp(source, flags)\`). */
  source: string;
  /** Original regex flags (preserved; Step 3 ensures \`g\`). */
  flags: string;
  /** Detection confidence 0..1 (from severity, priority-nudged). */
  confidence: number;
  /** Best-effort category label (\`'other'\` when not resolvable). */
  category: string;
  /** Precision tier — \`contextual\` is default-OFF in Step 3. */
  tier: 'high' | 'medium' | 'contextual';
  /** Name of a checksum/format validator in \`runValidator\`, when applicable. */
  validatorName?: string;
}
`;

const fpBlock = `
interface LocalFalsePositiveRule {
  patternType: string[];
  // Matchers are vendored verbatim from openredaction; \`any\` params let the
  // emitted closures keep their original (looser) bodies under our strict config.
  matcher: (value: any, context: any) => boolean;
}

// Value-based subset of openredaction's commonFalsePositives (MIT). Invoked with
// no context, so context-only branches no-op and only value-based checks fire.
const FALSE_POSITIVE_RULES: LocalFalsePositiveRule[] = [
${fpLiteral}
];

/** True if \`value\` (matched as \`type\`) is a known value-based false positive. */
export function isLocalFalsePositive(value: string, type: string): boolean {
  for (const r of FALSE_POSITIVE_RULES) {
    if (!r.patternType.includes(type)) continue;
    try { if (r.matcher(value, '')) return true; } catch { /* ignore */ }
  }
  return false;
}
`;

const out = `${header}
export const LOCAL_DETECTORS: LocalDetector[] = [
${detectorLiteral}
];

${VALIDATORS_BLOCK}
${fpBlock}`;

writeFileSync(OUT, out);
console.log(`✓ wrote ${OUT}`);
console.log(`  detectors: ${detectors.length}  (high ${tierCounts.high ?? 0} / medium ${tierCounts.medium ?? 0} / contextual ${tierCounts.contextual ?? 0})`);
console.log(`  skipped: ${skippedUnsafe} unsafe, ${skippedCore} core-overlap`);
const byCat = detectors.reduce((a, d) => ((a[d.category] = (a[d.category] ?? 0) + 1), a), {});
console.log('  categories:', Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
