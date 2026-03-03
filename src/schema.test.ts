import { describe, expect, it } from 'vitest';
import { InvestmentFinancingSchema } from './schema';
import { defaultValues } from './config/formConfig';

describe('InvestmentFinancingSchema', () => {
  it('accepts valid default values', () => {
    const result = InvestmentFinancingSchema.safeParse({
      ...defaultValues,
      person: 'meyer-tech',
      financingObjectName: 'Fuhrpark Q2',
      operatingResourcesNeeded: 'nein',
      operatingResourcesAmount: undefined,
      operatingResourcesType: undefined,
    });

    expect(result.success).toBe(true);
  });

  it('rejects non ISO purchaseDate', () => {
    const result = InvestmentFinancingSchema.safeParse({
      ...defaultValues,
      person: 'meyer-tech',
      financingObjectName: 'Objekt',
      purchaseDate: '31.12.2026',
      paymentDate: '2026-12-31',
      operatingResourcesNeeded: 'nein',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'purchaseDate')).toBe(
        true,
      );
    }
  });

  it('rejects paymentDate before purchaseDate', () => {
    const result = InvestmentFinancingSchema.safeParse({
      ...defaultValues,
      person: 'meyer-tech',
      financingObjectName: 'Objekt',
      purchaseDate: '2026-10-10',
      paymentDate: '2026-09-10',
      operatingResourcesNeeded: 'nein',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'paymentDate')).toBe(
        true,
      );
    }
  });

  it('requires operating resources details when needed is ja', () => {
    const result = InvestmentFinancingSchema.safeParse({
      ...defaultValues,
      person: 'meyer-tech',
      financingObjectName: 'Objekt',
      operatingResourcesNeeded: 'ja',
      operatingResourcesAmount: undefined,
      operatingResourcesType: undefined,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issuePaths = result.error.issues.map((issue) => issue.path[0]);
      expect(issuePaths).toContain('operatingResourcesAmount');
      expect(issuePaths).toContain('operatingResourcesType');
    }
  });
});
