/**
 * SnackbarFeedback — Global form feedback component.
 */

import { Alert, Snackbar } from '@mui/material';
import {
  useSubmissionActions,
  useSubmissionMessage,
  useSubmissionState,
} from '../../hooks/useFormStatus';

export function SnackbarFeedback() {
  const { isSuccess, isError } = useSubmissionState();
  const { lastError, lastSuccessMessage } = useSubmissionMessage();
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
