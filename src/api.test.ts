import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitInvestmentFinancing } from './api';
import type { InvestmentFinancingRequest } from './contracts/investmentFinancingContract';

const validRequest: InvestmentFinancingRequest = {
  person: 'Meyer Technologies GmbH',
  investmentObjectName: 'Volkswagen ID.3',
  investmentObjectType: 'kfz',
  purchasePriceCaptureMode: 'netto',
  purchasePrice: 45000,
  vatRate: '19',
  vatAmount: 8550,
  additionalCosts: 5000,
  financingDemandAmount: 50000,
};

const createAbortAwareFetchMock = () => {
  return vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  });
};

const createJsonResponse = (body: unknown, status: number): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

describe('submitInvestmentFinancing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns parsed success response for valid server payloads', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return Promise.resolve(createJsonResponse({ id: 'abc', message: 'ok' }, 200));
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0];
    if (!firstCall) {
      throw new Error('Expected fetch to be called at least once.');
    }

    const [input, init] = firstCall;
    expect(input).toBe('/api/investment-financing');
    expect(init).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(validRequest),
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);

    expect(result).toEqual({
      success: true,
      data: {
        id: 'abc',
        message: 'ok',
      },
    });
  });

  it('returns contract error when successful response body does not match success schema', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(createJsonResponse({ message: 'missing id' }, 200)));
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(result).toEqual({
      success: false,
      error: {
        status: 200,
        message: 'Antwortformat des Servers ist ungültig. Bitte Backend-Vertrag prüfen.',
        fieldErrors: undefined,
        code: undefined,
        traceId: undefined,
      },
    });
  });

  it('returns parsed structured validation error payload when backend contract matches', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        createJsonResponse(
          {
            message: 'Validierung fehlgeschlagen',
            fieldErrors: {
              purchasePrice: 'Ungültiger Betrag',
            },
            code: 'VALIDATION_ERROR',
            traceId: 'trace-123',
          },
          422,
        ),
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(result).toEqual({
      success: false,
      error: {
        status: 422,
        message: 'Validierung fehlgeschlagen',
        fieldErrors: {
          purchasePrice: 'Ungültiger Betrag',
        },
        code: 'VALIDATION_ERROR',
        traceId: 'trace-123',
      },
    });
  });

  it('falls back to generic validation error when error payload violates contract', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        createJsonResponse(
          {
            message: 'Validation failed',
            fieldErrors: 'not-a-record',
          },
          422,
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(result).toEqual({
      success: false,
      error: {
        status: 422,
        message: 'Validierungsfehler vom Server. Bitte überprüfen Sie die Eingaben.',
        fieldErrors: undefined,
        code: undefined,
        traceId: undefined,
      },
    });
  });

  it('returns generic server error message when error response body is not JSON', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response('not-json', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      })),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(result).toEqual({
      success: false,
      error: {
        status: 500,
        message: 'Serverfehler (500). Bitte versuchen Sie es später erneut.',
        fieldErrors: undefined,
        code: undefined,
        traceId: undefined,
      },
    });
  });

  it('returns timeout error when request exceeds timeout', async () => {
    vi.useFakeTimers();

    const fetchMock = createAbortAwareFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    const pendingResult = submitInvestmentFinancing(validRequest, { timeoutMs: 25 });

    await vi.advanceTimersByTimeAsync(30);

    const result = await pendingResult;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        status: 0,
        message: 'Zeitüberschreitung nach 25 ms. Bitte versuchen Sie es erneut.',
        fieldErrors: undefined,
        code: undefined,
        traceId: undefined,
      },
    });
  });

  it('returns canceled error when caller aborts request', async () => {
    const fetchMock = createAbortAwareFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const pendingResult = submitInvestmentFinancing(validRequest, {
      signal: controller.signal,
      timeoutMs: 5_000,
    });

    controller.abort();

    const result = await pendingResult;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        status: 0,
        message: 'Anfrage wurde abgebrochen.',
        fieldErrors: undefined,
        code: undefined,
        traceId: undefined,
      },
    });
  });

  it('returns network error when fetch fails for non-abort reasons', async () => {
    const fetchMock = vi.fn(() => Promise.reject(new TypeError('Network down')));
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        status: 0,
        message:
          'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        fieldErrors: undefined,
        code: undefined,
        traceId: undefined,
      },
    });
  });
});
