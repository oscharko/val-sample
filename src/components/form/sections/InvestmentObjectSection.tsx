import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Box, Divider, MenuItem, Paper, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { INVESTMENT_OBJECT_OPTIONS } from '../../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../../schema';
import { BinaryChoiceController } from '../fields/BinaryChoiceController';
import { TextFieldController } from '../fields/TextFieldController';
import { SectionTitle } from '../layout/SectionTitle';

const getInvestmentObjectTypeLabel = (
  optionValue: (typeof INVESTMENT_OBJECT_OPTIONS)[number]['value'],
  translate: ReturnType<typeof useTranslation>['t'],
): string => {
  switch (optionValue) {
    case 'kfz':
      return translate('form.options.investmentObjectType.kfz');
    case 'maschine':
      return translate('form.options.investmentObjectType.maschine');
    case 'it':
      return translate('form.options.investmentObjectType.it');
    case 'immobilie':
      return translate('form.options.investmentObjectType.immobilie');
    case 'sonstiges':
      return translate('form.options.investmentObjectType.sonstiges');
    default:
      return optionValue;
  }
};

export function InvestmentObjectSection() {
  const { t } = useTranslation();
  const { control, getValues, setValue } = useFormContext<InvestmentFinancingFormData>();

  const investmentObjectType = useWatch({
    control,
    name: 'investmentObjectType',
  });

  useEffect(() => {
    if (investmentObjectType !== 'kfz' && getValues('fleetPurchasePlanned') !== undefined) {
      setValue('fleetPurchasePlanned', undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [getValues, investmentObjectType, setValue]);

  return (
    <Box>
      <SectionTitle icon={<ShoppingCartOutlinedIcon />}>
        {t('form.sections.investmentObject')}
      </SectionTitle>
      <Paper
        variant="outlined"
        sx={{ p: 2, borderColor: 'divider', backgroundColor: 'background.paper' }}
      >
        <Stack spacing={2}>
          <TextFieldController<InvestmentFinancingFormData, 'investmentObjectName'>
            name="investmentObjectName"
            label={t('form.fields.investmentObjectName')}
            required
          />

          <TextFieldController<InvestmentFinancingFormData, 'investmentObjectType'>
            name="investmentObjectType"
            select
            label={t('form.fields.investmentObjectType')}
            required
          >
            <MenuItem value="">
              <em>{t('form.options.selectPlaceholder')}</em>
            </MenuItem>
            {INVESTMENT_OBJECT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {getInvestmentObjectTypeLabel(option.value, t)}
              </MenuItem>
            ))}
          </TextFieldController>

          {investmentObjectType === 'kfz' && (
            <BinaryChoiceController<InvestmentFinancingFormData, 'fleetPurchasePlanned'>
              name="fleetPurchasePlanned"
              label={t('form.fields.fleetPurchasePlanned')}
              optional
            />
          )}

          <Divider />

          <BinaryChoiceController<InvestmentFinancingFormData, 'expansionInvestment'>
            name="expansionInvestment"
            label={t('form.fields.expansionInvestment')}
            optional
          />
        </Stack>
      </Paper>
    </Box>
  );
}
