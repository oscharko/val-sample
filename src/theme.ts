import { createTheme } from '@mui/material/styles';

export type AppThemeDirection = 'ltr' | 'rtl';

export const createAppTheme = (direction: AppThemeDirection) => {
  return createTheme({
    direction,
    cssVariables: true,
    palette: {
      primary: {
        main: '#E30613',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#333333',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: {
        primary: '#1a1a1a',
        secondary: '#666666',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      subtitle1: {
        fontWeight: 600,
      },
      subtitle2: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 32px',
            fontSize: '0.938rem',
          },
          containedPrimary: ({ theme: t }) => ({
            background: `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.light} 100%)`,
            boxShadow: `0 4px 14px rgba(${t.palette.primary.mainChannel} / 0.3)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
              boxShadow: `0 6px 20px rgba(${t.palette.primary.mainChannel} / 0.4)`,
            },
          }),
          outlinedSecondary: ({ theme: t }) => ({
            borderColor: t.palette.divider,
            color: t.palette.text.primary,
            '&:hover': {
              borderColor: t.palette.action.disabled,
              backgroundColor: t.palette.action.hover,
            },
          }),
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          fullWidth: true,
          size: 'medium',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: t.palette.action.disabled,
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: 2,
          },
        },
      },
    },
  });
};
