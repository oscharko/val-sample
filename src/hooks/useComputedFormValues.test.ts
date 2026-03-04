import { describe, expect, it } from 'vitest';
import {
  calculateFinancingDemand,
  calculateOperatingResourcesSuggestedAmount,
  calculateVatAmount,
} from './useComputedFormValues';

describe('useComputedFormValues calculations', () => {
  it('calculates financing demand from purchase price and additional costs', () => {
    expect(calculateFinancingDemand(45000, 5000)).toBe(50000);
    expect(calculateFinancingDemand(undefined, undefined)).toBe(0);
  });

  it('calculates vat amount based on purchase price and vat rate', () => {
    expect(calculateVatAmount(45000, '19')).toBe(8550);
    expect(calculateVatAmount(undefined, '19')).toBe(0);
  });

  it('suggests operating resources from vat in netto mode and 0 in brutto mode', () => {
    expect(calculateOperatingResourcesSuggestedAmount('netto', 45000, '19')).toBe(8550);
    expect(calculateOperatingResourcesSuggestedAmount('brutto', 45000, '19')).toBe(0);
  });
});
