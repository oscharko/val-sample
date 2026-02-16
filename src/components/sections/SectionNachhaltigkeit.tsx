import { Collapse, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import { TriStateRadio } from '../ui/TriStateRadio';
import type { InvestmentFinancingFormData } from '../../schema';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SectionNachhaltigkeit({ expanded, onToggle }: SectionProps) {
  const { control } = useFormContext<InvestmentFinancingFormData>();

  return (
    <>
      <SectionHeading expanded={expanded} onToggle={onToggle}>
        Nachhaltigkeit
      </SectionHeading>

      <Collapse in={expanded}>
        <Stack spacing={3}>
          <Controller
            name="esgCompliant"
            control={control}
            render={({ field, fieldState }) => (
              <TriStateRadio
                label="Sind die ESG-Kriterien eingehalten?"
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </Collapse>
    </>
  );
}
