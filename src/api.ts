import type { InvestmentFinancingDTO } from './schema';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ApiSuccessResponse {
  id: string;
  message: string;
}

interface ApiErrorResponse {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

export type ApiResult =
  | { success: true; data: ApiSuccessResponse }
  | { success: false; error: ApiErrorResponse };

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const API_BASE_URL = '/api';

/* ------------------------------------------------------------------ */
/*  Submit investment financing form                                  */
/* ------------------------------------------------------------------ */

export async function submitInvestmentFinancing(
  dto: InvestmentFinancingDTO,
): Promise<ApiResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/investment-financing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (response.ok) {
      const data: ApiSuccessResponse = await response.json();
      return { success: true, data };
    }

    // Handle validation errors from Spring Boot (400/422)
    if (response.status === 400 || response.status === 422) {
      const errorBody = await response.json().catch(() => null);
      return {
        success: false,
        error: {
          status: response.status,
          message:
            errorBody?.message ??
            'Validierungsfehler vom Server. Bitte überprüfen Sie die Eingaben.',
          fieldErrors: errorBody?.fieldErrors,
        },
      };
    }

    // Other server errors
    return {
      success: false,
      error: {
        status: response.status,
        message: `Serverfehler (${response.status}). Bitte versuchen Sie es später erneut.`,
      },
    };
  } catch {
    return {
      success: false,
      error: {
        status: 0,
        message:
          'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
      },
    };
  }
}
