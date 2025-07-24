// Re-export the refactored hooks for backward compatibility
export { useBGGSearch } from './useBGGSearch';
export { useUserLibrary, useGroupedLibrary, type GroupedGame } from './useBGGLibrary';
export {
  useAddGameToLibrary,
  useRemoveGameFromLibrary,
  useUpdateUserGame,
  useUpdateGameExpansionRelationship,
  useUpdateGameCustomTitle,
  useSyncBGGCollection
} from './useBGGMutations';

// Import and re-export individual mechanic hooks for backward compatibility
import { useUpdateGameMechanics } from './useBGGMutations';

export const useUpdateGameCoreMechanic = () => {
  const { updateCoreMechanic } = useUpdateGameMechanics();
  return updateCoreMechanic;
};

export const useUpdateGameAdditionalMechanic1 = () => {
  const { updateAdditionalMechanic1 } = useUpdateGameMechanics();
  return updateAdditionalMechanic1;
};

export const useUpdateGameAdditionalMechanic2 = () => {
  const { updateAdditionalMechanic2 } = useUpdateGameMechanics();
  return updateAdditionalMechanic2;
};