/**
 * SectionHeading — Accessible collapsible section header.
 */

import { Box, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface SectionHeadingProps {
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}

export function SectionHeading({
  children,
  expanded,
  onToggle,
}: SectionHeadingProps) {
  return (
    <Box
      component={onToggle ? 'button' : 'div'}
      type={onToggle ? 'button' : undefined}
      onClick={onToggle}
      aria-expanded={onToggle ? expanded : undefined}
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
          outline: '2px solid primary.main',
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
          component="div" // Avoid nested button
          size="small"
          aria-hidden="true" // Decorative icon, button handles semantics
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      )}
    </Box>
  );
}
