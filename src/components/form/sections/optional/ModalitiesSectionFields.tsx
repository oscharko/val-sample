import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';
import { CurrencyController } from '../../fields/CurrencyController';

export default function ModalitiesSectionFields() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <CurrencyController<InvestmentFinancingFormData, 'targetDesiredRate'>
        name="targetDesiredRate"
        label={t('form.fields.targetDesiredRate')}
      />

      <CurrencyController<InvestmentFinancingFormData, 'plannedFinancingDurationMonths'>
        name="plannedFinancingDurationMonths"
        label={t('form.fields.plannedFinancingDurationMonths')}
        decimalScale={0}
        endAdornmentText=""
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'flexibilityImportant'>
        name="flexibilityImportant"
        label={t('form.fields.flexibilityImportant')}
        optional
      />

      <CurrencyController<InvestmentFinancingFormData, 'desiredSpecialRepaymentPercent'>
        name="desiredSpecialRepaymentPercent"
        label={t('form.fields.desiredSpecialRepaymentPercent')}
        endAdornmentText="%"
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'revolvingCreditPlanned'>
        name="revolvingCreditPlanned"
        label={t('form.fields.revolvingCreditPlanned')}
        optional
      />

      <CurrencyController<InvestmentFinancingFormData, 'additionalNeedAmount'>
        name="additionalNeedAmount"
        label={t('form.fields.additionalNeedAmount')}
      />
    </Stack>
  );
}
