import {
  Box,
  Collapse,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import { TriStateRadio } from '../ui/TriStateRadio';
import { CATEGORY_OPTIONS, PERSON_OPTIONS } from '../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../schema';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SectionBasisdaten({ expanded, onToggle }: SectionProps) {
  const { control } = useFormContext<InvestmentFinancingFormData>();

  return (
    <>
      <SectionHeading expanded={expanded} onToggle={onToggle}>
        Legen Sie die Basisdaten fest
      </SectionHeading>

      <Collapse in={expanded}>
        <Stack spacing={3}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Wem soll der Bedarf zugeordnet werden?
          </Typography>

          <Controller
            name="person"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Person"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {PERSON_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Divider />

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Finanzierungsobjekt
          </Typography>

          <Controller
            name="financingObjectName"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name des Finanzierungsobjektes"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="financingObjectCategory"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Kategorie des Finanzierungsobjektes"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="fleetPurchase"
            control={control}
            render={({ field, fieldState }) => (
              <TriStateRadio
                label="Ist die Anschaffung im Rahmen eines Fuhrparks angedacht?"
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="expansionInvestment"
            control={control}
            render={({ field, fieldState }) => (
              <TriStateRadio
                label="Handelt es sich um eine Erweiterungsinvestition?"
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                includeUnklar={false}
              />
            )}
          />

          {/* Bruttokaufpreis toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Controller
              name="grossPrice"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      size="small"
                    />
                  }
                  label="Bruttokaufpreis"
                  labelPlacement="start"
                  sx={{ mr: 0, gap: 1 }}
                />
              )}
            />
          </Box>
        </Stack>
      </Collapse>
    </>
  );
}
