import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import theme from './theme';

export default function AppRoot() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary fallback={<div>Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu.</div>}>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
