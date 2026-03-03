import { Collapse, MenuItem, Stack } from '@mui/material';
import { SectionHeading } from '../ui/SectionHeading';
import { VAT_RATE_OPTIONS } from '../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../schema';
import { CurrencyController } from '../form/fields/CurrencyController';
import { TextFieldController } from '../form/fields/TextFieldController';
import { TriStateController } from '../form/fields/TriStateController';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

const HEADING_ID = 'section-kosten-heading';
const CONTENT_ID = 'section-kosten-content';

export function SectionKosten({ expanded, onToggle }: SectionProps) {
  return (
    <>
      <SectionHeading
        sectionId={HEADING_ID}
        contentId={CONTENT_ID}
        expanded={expanded}
        onToggle={onToggle}
      >
        Kosten
      </SectionHeading>

      <Collapse in={expanded} id={CONTENT_ID} aria-labelledby={HEADING_ID}>
        <Stack spacing={3}>
          <CurrencyController<InvestmentFinancingFormData, 'netPurchasePrice'>
            name="netPurchasePrice"
            label="Nettokaufpreis"
          />

          <CurrencyController<InvestmentFinancingFormData, 'additionalCosts'>
            name="additionalCosts"
            label="Nebenkosten"
          />

          <TriStateController<InvestmentFinancingFormData, 'vatDeductible'>
            name="vatDeductible"
            label="Ist der Kreditnehmer vorsteuerabzugsberechtigt?"
            includeUnklar={false}
          />

          <TextFieldController<InvestmentFinancingFormData, 'vatRate'>
            name="vatRate"
            select
            label="MwST.-Satz"
          >
            {VAT_RATE_OPTIONS.map((option) => (
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
