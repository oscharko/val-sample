/**
 * SnackbarFeedback — Global form feedback component.
 * Subscribes directly to formStatusStore.
 */

import { Alert, Snackbar } from '@mui/material';
import { useFormStatus, useSubmissionActions } from '../../hooks/useFormStatus';

export function SnackbarFeedback() {
  const { isSuccess, isError, lastError, lastSuccessMessage } = useFormStatus();
  const { resetSubmissionState } = useSubmissionActions();

  const open = isSuccess || isError;
  const severity = isSuccess ? 'success' : 'error';
  const message = isSuccess
    ? (lastSuccessMessage ?? 'Bedarf erfolgreich angelegt.')
    : (lastError ?? 'Ein Fehler ist aufgetreten.');

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={resetSubmissionState}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={resetSubmissionState}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
