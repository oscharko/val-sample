import { Collapse, MenuItem, Stack } from '@mui/material';
import { SectionHeading } from '../ui/SectionHeading';
import { USEFUL_LIFE_OPTIONS } from '../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../schema';
import { TextFieldController } from '../form/fields/TextFieldController';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

const HEADING_ID = 'section-zeitpunkt-heading';
const CONTENT_ID = 'section-zeitpunkt-content';

export function SectionZeitpunkt({ expanded, onToggle }: SectionProps) {
  return (
    <>
      <SectionHeading
        sectionId={HEADING_ID}
        contentId={CONTENT_ID}
        expanded={expanded}
        onToggle={onToggle}
      >
        Zeitpunkt der Anschaffung und Nutzungsdauer
      </SectionHeading>

      <Collapse in={expanded} id={CONTENT_ID} aria-labelledby={HEADING_ID}>
        <Stack spacing={3}>
          <TextFieldController<InvestmentFinancingFormData, 'purchaseDate'>
            name="purchaseDate"
            label="Datum der Anschaffung"
            type="date"
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextFieldController<InvestmentFinancingFormData, 'paymentDate'>
            name="paymentDate"
            label="Datum der Kaufpreiszahlung"
            type="date"
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextFieldController<InvestmentFinancingFormData, 'usefulLifeYears'>
            name="usefulLifeYears"
            select
            label="Nutzungsdauer in Jahren (optional)"
            mapValue={(value) => (value ?? '') as string}
          >
            <MenuItem value="">
              <em>– Keine Auswahl –</em>
            </MenuItem>
            {USEFUL_LIFE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextFieldController>
        </Stack>
      </Collapse>
    </>
  );
}
