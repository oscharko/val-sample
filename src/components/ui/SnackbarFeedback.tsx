/**
 * SnackbarFeedback — Global form feedback component.
 */

import { Alert, Snackbar } from '@mui/material';
import {
  useFormStatus,
  useSubmissionActions,
} from '../../hooks/useFormStatus';

const DEFAULT_SUCCESS_MESSAGE = 'Bedarf erfolgreich angelegt.';
const DEFAULT_ERROR_MESSAGE = 'Ein Fehler ist aufgetreten.';

export function SnackbarFeedback() {
  const { isSuccess, isError, lastError, lastSuccessMessage } = useFormStatus();
  const { resetSubmissionState } = useSubmissionActions();

  const open = isSuccess || isError;
  const severity = isSuccess ? 'success' : 'error';
  const message = isSuccess
    ? (lastSuccessMessage ?? DEFAULT_SUCCESS_MESSAGE)
    : (lastError ?? DEFAULT_ERROR_MESSAGE);

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
