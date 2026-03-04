import { describe, expect, it } from 'vitest';
import {
  InvestmentFinancingSchema,
  toDTO,
  type InvestmentFinancingFormData,
} from './schema';
import { defaultValues } from './config/formConfig';

const createValidPayload = (
  overrides: Partial<InvestmentFinancingFormData> = {},
): InvestmentFinancingFormData => {
  return {
    ...defaultValues,
    person: 'Meyer Technologies GmbH',
    investmentObjectName: 'Volkswagen ID.3',
    investmentObjectType: 'kfz',
    purchasePriceCaptureMode: 'netto',
    purchasePrice: 45000,
    vatRate: '19',
    ...overrides,
  };
};

describe('InvestmentFinancingSchema', () => {
  it('accepts a valid minimal payload', () => {
    const result = InvestmentFinancingSchema.safeParse(createValidPayload());

    expect(result.success).toBe(true);
  });

  it('requires an investment object type', () => {
    const result = InvestmentFinancingSchema.safeParse(
      createValidPayload({
        investmentObjectType:
          undefined as unknown as InvestmentFinancingFormData['investmentObjectType'],
      }),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'investmentObjectType'),
      ).toBe(true);
    }
  });

  it('rejects purchase payment dates earlier than acquisition date', () => {
    const result = InvestmentFinancingSchema.safeParse(
      createValidPayload({
        acquisitionDate: '2026-05-15',
        purchasePaymentDate: '2026-05-14',
      }),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'purchasePaymentDate'),
      ).toBe(true);
    }
  });

  it('requires operating resources amount when additional operating resources are required', () => {
    const result = InvestmentFinancingSchema.safeParse(
      createValidPayload({
        operatingResourcesRequired: 'ja',
        operatingResourcesAmount: undefined,
      }),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'operatingResourcesAmount'),
      ).toBe(true);
    }
  });

  it('accepts missing operating resources amount when additional operating resources are not required', () => {
    const result = InvestmentFinancingSchema.safeParse(
      createValidPayload({
        operatingResourcesRequired: 'nein',
        operatingResourcesAmount: undefined,
      }),
    );

    expect(result.success).toBe(true);
  });

  it('trims string inputs and maps DTO totals correctly', () => {
    const parsed = InvestmentFinancingSchema.parse(
      createValidPayload({
        person: '  Meyer Technologies GmbH  ',
        investmentObjectName: '  Volkswagen ID.3  ',
        purchasePrice: 45000,
        additionalCosts: 5000,
        vatRate: '19',
      }),
    );

    expect(parsed.person).toBe('Meyer Technologies GmbH');
    expect(parsed.investmentObjectName).toBe('Volkswagen ID.3');

    const dto = toDTO(parsed);

    expect(dto.vatAmount).toBe(8550);
    expect(dto.financingDemandAmount).toBe(50000);
  });

  it('rejects unknown keys due to strict schema boundaries', () => {
    const payloadWithUnknownKey = {
      ...createValidPayload(),
      unknownField: 'should-not-pass',
    };

    const result = InvestmentFinancingSchema.safeParse(payloadWithUnknownKey);

    expect(result.success).toBe(false);
  });
});
