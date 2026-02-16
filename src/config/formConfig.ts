/**
 * formConfig.ts — Configuration constants for the Investment Financing Form.
 */

import type { InvestmentFinancingFormData } from '../schema';

export const SECTION_IDS = [
  'basisdaten',
  'kosten',
  'zeitpunkt',
  'betriebsmittel',
  'nachhaltigkeit',
] as const;

export const CATEGORY_OPTIONS = [
  { value: 'kfz', label: 'Kfz' },
  { value: 'maschine', label: 'Maschine' },
  { value: 'it', label: 'IT / Software' },
  { value: 'immobilie', label: 'Immobilie' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const;

export const VAT_RATE_OPTIONS = [
  { value: '19', label: '19 %' },
  { value: '7', label: '7 %' },
  { value: '0', label: '0 %' },
] as const;

export const USEFUL_LIFE_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} Jahre`,
}));

export const PERSON_OPTIONS = [
  { value: 'meyer-tech', label: 'Meyer Technology GmbH' },
  { value: 'schmidt-ag', label: 'Schmidt AG' },
  { value: 'weber-gmbh', label: 'Weber GmbH' },
] as const;

export const defaultValues: InvestmentFinancingFormData = {
  person: '',
  financingObjectName: '',
  financingObjectCategory: 'kfz',
  fleetPurchase: 'nein',
  expansionInvestment: 'nein',
  grossPrice: false,
  netPurchasePrice: 0,
  additionalCosts: 0,
  vatDeductible: 'ja',
  vatRate: '19',
  purchaseDate: '2026-02-01',
  paymentDate: '2026-02-01',
  usefulLifeYears: undefined,
  operatingResourcesNeeded: 'ja',
  operatingResourcesAmount: undefined,
  operatingResourcesType: undefined,
  esgCompliant: 'ja',
};
