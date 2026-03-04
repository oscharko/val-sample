import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { CurrencyController } from '../../fields/CurrencyController';
import { TextFieldController } from '../../fields/TextFieldController';

export default function TimingSectionFields() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <TextFieldController<InvestmentFinancingFormData, 'acquisitionDate'>
        name="acquisitionDate"
        label={t('form.fields.acquisitionDate')}
        type="date"
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextFieldController<InvestmentFinancingFormData, 'purchasePaymentDate'>
        name="purchasePaymentDate"
        label={t('form.fields.purchasePaymentDate')}
        type="date"
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <CurrencyController<InvestmentFinancingFormData, 'plannedUsefulLifeMonths'>
        name="plannedUsefulLifeMonths"
        label={t('form.fields.plannedUsefulLifeMonths')}
        decimalScale={0}
        endAdornmentText=""
      />
    </Stack>
  );
}
