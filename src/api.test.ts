import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CLIENT_ABORTED_ERROR_CODE,
  CLIENT_CONTRACT_MISMATCH_ERROR_CODE,
  CLIENT_NETWORK_ERROR_CODE,
  CLIENT_TIMEOUT_ERROR_CODE,
  submitInvestmentFinancing,
} from './api';
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
        code: CLIENT_CONTRACT_MISMATCH_ERROR_CODE,
        traceId: undefined,
      },
    });
  });

  it('returns parsed structured validation error payload when backend contract matches', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        createJsonResponse(
          {
            message: 'Validation failed on backend.',
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
        message: 'Validierungsfehler vom Server. Bitte überprüfen Sie die Eingaben.',
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
        code: CLIENT_CONTRACT_MISMATCH_ERROR_CODE,
        traceId: undefined,
      },
    });
  });

  it('normalizes structured server error messages to localized generic text', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        createJsonResponse(
          {
            message: 'Null pointer while storing request object.',
            code: 'INTERNAL_SERVER_ERROR',
            traceId: 'trace-500',
          },
          500,
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(result).toEqual({
      success: false,
      error: {
        status: 500,
        message: 'Serverfehler (500). Bitte versuchen Sie es später erneut.',
        fieldErrors: undefined,
        code: 'INTERNAL_SERVER_ERROR',
        traceId: 'trace-500',
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
        code: CLIENT_CONTRACT_MISMATCH_ERROR_CODE,
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
        code: CLIENT_TIMEOUT_ERROR_CODE,
        traceId: undefined,
      },
    });
  });

  it('falls back to default timeout for invalid timeout values', async () => {
    vi.useFakeTimers();

    for (const invalidTimeoutMs of [0, -50, Number.NaN]) {
      const fetchMock = createAbortAwareFetchMock();
      vi.stubGlobal('fetch', fetchMock);

      const pendingResult = submitInvestmentFinancing(validRequest, {
        timeoutMs: invalidTimeoutMs,
      });

      await vi.advanceTimersByTimeAsync(10_050);
      const result = await pendingResult;

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: false,
        error: {
          status: 0,
          message: 'Zeitüberschreitung nach 10.000 ms. Bitte versuchen Sie es erneut.',
          fieldErrors: undefined,
          code: CLIENT_TIMEOUT_ERROR_CODE,
          traceId: undefined,
        },
      });

      vi.restoreAllMocks();
    }
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
        code: CLIENT_ABORTED_ERROR_CODE,
        traceId: undefined,
      },
    });
  });

  it('prefers caller-abort classification when abort happens before timeout', async () => {
    vi.useFakeTimers();

    const fetchMock = createAbortAwareFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const pendingResult = submitInvestmentFinancing(validRequest, {
      signal: controller.signal,
      timeoutMs: 25,
    });

    controller.abort();
    await vi.advanceTimersByTimeAsync(30);

    const result = await pendingResult;

    expect(result).toEqual({
      success: false,
      error: {
        status: 0,
        message: 'Anfrage wurde abgebrochen.',
        fieldErrors: undefined,
        code: CLIENT_ABORTED_ERROR_CODE,
        traceId: undefined,
      },
    });
  });

  it('returns canceled error immediately when caller signal is already aborted', async () => {
    const fetchMock = createAbortAwareFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    controller.abort();

    const result = await submitInvestmentFinancing(validRequest, {
      signal: controller.signal,
      timeoutMs: 5_000,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: {
        status: 0,
        message: 'Anfrage wurde abgebrochen.',
        fieldErrors: undefined,
        code: CLIENT_ABORTED_ERROR_CODE,
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
        code: CLIENT_NETWORK_ERROR_CODE,
        traceId: undefined,
      },
    });
  });

  it('cleans up abort listeners after request completion', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(createJsonResponse({ id: 'abc', message: 'ok' }, 200)),
    );
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const addEventListenerSpy = vi.spyOn(controller.signal, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener');

    await submitInvestmentFinancing(validRequest, { signal: controller.signal });

    const abortListener = addEventListenerSpy.mock.calls[0]?.[1];

    expect(abortListener).toBeDefined();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('abort', abortListener);
  });
});
