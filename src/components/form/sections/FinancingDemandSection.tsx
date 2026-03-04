import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Chip,
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
import { useId } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PURCHASE_PRICE_CAPTURE_OPTIONS, VAT_RATE_OPTIONS } from '../../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../../schema';
import { useComputedFormValues } from '../../../hooks/useComputedFormValues';
import { useOperatingResourcesAutoFill } from '../../../hooks/useOperatingResourcesAutoFill';
import { formatPercent } from '../../../i18n/formatters';
import { useLocale } from '../../../i18n/useLocale';
import { BinaryChoiceController } from '../fields/BinaryChoiceController';
import { CurrencyController } from '../fields/CurrencyController';
import { TextFieldController } from '../fields/TextFieldController';
import { SectionTitle } from '../layout/SectionTitle';

export function FinancingDemandSection() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { control } = useFormContext<InvestmentFinancingFormData>();
  const purchasePriceCaptureModeLabelId = useId();

  const {
    purchasePriceLabel,
    vatInfoText,
    operatingResourcesInfoText,
    operatingResourcesSuggestedAmount,
    formattedFinancingDemand,
  } = useComputedFormValues(control);

  useOperatingResourcesAutoFill(operatingResourcesSuggestedAmount);

  const operatingResourcesRequired = useWatch({
    control,
    name: 'operatingResourcesRequired',
  });

  return (
    <Box>
      <SectionTitle icon={<CalculateOutlinedIcon />}>
        {t('form.sections.financingDemand')}
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
              <FormControl component="fieldset" fullWidth>
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
                    component="legend"
                    id={purchasePriceCaptureModeLabelId}
                    sx={{
                      color: 'text.primary',
                      '&.Mui-focused': { color: 'text.primary' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <span>{t('form.fields.purchasePriceCaptureMode')}</span>
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
                        key={option}
                        value={option}
                        control={<Radio size="small" />}
                        label={
                          option === 'netto'
                            ? t('form.options.purchasePriceCaptureMode.netto')
                            : t('form.options.purchasePriceCaptureMode.brutto')
                        }
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
            required
          />

          <TextFieldController<InvestmentFinancingFormData, 'vatRate'>
            name="vatRate"
            select
            label={t('form.fields.vatRate')}
          >
            {VAT_RATE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {formatPercent({
                  locale,
                  value: Number(option) / 100,
                })}
              </MenuItem>
            ))}
          </TextFieldController>

          <CurrencyController<InvestmentFinancingFormData, 'additionalCosts'>
            name="additionalCosts"
            label={t('form.fields.additionalCosts')}
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
              {t('form.fields.financingDemandAmount')}
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
          <BinaryChoiceController<InvestmentFinancingFormData, 'operatingResourcesRequired'>
            name="operatingResourcesRequired"
            label={t('form.fields.operatingResourcesRequired')}
          />

          {operatingResourcesRequired === 'ja' && (
            <>
              <CurrencyController<InvestmentFinancingFormData, 'operatingResourcesAmount'>
                name="operatingResourcesAmount"
                label={t('form.fields.operatingResourcesAmount')}
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
                <Typography variant="body2">{operatingResourcesInfoText}</Typography>
                <Typography variant="body2">
                  {t('form.fields.separateOperatingResourcesHint')}
                </Typography>
              </Alert>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
