import { Collapse, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import { USEFUL_LIFE_OPTIONS } from '../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../schema';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SectionZeitpunkt({ expanded, onToggle }: SectionProps) {
  const { control } = useFormContext<InvestmentFinancingFormData>();

  return (
    <>
      <SectionHeading expanded={expanded} onToggle={onToggle}>
        Zeitpunkt der Anschaffung und Nutzungsdauer
      </SectionHeading>

      <Collapse in={expanded}>
        <Stack spacing={3}>
          <Controller
            name="purchaseDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Datum der Anschaffung"
                type="date"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            )}
          />

          <Controller
            name="paymentDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Datum der Kaufpreiszahlung"
                type="date"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            )}
          />

          <Controller
            name="usefulLifeYears"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                select
                label="Nutzungsdauer in Jahren (optional)"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="">
                  <em>– Keine Auswahl –</em>
                </MenuItem>
                {USEFUL_LIFE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>
      </Collapse>
    </>
  );
}
