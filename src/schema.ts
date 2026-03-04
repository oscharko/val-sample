import { z } from 'zod';
import type { InvestmentFinancingRequest } from './contracts/investmentFinancingContract';

const VALIDATION_MESSAGES = {
  personRequired: 'Bitte wählen Sie eine Person aus.',
  investmentObjectNameRequired:
    'Bitte geben Sie die konkrete Bezeichnung des Investitionsobjekts ein.',
  investmentObjectTypeRequired: 'Bitte wählen Sie die Art des Investitionsobjekts aus.',
  purchasePriceRequired: 'Bitte geben Sie die Höhe des Kaufpreises ein.',
  invalidNumber: 'Bitte geben Sie einen gültigen Betrag ein.',
  nonNegativeAmount: 'Der Betrag darf nicht negativ sein.',
  invalidAcquisitionDate: 'Bitte geben Sie ein gültiges Datum der Anschaffung ein.',
  invalidPurchasePaymentDate:
    'Bitte geben Sie ein gültiges Datum der Kaufpreiszahlung ein.',
  purchasePaymentDateBeforeAcquisitionDate:
    'Das Datum der Kaufpreiszahlung darf nicht vor dem Datum der Anschaffung liegen.',
  operatingResourcesAmountRequired:
    'Bitte geben Sie die Höhe der Betriebsmittel ein, wenn diese erforderlich sind.',
  internalNoteTooLong: 'Der interne Vermerk darf maximal 10000 Zeichen enthalten.',
} as const;

const optionalIsoDate = (errorMessage: string) =>
  z.union([z.iso.date(errorMessage), z.literal('')]).optional();

/* ------------------------------------------------------------------ */
/*  Enum definitions                                                  */
/* ------------------------------------------------------------------ */

export const YesNo = z.enum(['ja', 'nein']);
export type YesNo = z.infer<typeof YesNo>;

export const PurchasePriceCaptureMode = z.enum(['netto', 'brutto']);
export type PurchasePriceCaptureMode = z.infer<typeof PurchasePriceCaptureMode>;

export const InvestmentObjectType = z.enum([
  'kfz',
  'maschine',
  'it',
  'immobilie',
  'sonstiges',
]);
export type InvestmentObjectType = z.infer<typeof InvestmentObjectType>;

export const VatRate = z.enum(['19', '7', '0']);
export type VatRate = z.infer<typeof VatRate>;

/* ------------------------------------------------------------------ */
/*  Main form schema                                                  */
/* ------------------------------------------------------------------ */

export const InvestmentFinancingSchema = z
  .object({
    person: z.string().trim().min(1, VALIDATION_MESSAGES.personRequired),

    investmentObjectName: z
      .string()
      .trim()
      .min(1, VALIDATION_MESSAGES.investmentObjectNameRequired),
    investmentObjectType: InvestmentObjectType.optional(),
    fleetPurchasePlanned: YesNo.optional(),
    expansionInvestment: YesNo.optional(),

    purchasePriceCaptureMode: PurchasePriceCaptureMode,
    purchasePrice: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount)
      .optional(),
    vatRate: VatRate,
    additionalCosts: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount)
      .optional(),

    operatingResourcesRequired: YesNo.optional(),
    operatingResourcesAmount: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount)
      .optional(),

    acquisitionDate: optionalIsoDate(VALIDATION_MESSAGES.invalidAcquisitionDate),
    purchasePaymentDate: optionalIsoDate(
      VALIDATION_MESSAGES.invalidPurchasePaymentDate,
    ),
    plannedUsefulLifeMonths: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .int(VALIDATION_MESSAGES.invalidNumber)
      .positive(VALIDATION_MESSAGES.invalidNumber)
      .max(1200, VALIDATION_MESSAGES.invalidNumber)
      .optional(),

    targetDesiredRate: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount)
      .optional(),
    plannedFinancingDurationMonths: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .int(VALIDATION_MESSAGES.invalidNumber)
      .positive(VALIDATION_MESSAGES.invalidNumber)
      .max(1200, VALIDATION_MESSAGES.invalidNumber)
      .optional(),
    flexibilityImportant: YesNo.optional(),
    desiredSpecialRepaymentPercent: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount)
      .max(100, VALIDATION_MESSAGES.invalidNumber)
      .optional(),
    revolvingCreditPlanned: YesNo.optional(),
    additionalNeedAmount: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount)
      .optional(),

    sustainabilityCriteriaFulfilled: YesNo.optional(),

    investmentObjectInsuranceDesired: YesNo.optional(),
    residualDebtInsuranceDesired: YesNo.optional(),
    interestHedgingUseful: YesNo.optional(),

    taxOptimizedBalanceNeutralDesired: YesNo.optional(),

    internalNote: z
      .string()
      .max(10000, VALIDATION_MESSAGES.internalNoteTooLong)
      .optional(),
  })
  .superRefine((data, context) => {
    if (!data.investmentObjectType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_MESSAGES.investmentObjectTypeRequired,
        path: ['investmentObjectType'],
      });
    }

    if (data.purchasePrice === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_MESSAGES.purchasePriceRequired,
        path: ['purchasePrice'],
      });
    }

    if (
      data.operatingResourcesRequired === 'ja' &&
      data.operatingResourcesAmount === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_MESSAGES.operatingResourcesAmountRequired,
        path: ['operatingResourcesAmount'],
      });
    }

    if (
      data.acquisitionDate &&
      data.purchasePaymentDate &&
      data.purchasePaymentDate < data.acquisitionDate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_MESSAGES.purchasePaymentDateBeforeAcquisitionDate,
        path: ['purchasePaymentDate'],
      });
    }
  });

