/**
 * useSectionVisibility — UI-State-Hook für klappbare Formular-Sektionen.
 * Verwaltet eine Map von Sektions-IDs zu Expanded/Collapsed-Zustand.
 */

import { useReducer, useCallback, useEffect, useMemo, useRef } from 'react';

export type SectionVisibilityMap = Record<string, boolean>;

type SectionAction =
  | { type: 'SET'; sectionId: string; expanded: boolean }
  | { type: 'REPLACE_ALL'; sections: SectionVisibilityMap };

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
  /** Referenzstabilität für das sectionIds-Array über Re-Renders hinweg. */
  const previousIdsRef = useRef(sectionIds);
  const stableSectionIds = useMemo(() => {
    const prev = previousIdsRef.current;
    if (
      prev.length === sectionIds.length &&
      prev.every((id, index) => id === sectionIds[index])
    ) {
      return prev;
    }

    previousIdsRef.current = sectionIds;
    return sectionIds;
  }, [sectionIds]);

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
