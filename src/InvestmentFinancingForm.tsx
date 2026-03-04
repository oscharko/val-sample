/**
 * InvestmentFinancingForm — Main Form Component (V2)
 */

import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  memo,
  useRef,
  type ReactNode,
} from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useWatch,
  type Control,
  type FieldError,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  defaultValues,
  INVESTMENT_OBJECT_OPTIONS,
  PERSON_OPTIONS,
  PURCHASE_PRICE_CAPTURE_OPTIONS,
  SECTION_IDS,
  VAT_RATE_OPTIONS,
} from './config/formConfig';
import {
  InvestmentFinancingSchema,
  toDTO,
  type InvestmentFinancingFormData,
} from './schema';
import { submitInvestmentFinancing, type ApiResult } from './api';
import type { SubmissionActionState } from './types/formTypes';
import {
  useSubmissionActions,
  useSubmissionState,
} from './hooks/useFormStatus';
import { useSectionVisibility } from './hooks/useSectionVisibility';
import { useComputedFormValues } from './hooks/useComputedFormValues';
import { SnackbarFeedback } from './components/ui/SnackbarFeedback';
import { TextFieldController } from './components/form/fields/TextFieldController';
import { CurrencyController } from './components/form/fields/CurrencyController';
import { BinaryChoiceController } from './components/form/fields/BinaryChoiceController';

const INTERNAL_NOTE_MAX_LENGTH = 10000;

const OPTIONAL_ACCORDION_SECTIONS: ReadonlyArray<{
  id: (typeof SECTION_IDS)[number];
  icon: ReactNode;
  title: string;
}> = [
  {
    id: 'timing',
    icon: <EventNoteOutlinedIcon fontSize="small" />,
    title: 'Zeitliche Planung der Investition',
  },
  {
    id: 'modalities',
    icon: <TuneOutlinedIcon fontSize="small" />,
    title: 'Finanzierungsmodalitäten',
  },
  {
    id: 'sustainability',
    icon: <NatureOutlinedIcon fontSize="small" />,
    title: 'Nachhaltigkeit',
  },
  {
    id: 'insurance',
    icon: <ShieldOutlinedIcon fontSize="small" />,
    title: 'Versicherung und Absicherung',
  },
  {
    id: 'tax',
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    title: 'Steuer- und Bilanzoptimierung',
  },
] as const;

const roundToCents = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const areSameCurrencyValue = (
  leftValue: number | undefined,
  rightValue: number | undefined,
): boolean => {
  if (leftValue === undefined && rightValue === undefined) {
    return true;
  }

  if (leftValue === undefined || rightValue === undefined) {
    return false;
  }

  return roundToCents(leftValue) === roundToCents(rightValue);
};

const countErrorEntries = (errors: FieldErrors<InvestmentFinancingFormData>): number => {
  const walk = (node: unknown): number => {
    if (!node || typeof node !== 'object') {
      return 0;
    }

    if ('type' in (node as FieldError)) {
      return 1;
    }

    return Object.values(node).reduce((sum, value) => sum + walk(value), 0);
  };

  return walk(errors);
};

interface SectionTitleProps {
  icon: ReactNode;
  children: ReactNode;
}

const SectionTitle = memo(function SectionTitle({ icon, children }: SectionTitleProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
        {children}
      </Typography>
    </Box>
  );
});

interface OptionalAccordionProps {
  icon: ReactNode;
  title: string;
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  children: ReactNode;
}

