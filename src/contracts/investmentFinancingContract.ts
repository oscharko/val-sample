import { z } from 'zod';

/**
 * Contract-first integration point for the Investment Financing form.
 *
 * This file is the single backend-facing boundary for:
 * - HTTP endpoint metadata
 * - request payload shape
 * - success/error response shape
 *
 * Spring Boot mapping guidance:
 * - Use `BigDecimal` for monetary amounts (`purchasePrice`, `vatAmount`, ...).
 * - Use `LocalDate` for date fields.
 * - Keep enum literals exactly as defined here.
 */

export const INVESTMENT_FINANCING_API_VERSION = '2026-03-04';
export const INVESTMENT_FINANCING_ENDPOINT = '/api/investment-financing';

export const InvestmentFinancingYesNoSchema = z.enum(['ja', 'nein']);
export type InvestmentFinancingYesNo = z.infer<typeof InvestmentFinancingYesNoSchema>;

export const InvestmentFinancingObjectTypeSchema = z.enum([
  'kfz',
  'maschine',
  'it',
  'immobilie',
  'sonstiges',
]);
export type InvestmentFinancingObjectType = z.infer<
  typeof InvestmentFinancingObjectTypeSchema
>;

export const InvestmentFinancingCaptureModeSchema = z.enum(['netto', 'brutto']);
export type InvestmentFinancingCaptureMode = z.infer<
  typeof InvestmentFinancingCaptureModeSchema
>;

export const InvestmentFinancingVatRateSchema = z.enum(['19', '7', '0']);
export type InvestmentFinancingVatRate = z.infer<
  typeof InvestmentFinancingVatRateSchema
>;

export const InvestmentFinancingRequestSchema = z.object({
  person: z.string().min(1),
  investmentObjectName: z.string().min(1),
  investmentObjectType: InvestmentFinancingObjectTypeSchema,
  fleetPurchasePlanned: InvestmentFinancingYesNoSchema.optional(),
  expansionInvestment: InvestmentFinancingYesNoSchema.optional(),
  purchasePriceCaptureMode: InvestmentFinancingCaptureModeSchema,
  purchasePrice: z.number().min(0),
  vatRate: InvestmentFinancingVatRateSchema,
  vatAmount: z.number().min(0),
  additionalCosts: z.number().min(0),
  financingDemandAmount: z.number().min(0),
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
  internalNote: z.string().max(10000).optional(),
});

export type InvestmentFinancingRequest = z.infer<
  typeof InvestmentFinancingRequestSchema
>;

export const InvestmentFinancingSuccessResponseSchema = z.object({
  id: z.string().min(1),
  message: z.string().min(1).optional(),
});

export type InvestmentFinancingSuccessResponse = z.infer<
  typeof InvestmentFinancingSuccessResponseSchema
>;

export const InvestmentFinancingErrorResponseSchema = z.object({
  status: z.number().int().nonnegative(),
  message: z.string().min(1),
  fieldErrors: z.record(z.string(), z.string()).optional(),
  code: z.string().min(1).optional(),
  traceId: z.string().min(1).optional(),
});

export type InvestmentFinancingErrorResponse = z.infer<
  typeof InvestmentFinancingErrorResponseSchema
>;

export const investmentFinancingContract = {
  version: INVESTMENT_FINANCING_API_VERSION,
  endpoint: INVESTMENT_FINANCING_ENDPOINT,
  method: 'POST',
  requestSchema: InvestmentFinancingRequestSchema,
  successSchema: InvestmentFinancingSuccessResponseSchema,
  errorSchema: InvestmentFinancingErrorResponseSchema,
} as const;
