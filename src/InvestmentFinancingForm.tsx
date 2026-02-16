import { useCallback, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import {
  InvestmentFinancingSchema,
  toDTO,
  type InvestmentFinancingFormData,
} from './schema';
import { submitInvestmentFinancing, type ApiResult } from './api';

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
/*  Category labels                                                   */
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
/*  Section heading                                                   */
/* ------------------------------------------------------------------ */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 700, mt: 1, mb: 0.5, color: 'text.primary' }}
    >
      {children}
    </Typography>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function InvestmentFinancingForm() {
  const [isPending, startTransition] = useTransition();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const {
    control,
    handleSubmit,
    watch,
    setError,
  } = useForm<InvestmentFinancingFormData>({
    resolver: zodResolver(InvestmentFinancingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const operatingResourcesNeeded = watch('operatingResourcesNeeded');
  const showOperatingResources = operatingResourcesNeeded === 'ja';

  /* ─── Submission handler ──────────────────────────────────────── */

  const onSubmit = useCallback(
    (data: InvestmentFinancingFormData) => {
      startTransition(async () => {
        const dto = toDTO(data);
        const result: ApiResult = await submitInvestmentFinancing(dto);

        if (result.success) {
          setSnackbar({
            open: true,
            severity: 'success',
            message: result.data.message || 'Bedarf erfolgreich angelegt.',
          });
        } else {
          // Map server field‐level errors back into the form
          if (result.error.fieldErrors) {
            for (const [field, message] of Object.entries(
              result.error.fieldErrors,
            )) {
              setError(field as keyof InvestmentFinancingFormData, {
                type: 'server',
                message,
              });
            }
          }
          setSnackbar({
            open: true,
            severity: 'error',
            message: result.error.message,
          });
        }
      });
    },
    [setError],
  );

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
      </Paper>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          {/* ── Basisdaten ─────────────────────────────────────── */}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Legen Sie die Basisdaten fest
          </Typography>

          <SectionHeading>
            Wem soll der Bedarf zugeordnet werden?
          </SectionHeading>

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

          {/* ── Finanzierungsobjekt ────────────────────────────── */}
          <SectionHeading>Finanzierungsobjekt</SectionHeading>

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

          <Divider />

          {/* ── Kosten ────────────────────────────────────────── */}
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

          <Divider />

          {/* ── Zeitpunkt ──────────────────────────────────────── */}
          <SectionHeading>
            Zeitpunkt der Anschaffung und Nutzungsdauer
          </SectionHeading>

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

          <Divider />

          {/* ── Betriebsmittelbedarf ───────────────────────────── */}
          <SectionHeading>Betriebsmittelbedarf</SectionHeading>

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

          <Divider />

          {/* ── Nachhaltigkeit ─────────────────────────────────── */}
          <SectionHeading>Nachhaltigkeit</SectionHeading>

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
              disabled={isPending}
            >
              Zurück
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ minWidth: 300 }}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isPending
                ? 'Wird gesendet…'
                : 'Weiter mit den Finanzierungsdaten'}
            </Button>
          </Box>
        </Stack>
      </form>

      {/* ── Snackbar feedback ──────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
