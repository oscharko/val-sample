import {
  investmentFinancingContract,
  type InvestmentFinancingRequest,
  type InvestmentFinancingSuccessResponse,
  type InvestmentFinancingErrorResponse,
} from './contracts/investmentFinancingContract';
import { resolveApiEndpoint } from './config/runtimeEnv';
import { formatNumber } from './utils/formatters';

/** Client-seitige Fehlercodes für nicht-server-basierte Fehler. */
export const CLIENT_ABORTED_ERROR_CODE = 'CLIENT_ABORTED' as const;
export const CLIENT_TIMEOUT_ERROR_CODE = 'CLIENT_TIMEOUT' as const;
export const CLIENT_NETWORK_ERROR_CODE = 'CLIENT_NETWORK' as const;
export const CLIENT_CONTRACT_MISMATCH_ERROR_CODE = 'CLIENT_CONTRACT_MISMATCH' as const;

export type ClientErrorCode =
  | typeof CLIENT_ABORTED_ERROR_CODE
  | typeof CLIENT_TIMEOUT_ERROR_CODE
  | typeof CLIENT_NETWORK_ERROR_CODE
  | typeof CLIENT_CONTRACT_MISMATCH_ERROR_CODE;

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

/** Status 400/422 = serverseitige Validierungsfehler. */
const isValidationStatus = (status: number): boolean => {
  return status === 400 || status === 422;
};

/** Erzeugt nutzerfreundliche Fehlermeldung basierend auf HTTP-Status. */
const toUserFacingServerMessage = ({
  status,
  code,
}: {
  status: number;
  code?: string | undefined;
}): string => {
  const normalizedCode = code?.trim().toUpperCase();
  if (isValidationStatus(status) || normalizedCode === 'VALIDATION_ERROR') {
    return 'Validierungsfehler vom Server. Bitte überprüfen Sie die Eingaben.';
  }

  return `Serverfehler (${status}). Bitte versuchen Sie es später erneut.`;
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

/**
 * Sendet den Finanzierungsbedarf an das Backend.
 * Unterstützt Timeout, externes Abort-Signal und Contract-Validierung.
 */
export async function submitInvestmentFinancing(
  dto: InvestmentFinancingRequest,
  { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, signal }: SubmitInvestmentFinancingOptions = {},
): Promise<ApiResult> {
  if (signal?.aborted === true) {
    return toErrorResult({
      status: 0,
      message: 'Anfrage wurde abgebrochen.',
      code: CLIENT_ABORTED_ERROR_CODE,
    });
  }

  const endpoint = resolveApiEndpoint(investmentFinancingContract.endpoint);
  const requestController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    requestController.abort();
  }, timeoutMs);
  let wasAbortedByCaller = false;

  const abortFromCaller = () => {
    wasAbortedByCaller = true;
    requestController.abort();
  };

  signal?.addEventListener('abort', abortFromCaller);

  try {
    const response = await fetch(endpoint, {
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
        message: 'Antwortformat des Servers ist ungültig. Bitte Backend-Vertrag prüfen.',
        code: CLIENT_CONTRACT_MISMATCH_ERROR_CODE,
      });
    }

    const hasStructuredErrorBody = isObjectRecord(responseBody);
    if (!hasStructuredErrorBody) {
      return toErrorResult({
        status: response.status,
        message: toUserFacingServerMessage({
          status: response.status,
        }),
        code: CLIENT_CONTRACT_MISMATCH_ERROR_CODE,
      });
    }

    const errorResponseBody = parseErrorResponseBody(responseBody);

    const parsedError = investmentFinancingContract.errorSchema.safeParse({
      status: response.status,
      message: toUserFacingServerMessage({
        status: response.status,
        code: errorResponseBody.code,
      }),
      fieldErrors: errorResponseBody.fieldErrors,
      code: errorResponseBody.code,
      traceId: errorResponseBody.traceId,
    });

    if (parsedError.success) {
      return { success: false, error: parsedError.data };
    }

    return toErrorResult({
      status: response.status,
      message: toUserFacingServerMessage({
        status: response.status,
        code: errorResponseBody.code,
      }),
      code: CLIENT_CONTRACT_MISMATCH_ERROR_CODE,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const formattedTimeoutMs = formatNumber({
        value: timeoutMs,
        maximumFractionDigits: 0,
      });

      if (wasAbortedByCaller) {
        return toErrorResult({
          status: 0,
          message: 'Anfrage wurde abgebrochen.',
          code: CLIENT_ABORTED_ERROR_CODE,
        });
      }

      return toErrorResult({
        status: 0,
        message: `Zeitüberschreitung nach ${formattedTimeoutMs} ms. Bitte versuchen Sie es erneut.`,
        code: CLIENT_TIMEOUT_ERROR_CODE,
      });
    }

    return toErrorResult({
      status: 0,
      message: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
      code: CLIENT_NETWORK_ERROR_CODE,
    });
  } finally {
    clearTimeout(timeoutHandle);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
