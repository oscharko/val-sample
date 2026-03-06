import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Box, CircularProgress } from '@mui/material';
import {
  lazy,
  Suspense,
  type JSX,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';
import { SECTION_IDS } from '../../../config/formConfig';
import { OptionalAccordion } from '../layout/OptionalAccordion';

const TimingSectionFields = lazy(() => import('./optional/TimingSectionFields'));
const ModalitiesSectionFields = lazy(() => import('./optional/ModalitiesSectionFields'));
const SustainabilitySectionFields = lazy(() => import('./optional/SustainabilitySectionFields'));
const InsuranceSectionFields = lazy(() => import('./optional/InsuranceSectionFields'));
const TaxSectionFields = lazy(() => import('./optional/TaxSectionFields'));

type OptionalSectionId = (typeof SECTION_IDS)[number];

type OptionalSectionConfig = {
  id: OptionalSectionId;
  icon: ReactNode;
  title: string;
  Component: LazyExoticComponent<() => JSX.Element>;
};

const OPTIONAL_ACCORDION_SECTIONS: ReadonlyArray<OptionalSectionConfig> = [
  {
    id: 'timing',
    icon: <EventNoteOutlinedIcon fontSize="small" />,
    title: 'Zeitliche Planung der Investition',
    Component: TimingSectionFields,
  },
  {
    id: 'modalities',
    icon: <TuneOutlinedIcon fontSize="small" />,
    title: 'Finanzierungsmodalitäten',
    Component: ModalitiesSectionFields,
  },
  {
    id: 'sustainability',
    icon: <NatureOutlinedIcon fontSize="small" />,
    title: 'Nachhaltigkeit',
    Component: SustainabilitySectionFields,
  },
  {
    id: 'insurance',
    icon: <ShieldOutlinedIcon fontSize="small" />,
    title: 'Versicherung und Absicherung',
    Component: InsuranceSectionFields,
  },
  {
    id: 'tax',
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    title: 'Steuer- und Bilanzoptimierung',
    Component: TaxSectionFields,
  },
] as const;

const optionalSectionFallback = (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
    <CircularProgress size={20} />
  </Box>
);

export interface OptionalSectionsPanelProps {
  isSectionExpanded: (sectionId: OptionalSectionId) => boolean;
  setSection: (sectionId: OptionalSectionId, expanded: boolean) => void;
}

export function OptionalSectionsPanel({
  isSectionExpanded,
  setSection,
}: OptionalSectionsPanelProps) {
  return (
    <Box>
      {OPTIONAL_ACCORDION_SECTIONS.map((section) => {
        const expanded = isSectionExpanded(section.id);

        return (
          <OptionalAccordion
            key={section.id}
            icon={section.icon}
            title={section.title}
            expanded={expanded}
            onToggle={(nextExpanded) => setSection(section.id, nextExpanded)}
          >
            {expanded ? (
              <Suspense fallback={optionalSectionFallback}>
                <section.Component />
              </Suspense>
            ) : null}
          </OptionalAccordion>
        );
      })}
    </Box>
  );
}
