/**
 * InvestmentFinancingForm — Main Form Component
 */

import { useCallback, useActionState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { SECTION_IDS, defaultValues } from './config/formConfig';
import {
  InvestmentFinancingSchema,
  toDTO,
  type InvestmentFinancingFormData,
} from './schema';
import { submitInvestmentFinancing, type ApiResult } from './api';
import type { SubmissionActionState } from './types/formTypes';

import {
  useSubmissionState,
  useSubmissionActions,
} from './hooks/useFormStatus';
import { useSectionVisibility } from './hooks/useSectionVisibility';

import { SnackbarFeedback } from './components/ui/SnackbarFeedback';
import { TotalCostChip } from './components/ui/TotalCostChip';
import { SectionBasisdaten } from './components/sections/SectionBasisdaten';
import { SectionKosten } from './components/sections/SectionKosten';
import { SectionZeitpunkt } from './components/sections/SectionZeitpunkt';
import { SectionBetriebsmittel } from './components/sections/SectionBetriebsmittel';
import { SectionNachhaltigkeit } from './components/sections/SectionNachhaltigkeit';

export default function InvestmentFinancingForm() {
  const { isSubmitting, submissionState } = useSubmissionState();
  const {
    startSubmission,
    completeSubmission,
    failSubmission,
    updateValidationSummary,
    setDirty,
  } = useSubmissionActions();

  const {
    isSectionExpanded,
    toggleSection,
    expandAll,
    collapseAll,
    expandedCount,
  } = useSectionVisibility(SECTION_IDS);

  const methods = useForm<InvestmentFinancingFormData>({
    resolver: zodResolver(InvestmentFinancingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty: formIsDirty },
  } = methods;

  useEffect(() => {
    setDirty(formIsDirty);
  }, [formIsDirty, setDirty]);

  useEffect(() => {
    if (submissionState === 'success') {
      reset(defaultValues);
    }
  }, [submissionState, reset]);

  const [, submitAction, isPending] = useActionState<
    SubmissionActionState,
    InvestmentFinancingFormData
  >(
    async (_prevState, data) => {
      startSubmission();
      const dto = toDTO(data);
      const result: ApiResult = await submitInvestmentFinancing(dto);

      if (result.success) {
        const message = result.data.message || 'Bedarf erfolgreich angelegt.';
        completeSubmission(message);
        return { status: 'success' as const, message };
      }

      if (result.error.fieldErrors) {
        for (const [field, message] of Object.entries(result.error.fieldErrors)) {
          setError(field as keyof InvestmentFinancingFormData, {
            type: 'server',
            message,
          });
        }
      }

      failSubmission(result.error.message);
      return { status: 'error' as const, message: result.error.message };
    },
    { status: 'idle', message: null },
  );

  const formPending = isPending || isSubmitting;

  const onSubmit = useCallback(
    (data: InvestmentFinancingFormData) => {
      if (formPending) {
        return;
      }

      updateValidationSummary(Object.keys(errors).length);
      submitAction(data);
    },
    [errors, formPending, submitAction, updateValidationSummary],
  );

  return (
    <FormProvider {...methods}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <SnackbarFeedback />

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Neuen Bedarf hinzufügen
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2.5,
            mb: 4,
            borderColor: '#e0e0e0',
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Investitionsfinanzierung
          </Typography>
          <TotalCostChip />
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
          <Tooltip title="Alle Sektionen aufklappen">
            <Button
              size="small"
              variant="text"
              onClick={expandAll}
              startIcon={<ExpandMoreIcon />}
            >
              Alle öffnen
            </Button>
          </Tooltip>
          <Tooltip title="Alle Sektionen zuklappen">
            <Button
              size="small"
              variant="text"
              onClick={collapseAll}
              startIcon={<ExpandLessIcon />}
            >
              Alle schließen ({expandedCount}/{SECTION_IDS.length})
            </Button>
          </Tooltip>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <SectionBasisdaten
              expanded={isSectionExpanded('basisdaten')}
              onToggle={() => toggleSection('basisdaten')}
            />
            <Divider />
            <SectionKosten
              expanded={isSectionExpanded('kosten')}
              onToggle={() => toggleSection('kosten')}
            />
            <Divider />
            <SectionZeitpunkt
              expanded={isSectionExpanded('zeitpunkt')}
              onToggle={() => toggleSection('zeitpunkt')}
            />
            <Divider />
            <SectionBetriebsmittel
              expanded={isSectionExpanded('betriebsmittel')}
              onToggle={() => toggleSection('betriebsmittel')}
            />
            <Divider />
            <SectionNachhaltigkeit
              expanded={isSectionExpanded('nachhaltigkeit')}
              onToggle={() => toggleSection('nachhaltigkeit')}
            />
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="outlined" disabled={formPending}>
              Zurück
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formPending}
              startIcon={formPending ? <CircularProgress size={20} /> : undefined}
            >
              Weiter mit den Finanzierungsdaten
            </Button>
          </Box>
        </form>
      </Container>
    </FormProvider>
  );
}