export type InvestmentFinancingFormData = z.infer<typeof InvestmentFinancingSchema>;

const calculateVatAmount = (purchasePrice: number, vatRate: VatRate): number => {
  const rate = Number(vatRate) / 100;
  return purchasePrice * rate;
};

const roundToCents = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const normalizeOptionalDate = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value;
};

/**
 * Convert validated form data to the backend contract request shape.
 */
export function toDTO(data: InvestmentFinancingFormData): InvestmentFinancingRequest {
  const purchasePrice = data.purchasePrice ?? 0;
  const additionalCosts = data.additionalCosts ?? 0;
  const vatAmount = roundToCents(calculateVatAmount(purchasePrice, data.vatRate));

  return {
    person: data.person,
    investmentObjectName: data.investmentObjectName,
    investmentObjectType:
      data.investmentObjectType as InvestmentFinancingRequest['investmentObjectType'],
    fleetPurchasePlanned: data.fleetPurchasePlanned,
    expansionInvestment: data.expansionInvestment,
    purchasePriceCaptureMode: data.purchasePriceCaptureMode,
    purchasePrice,
    vatRate: data.vatRate,
    vatAmount,
    additionalCosts,
    financingDemandAmount: roundToCents(purchasePrice + additionalCosts),
    operatingResourcesRequired: data.operatingResourcesRequired,
    operatingResourcesAmount: data.operatingResourcesAmount,
    acquisitionDate: normalizeOptionalDate(data.acquisitionDate),
    purchasePaymentDate: normalizeOptionalDate(data.purchasePaymentDate),
    plannedUsefulLifeMonths: data.plannedUsefulLifeMonths,
    targetDesiredRate: data.targetDesiredRate,
    plannedFinancingDurationMonths: data.plannedFinancingDurationMonths,
    flexibilityImportant: data.flexibilityImportant,
    desiredSpecialRepaymentPercent: data.desiredSpecialRepaymentPercent,
    revolvingCreditPlanned: data.revolvingCreditPlanned,
    additionalNeedAmount: data.additionalNeedAmount,
    sustainabilityCriteriaFulfilled: data.sustainabilityCriteriaFulfilled,
    investmentObjectInsuranceDesired: data.investmentObjectInsuranceDesired,
    residualDebtInsuranceDesired: data.residualDebtInsuranceDesired,
    interestHedgingUseful: data.interestHedgingUseful,
    taxOptimizedBalanceNeutralDesired: data.taxOptimizedBalanceNeutralDesired,
    internalNote: data.internalNote,
  };
}
