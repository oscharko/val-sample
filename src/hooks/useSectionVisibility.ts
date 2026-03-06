/**
 * useSectionVisibility — UI-State-Hook für klappbare Formular-Sektionen.
 * Verwaltet eine Map von Sektions-IDs zu Expanded/Collapsed-Zustand.
 */

import { useReducer, useCallback, useEffect, useMemo } from 'react';

export type SectionVisibilityMap = Record<string, boolean>;

type SectionAction =
  | { type: 'SET'; sectionId: string; expanded: boolean }
  | { type: 'REPLACE_ALL'; sections: SectionVisibilityMap };

const SECTION_IDS_KEY_SEPARATOR = '\u0000';

const createSectionIdsKey = (sectionIds: readonly string[]): string =>
  sectionIds.join(SECTION_IDS_KEY_SEPARATOR);

const getStableSectionIds = (sectionIdsKey: string): readonly string[] =>
  sectionIdsKey === '' ? [] : sectionIdsKey.split(SECTION_IDS_KEY_SEPARATOR);

function buildInitialSectionMap(
  sectionIds: readonly string[],
  initiallyExpanded: boolean,
): SectionVisibilityMap {
  return Object.fromEntries(sectionIds.map((id) => [id, initiallyExpanded]));
}

/** Bail-out bei identischem Zustand für Referenzstabilität. */
function sectionReducer(
  state: SectionVisibilityMap,
  action: SectionAction,
): SectionVisibilityMap {
  switch (action.type) {
    case 'SET': {
      if (!(action.sectionId in state) || state[action.sectionId] === action.expanded) {
        return state;
      }
      return { ...state, [action.sectionId]: action.expanded };
    }

    case 'REPLACE_ALL': {
      const keys = Object.keys(state);
      const newKeys = Object.keys(action.sections);
      const isUnchanged =
        keys.length === newKeys.length &&
        keys.every((key) => state[key] === action.sections[key]);
      return isUnchanged ? state : action.sections;
    }

    default:
      return state;
  }
}

export function useSectionVisibility(
  sectionIds: readonly string[],
  initiallyExpanded = true,
) {
  const sectionIdsKey = createSectionIdsKey(sectionIds);
  // Warum über einen Key? Gleicher Inhalt soll denselben Zustand behalten,
  // auch wenn der Caller pro Render ein neues Array erzeugt.
  const stableSectionIds = useMemo(
    () => getStableSectionIds(sectionIdsKey),
    [sectionIdsKey],
  );

  const [sections, dispatch] = useReducer(
    sectionReducer,
    undefined,
    () => buildInitialSectionMap(stableSectionIds, initiallyExpanded),
  );

  /** Bei Änderung der Section-IDs Map neu aufbauen. */
  useEffect(() => {
    dispatch({
      type: 'REPLACE_ALL',
      sections: buildInitialSectionMap(stableSectionIds, initiallyExpanded),
    });
  }, [initiallyExpanded, stableSectionIds]);

  const setSection = useCallback(
    (sectionId: string, expanded: boolean) =>
      dispatch({ type: 'SET', sectionId, expanded }),
    [],
  );

  const isSectionExpanded = useCallback(
    (sectionId: string) => sections[sectionId] ?? initiallyExpanded,
    [sections, initiallyExpanded],
  );

  return {
    sections,
    setSection,
    isSectionExpanded,
  } as const;
}
