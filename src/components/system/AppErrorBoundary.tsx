import { Alert, Box, Button, Container, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { logClientError } from '../../utils/errorReporting';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

function AppErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Unerwarteter Fehler
        </Typography>

        <Alert severity="error" variant="outlined">
          Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.
        </Alert>

        <Button variant="contained" onClick={resetErrorBoundary}>
          Neu laden
        </Button>
      </Box>
    </Container>
  );
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={AppErrorFallback}
      onError={(error, info) => {
        logClientError({
          type: 'unhandled_application_error',
          error,
          ...(info.componentStack
            ? { componentStack: info.componentStack }
            : {}),
        });
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
