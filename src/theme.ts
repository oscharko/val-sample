import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
        containedPrimary: {
          background: 'linear-gradient(135deg, #E30613 0%, #FF4D4D 100%)',
          boxShadow: '0 4px 14px rgba(227, 6, 19, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #c00510 0%, #e63e3e 100%)',
            boxShadow: '0 6px 20px rgba(227, 6, 19, 0.4)',
          },
        },
        outlinedSecondary: {
          borderColor: '#ccc',
          color: '#333',
          '&:hover': {
            borderColor: '#999',
            backgroundColor: 'rgba(0,0,0,0.02)',
          },
        },
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
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#999',
          },
        },
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

export default theme;
