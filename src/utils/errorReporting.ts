interface ClientErrorPayload {
  type: 'unhandled_application_error';
  error: unknown;
  componentStack?: string;
}

export function logClientError({ type, error, componentStack }: ClientErrorPayload): void {
  const normalizedError =
    error instanceof Error ? error : new Error('Unbekannter Anwendungsfehler');

  console.error(type, {
    message: normalizedError.message,
    stack: normalizedError.stack,
    componentStack,
    rawError: error instanceof Error ? undefined : error,
  });
}
