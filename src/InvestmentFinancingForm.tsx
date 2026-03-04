import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
  type InvestmentFinancingFormData,
} from './schema';
import {
  useSubmissionActions,
  useSubmissionState,
} from './hooks/useFormStatus';
import { useSectionVisibility } from './hooks/useSectionVisibility';
import { useInvestmentFinancingSubmission } from './hooks/useInvestmentFinancingSubmission';
import { SnackbarFeedback } from './components/ui/SnackbarFeedback';
import { AssignmentSection } from './components/form/sections/AssignmentSection';
import { InvestmentObjectSection } from './components/form/sections/InvestmentObjectSection';
import { FinancingDemandSection } from './components/form/sections/FinancingDemandSection';
import { OptionalSectionsPanel } from './components/form/sections/OptionalSectionsPanel';
import { InternalNoteField } from './components/form/sections/InternalNoteField';

export default function InvestmentFinancingForm() {
  const { submissionState } = useSubmissionState();
  const { setDirty, resetSubmissionState, resetFormStatus } =
    useSubmissionActions();

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

  const { formPending, onValidSubmit, onInvalidSubmit } =
    useInvestmentFinancingSubmission(setError);

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
          aria-label="Investitionsfinanzierung Bedarf anlegen"
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