const OptionalAccordion = memo(function OptionalAccordion({
  icon,
  title,
  expanded,
  onToggle,
  children,
}: OptionalAccordionProps) {
  return (
    <Accordion
      expanded={expanded}
      onChange={(_event, nextExpanded) => onToggle(nextExpanded)}
      disableGutters
      square
      elevation={0}
      slotProps={{
        transition: {
          unmountOnExit: true,
        },
      }}
      sx={{
        backgroundColor: 'transparent',
        '&::before': { display: 'none' },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            (optional)
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            borderColor: 'divider',
          }}
        >
          {children}
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
});

interface InternalNoteFieldProps {
  control: Control<InvestmentFinancingFormData>;
}

const InternalNoteField = memo(function InternalNoteField({
  control,
}: InternalNoteFieldProps) {
  const internalNote = useWatch({ control, name: 'internalNote' });
  const remainingInternalNoteLength = Math.max(
    INTERNAL_NOTE_MAX_LENGTH - (internalNote?.length ?? 0),
    0,
  );

  return (
    <Box>
      <TextFieldController<InvestmentFinancingFormData, 'internalNote'>
        name="internalNote"
        label="Interner Vermerk (optional)"
        multiline
        minRows={4}
        mapValue={(value) => (value ?? '') as string}
        slotProps={{
          htmlInput: {
            maxLength: INTERNAL_NOTE_MAX_LENGTH,
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ float: 'right' }}>
        {remainingInternalNoteLength}
      </Typography>
    </Box>
  );
});

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
  const purchasePriceCaptureModeLabelId = useId();

  const methods = useForm<InvestmentFinancingFormData>({
    resolver: zodResolver(InvestmentFinancingSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const {
    control,
    handleSubmit,
    setError,
    reset,
    setValue,
    getValues,
    formState: { isDirty: isFormDirty },
  } = methods;

  const {
    purchasePriceLabel,
    vatInfoText,
    operatingResourcesInfoText,
    operatingResourcesSuggestedAmount,
    formattedFinancingDemand,
  } = useComputedFormValues(control);

  const investmentObjectType = useWatch({
    control,
    name: 'investmentObjectType',
  });
  const operatingResourcesRequired = useWatch({
    control,
    name: 'operatingResourcesRequired',
  });
  const operatingResourcesAmount = useWatch({
    control,
    name: 'operatingResourcesAmount',
  });

  const previousOperatingResourcesRequiredRef =
    useRef<InvestmentFinancingFormData['operatingResourcesRequired']>(undefined);
  const lastAutoFilledOperatingResourcesAmountRef = useRef<number | undefined>(
    undefined,
  );
  const totalFieldCount = Object.keys(defaultValues).length;

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

  useEffect(() => {
    if (investmentObjectType !== 'kfz' && getValues('fleetPurchasePlanned') !== undefined) {
      setValue('fleetPurchasePlanned', undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [getValues, investmentObjectType, setValue]);

  useEffect(() => {
    const previousRequired = previousOperatingResourcesRequiredRef.current;
    const currentSuggestedAmount = roundToCents(operatingResourcesSuggestedAmount);

    if (operatingResourcesRequired === 'ja') {
      const wasAutoFilledPreviously = areSameCurrencyValue(
        operatingResourcesAmount,
        lastAutoFilledOperatingResourcesAmountRef.current,
      );

      const shouldApplySuggestion =
        previousRequired !== 'ja' ||
        operatingResourcesAmount === undefined ||
        wasAutoFilledPreviously;

      if (
        shouldApplySuggestion &&
        !areSameCurrencyValue(operatingResourcesAmount, currentSuggestedAmount)
      ) {
        setValue('operatingResourcesAmount', currentSuggestedAmount, {
          shouldValidate: true,
          shouldDirty: previousRequired === 'ja',
        });
      }

      if (shouldApplySuggestion) {
        lastAutoFilledOperatingResourcesAmountRef.current = currentSuggestedAmount;
      }
    }

    if (operatingResourcesRequired !== 'ja') {
      if (
        previousRequired === 'ja' &&
        getValues('operatingResourcesAmount') !== undefined
      ) {
        setValue('operatingResourcesAmount', undefined, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }

      lastAutoFilledOperatingResourcesAmountRef.current = undefined;
    }

    previousOperatingResourcesRequiredRef.current = operatingResourcesRequired;
  }, [
    getValues,
    operatingResourcesAmount,
    operatingResourcesRequired,
    operatingResourcesSuggestedAmount,
    setValue,
  ]);

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

      if (result.error.fieldErrors) {
        for (const [field, message] of Object.entries(result.error.fieldErrors)) {
          setError(field as keyof InvestmentFinancingFormData, {
            type: 'server',
            message,
          });
        }

        updateValidationSummary({
          total: totalFieldCount,
          errors: Object.keys(result.error.fieldErrors).length,
        });
      }

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

        <form onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)} noValidate>
          <Stack spacing={3}>
            <Box>
              <SectionTitle icon={<PersonOutlineIcon />}>Zuordnung des Bedarfs</SectionTitle>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderColor: 'divider', backgroundColor: 'background.paper' }}
              >
                <TextFieldController<InvestmentFinancingFormData, 'person'>
                  name="person"
                  select
                  label="Person"
                >
                  {PERSON_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextFieldController>
              </Paper>
            </Box>

            <Box>
              <SectionTitle icon={<ShoppingCartOutlinedIcon />}>
                Investitionsobjekt
              </SectionTitle>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderColor: 'divider', backgroundColor: 'background.paper' }}
              >
                <Stack spacing={2}>
                  <TextFieldController<InvestmentFinancingFormData, 'investmentObjectName'>
                    name="investmentObjectName"
                    label="Konkrete Bezeichnung des Investitionsobjekts"
                  />

                  <TextFieldController<InvestmentFinancingFormData, 'investmentObjectType'>
                    name="investmentObjectType"
                    select
                    label="Art des Investitionsobjekts"
                    mapValue={(value) => (value ?? '') as string}
                  >
                    <MenuItem value="">
                      <em>Bitte auswählen</em>
                    </MenuItem>
                    {INVESTMENT_OBJECT_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextFieldController>

                  {investmentObjectType === 'kfz' && (
                    <BinaryChoiceController<
                      InvestmentFinancingFormData,
                      'fleetPurchasePlanned'
                    >
                      name="fleetPurchasePlanned"
                      label="Ist die Anschaffung im Rahmen eines Fuhrparks angedacht?"
                      optional
                    />
                  )}

                  <Divider />

                  <BinaryChoiceController<
                    InvestmentFinancingFormData,
                    'expansionInvestment'
                  >
                    name="expansionInvestment"
                    label="Handelt es sich um eine Erweiterungsinvestition?"
                    optional
                  />
                </Stack>
              </Paper>
            </Box>

            <Box>
              <SectionTitle icon={<CalculateOutlinedIcon />}>
                Ermittlung des Finanzierungsbedarfs
              </SectionTitle>

              <Paper
                variant="outlined"
                sx={{ p: 2, borderColor: 'divider', backgroundColor: 'background.paper' }}
              >
                <Stack spacing={2}>
                  <Controller
                    name="purchasePriceCaptureMode"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            py: 1,
                          }}
                        >
                          <FormLabel
                            id={purchasePriceCaptureModeLabelId}
                            sx={{
                              color: 'text.primary',
                              '&.Mui-focused': { color: 'text.primary' },
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <span>Wie soll der Kaufpreis erfasst werden?</span>
                            <InfoOutlinedIcon fontSize="small" color="disabled" />
                          </FormLabel>

                          <RadioGroup
                            row
                            aria-labelledby={purchasePriceCaptureModeLabelId}
                            value={field.value}
                            onChange={(event) => field.onChange(event.target.value)}
                            sx={{ flexShrink: 0 }}
                          >
                            {PURCHASE_PRICE_CAPTURE_OPTIONS.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio size="small" />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      </FormControl>
                    )}
                  />

                  <Alert
                    icon={<InfoOutlinedIcon fontSize="inherit" />}
                    severity="info"
                    sx={{
                      backgroundColor: 'grey.100',
                      color: 'text.primary',
                      '& .MuiAlert-icon': { color: 'text.secondary' },
                    }}
                  >
                    {vatInfoText}
                  </Alert>

                  <CurrencyController<InvestmentFinancingFormData, 'purchasePrice'>
                    name="purchasePrice"
                    label={purchasePriceLabel}
                  />

                  <TextFieldController<InvestmentFinancingFormData, 'vatRate'>
                    name="vatRate"
                    select
                    label="Anfallender MwSt.-Satz bei Kauf"
                  >
                    {VAT_RATE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextFieldController>

                  <CurrencyController<InvestmentFinancingFormData, 'additionalCosts'>
                    name="additionalCosts"
                    label="Höhe der Nebenkosten (Brutto) (optional)"
                  />

                  <Divider />

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      Finanzierungsbedarf des Investitionsobjekts
                    </Typography>
                    <Chip
                      label={formattedFinancingDemand}
                      sx={{
                        color: 'common.white',
                        backgroundColor: 'grey.700',
                        fontWeight: 700,
                        fontSize: '1rem',
                        px: 0.5,
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  mt: 2,
                }}
              >
                <Stack spacing={2}>
                  <BinaryChoiceController<
                    InvestmentFinancingFormData,
                    'operatingResourcesRequired'
                  >
                    name="operatingResourcesRequired"
                    label="Sind zusätzliche Betriebsmittel erforderlich?"
                  />

                  {operatingResourcesRequired === 'ja' && (
                    <>
                      <CurrencyController<
                        InvestmentFinancingFormData,
                        'operatingResourcesAmount'
                      >
                        name="operatingResourcesAmount"
                        label="Höhe der Betriebsmittel"
                      />

                      <Alert
                        icon={<InfoOutlinedIcon fontSize="inherit" />}
                        severity="info"
                        sx={{
                          backgroundColor: 'grey.100',
                          color: 'text.primary',
                          '& .MuiAlert-icon': { color: 'text.secondary' },
                        }}
                      >
                        <Typography variant="body2">
                          {operatingResourcesInfoText}
                        </Typography>
                        <Typography variant="body2">
                          Für die Betriebsmittel wird ein separater Bedarf angelegt.
                        </Typography>
                      </Alert>
                    </>
                  )}
                </Stack>
              </Paper>
            </Box>

            <Box>
              {OPTIONAL_ACCORDION_SECTIONS.map((section) => (
                <OptionalAccordion
                  key={section.id}
                  icon={section.icon}
                  title={section.title}
                  expanded={isSectionExpanded(section.id)}
                  onToggle={(expanded) => setSection(section.id, expanded)}
                >
                  {section.id === 'timing' && (
                    <Stack spacing={2}>
                      <TextFieldController<
                        InvestmentFinancingFormData,
                        'acquisitionDate'
                      >
                        name="acquisitionDate"
                        label="Datum der Anschaffung (optional)"
                        type="date"
                        mapValue={(value) => (value ?? '') as string}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />

                      <TextFieldController<
                        InvestmentFinancingFormData,
                        'purchasePaymentDate'
                      >
                        name="purchasePaymentDate"
                        label="Datum der Kaufpreiszahlung (optional)"
                        type="date"
                        mapValue={(value) => (value ?? '') as string}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />

                      <CurrencyController<
                        InvestmentFinancingFormData,
                        'plannedUsefulLifeMonths'
                      >
                        name="plannedUsefulLifeMonths"
                        label="Geplante Nutzungsdauer in Monaten (optional)"
                        decimalScale={0}
                        endAdornmentText=""
                      />
                    </Stack>
                  )}

                  {section.id === 'modalities' && (
                    <Stack spacing={2}>
                      <CurrencyController<
                        InvestmentFinancingFormData,
                        'targetDesiredRate'
                      >
                        name="targetDesiredRate"
                        label="Angestrebte Wunschrate (optional)"
                      />

                      <CurrencyController<
                        InvestmentFinancingFormData,
                        'plannedFinancingDurationMonths'
                      >
                        name="plannedFinancingDurationMonths"
                        label="Geplante Finanzierungsdauer (optional)"
                        decimalScale={0}
                        endAdornmentText=""
                      />

                      <BinaryChoiceController<
                        InvestmentFinancingFormData,
                        'flexibilityImportant'
                      >
                        name="flexibilityImportant"
                        label="Ist Flexibilität wichtig?"
                        optional
                      />

                      <CurrencyController<
                        InvestmentFinancingFormData,
                        'desiredSpecialRepaymentPercent'
                      >
                        name="desiredSpecialRepaymentPercent"
                        label="Gewünschte Sondertilgung (optional)"
                        endAdornmentText="%"
                      />

                      <BinaryChoiceController<
                        InvestmentFinancingFormData,
                        'revolvingCreditPlanned'
                      >
                        name="revolvingCreditPlanned"
                        label="Ist eine zusätzliche revolvierende Inanspruchnahme geplant?"
                        optional
                      />

                      <CurrencyController<
                        InvestmentFinancingFormData,
                        'additionalNeedAmount'
                      >
                        name="additionalNeedAmount"
                        label="Zusätzlicher Bedarf (optional)"
                      />
                    </Stack>
                  )}

                  {section.id === 'sustainability' && (
                    <Stack spacing={2}>
                      <BinaryChoiceController<
                        InvestmentFinancingFormData,
                        'sustainabilityCriteriaFulfilled'
                      >
                        name="sustainabilityCriteriaFulfilled"
                        label="Könnte das Investitionsobjekt Nachhaltigkeitskriterien erfüllen?"
                        optional
                      />
                    </Stack>
                  )}

                  {section.id === 'insurance' && (
                    <Stack spacing={2}>
                      <BinaryChoiceController<
                        InvestmentFinancingFormData,
                        'investmentObjectInsuranceDesired'
                      >
                        name="investmentObjectInsuranceDesired"
                        label="Ist eine Versicherung des Investitionsobjekts gewünscht?"
                        optional
                      />

                      <BinaryChoiceController<
                        InvestmentFinancingFormData,
                        'residualDebtInsuranceDesired'
                      >
                        name="residualDebtInsuranceDesired"
                        label="Ist eine Restkreditversicherung gewünscht?"
                        optional
                      />

                      <BinaryChoiceController<
                        InvestmentFinancingFormData,
                        'interestHedgingUseful'
                      >
                        name="interestHedgingUseful"
                        label="Ist eine Zinssicherung sinnvoll?"
                        optional
                      />
                    </Stack>
                  )}

                  {section.id === 'tax' && (
                    <Stack spacing={2}>
                      <BinaryChoiceController<
                        InvestmentFinancingFormData,
                        'taxOptimizedBalanceNeutralDesired'
                      >
                        name="taxOptimizedBalanceNeutralDesired"
                        label="Soll steueroptimiert bzw. bilanziell neutral finanziert werden?"
                        optional
                      />
                    </Stack>
                  )}
                </OptionalAccordion>
              ))}
            </Box>

            <InternalNoteField control={control} />

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
