import { z } from 'zod';
import { INVESTMENT_FINANCING_FIELD_NAMES } from './domain/investmentFinancingFields';
import type { InvestmentFinancingRequest } from './contracts/investmentFinancingContract';
import { calculateVatAmount, roundToCents } from './utils/currency';
import {
  INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH,
  INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH,
  InvestmentFinancingBaseSchema,
  InvestmentFinancingCaptureModeSchema,
  InvestmentFinancingObjectTypeSchema,
  InvestmentFinancingVatRateSchema,
  InvestmentFinancingYesNoSchema,
} from './validation/investmentFinancingBaseSchema';

const VALIDATION_MESSAGES = {
  personRequired: 'Bitte wählen Sie eine Person aus.',
  investmentObjectNameRequired:
    'Bitte geben Sie die konkrete Bezeichnung des Investitionsobjekts ein.',
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

export const YesNo = InvestmentFinancingYesNoSchema;
export type YesNo = z.infer<typeof YesNo>;

export const PurchasePriceCaptureMode = InvestmentFinancingCaptureModeSchema;
export type PurchasePriceCaptureMode = z.infer<typeof PurchasePriceCaptureMode>;

export const InvestmentObjectType = InvestmentFinancingObjectTypeSchema;
export type InvestmentObjectType = z.infer<typeof InvestmentObjectType>;

export const VatRate = InvestmentFinancingVatRateSchema;
export type VatRate = z.infer<typeof VatRate>;

export const InvestmentFinancingFieldNameSchema = z.enum(
  INVESTMENT_FINANCING_FIELD_NAMES,
);
export type InvestmentFinancingFieldName = z.infer<
  typeof InvestmentFinancingFieldNameSchema
>;

export const InvestmentFinancingSchema = InvestmentFinancingBaseSchema.extend({
    person: z
      .string()
      .trim()
      .min(1, VALIDATION_MESSAGES.personRequired)
      .max(INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH),

    investmentObjectName: z
      .string()
      .trim()
      .min(1, VALIDATION_MESSAGES.investmentObjectNameRequired)
      .max(INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH),
    purchasePrice: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount),
    additionalCosts: z
      .number({ message: VALIDATION_MESSAGES.invalidNumber })
      .min(0, VALIDATION_MESSAGES.nonNegativeAmount)
      .optional(),

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
    internalNote: z
      .string()
      .max(
        INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH,
        VALIDATION_MESSAGES.internalNoteTooLong,
      )
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
