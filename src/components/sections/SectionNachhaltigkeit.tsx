import { Collapse, Stack } from '@mui/material';
import { SectionHeading } from '../ui/SectionHeading';
import type { InvestmentFinancingFormData } from '../../schema';
import { TriStateController } from '../form/fields/TriStateController';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

const HEADING_ID = 'section-nachhaltigkeit-heading';
const CONTENT_ID = 'section-nachhaltigkeit-content';

export function SectionNachhaltigkeit({ expanded, onToggle }: SectionProps) {
  return (
    <>
      <SectionHeading
        sectionId={HEADING_ID}
        contentId={CONTENT_ID}
        expanded={expanded}
        onToggle={onToggle}
      >
        Nachhaltigkeit
      </SectionHeading>

      <Collapse in={expanded} id={CONTENT_ID} aria-labelledby={HEADING_ID}>
        <Stack spacing={3}>
          <TriStateController<InvestmentFinancingFormData, 'esgCompliant'>
            name="esgCompliant"
            label="Sind die ESG-Kriterien eingehalten?"
          />
        </Stack>
      </Collapse>
    </>
  );
}
