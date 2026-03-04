import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Box, MenuItem, Paper } from '@mui/material';
import { PERSON_OPTIONS } from '../../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../../schema';
import { TextFieldController } from '../fields/TextFieldController';
import { SectionTitle } from '../layout/SectionTitle';

export function AssignmentSection() {
  return (
    <Box>
      <SectionTitle icon={<PersonOutlineIcon />}>Zuordnung des Bedarfs</SectionTitle>
      <Paper
        variant="outlined"
        sx={{ p: 2, borderColor: 'divider', backgroundColor: 'background.paper' }}
      >
        <TextFieldController<InvestmentFinancingFormData, 'person'>
          name="person"
          select
          label="Person"
          required
        >
          {PERSON_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextFieldController>
      </Paper>
    </Box>
  );
}
