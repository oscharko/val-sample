import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { type ReactNode } from 'react';

export interface OptionalAccordionProps {
  icon: ReactNode;
  title: string;
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  children: ReactNode;
}

export function OptionalAccordion({
  icon,
  title,
  expanded,
  onToggle,
  children,
}: OptionalAccordionProps) {
  return (
    <Accordion
      expanded={expanded}
      onChange={(_event, nextExpanded) => onToggle(nextExpanded)}
      disableGutters
      square
      elevation={0}
      slotProps={{
        transition: {
          unmountOnExit: true,
        },
      }}
      sx={{
        backgroundColor: 'transparent',
        '&::before': { display: 'none' },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{icon}</Box>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            (optional)
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            borderColor: 'divider',
          }}
        >
          {children}
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
}
