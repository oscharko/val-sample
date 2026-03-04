import {
  useActionState,
  useCallback,
  useEffect,
} from 'react';
import {
  FormProvider,
  useForm,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { defaultValues, SECTION_IDS } from './config/formConfig';
import {
  InvestmentFinancingSchema,
  toDTO,
  type InvestmentFinancingFieldName,
  type InvestmentFinancingFormData,
} from './schema';
import { submitInvestmentFinancing, type ApiResult } from './api';
import type { SubmissionActionState } from './types/formTypes';
import {
  useSubmissionActions,
  useSubmissionState,
} from './hooks/useFormStatus';
import { useSectionVisibility } from './hooks/useSectionVisibility';
import { SnackbarFeedback } from './components/ui/SnackbarFeedback';
import { AssignmentSection } from './components/form/sections/AssignmentSection';
import { InvestmentObjectSection } from './components/form/sections/InvestmentObjectSection';
import { FinancingDemandSection } from './components/form/sections/FinancingDemandSection';
import { OptionalSectionsPanel } from './components/form/sections/OptionalSectionsPanel';
import { InternalNoteField } from './components/form/sections/InternalNoteField';
import { parseServerFieldErrors, countErrorEntries } from './utils/formFieldErrors';
import { INVESTMENT_FINANCING_FIELD_NAMES } from './domain/investmentFinancingFields';



export default function InvestmentFinancingForm() {
  const { isSubmitting, submissionState } = useSubmissionState();
  const {
    startSubmission,
    completeSubmission,
    failSubmission,
    updateValidationSummary,
    setDirty,
    resetSubmissionState,
    resetFormStatus,
  } = useSubmissionActions();

  const { isSectionExpanded, setSection } = useSectionVisibility(SECTION_IDS, false);

  const methods = useForm<InvestmentFinancingFormData>({
    resolver: zodResolver(InvestmentFinancingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    setError,
    reset,
    formState: { isDirty: isFormDirty },
  } = methods;

  const totalFieldCount = INVESTMENT_FINANCING_FIELD_NAMES.length;

  useEffect(() => {
    resetFormStatus();

    return () => {
      resetFormStatus();
    };
  }, [resetFormStatus]);

  useEffect(() => {
    setDirty(isFormDirty);
  }, [isFormDirty, setDirty]);

  useEffect(() => {
    if (submissionState === 'success') {
      reset(defaultValues);
    }
  }, [submissionState, reset]);

  const [, submitAction, isPending] = useActionState<
    SubmissionActionState,
    InvestmentFinancingFormData
  >(
    async (_previousState, formData) => {
      startSubmission();

      const dto = toDTO(formData);
      const result: ApiResult = await submitInvestmentFinancing(dto);

      if (result.success) {
        const message = result.data.message || 'Bedarf erfolgreich angelegt.';
        completeSubmission(message);
        return { status: 'success' as const, message };
      }

      const typedFieldErrors = parseServerFieldErrors(result.error.fieldErrors);
      for (const fieldName of Object.keys(
        typedFieldErrors,
      ) as InvestmentFinancingFieldName[]) {
        const message = typedFieldErrors[fieldName];
        if (!message) {
          continue;
        }

        setError(fieldName, {
          type: 'server',
          message,
        });
      }

      updateValidationSummary({
        total: totalFieldCount,
        errors: Object.keys(typedFieldErrors).length,
      });

      failSubmission(result.error.message);
      return { status: 'error' as const, message: result.error.message };
    },
    { status: 'idle', message: null },
  );

  const formPending = isPending || isSubmitting;

  const onValidSubmit = useCallback(
    (formData: InvestmentFinancingFormData) => {
      if (formPending) {
        return;
      }

      updateValidationSummary({
        total: totalFieldCount,
        errors: 0,
      });
      submitAction(formData);
    },
    [formPending, submitAction, totalFieldCount, updateValidationSummary],
  );

  const onInvalidSubmit = useCallback(
    (invalidErrors: FieldErrors<InvestmentFinancingFormData>) => {
      updateValidationSummary({
        total: totalFieldCount,
        errors: countErrorEntries(invalidErrors),
      });
    },
    [totalFieldCount, updateValidationSummary],
  );

  return (
    <FormProvider {...methods}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <SnackbarFeedback />

        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Bedarf hinzufügen
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'grey.100', color: 'text.secondary' }}>
              <SettingsOutlinedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Bedarf: Investitionsfinanzierung
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ↳ Für “Fuhrpark”
              </Typography>
            </Box>
          </Box>
        </Paper>

        <form
          onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
          noValidate
          aria-busy={formPending}
        >
          <Stack spacing={3}>
            <AssignmentSection />

            <InvestmentObjectSection />

            <FinancingDemandSection />

            <OptionalSectionsPanel
              isSectionExpanded={isSectionExpanded}
              setSection={setSection}
            />

            <InternalNoteField />

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                mt: 1,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                disabled={formPending}
                onClick={() => {
                  reset(defaultValues);
                  resetSubmissionState();
                }}
                sx={{ py: 1.25 }}
              >
                Abbrechen
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={formPending}
                startIcon={formPending ? <CircularProgress size={20} /> : undefined}
                sx={{ py: 1.25 }}
              >
                Bedarf anlegen
              </Button>
            </Box>
          </Stack>
        </form>
      </Container>
    </FormProvider>
  );
}
