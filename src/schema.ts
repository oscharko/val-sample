import { z } from 'zod';
import { INVESTMENT_FINANCING_FIELD_NAMES } from './domain/investmentFinancingFields';
import type { InvestmentFinancingRequest } from './contracts/investmentFinancingContract';
import { translate } from './i18n';
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

type TranslationOptions = Record<string, unknown>;

export type SchemaTranslate = (
  key: string,
  options?: TranslationOptions,
) => string;

const defaultSchemaTranslate: SchemaTranslate = (key, options) => {
  return translate(key, options);
};

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

const getValidationMessages = (translateSchema: SchemaTranslate) => {
  return {
    personRequired: translateSchema('validation.personRequired'),
    investmentObjectNameRequired: translateSchema(
      'validation.investmentObjectNameRequired',
    ),
    invalidNumber: translateSchema('validation.invalidNumber'),
    nonNegativeAmount: translateSchema('validation.nonNegativeAmount'),
    invalidAcquisitionDate: translateSchema('validation.invalidAcquisitionDate'),
    invalidPurchasePaymentDate: translateSchema(
      'validation.invalidPurchasePaymentDate',
    ),
    purchasePaymentDateBeforeAcquisitionDate: translateSchema(
      'validation.purchasePaymentDateBeforeAcquisitionDate',
    ),
    operatingResourcesAmountRequired: translateSchema(
      'validation.operatingResourcesAmountRequired',
    ),
    internalNoteTooLong: translateSchema('validation.internalNoteTooLong', {
      maxLength: INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH,
    }),
  } as const;
};

export const createInvestmentFinancingSchema = ({
  translate: translateSchema = defaultSchemaTranslate,
}: {
  translate?: SchemaTranslate;
} = {}) => {
  const validationMessages = getValidationMessages(translateSchema);

  return InvestmentFinancingBaseSchema.extend({
    person: z
      .string()
      .trim()
      .min(1, validationMessages.personRequired)
      .max(INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH),

    investmentObjectName: z
      .string()
      .trim()
      .min(1, validationMessages.investmentObjectNameRequired)
      .max(INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH),
    purchasePrice: z
      .number({ message: validationMessages.invalidNumber })
      .min(0, validationMessages.nonNegativeAmount),
    additionalCosts: z
      .number({ message: validationMessages.invalidNumber })
      .min(0, validationMessages.nonNegativeAmount)
      .optional(),

    operatingResourcesAmount: z
      .number({ message: validationMessages.invalidNumber })
      .min(0, validationMessages.nonNegativeAmount)
      .optional(),

    acquisitionDate: optionalIsoDate(validationMessages.invalidAcquisitionDate),
    purchasePaymentDate: optionalIsoDate(
      validationMessages.invalidPurchasePaymentDate,
    ),
    plannedUsefulLifeMonths: z
      .number({ message: validationMessages.invalidNumber })
      .int(validationMessages.invalidNumber)
      .positive(validationMessages.invalidNumber)
      .max(1200, validationMessages.invalidNumber)
      .optional(),

    targetDesiredRate: z
      .number({ message: validationMessages.invalidNumber })
      .min(0, validationMessages.nonNegativeAmount)
      .optional(),
    plannedFinancingDurationMonths: z
      .number({ message: validationMessages.invalidNumber })
      .int(validationMessages.invalidNumber)
      .positive(validationMessages.invalidNumber)
      .max(1200, validationMessages.invalidNumber)
      .optional(),
    flexibilityImportant: YesNo.optional(),
    desiredSpecialRepaymentPercent: z
      .number({ message: validationMessages.invalidNumber })
      .min(0, validationMessages.nonNegativeAmount)
      .max(100, validationMessages.invalidNumber)
      .optional(),
    revolvingCreditPlanned: YesNo.optional(),
    additionalNeedAmount: z
      .number({ message: validationMessages.invalidNumber })
      .min(0, validationMessages.nonNegativeAmount)
      .optional(),
    internalNote: z
      .string()
      .max(
        INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH,
        validationMessages.internalNoteTooLong,
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
        message: validationMessages.operatingResourcesAmountRequired,
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
        message: validationMessages.purchasePaymentDateBeforeAcquisitionDate,
        path: ['purchasePaymentDate'],
      });
    }
  });
};

export const InvestmentFinancingSchema = createInvestmentFinancingSchema();

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
