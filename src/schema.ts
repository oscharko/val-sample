import { z } from 'zod';
import {
  INVESTMENT_FINANCING_OBJECT_TYPES,
  INVESTMENT_FINANCING_PURCHASE_PRICE_CAPTURE_MODES,
  INVESTMENT_FINANCING_VAT_RATES,
  INVESTMENT_FINANCING_YES_NO_VALUES,
} from './domain/investmentFinancingEnums';
import { INVESTMENT_FINANCING_FIELD_NAMES } from './domain/investmentFinancingFields';
import type { InvestmentFinancingRequest } from './contracts/investmentFinancingContract';
import { calculateVatAmount, roundToCents } from './utils/currency';

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

export const YesNo = z.enum(INVESTMENT_FINANCING_YES_NO_VALUES);
export type YesNo = z.infer<typeof YesNo>;

export const PurchasePriceCaptureMode = z.enum(
  INVESTMENT_FINANCING_PURCHASE_PRICE_CAPTURE_MODES,
);
export type PurchasePriceCaptureMode = z.infer<typeof PurchasePriceCaptureMode>;

export const InvestmentObjectType = z.enum(INVESTMENT_FINANCING_OBJECT_TYPES);
export type InvestmentObjectType = z.infer<typeof InvestmentObjectType>;

export const VatRate = z.enum(INVESTMENT_FINANCING_VAT_RATES);
export type VatRate = z.infer<typeof VatRate>;

export const InvestmentFinancingFieldNameSchema = z.enum(
  INVESTMENT_FINANCING_FIELD_NAMES,
);
export type InvestmentFinancingFieldName = z.infer<
  typeof InvestmentFinancingFieldNameSchema
>;

export const InvestmentFinancingSchema = z
  .object({
    person: z.string().trim().min(1, VALIDATION_MESSAGES.personRequired),

    investmentObjectName: z
      .string()
      .trim()
      .min(1, VALIDATION_MESSAGES.investmentObjectNameRequired),
    investmentObjectType: InvestmentObjectType.refine((val) => val !== undefined, {
      message: VALIDATION_MESSAGES.investmentObjectTypeRequired,
    }),
    fleetPurchasePlanned: YesNo.optional(),
    expansionInvestment: YesNo.optional(),

    purchasePriceCaptureMode: PurchasePriceCaptureMode,
    purchasePrice: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount),
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

const emptyToUndefined = (value: string | undefined): string | undefined =>
  value === '' ? undefined : value;

/**
 * Convert validated form data to the backend contract request shape.
 */
export function toDTO(data: InvestmentFinancingFormData): InvestmentFinancingRequest {
  const purchasePrice = data.purchasePrice ?? 0;
  const additionalCosts = data.additionalCosts ?? 0;
  const vatAmount = calculateVatAmount({
    purchasePrice,
    vatRate: Number(data.vatRate),
  });

  return {
    person: data.person,
    investmentObjectName: data.investmentObjectName,
    investmentObjectType: data.investmentObjectType,
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
    acquisitionDate: emptyToUndefined(data.acquisitionDate),
    purchasePaymentDate: emptyToUndefined(data.purchasePaymentDate),
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
