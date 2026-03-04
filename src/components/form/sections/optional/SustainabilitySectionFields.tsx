import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';

export default function SustainabilitySectionFields() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <BinaryChoiceController<InvestmentFinancingFormData, 'sustainabilityCriteriaFulfilled'>
        name="sustainabilityCriteriaFulfilled"
        label={t('form.fields.sustainabilityCriteriaFulfilled')}
        optional
      />
    </Stack>
  );
}
