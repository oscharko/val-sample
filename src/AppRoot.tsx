import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import createCache from '@emotion/cache';
import { useMemo } from 'react';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { AppLocaleManager } from './components/system/AppLocaleManager';
import { useLocale } from './i18n/useLocale';
import App from './App';
import { createAppTheme } from './theme';

const ltrCache = createCache({ key: 'muiltr' });

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export default function AppRoot() {
  const { direction } = useLocale();

  const theme = useMemo(() => {
    return createAppTheme(direction);
  }, [direction]);

  const emotionCache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppLocaleManager />
        <App />
      </ThemeProvider>
    </CacheProvider>
  );
}
