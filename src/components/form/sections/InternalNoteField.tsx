import { Box, Typography } from '@mui/material';
import { useId } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { InvestmentFinancingFormData } from '../../../schema';
import { TextFieldController } from '../fields/TextFieldController';
import { INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH } from '../../../validation/investmentFinancingBaseSchema';

export function InternalNoteField() {
  const { t } = useTranslation();
  const { control } = useFormContext<InvestmentFinancingFormData>();
  const remainingLengthId = useId();

  const internalNote = useWatch({
    control,
    name: 'internalNote',
  });

  const remainingInternalNoteLength = Math.max(
    INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH - (internalNote?.length ?? 0),
    0,
  );

  return (
    <Box>
      <TextFieldController<InvestmentFinancingFormData, 'internalNote'>
        name="internalNote"
        label={t('form.fields.internalNote')}
        multiline
        minRows={4}
        slotProps={{
          htmlInput: {
            maxLength: INVESTMENT_FINANCING_INTERNAL_NOTE_MAX_LENGTH,
            'aria-describedby': remainingLengthId,
          },
        }}
      />
      <Typography
        id={remainingLengthId}
        component="p"
        variant="caption"
        color="text.secondary"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{ display: 'block', textAlign: 'right' }}
      >
        {t('form.fields.remainingCharacters', {
          count: remainingInternalNoteLength,
        })}
      </Typography>
    </Box>
  );
}
