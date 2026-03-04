import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Box, MenuItem, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PERSON_OPTIONS } from '../../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../../schema';
import { TextFieldController } from '../fields/TextFieldController';
import { SectionTitle } from '../layout/SectionTitle';

export function AssignmentSection() {
  const { t } = useTranslation();

  return (
    <Box>
      <SectionTitle icon={<PersonOutlineIcon />}>
        {t('form.sections.assignment')}
      </SectionTitle>
      <Paper
        variant="outlined"
        sx={{ p: 2, borderColor: 'divider', backgroundColor: 'background.paper' }}
      >
        <TextFieldController<InvestmentFinancingFormData, 'person'>
          name="person"
          select
          label={t('form.fields.person')}
          required
        >
          {PERSON_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </MenuItem>
          ))}
        </TextFieldController>
      </Paper>
    </Box>
  );
}
