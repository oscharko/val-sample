import { Collapse, MenuItem, Stack, useTheme } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { SectionHeading } from '../ui/SectionHeading';
import type { InvestmentFinancingFormData } from '../../schema';
import { CurrencyController } from '../form/fields/CurrencyController';
import { TextFieldController } from '../form/fields/TextFieldController';
import { TriStateController } from '../form/fields/TriStateController';

interface SectionProps {
  expanded: boolean;
  onToggle: () => void;
}

const HEADING_ID = 'section-betriebsmittel-heading';
const CONTENT_ID = 'section-betriebsmittel-content';

export function SectionBetriebsmittel({ expanded, onToggle }: SectionProps) {
  const { control } = useFormContext<InvestmentFinancingFormData>();
  const theme = useTheme();

  const operatingResourcesNeeded = useWatch({
    control,
    name: 'operatingResourcesNeeded',
  });

  const showOperatingResources = operatingResourcesNeeded === 'ja';

  return (
    <>
      <SectionHeading
        sectionId={HEADING_ID}
        contentId={CONTENT_ID}
        expanded={expanded}
        onToggle={onToggle}
      >
        Betriebsmittelbedarf
      </SectionHeading>

      <Collapse in={expanded} id={CONTENT_ID} aria-labelledby={HEADING_ID}>
        <Stack spacing={3}>
          <TriStateController<InvestmentFinancingFormData, 'operatingResourcesNeeded'>
            name="operatingResourcesNeeded"
            label="Wird ein Betriebsmittelkredit benötigt?"
          />

          <Collapse in={showOperatingResources} unmountOnExit>
            <Stack
              spacing={3}
              sx={{ pl: 2, borderLeft: `2px solid ${theme.palette.divider}` }}
            >
              <CurrencyController<InvestmentFinancingFormData, 'operatingResourcesAmount'>
                name="operatingResourcesAmount"
                label="Betrag des Betriebsmittels"
              />

              <TextFieldController<InvestmentFinancingFormData, 'operatingResourcesType'>
                name="operatingResourcesType"
                select
                label="Art des Betriebsmittels"
                mapValue={(value) => (value ?? '') as string}
              >
                <MenuItem value="umlaufvermoegen">Umlaufvermögen</MenuItem>
                <MenuItem value="anlagevermoegen">Anlagevermögen</MenuItem>
              </TextFieldController>
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </>
  );
}
