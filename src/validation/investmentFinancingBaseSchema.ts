import { z } from 'zod';
import {
  INVESTMENT_FINANCING_OBJECT_TYPES,
  INVESTMENT_FINANCING_PURCHASE_PRICE_CAPTURE_MODES,
  INVESTMENT_FINANCING_VAT_RATES,
  INVESTMENT_FINANCING_YES_NO_VALUES,
} from '../domain/investmentFinancingEnums';

export const INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH = 255;
export const INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH = 10_000;

export const InvestmentFinancingYesNoSchema = z.enum(INVESTMENT_FINANCING_YES_NO_VALUES);
export type InvestmentFinancingYesNo = z.infer<typeof InvestmentFinancingYesNoSchema>;

export const InvestmentFinancingObjectTypeSchema = z.enum(INVESTMENT_FINANCING_OBJECT_TYPES);
export type InvestmentFinancingObjectType = z.infer<
  typeof InvestmentFinancingObjectTypeSchema
>;

export const InvestmentFinancingCaptureModeSchema = z.enum(
  INVESTMENT_FINANCING_PURCHASE_PRICE_CAPTURE_MODES,
);
export type InvestmentFinancingCaptureMode = z.infer<
  typeof InvestmentFinancingCaptureModeSchema
>;

export const InvestmentFinancingVatRateSchema = z.enum(INVESTMENT_FINANCING_VAT_RATES);
export type InvestmentFinancingVatRate = z.infer<typeof InvestmentFinancingVatRateSchema>;

export const InvestmentFinancingBaseSchema = z.strictObject({
  person: z
    .string()
    .trim()
    .min(1)
    .max(INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH),
  investmentObjectName: z
    .string()
    .trim()
    .min(1)
    .max(INVESTMENT_FINANCING_SHORT_TEXT_MAX_LENGTH),
  investmentObjectType: InvestmentFinancingObjectTypeSchema,
  fleetPurchasePlanned: InvestmentFinancingYesNoSchema.optional(),
  expansionInvestment: InvestmentFinancingYesNoSchema.optional(),
  purchasePriceCaptureMode: InvestmentFinancingCaptureModeSchema,
  purchasePrice: z.number().min(0),
  vatRate: InvestmentFinancingVatRateSchema,
  additionalCosts: z.number().min(0).optional(),
  operatingResourcesRequired: InvestmentFinancingYesNoSchema.optional(),
  operatingResourcesAmount: z.number().min(0).optional(),
  acquisitionDate: z.iso.date().optional(),
  purchasePaymentDate: z.iso.date().optional(),
  plannedUsefulLifeMonths: z.number().int().positive().max(1200).optional(),
  targetDesiredRate: z.number().min(0).optional(),
  plannedFinancingDurationMonths: z.number().int().positive().max(1200).optional(),
  flexibilityImportant: InvestmentFinancingYesNoSchema.optional(),
  desiredSpecialRepaymentPercent: z.number().min(0).max(100).optional(),
  revolvingCreditPlanned: InvestmentFinancingYesNoSchema.optional(),
  additionalNeedAmount: z.number().min(0).optional(),
  sustainabilityCriteriaFulfilled: InvestmentFinancingYesNoSchema.optional(),
  investmentObjectInsuranceDesired: InvestmentFinancingYesNoSchema.optional(),
  residualDebtInsuranceDesired: InvestmentFinancingYesNoSchema.optional(),
  interestHedgingUseful: InvestmentFinancingYesNoSchema.optional(),
  taxOptimizedBalanceNeutralDesired: InvestmentFinancingYesNoSchema.optional(),
  internalNote: z.string().max(INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH).optional(),
});
