import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';

export default function InsuranceSectionFields() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <BinaryChoiceController<InvestmentFinancingFormData, 'investmentObjectInsuranceDesired'>
        name="investmentObjectInsuranceDesired"
        label={t('form.fields.investmentObjectInsuranceDesired')}
        optional
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'residualDebtInsuranceDesired'>
        name="residualDebtInsuranceDesired"
        label={t('form.fields.residualDebtInsuranceDesired')}
        optional
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'interestHedgingUseful'>
        name="interestHedgingUseful"
        label={t('form.fields.interestHedgingUseful')}
        optional
      />
    </Stack>
  );
}
