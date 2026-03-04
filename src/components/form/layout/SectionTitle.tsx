import { Box, Typography } from '@mui/material';
import { type ReactNode } from 'react';

export interface SectionTitleProps {
  icon: ReactNode;
  children: ReactNode;
}

export function SectionTitle({ icon, children }: SectionTitleProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
        {children}
      </Typography>
    </Box>
  );
}
