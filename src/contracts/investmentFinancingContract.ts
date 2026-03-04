import { z } from 'zod';
import {
  InvestmentFinancingBaseSchema,
  InvestmentFinancingCaptureModeSchema,
  InvestmentFinancingObjectTypeSchema,
  InvestmentFinancingVatRateSchema,
  InvestmentFinancingYesNoSchema,
} from '../validation/investmentFinancingBaseSchema';

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
export const INVESTMENT_FINANCING_ENDPOINT = '/investment-financing';

export type InvestmentFinancingYesNo = z.infer<typeof InvestmentFinancingYesNoSchema>;

export type InvestmentFinancingObjectType = z.infer<
  typeof InvestmentFinancingObjectTypeSchema
>;

export type InvestmentFinancingCaptureMode = z.infer<
  typeof InvestmentFinancingCaptureModeSchema
>;

export type InvestmentFinancingVatRate = z.infer<
  typeof InvestmentFinancingVatRateSchema
>;

export const InvestmentFinancingRequestSchema = InvestmentFinancingBaseSchema.extend({
  vatAmount: z.number().min(0),
  financingDemandAmount: z.number().min(0),
});

export type InvestmentFinancingRequest = z.infer<
  typeof InvestmentFinancingRequestSchema
>;

export const InvestmentFinancingSuccessResponseSchema = z.strictObject({
  id: z.string().min(1),
  message: z.string().min(1).optional(),
});

export type InvestmentFinancingSuccessResponse = z.infer<
  typeof InvestmentFinancingSuccessResponseSchema
>;

export const InvestmentFinancingErrorResponseSchema = z.strictObject({
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
