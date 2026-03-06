/**
 * useSectionVisibility — UI-State-Hook für klappbare Formular-Sektionen.
 * Verwaltet eine Map von Sektions-IDs zu Expanded/Collapsed-Zustand.
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';

export type SectionVisibilityMap = Record<string, boolean>;

type SectionAction =
  | { type: 'SET'; sectionId: string; expanded: boolean }
  | { type: 'REPLACE_ALL'; sections: SectionVisibilityMap };

const areSectionIdsEqual = (
  left: readonly string[],
  right: readonly string[],
): boolean => {
  return left.length === right.length && left.every((sectionId, index) => sectionId === right[index]);
};

const areSectionMapsEqual = (
  left: SectionVisibilityMap,
  right: SectionVisibilityMap,
): boolean => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => left[key] === right[key])
  );
};

function buildInitialSectionMap(
  sectionIds: readonly string[],
  initiallyExpanded: boolean,
): SectionVisibilityMap {
  return Object.fromEntries(sectionIds.map((id) => [id, initiallyExpanded]));
}

const assertUnreachable = (value: never): never => {
  throw new Error(`Unhandled section action: ${JSON.stringify(value)}`);
};

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
      return areSectionMapsEqual(state, action.sections) ? state : action.sections;
    }

    default: {
      return assertUnreachable(action);
    }
  }
}

export function useSectionVisibility(
  sectionIds: readonly string[],
  initiallyExpanded = true,
) {
  const [sections, dispatch] = useReducer(
    sectionReducer,
    undefined,
    () => buildInitialSectionMap(sectionIds, initiallyExpanded),
  );
  const previousInputsRef = useRef<{
    sectionIds: readonly string[];
    initiallyExpanded: boolean;
  }>({
    sectionIds: [...sectionIds],
    initiallyExpanded,
  });

  useEffect(() => {
    const previousInputs = previousInputsRef.current;
    const hasSameIds = areSectionIdsEqual(previousInputs.sectionIds, sectionIds);
    const hasSameInitialExpansion =
      previousInputs.initiallyExpanded === initiallyExpanded;

    if (hasSameIds && hasSameInitialExpansion) {
      return;
    }

    // Warum Clone? Schützt den Vergleich vor versehentlichen Mutationen von außen.
    previousInputsRef.current = {
      sectionIds: [...sectionIds],
      initiallyExpanded,
    };

    dispatch({
      type: 'REPLACE_ALL',
      sections: buildInitialSectionMap(sectionIds, initiallyExpanded),
    });
  }, [initiallyExpanded, sectionIds]);

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
