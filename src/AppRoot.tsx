import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { AppLocaleManager } from './components/system/AppLocaleManager';
import InvestmentFinancingForm from './InvestmentFinancingForm';
import { createAppTheme } from './theme';

/** Emotion-Cache und Theme werden einmalig auf Modul-Ebene erzeugt. */
const emotionCache = createCache({ key: 'mui' });
const theme = createAppTheme();

export default function AppRoot() {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppLocaleManager />
        <InvestmentFinancingForm />
      </ThemeProvider>
    </CacheProvider>
  );
}
