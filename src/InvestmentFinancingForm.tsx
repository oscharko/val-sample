/**
 * InvestmentFinancingForm — Main Form Component
 *
 * Refactored to use the Micro State Management patterns from
 * "Micro State Management with React Hooks" (Daishi Kato).
 *
 * State architecture (following the book's micro state principle):
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  Form Field State (React Hook Form + Zod v4)            │
 *  │  → Field values, field-level validation, field errors    │
 *  │  → "Form state should be treated separately" (Ch. 1)    │
 *  ├─────────────────────────────────────────────────────────┤
 *  │  Global Form Status (formStatusStore — Ch. 4 Module)     │
 *  │  → Submission lifecycle, validation summary, dirty flag  │
 *  │  → Accessed via useFormStatus() / useSubmissionActions() │
 *  ├─────────────────────────────────────────────────────────┤
 *  │  UI State (useSectionVisibility — Ch. 2 Local)           │
 *  │  → Section expand/collapse, accordion state              │
 *  │  → useReducer-based, component-scoped                    │
 *  ├─────────────────────────────────────────────────────────┤
 *  │  Derived State (useComputedFormValues — Ch. 1 Custom)    │
 *  │  → Total cost, VAT, conditional visibility               │
 *  │  → Memoized from watched fields                          │
 *  └─────────────────────────────────────────────────────────┘
 */

import { useCallback, useActionState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {
  InvestmentFinancingSchema,
  toDTO,
  type InvestmentFinancingFormData,
} from './schema';
import { submitInvestmentFinancing, type ApiResult } from './api';

// ─── Micro State Management Hooks (Book patterns) ──────────────────
import { useFormStatus, useSubmissionActions } from './hooks/useFormStatus';
import { useSectionVisibility } from './hooks/useSectionVisibility';
import { useComputedFormValues } from './hooks/useComputedFormValues';

/* ------------------------------------------------------------------ */
/*  Section identifiers (stable configuration)                        */
/* ------------------------------------------------------------------ */

/**
 * Section IDs for the collapsible form sections.
 * Defined as a const array outside the component (Ch. 1 pattern:
 * "define constants outside hooks for stability").
 */
const SECTION_IDS = [
  'basisdaten',
  'kosten',
  'zeitpunkt',
  'betriebsmittel',
  'nachhaltigkeit',
] as const;

/* ------------------------------------------------------------------ */
/*  Default values                                                    */
/* ------------------------------------------------------------------ */

const defaultValues: InvestmentFinancingFormData = {
  person: '',
  financingObjectName: '',
  financingObjectCategory: 'kfz',
  fleetPurchase: 'nein',
  expansionInvestment: 'nein',
  grossPrice: false,
  netPurchasePrice: 0,
  additionalCosts: 0,
  vatDeductible: 'ja',
  vatRate: '19',
  purchaseDate: '2026-02-01',
  paymentDate: '2026-02-01',
  usefulLifeYears: undefined,
  operatingResourcesNeeded: 'ja',
  operatingResourcesAmount: undefined,
  operatingResourcesType: undefined,
  esgCompliant: 'ja',
};

/* ------------------------------------------------------------------ */
/*  Helper: TriStateRadio                                             */
/* ------------------------------------------------------------------ */

interface TriStateRadioProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  includeUnklar?: boolean;
}

function TriStateRadio({
  label,
  value,
  onChange,
  error,
  helperText,
  includeUnklar = true,
}: TriStateRadioProps) {
  return (
    <FormControl error={error} fullWidth>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 0,
        }}
      >
        <FormLabel
          sx={{
            flex: 1,
            color: 'text.primary',
            '&.Mui-focused': { color: 'text.primary' },
          }}
        >
          {label}
        </FormLabel>
        <RadioGroup
          row
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ flexShrink: 0 }}
        >
          {includeUnklar && (
            <FormControlLabel
              value="unklar"
              control={<Radio size="small" />}
              label="Noch unklar"
            />
          )}
          <FormControlLabel
            value="ja"
            control={<Radio size="small" />}
            label="Ja"
          />
          <FormControlLabel
            value="nein"
            control={<Radio size="small" />}
            label="Nein"
          />
        </RadioGroup>
      </Box>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

