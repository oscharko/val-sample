import { Stack } from '@mui/material';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';
import { CurrencyController } from '../../fields/CurrencyController';

const NO_END_ADORNMENT = '';

export default function ModalitiesSectionFields() {
  return (
    <Stack spacing={2}>
      <CurrencyController<InvestmentFinancingFormData, 'targetDesiredRate'>
        name="targetDesiredRate"
        label="Angestrebte Wunschrate (optional)"
      />

      <CurrencyController<InvestmentFinancingFormData, 'plannedFinancingDurationMonths'>
        name="plannedFinancingDurationMonths"
        label="Geplante Finanzierungsdauer (optional)"
        decimalScale={0}
        endAdornmentText={NO_END_ADORNMENT}
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'flexibilityImportant'>
        name="flexibilityImportant"
        label="Ist Flexibilität wichtig?"
        optional
      />

      <CurrencyController<InvestmentFinancingFormData, 'desiredSpecialRepaymentPercent'>
        name="desiredSpecialRepaymentPercent"
        label="Gewünschte Sondertilgung (optional)"
        endAdornmentText="%"
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'revolvingCreditPlanned'>
        name="revolvingCreditPlanned"
        label="Ist eine zusätzliche revolvierende Inanspruchnahme geplant?"
        optional
      />

      <CurrencyController<InvestmentFinancingFormData, 'additionalNeedAmount'>
        name="additionalNeedAmount"
        label="Zusätzlicher Bedarf (optional)"
      />
    </Stack>
  );
}
