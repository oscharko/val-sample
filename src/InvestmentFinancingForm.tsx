import { useEffect, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';

import { defaultValues, SECTION_IDS } from './config/formConfig';
import {
  createInvestmentFinancingSchema,
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
import { LanguageSwitcher } from './components/system/LanguageSwitcher';
import { FormStatusProvider } from './stores/formStatusContext';

function InvestmentFinancingFormContent() {
  const { t, i18n } = useTranslation();
  const { submissionState } = useSubmissionState();
  const { setDirty, resetSubmissionState } = useSubmissionActions();

  const { isSectionExpanded, setSection } = useSectionVisibility(SECTION_IDS, false);

  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;

  const validationSchema = useMemo(() => {
    const fixedTranslation = i18n.getFixedT(activeLanguage);

    return createInvestmentFinancingSchema({
      translate: (key, options) => {
        const translated = fixedTranslation(key as never, options as never);
        if (typeof translated === 'string') {
          return translated;
        }

        return key;
      },
    });
  }, [activeLanguage, i18n]);

  const methods = useForm<InvestmentFinancingFormData>({
    resolver: zodResolver(validationSchema),
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

        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('form.pageTitle')}
          </Typography>
          <LanguageSwitcher />
        </Box>

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
                {t('form.contextCard.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('form.contextCard.subtitle')}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <form
          onSubmit={(event) => {
            void handleSubmit(onValidSubmit, onInvalidSubmit)(event);
          }}
          noValidate
          aria-busy={formPending}
          aria-label={t('form.aria.submitLabel')}
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
                {t('form.buttons.cancel')}
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={formPending}
                startIcon={formPending ? <CircularProgress size={20} /> : undefined}
                sx={{ py: 1.25 }}
              >
                {t('form.buttons.submit')}
              </Button>
            </Box>
          </Stack>
        </form>
      </Container>
    </FormProvider>
  );
}

export default function InvestmentFinancingForm() {
  return (
    <FormStatusProvider>
      <InvestmentFinancingFormContent />
    </FormStatusProvider>
  );
}