/* ------------------------------------------------------------------ */
/*  Category / option labels                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_OPTIONS = [
  { value: 'kfz', label: 'Kfz' },
  { value: 'maschine', label: 'Maschine' },
  { value: 'it', label: 'IT / Software' },
  { value: 'immobilie', label: 'Immobilie' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const;

const VAT_RATE_OPTIONS = [
  { value: '19', label: '19 %' },
  { value: '7', label: '7 %' },
  { value: '0', label: '0 %' },
] as const;

const USEFUL_LIFE_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} Jahre`,
}));

const PERSON_OPTIONS = [
  { value: 'meyer-tech', label: 'Meyer Technology GmbH' },
  { value: 'schmidt-ag', label: 'Schmidt AG' },
  { value: 'weber-gmbh', label: 'Weber GmbH' },
] as const;

/* ------------------------------------------------------------------ */
/*  Section heading (with expand/collapse)                            */
/* ------------------------------------------------------------------ */

/**
 * Collapsible section heading — integrates with useSectionVisibility.
 * This is a small, reusable UI component following the book's
 * component model principle (Ch. 2).
 */
function SectionHeading({
  children,
  expanded,
  onToggle,
}: {
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Box
      component={onToggle ? 'button' : 'div'}
      type={onToggle ? 'button' : undefined}
      onClick={onToggle}
      aria-expanded={onToggle ? expanded : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: 'none',
        border: 'none',
        p: 0,
        cursor: onToggle ? 'pointer' : 'default',
        textAlign: 'left',
        color: 'inherit',
        font: 'inherit',
        '&:focus-visible': {
          outline: '2px solid primary.main',
          outlineOffset: '2px',
        },
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, mt: 1, mb: 0.5, color: 'text.primary', flexGrow: 1 }}
      >
        {children}
      </Typography>
      {onToggle && (
        <IconButton
          component="div" // Avoid nested button
          size="small"
          aria-hidden="true" // Decorative icon, button handles semantics
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  SnackbarFeedback — reads from formStatusStore directly            */
/* ------------------------------------------------------------------ */

/**
 * Snackbar component that subscribes to the global form status store.
 *
 * Book pattern (Ch. 4): "A component using a module state directly."
 * This component is decoupled from the form — it can be placed
 * anywhere in the tree and will react to submission status changes.
 */
function SnackbarFeedback() {
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

/* ------------------------------------------------------------------ */
/*  useActionState submission type                                    */
/* ------------------------------------------------------------------ */

/**
 * State type for React 19's useActionState.
 * Replaces the previous useTransition + manual state pattern.
 */
type SubmissionActionState = {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string | null;
};

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function InvestmentFinancingForm() {
  // ─── Micro State: Form Status (Ch. 4 Module State) ──────────────
  const { isSubmitting, submissionState } = useFormStatus();
  const {
    startSubmission,
    completeSubmission,
    failSubmission,
    updateValidationSummary,
    setDirty,
  } = useSubmissionActions();

  // ─── Micro State: Section Visibility (Ch. 2 Local State) ────────
  const {
    isSectionExpanded,
    toggleSection,
    expandAll,
    collapseAll,
    expandedCount,
  } = useSectionVisibility(SECTION_IDS);

  // ─── Form Field State (React Hook Form + Zod — kept separate) ───
  const {
    control,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isDirty: formIsDirty },
  } = useForm<InvestmentFinancingFormData>({
    resolver: zodResolver(InvestmentFinancingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  // ─── Reset form on success ───────────────────────────────────────
  // (Syncs React Hook Form with global status)
  useEffect(() => {
    if (submissionState === 'success') {
      reset(defaultValues);
      setDirty(false); // Ensure global dirty state is also reset
    }
  }, [submissionState, reset, setDirty]);

  // ─── Micro State: Derived Values (Ch. 1 Custom Hook) ────────────
  const {
    showOperatingResources,
    formattedTotalCost,
  } = useComputedFormValues(watch);

  // ─── Sync dirty state to global store ────────────────────────────
  // (Bridges React Hook Form's local dirty state to the global store)
  if (formIsDirty) {
    setDirty(true);
  }

  // ─── React 19: useActionState for submission ─────────────────────
  /**
   * useActionState replaces the previous useTransition + useState pattern.
   * It provides a built-in state machine for async form actions,
   * automatically managing pending states.
   *
   * This goes beyond the book (published pre-React 19) but follows
   * the same micro state principle: purpose-specific state for
   * the submission lifecycle.
   */
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

      // Map server field-level errors back into React Hook Form
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

  // ─── Form submission handler ─────────────────────────────────────
  const onSubmit = useCallback(
    (data: InvestmentFinancingFormData) => {
      // Update validation summary before submission
      const errorCount = Object.keys(errors).length;
      updateValidationSummary(errorCount);
      // Dispatch through useActionState
      submitAction(data);
    },
    [errors, updateValidationSummary, submitAction],
  );

  // Combined pending state (from useActionState or global store)
  const formPending = isPending || isSubmitting;

  /* ─── Render ──────────────────────────────────────────────────── */

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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

        {/* ── Cost summary chip (derived state) ─────────────────── */}
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

      {/* ── Form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          {/* ── Basisdaten ─────────────────────────────────────── */}
          <SectionHeading
            expanded={isSectionExpanded('basisdaten')}
            onToggle={() => toggleSection('basisdaten')}
          >
            Legen Sie die Basisdaten fest
          </SectionHeading>

          <Collapse in={isSectionExpanded('basisdaten')}>
            <Stack spacing={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Wem soll der Bedarf zugeordnet werden?
              </Typography>

              <Controller
                name="person"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Person"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {PERSON_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Finanzierungsobjekt
              </Typography>

              <Controller
                name="financingObjectName"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Name des Finanzierungsobjektes"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="financingObjectCategory"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Kategorie des Finanzierungsobjektes"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="fleetPurchase"
                control={control}
                render={({ field, fieldState }) => (
                  <TriStateRadio
                    label="Ist die Anschaffung im Rahmen eines Fuhrparks angedacht?"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="expansionInvestment"
                control={control}
                render={({ field, fieldState }) => (
                  <TriStateRadio
                    label="Handelt es sich um eine Erweiterungsinvestition?"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    includeUnklar={false}
                  />
                )}
              />

              {/* Bruttokaufpreis toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Controller
                  name="grossPrice"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          size="small"
                        />
                      }
                      label="Bruttokaufpreis"
                      labelPlacement="start"
                      sx={{ mr: 0, gap: 1 }}
                    />
                  )}
                />
              </Box>
            </Stack>
          </Collapse>

          <Divider />

          {/* ── Kosten ────────────────────────────────────────── */}
          <SectionHeading
            expanded={isSectionExpanded('kosten')}
            onToggle={() => toggleSection('kosten')}
          >
            Kosten
          </SectionHeading>

          <Collapse in={isSectionExpanded('kosten')}>
            <Stack spacing={3}>
              <Controller
                name="netPurchasePrice"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Nettokaufpreis"
                    type="number"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      },
                      htmlInput: { step: '0.01', min: '0' },
                    }}
                  />
                )}
              />

              <Controller
                name="additionalCosts"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Nebenkosten"
                    type="number"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      },
                      htmlInput: { step: '0.01', min: '0' },
                    }}
                  />
                )}
              />

              <Controller
                name="vatDeductible"
                control={control}
                render={({ field, fieldState }) => (
                  <TriStateRadio
                    label="Ist der Kreditnehmer vorsteuerabzugsberechtigt?"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    includeUnklar={false}
                  />
                )}
              />

              <Controller
                name="vatRate"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="MwST.-Satz"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {VAT_RATE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
          </Collapse>

          <Divider />

          {/* ── Zeitpunkt ──────────────────────────────────────── */}
          <SectionHeading
            expanded={isSectionExpanded('zeitpunkt')}
            onToggle={() => toggleSection('zeitpunkt')}
          >
            Zeitpunkt der Anschaffung und Nutzungsdauer
          </SectionHeading>

          <Collapse in={isSectionExpanded('zeitpunkt')}>
            <Stack spacing={3}>
              <Controller
                name="purchaseDate"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Datum der Anschaffung"
                    type="date"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarTodayIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: { shrink: true },
                    }}
                  />
                )}
              />

              <Controller
                name="paymentDate"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Datum der Kaufpreiszahlung"
                    type="date"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarTodayIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: { shrink: true },
                    }}
                  />
                )}
              />

              <Controller
                name="usefulLifeYears"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    select
                    label="Nutzungsdauer in Jahren (optional)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="">
                      <em>– Keine Auswahl –</em>
                    </MenuItem>
                    {USEFUL_LIFE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
          </Collapse>

          <Divider />

          {/* ── Betriebsmittelbedarf ───────────────────────────── */}
          <SectionHeading
            expanded={isSectionExpanded('betriebsmittel')}
            onToggle={() => toggleSection('betriebsmittel')}
          >
            Betriebsmittelbedarf
          </SectionHeading>

          <Collapse in={isSectionExpanded('betriebsmittel')}>
            <Stack spacing={3}>
              <Controller
                name="operatingResourcesNeeded"
                control={control}
                render={({ field, fieldState }) => (
                  <TriStateRadio
                    label="Führt die Investition zu einem zusätzlichen Betriebsmittelbedarf?"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              {/* Conditional fields — visibility from useComputedFormValues */}
              {showOperatingResources && (
                <>
                  <Controller
                    name="operatingResourcesAmount"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Betrag des Betriebsmittels"
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : parseFloat(e.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">€</InputAdornment>
                            ),
                          },
                          htmlInput: { step: '0.01', min: '0' },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="operatingResourcesType"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        select
                        label="Betriebsmittelart"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      >
                        <MenuItem value="umlaufvermoegen">Umlaufvermögen</MenuItem>
                        <MenuItem value="anlagevermoegen">Anlagevermögen</MenuItem>
                      </TextField>
                    )}
                  />
                </>
              )}
            </Stack>
          </Collapse>

          <Divider />

          {/* ── Nachhaltigkeit ─────────────────────────────────── */}
          <SectionHeading
            expanded={isSectionExpanded('nachhaltigkeit')}
            onToggle={() => toggleSection('nachhaltigkeit')}
          >
            Nachhaltigkeit
          </SectionHeading>

          <Collapse in={isSectionExpanded('nachhaltigkeit')}>
            <Stack spacing={3}>
              <Controller
                name="esgCompliant"
                control={control}
                render={({ field, fieldState }) => (
                  <TriStateRadio
                    label="Wird das Objekt nach ESG-Kriterien beschafft oder genutzt?"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Stack>
          </Collapse>

          <Divider />

          {/* ── Action buttons ─────────────────────────────────── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              pt: 2,
              pb: 4,
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              sx={{ minWidth: 180 }}
              disabled={formPending}
            >
              Zurück
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ minWidth: 300 }}
              disabled={formPending}
              startIcon={
                formPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {formPending
                ? 'Wird gesendet…'
                : 'Weiter mit den Finanzierungsdaten'}
            </Button>
          </Box>
        </Stack>
      </form>

      {/* ── Snackbar feedback (reads from global formStatusStore) ── */}
      <SnackbarFeedback />
    </Container>
  );
}
