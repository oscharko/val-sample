/**
 * SectionHeading — Accessible collapsible section header.
 */

import { Box, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface SectionHeadingProps {
  children: React.ReactNode;
  sectionId?: string;
  contentId?: string;
  expanded?: boolean;
  onToggle?: () => void;
}

export function SectionHeading({
  children,
  sectionId,
  contentId,
  expanded,
  onToggle,
}: SectionHeadingProps) {
  return (
    <Box
      id={sectionId}
      component={onToggle ? 'button' : 'div'}
      type={onToggle ? 'button' : undefined}
      onClick={onToggle}
      aria-expanded={onToggle ? expanded : undefined}
      aria-controls={onToggle ? contentId : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: 'none',
        border: 'none',
        p: 0,
        cursor: onToggle ? 'pointer' : 'default',
        textAlign: 'left',
        color: 'inherit',
        font: 'inherit',
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, mt: 1, mb: 0.5, color: 'text.primary', flexGrow: 1 }}
      >
        {children}
      </Typography>
      {onToggle && (
        <IconButton
          component="div"
          size="small"
          aria-hidden="true"
          tabIndex={-1}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      )}
    </Box>
  );
}
