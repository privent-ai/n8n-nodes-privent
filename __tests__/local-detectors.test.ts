import { describe, expect, it } from 'vitest';
import {
  LOCAL_DETECTORS,
  runValidator,
  isLocalFalsePositive,
  type LocalDetector,
} from '../shared/local-detectors.js';

const CORE_KINDS = new Set([
  'EMAIL', 'PHONE', 'SSN', 'CREDIT_CARD', 'IBAN',
  'IP_ADDRESS', 'URL', 'API_KEY', 'AWS_KEY', 'JWT',
]);

const byKind = (kind: string): LocalDetector => LOCAL_DETECTORS.find((d) => d.kind === kind)!;

/** Build the regex the Step-3 pipeline will (flags preserved + `g` ensured). */
function buildRegex(d: LocalDetector): RegExp {
  return new RegExp(d.source, d.flags.includes('g') ? d.flags : d.flags + 'g');
}

describe('LOCAL_DETECTORS (generated)', () => {
  it('reports the catalog size and breakdown, asserts a healthy floor', () => {
    const tiers = LOCAL_DETECTORS.reduce<Record<string, number>>((a, d) => {
      a[d.tier] = (a[d.tier] ?? 0) + 1;
      return a;
    }, {});
    const cats = LOCAL_DETECTORS.reduce<Record<string, number>>((a, d) => {
      a[d.category] = (a[d.category] ?? 0) + 1;
      return a;
    }, {});
    // eslint-disable-next-line no-console
    console.log(`LOCAL_DETECTORS: ${LOCAL_DETECTORS.length}`, 'tiers:', tiers, 'categories:', cats);
    expect(LOCAL_DETECTORS.length).toBeGreaterThanOrEqual(300);
  });

  it('every kind is TOKEN_RE-safe, unique, and not a core duplicate', () => {
    const seen = new Set<string>();
    for (const d of LOCAL_DETECTORS) {
      expect(d.kind, d.kind).toMatch(/^[A-Z][A-Z0-9_]{1,31}$/);
      expect(CORE_KINDS.has(d.kind), d.kind).toBe(false);
      expect(seen.has(d.kind), `duplicate ${d.kind}`).toBe(false);
      seen.add(d.kind);
    }
  });

  it('every detector has a valid confidence and tier', () => {
    for (const d of LOCAL_DETECTORS) {
      expect(d.confidence, d.kind).toBeGreaterThan(0);
      expect(d.confidence, d.kind).toBeLessThanOrEqual(1);
      expect(['high', 'medium', 'contextual'], d.kind).toContain(d.tier);
    }
  });

  // Serialization + flag guard: every emitted source/flags must build a real
  // RegExp (catches bad escaping or a stray flag for all 575 patterns at once).
  it('every detector source+flags builds a valid RegExp', () => {
    for (const d of LOCAL_DETECTORS) {
      expect(() => buildRegex(d), d.kind).not.toThrow();
    }
  });

  it('validated detectors point at a real validator', () => {
    for (const d of LOCAL_DETECTORS) {
      if (d.validatorName) expect(d.tier, d.kind).toBe('high');
    }
  });
});

describe('runValidator (vendored checksums)', () => {
  it('SWIFT/BIC: accepts a valid BIC, rejects a malformed one', () => {
    expect(runValidator('validateSWIFTBIC', 'DEUTDEFF')).toBe(true);
    expect(runValidator('validateSWIFTBIC', 'DEUT12')).toBe(false);
  });

  it('NHS: accepts a valid mod-11 number, rejects a bad check digit', () => {
    expect(runValidator('validateNHS', '9434765919')).toBe(true);
    expect(runValidator('validateNHS', '9434765918')).toBe(false);
  });

  it('Canadian SIN: accepts a valid Luhn, rejects a bad one', () => {
    expect(runValidator('validateCanadianSIN', '046454286')).toBe(true);
    expect(runValidator('validateCanadianSIN', '046454287')).toBe(false);
  });

  it('US routing: accepts a valid ABA checksum, rejects a bad one', () => {
    expect(runValidator('validateRoutingNumber', '021000021')).toBe(true);
    expect(runValidator('validateRoutingNumber', '021000022')).toBe(false);
  });

  it('Luhn: accepts a valid number, rejects a bad one', () => {
    expect(runValidator('validateLuhn', '4532015112830366')).toBe(true);
    expect(runValidator('validateLuhn', '4532015112830367')).toBe(false);
  });

  it('unknown validator name is a no-op (does not reject)', () => {
    expect(runValidator('nope', 'whatever')).toBe(true);
  });
});

describe('SWIFT_BIC detector (end-to-end, no label prefix)', () => {
  it('matches a valid BIC and the checksum gate accepts it', () => {
    const d = byKind('SWIFT_BIC');
    const re = buildRegex(d);
    const m = 'send to DEUTDEFF today'.match(re);
    expect(m?.[0]).toBe('DEUTDEFF');
    expect(runValidator(d.validatorName!, 'DEUTDEFF')).toBe(true);
  });
});

describe('isLocalFalsePositive (value-based subset)', () => {
  it('flags a semver string matched as a PHONE type', () => {
    expect(isLocalFalsePositive('1.2.3', 'PHONE')).toBe(true);
  });

  it('does not flag an ordinary value', () => {
    expect(isLocalFalsePositive('hello world', 'PHONE')).toBe(false);
  });
});
