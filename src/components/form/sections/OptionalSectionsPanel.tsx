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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const optionalAccordionSections: ReadonlyArray<OptionalSectionConfig> = [
    {
      id: 'timing',
      icon: <EventNoteOutlinedIcon fontSize="small" />,
      title: t('form.sections.optional.timing'),
      Component: TimingSectionFields,
    },
    {
      id: 'modalities',
      icon: <TuneOutlinedIcon fontSize="small" />,
      title: t('form.sections.optional.modalities'),
      Component: ModalitiesSectionFields,
    },
    {
      id: 'sustainability',
      icon: <NatureOutlinedIcon fontSize="small" />,
      title: t('form.sections.optional.sustainability'),
      Component: SustainabilitySectionFields,
    },
    {
      id: 'insurance',
      icon: <ShieldOutlinedIcon fontSize="small" />,
      title: t('form.sections.optional.insurance'),
      Component: InsuranceSectionFields,
    },
    {
      id: 'tax',
      icon: <DescriptionOutlinedIcon fontSize="small" />,
      title: t('form.sections.optional.tax'),
      Component: TaxSectionFields,
    },
  ] as const;

  return (
    <Box>
      {optionalAccordionSections.map((section) => {
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
