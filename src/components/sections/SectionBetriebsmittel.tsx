import {
  Collapse,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import { TriStateRadio } from '../ui/TriStateRadio';
import { useComputedFormValues } from '../../hooks/useComputedFormValues';
import type { InvestmentFinancingFormData } from '../../schema';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SectionBetriebsmittel({ expanded, onToggle }: SectionProps) {
  const { control, watch } = useFormContext<InvestmentFinancingFormData>();
  const { showOperatingResources } = useComputedFormValues(watch);

  return (
    <>
      <SectionHeading expanded={expanded} onToggle={onToggle}>
        Betriebsmittelbedarf
      </SectionHeading>

      <Collapse in={expanded}>
        <Stack spacing={3}>
          <Controller
            name="operatingResourcesNeeded"
            control={control}
            render={({ field, fieldState }) => (
              <TriStateRadio
                label="Wird ein Betriebsmittelkredit benötigt?"
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Collapse in={showOperatingResources}>
            <Stack spacing={3} sx={{ pl: 2, borderLeft: '2px solid #eee' }}>
              <Controller
                name="operatingResourcesAmount"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Betrag des Betriebsmittels"
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      },
                      htmlInput: { step: '0.01', min: '0' },
                    }}
                  />
                )}
              />

              <Controller
                name="operatingResourcesType"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Art des Betriebsmittels"
                    value={field.value ?? ''}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="umlaufvermoegen">Umlaufvermögen</MenuItem>
                    <MenuItem value="anlagevermoegen">Anlagevermögen</MenuItem>
                  </TextField>
                )}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </>
  );
}
