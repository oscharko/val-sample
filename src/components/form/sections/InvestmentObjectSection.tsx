import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Box, Divider, MenuItem, Paper, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { INVESTMENT_OBJECT_OPTIONS } from '../../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../../schema';
import { BinaryChoiceController } from '../fields/BinaryChoiceController';
import { TextFieldController } from '../fields/TextFieldController';
import { SectionTitle } from '../layout/SectionTitle';

export function InvestmentObjectSection() {
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
      <SectionTitle icon={<ShoppingCartOutlinedIcon />}>Investitionsobjekt</SectionTitle>
      <Paper
        variant="outlined"
        sx={{ p: 2, borderColor: 'divider', backgroundColor: 'background.paper' }}
      >
        <Stack spacing={2}>
          <TextFieldController<InvestmentFinancingFormData, 'investmentObjectName'>
            name="investmentObjectName"
            label="Konkrete Bezeichnung des Investitionsobjekts"
          />

          <TextFieldController<InvestmentFinancingFormData, 'investmentObjectType'>
            name="investmentObjectType"
            select
            label="Art des Investitionsobjekts"
            mapValue={(value) => (value ?? '') as string}
          >
            <MenuItem value="">
              <em>Bitte auswählen</em>
            </MenuItem>
            {INVESTMENT_OBJECT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextFieldController>

          {investmentObjectType === 'kfz' && (
            <BinaryChoiceController<InvestmentFinancingFormData, 'fleetPurchasePlanned'>
              name="fleetPurchasePlanned"
              label="Ist die Anschaffung im Rahmen eines Fuhrparks angedacht?"
              optional
            />
          )}

          <Divider />

          <BinaryChoiceController<InvestmentFinancingFormData, 'expansionInvestment'>
            name="expansionInvestment"
            label="Handelt es sich um eine Erweiterungsinvestition?"
            optional
          />
        </Stack>
      </Paper>
    </Box>
  );
}
