import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { VAT_RATE_OPTIONS } from '../../../config/formConfig';
import type { InvestmentFinancingFormData } from '../../../schema';
import { useComputedFormValues } from '../../../hooks/useComputedFormValues';
import { useOperatingResourcesAutoFill } from '../../../hooks/useOperatingResourcesAutoFill';
import { formatPercent } from '../../../utils/formatters';
import { BinaryChoiceController } from '../fields/BinaryChoiceController';
import { CurrencyController } from '../fields/CurrencyController';
import { PurchasePriceCaptureModeField } from '../fields/PurchasePriceCaptureModeField';
import { TextFieldController } from '../fields/TextFieldController';
import { SectionTitle } from '../layout/SectionTitle';
import { sectionPaperSx } from '../layout/sectionPaperSx';

// Einheitliches Styling für Info-Alerts in dieser Sektion
const infoAlertSx = {
  backgroundColor: 'grey.100',
  color: 'text.primary',
  '& .MuiAlert-icon': { color: 'text.secondary' },
} as const;

const InfoAlert = ({ children }: { children: ReactNode }) => {
  return (
    <Alert icon={<InfoOutlinedIcon fontSize="inherit" />} severity="info" sx={infoAlertSx}>
      {children}
    </Alert>
  );
};

const FinancingDemandSummary = ({
  formattedFinancingDemand,
}: {
  formattedFinancingDemand: string;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography sx={{ fontWeight: 600 }}>Finanzierungsbedarf des Investitionsobjekts</Typography>
      {/* Read-only Kennzahl: bewusst nicht editierbar, damit Berechnung transparent bleibt. */}
      <Chip
        label={formattedFinancingDemand}
        sx={{
          color: 'common.white',
          backgroundColor: 'grey.700',
          fontWeight: 700,
          fontSize: '1rem',
          px: 0.5,
        }}
      />
    </Box>
  );
};

const OperatingResourcesBlock = ({
  operatingResourcesRequired,
  operatingResourcesInfoText,
}: {
  operatingResourcesRequired: InvestmentFinancingFormData['operatingResourcesRequired'];
  operatingResourcesInfoText: string;
}) => {
  if (operatingResourcesRequired !== 'ja') {
    return null;
  }

  return (
    <>
      <CurrencyController<InvestmentFinancingFormData, 'operatingResourcesAmount'>
        name="operatingResourcesAmount"
        label="Höhe der Betriebsmittel"
      />
      <InfoAlert>
        <Typography variant="body2">{operatingResourcesInfoText}</Typography>
        <Typography variant="body2">
          Für die Betriebsmittel wird ein separater Bedarf angelegt.
        </Typography>
      </InfoAlert>
    </>
  );
};

export function FinancingDemandSection() {
  const { control } = useFormContext<InvestmentFinancingFormData>();

  const {
    purchasePriceLabel,
    vatInfoText,
    operatingResourcesInfoText,
    operatingResourcesSuggestedAmount,
    formattedFinancingDemand,
  } = useComputedFormValues(control);

  // Hook zur automatischen Befüllung des Betriebsmittel-Feldes (basierend auf MwSt.)
  useOperatingResourcesAutoFill(operatingResourcesSuggestedAmount);

  // Reagiert auf die Notwendigkeit von Betriebsmitteln zur Steuerung bedingter Felder
  const operatingResourcesRequired = useWatch({
    control,
    name: 'operatingResourcesRequired',
  });

  return (
    <Box>
      <SectionTitle icon={<CalculateOutlinedIcon />}>
        Ermittlung des Finanzierungsbedarfs
      </SectionTitle>

      <Paper
        variant="outlined"
        sx={sectionPaperSx}
      >
        <Stack spacing={2}>
          <PurchasePriceCaptureModeField />

          <InfoAlert>{vatInfoText}</InfoAlert>

          <CurrencyController<InvestmentFinancingFormData, 'purchasePrice'>
            name="purchasePrice"
            label={purchasePriceLabel}
            required
          />

          <TextFieldController<InvestmentFinancingFormData, 'vatRate'>
            name="vatRate"
            select
            label="Anfallender MwSt.-Satz bei Kauf"
          >
            {VAT_RATE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {formatPercent({
                  value: Number(option) / 100,
                })}
              </MenuItem>
            ))}
          </TextFieldController>

          <CurrencyController<InvestmentFinancingFormData, 'additionalCosts'>
            name="additionalCosts"
            label="Höhe der Nebenkosten (Brutto) (optional)"
          />

          <Divider />
          <FinancingDemandSummary formattedFinancingDemand={formattedFinancingDemand} />
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          ...sectionPaperSx,
          mt: 2,
        }}
      >
        <Stack spacing={2}>
          <BinaryChoiceController<InvestmentFinancingFormData, 'operatingResourcesRequired'>
            name="operatingResourcesRequired"
            label="Sind zusätzliche Betriebsmittel erforderlich?"
          />
          <OperatingResourcesBlock
            operatingResourcesRequired={operatingResourcesRequired}
            operatingResourcesInfoText={operatingResourcesInfoText}
          />
        </Stack>
      </Paper>
    </Box>
  );
}
