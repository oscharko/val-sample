import {
  OPENAPI_CONTRACT_VERSION,
  InvestmentFinancingErrorResponseSchema,
  InvestmentFinancingRequestSchema,
  InvestmentFinancingSuccessResponseSchema,
} from './generated/investmentFinancingContract.generated';

export type {
  InvestmentFinancingErrorResponse,
  InvestmentFinancingRequest,
  InvestmentFinancingSuccessResponse,
} from './generated/investmentFinancingContract.generated';

export type {
  InvestmentFinancingCaptureMode,
  InvestmentFinancingObjectType,
  InvestmentFinancingVatRate,
  InvestmentFinancingYesNo,
} from '../validation/investmentFinancingBaseSchema';

/**
 * Backend-facing contract adapter.
 *
 * Source of truth:
 * - `src/contracts/generated/openapi.snapshot.json` (from Spring Boot `/v3/api-docs`)
 * - generated artifacts in `src/contracts/generated/*`
 */
export const INVESTMENT_FINANCING_API_VERSION = OPENAPI_CONTRACT_VERSION;
export const INVESTMENT_FINANCING_ENDPOINT = '/investment-financing';

export { InvestmentFinancingRequestSchema };
export { InvestmentFinancingSuccessResponseSchema };
export { InvestmentFinancingErrorResponseSchema };

export const investmentFinancingContract = {
  version: INVESTMENT_FINANCING_API_VERSION,
  endpoint: INVESTMENT_FINANCING_ENDPOINT,
  method: 'POST',
  requestSchema: InvestmentFinancingRequestSchema,
  successSchema: InvestmentFinancingSuccessResponseSchema,
  errorSchema: InvestmentFinancingErrorResponseSchema,
} as const;
