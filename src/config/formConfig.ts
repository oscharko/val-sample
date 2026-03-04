/**
 * formConfig.ts — Configuration constants for InvestmentFinancingForm V2.
 */

import type { DefaultValues } from 'react-hook-form';
import type { InvestmentFinancingFormData } from '../schema';

export const SECTION_IDS = [
  'timing',
  'modalities',
  'sustainability',
  'insurance',
  'tax',
] as const;

export const PERSON_OPTIONS = [
  {
    value: 'Meyer Technologies GmbH',
    label: 'Meyer Technologies GmbH',
  },
  {
    value: 'Schmidt Maschinenbau AG',
    label: 'Schmidt Maschinenbau AG',
  },
  {
    value: 'Weber Immobilien GmbH',
    label: 'Weber Immobilien GmbH',
  },
] as const;

export const INVESTMENT_OBJECT_OPTIONS = [
  { value: 'kfz', label: 'KFZ' },
  { value: 'maschine', label: 'Maschine' },
  { value: 'it', label: 'IT / Software' },
  { value: 'immobilie', label: 'Immobilie' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const;

export const VAT_RATE_OPTIONS = [
  { value: '19', label: '19,00 %' },
  { value: '7', label: '7,00 %' },
  { value: '0', label: '0,00 %' },
] as const;

export const PURCHASE_PRICE_CAPTURE_OPTIONS = [
  { value: 'netto', label: 'Netto' },
  { value: 'brutto', label: 'Brutto' },
] as const;

/**
 * Intermediate type that validates every key and value type of
 * InvestmentFinancingFormData while explicitly allowing `undefined`.
 *
 * This bridges the `exactOptionalPropertyTypes` constraint:
 * DeepPartial's `?:` syntax forbids explicit `undefined` assignment,
 * but form defaults legitimately need `undefined` for optional fields.
 */
type ExactFormDefaults = {
  [K in keyof InvestmentFinancingFormData]: InvestmentFinancingFormData[K] | undefined;
};

const formDefaults: ExactFormDefaults = {
  person: PERSON_OPTIONS[0].value,
  investmentObjectName: '',
  investmentObjectType: undefined,
  fleetPurchasePlanned: undefined,
  expansionInvestment: undefined,

  purchasePriceCaptureMode: 'netto',
  purchasePrice: undefined,
  vatRate: '19',
  additionalCosts: undefined,

  operatingResourcesRequired: undefined,
  operatingResourcesAmount: undefined,

  acquisitionDate: undefined,
  purchasePaymentDate: undefined,
  plannedUsefulLifeMonths: undefined,

  targetDesiredRate: undefined,
  plannedFinancingDurationMonths: undefined,
  flexibilityImportant: undefined,
  desiredSpecialRepaymentPercent: undefined,
  revolvingCreditPlanned: undefined,
  additionalNeedAmount: undefined,

  sustainabilityCriteriaFulfilled: undefined,

  investmentObjectInsuranceDesired: undefined,
  residualDebtInsuranceDesired: undefined,
  interestHedgingUseful: undefined,

  taxOptimizedBalanceNeutralDesired: undefined,

  internalNote: '',
};

/**
 * Narrow cast from ExactFormDefaults → DefaultValues<InvestmentFinancingFormData>.
 * Safe because ExactFormDefaults is structurally identical; the cast only
 * bridges the exactOptionalPropertyTypes / DeepPartial mismatch.
 */
export const defaultValues =
  formDefaults as DefaultValues<InvestmentFinancingFormData>;
