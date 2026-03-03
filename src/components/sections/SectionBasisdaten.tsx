import {
  Box,
  Collapse,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import { CATEGORY_OPTIONS, PERSON_OPTIONS } from '../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../schema';
import { TextFieldController } from '../form/fields/TextFieldController';
import { TriStateController } from '../form/fields/TriStateController';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

const HEADING_ID = 'section-basisdaten-heading';
const CONTENT_ID = 'section-basisdaten-content';

export function SectionBasisdaten({ expanded, onToggle }: SectionProps) {
  const { control } = useFormContext<InvestmentFinancingFormData>();
  const { field: grossPriceField } = useController({
    name: 'grossPrice',
    control,
  });

  return (
    <>
      <SectionHeading
        sectionId={HEADING_ID}
        contentId={CONTENT_ID}
        expanded={expanded}
        onToggle={onToggle}
      >
        Legen Sie die Basisdaten fest
      </SectionHeading>

      <Collapse in={expanded} id={CONTENT_ID} aria-labelledby={HEADING_ID}>
        <Stack spacing={3}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Wem soll der Bedarf zugeordnet werden?
          </Typography>

          <TextFieldController<InvestmentFinancingFormData, 'person'>
            name="person"
            select
            label="Person"
          >
            {PERSON_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextFieldController>

          <Divider />

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Finanzierungsobjekt
          </Typography>

          <TextFieldController<InvestmentFinancingFormData, 'financingObjectName'>
            name="financingObjectName"
            label="Name des Finanzierungsobjektes"
          />

          <TextFieldController<InvestmentFinancingFormData, 'financingObjectCategory'>
            name="financingObjectCategory"
            select
            label="Kategorie des Finanzierungsobjektes"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextFieldController>

          <TriStateController<InvestmentFinancingFormData, 'fleetPurchase'>
            name="fleetPurchase"
            label="Ist die Anschaffung im Rahmen eines Fuhrparks angedacht?"
          />

          <TriStateController<InvestmentFinancingFormData, 'expansionInvestment'>
            name="expansionInvestment"
            label="Handelt es sich um eine Erweiterungsinvestition?"
            includeUnklar={false}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(grossPriceField.value)}
                  onChange={grossPriceField.onChange}
                  onBlur={grossPriceField.onBlur}
                  inputRef={grossPriceField.ref}
                  size="small"
                />
              }
              label="Bruttokaufpreis"
              labelPlacement="start"
              sx={{ mr: 0, gap: 1 }}
            />
          </Box>
        </Stack>
      </Collapse>
    </>
  );
}
