import { Alert, Box, Button, Container, Typography } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

const INITIAL_STATE: AppErrorBoundaryState = {
  hasError: false,
  errorMessage: null,
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = INITIAL_STATE;
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled application error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Unerwarteter Fehler
          </Typography>

          <Alert severity="error" variant="outlined">
            {this.state.errorMessage ??
              'Die Anwendung konnte nicht korrekt geladen werden.'}
          </Alert>

          <Button variant="contained" onClick={this.handleReload}>
            Neu laden
          </Button>
        </Box>
      </Container>
    );
  }
}
