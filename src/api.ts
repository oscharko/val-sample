import {
  investmentFinancingContract,
  type InvestmentFinancingRequest,
  type InvestmentFinancingSuccessResponse,
  type InvestmentFinancingErrorResponse,
} from './contracts/investmentFinancingContract';
import { formatNumber } from './i18n/formatters';
import { getCurrentLocale, translate } from './i18n';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type ApiResult =
  | { success: true; data: InvestmentFinancingSuccessResponse }
  | { success: false; error: InvestmentFinancingErrorResponse };

export interface SubmitInvestmentFinancingOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toOptionalString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

const toErrorResult = ({
  status,
  message,
  fieldErrors,
  code,
  traceId,
}: {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
  code?: string;
  traceId?: string;
}): ApiResult => {
  return {
    success: false,
    error: {
      status,
      message,
      fieldErrors,
      code,
      traceId,
    },
  };
};

const parseErrorResponseBody = (responseBody: unknown) => {
  if (!isObjectRecord(responseBody)) {
    return {
      message: undefined,
      fieldErrors: undefined,
      code: undefined,
      traceId: undefined,
    };
  }

  return {
    message: toOptionalString(responseBody.message),
    fieldErrors: responseBody.fieldErrors,
    code: toOptionalString(responseBody.code),
    traceId: toOptionalString(responseBody.traceId),
  };
};

/* ------------------------------------------------------------------ */
/*  Submit investment financing form                                  */
/* ------------------------------------------------------------------ */

export async function submitInvestmentFinancing(
  dto: InvestmentFinancingRequest,
  { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, signal }: SubmitInvestmentFinancingOptions = {},
): Promise<ApiResult> {
  const requestController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    requestController.abort();
  }, timeoutMs);

  const abortFromCaller = () => {
    requestController.abort();
  };

  signal?.addEventListener('abort', abortFromCaller);

  try {
    const response = await fetch(investmentFinancingContract.endpoint, {
      method: investmentFinancingContract.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
      signal: requestController.signal,
    });

    const responseBody = (await response.json().catch(() => null)) as unknown;

    if (response.ok) {
      const parsedSuccess =
        investmentFinancingContract.successSchema.safeParse(responseBody);

      if (parsedSuccess.success) {
        return { success: true, data: parsedSuccess.data };
      }

      return toErrorResult({
        status: response.status,
        message: translate('api.errors.invalidServerResponse'),
      });
    }

    const errorResponseBody = parseErrorResponseBody(responseBody);

    const parsedError = investmentFinancingContract.errorSchema.safeParse({
      status: response.status,
      message:
        errorResponseBody.message ??
        (response.status === 400 || response.status === 422
          ? translate('api.errors.validation')
          : translate('api.errors.server', { status: response.status })),
      fieldErrors: errorResponseBody.fieldErrors,
      code: errorResponseBody.code,
      traceId: errorResponseBody.traceId,
    });

    if (parsedError.success) {
      return { success: false, error: parsedError.data };
    }

    if (response.status === 400 || response.status === 422) {
      return toErrorResult({
        status: response.status,
        message: translate('api.errors.validation'),
      });
    }

    return toErrorResult({
      status: response.status,
      message: translate('api.errors.server', { status: response.status }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const formattedTimeoutMs = formatNumber({
        locale: getCurrentLocale(),
        value: timeoutMs,
        maximumFractionDigits: 0,
      });

      return toErrorResult({
        status: 0,
        message:
          signal?.aborted === true
            ? translate('api.errors.aborted')
            : translate('api.errors.timeout', { timeoutMs: formattedTimeoutMs }),
      });
    }

    return toErrorResult({
      status: 0,
      message: translate('api.errors.network'),
    });
  } finally {
    clearTimeout(timeoutHandle);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
