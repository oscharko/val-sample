/**
 * SnackbarFeedback — Global form feedback component.
 */

import { Alert, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useSubmissionActions,
  useSubmissionMessage,
  useSubmissionState,
} from '../../hooks/useFormStatus';

export function SnackbarFeedback() {
  const { t } = useTranslation();
  const { isSuccess, isError } = useSubmissionState();
  const { lastError, lastSuccessMessage } = useSubmissionMessage();
  const { resetSubmissionState } = useSubmissionActions();

  const open = isSuccess || isError;
  const severity = isSuccess ? 'success' : 'error';
  const message = isSuccess
    ? (lastSuccessMessage ?? t('submission.successDefault'))
    : (lastError ?? t('snackbar.errorDefault'));

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
