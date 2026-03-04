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

describe('submitInvestmentFinancing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns parsed success response for valid server payloads', async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ id: 'abc', message: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInvestmentFinancing(validRequest);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      data: {
        id: 'abc',
        message: 'ok',
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
});
