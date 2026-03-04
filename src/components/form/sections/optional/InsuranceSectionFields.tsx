import { Stack } from '@mui/material';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';

export default function InsuranceSectionFields() {
  return (
    <Stack spacing={2}>
      <BinaryChoiceController<InvestmentFinancingFormData, 'investmentObjectInsuranceDesired'>
        name="investmentObjectInsuranceDesired"
        label="Ist eine Versicherung des Investitionsobjekts gewünscht?"
        optional
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'residualDebtInsuranceDesired'>
        name="residualDebtInsuranceDesired"
        label="Ist eine Restkreditversicherung gewünscht?"
        optional
      />

      <BinaryChoiceController<InvestmentFinancingFormData, 'interestHedgingUseful'>
        name="interestHedgingUseful"
        label="Ist eine Zinssicherung sinnvoll?"
        optional
      />
    </Stack>
  );
}
