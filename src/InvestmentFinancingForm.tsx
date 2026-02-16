/**
 * InvestmentFinancingForm — Main Form Component
 *
 * Refactored to reuse extracted components and focusing on orchestration.
 * Maintains the Micro State Management architecture:
 * - Form Data: React Hook Form (via FormProvider)
 * - Global Status: useFormStatus
 * - UI State: useSectionVisibility
 * - Derived: useComputedFormValues
 *
 * Reduced from ~980 lines to ~220 lines.
 */

import { useCallback, useActionState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Chip,
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

// Config & Types
import { SECTION_IDS, defaultValues } from './config/formConfig';
import { InvestmentFinancingSchema, toDTO, type InvestmentFinancingFormData } from './schema';
import { submitInvestmentFinancing, type ApiResult } from './api';
import type { SubmissionActionState } from './types/formTypes';

// Micro State Hooks
import { useFormStatus, useSubmissionActions } from './hooks/useFormStatus';
import { useSectionVisibility } from './hooks/useSectionVisibility';
import { useComputedFormValues } from './hooks/useComputedFormValues';

// Extracted Components
import { SnackbarFeedback } from './components/ui/SnackbarFeedback';
import { SectionBasisdaten } from './components/sections/SectionBasisdaten';
import { SectionKosten } from './components/sections/SectionKosten';
import { SectionZeitpunkt } from './components/sections/SectionZeitpunkt';
import { SectionBetriebsmittel } from './components/sections/SectionBetriebsmittel';
import { SectionNachhaltigkeit } from './components/sections/SectionNachhaltigkeit';

export default function InvestmentFinancingForm() {
  // ─── Micro State: Form Status ────────────────────────────────────
  const { isSubmitting, submissionState } = useFormStatus();
  const {
    startSubmission,
    completeSubmission,
    failSubmission,
    updateValidationSummary,
    setDirty,
  } = useSubmissionActions();

  // ─── Micro State: Section Visibility ─────────────────────────────
  const {
    isSectionExpanded,
    toggleSection,
    expandAll,
    collapseAll,
    expandedCount,
  } = useSectionVisibility(SECTION_IDS);

  // ─── Form Field State (React Hook Form) ──────────────────────────
  const methods = useForm<InvestmentFinancingFormData>({
    resolver: zodResolver(InvestmentFinancingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isDirty: formIsDirty },
  } = methods;

  // ─── Micro State: Derived Values ─────────────────────────────────
  const { formattedTotalCost } = useComputedFormValues(watch);

  // ─── Sync dirty state & Reset on success ─────────────────────────
  if (formIsDirty) setDirty(true);

  useEffect(() => {
    if (submissionState === 'success') {
      reset(defaultValues);
      setDirty(false);
    }
  }, [submissionState, reset, setDirty]);

  // ─── React 19: useActionState ────────────────────────────────────
  const [, submitAction, isPending] = useActionState<
    SubmissionActionState,
    InvestmentFinancingFormData
  >(
    async (_prevState, data) => {
      startSubmission();
      const dto = toDTO(data);
      const result: ApiResult = await submitInvestmentFinancing(dto);

      if (result.success) {
        const msg = result.data.message || 'Bedarf erfolgreich angelegt.';
        completeSubmission(msg);
        return { status: 'success' as const, message: msg };
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

  const onSubmit = useCallback(
    (data: InvestmentFinancingFormData) => {
      updateValidationSummary(Object.keys(errors).length);
      submitAction(data);
    },
    [errors, updateValidationSummary, submitAction],
  );

  const formPending = isPending || isSubmitting;

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Tooltip title="Globaler Feedback">
        {/* Placeholder wrapper just to satisfy TS if needed, logic is inside component */}
        <Box />
      </Tooltip>
      <SnackbarFeedback />

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Neuen Bedarf hinzufügen
      </Typography>

      {/* ── Category card ────────────────────────────────────────── */}
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

        <Chip
          label={`Gesamt: ${formattedTotalCost}`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ ml: 'auto' }}
        />
      </Paper>

      {/* ── Section controls ─────────────────────────────────────── */}
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

      {/* ── Form with Provider ───────────────────────────────────── */}
      <FormProvider {...methods}>
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

          {/* ── Action buttons ───────────────────────────────────── */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="outlined" disabled={formPending}>
              Zurück
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formPending}
              startIcon={formPending ? <CircularProgress size={20} /> : undefined}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                color: 'white',
              }}
            >
              Weiter mit den Finanzierungsdaten
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Container>
  );
}
