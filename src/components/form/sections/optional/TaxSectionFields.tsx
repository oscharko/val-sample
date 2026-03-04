import { Stack } from '@mui/material';
import type { InvestmentFinancingFormData } from '../../../../schema';
import { BinaryChoiceController } from '../../fields/BinaryChoiceController';

export default function TaxSectionFields() {
  return (
    <Stack spacing={2}>
      <BinaryChoiceController<InvestmentFinancingFormData, 'taxOptimizedBalanceNeutralDesired'>
        name="taxOptimizedBalanceNeutralDesired"
        label="Soll steueroptimiert bzw. bilanziell neutral finanziert werden?"
        optional
      />
    </Stack>
  );
}
