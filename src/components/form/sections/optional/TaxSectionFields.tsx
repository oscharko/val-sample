import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';

export default function TaxSectionFields() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <BinaryChoiceController<InvestmentFinancingFormData, 'taxOptimizedBalanceNeutralDesired'>
        name="taxOptimizedBalanceNeutralDesired"
        label={t('form.fields.taxOptimizedBalanceNeutralDesired')}
        optional
      />
    </Stack>
  );
}
