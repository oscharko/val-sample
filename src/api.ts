import {
  investmentFinancingContract,
  type InvestmentFinancingRequest,
  type InvestmentFinancingSuccessResponse,
  type InvestmentFinancingErrorResponse,
} from './contracts/investmentFinancingContract';

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

    const responseBody = await response.json().catch(() => null);

    if (response.ok) {
      const parsedSuccess =
        investmentFinancingContract.successSchema.safeParse(responseBody);

      if (parsedSuccess.success) {
        return { success: true, data: parsedSuccess.data };
      }

      return toErrorResult({
        status: response.status,
        message:
          'Antwortformat des Servers ist ungültig. Bitte Backend-Vertrag prüfen.',
      });
    }

    const parsedError = investmentFinancingContract.errorSchema.safeParse({
      status: response.status,
      message:
        responseBody?.message ??
        (response.status === 400 || response.status === 422
          ? 'Validierungsfehler vom Server. Bitte überprüfen Sie die Eingaben.'
          : `Serverfehler (${response.status}). Bitte versuchen Sie es später erneut.`),
      fieldErrors: responseBody?.fieldErrors,
      code: responseBody?.code,
      traceId: responseBody?.traceId,
    });

    if (parsedError.success) {
      return { success: false, error: parsedError.data };
    }

    if (response.status === 400 || response.status === 422) {
      return toErrorResult({
        status: response.status,
        message: 'Validierungsfehler vom Server. Bitte überprüfen Sie die Eingaben.',
      });
    }

    return toErrorResult({
      status: response.status,
      message: `Serverfehler (${response.status}). Bitte versuchen Sie es später erneut.`,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return toErrorResult({
        status: 0,
        message:
          signal?.aborted === true
            ? 'Anfrage wurde abgebrochen.'
            : `Zeitüberschreitung nach ${timeoutMs} ms. Bitte versuchen Sie es erneut.`,
      });
    }

    return toErrorResult({
      status: 0,
      message:
        'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
    });
  } finally {
    clearTimeout(timeoutHandle);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
