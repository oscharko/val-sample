import { Alert, Box, Button, Container, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import App from './App';
import theme from './theme';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Unerwarteter Fehler
        </Typography>

        <Alert severity="error" variant="outlined">
          {error instanceof Error
            ? error.message
            : 'Die Anwendung konnte nicht korrekt geladen werden.'}
        </Alert>

        <Button variant="contained" onClick={resetErrorBoundary}>
          Neu laden
        </Button>
      </Box>
    </Container>
  );
}

export default function AppRoot() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          window.location.reload();
        }}
      >
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
