import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useBGGSearch, 
  useUserLibrary, 
  useAddGameToLibrary, 
  useRemoveGameFromLibrary, 
  useUpdateUserGame, 
  useSyncBGGCollection, 
  useGroupedLibrary,
  useUpdateGameExpansionRelationship,
  useUpdateGameCoreMechanic,
  useUpdateGameAdditionalMechanic1,
  useUpdateGameAdditionalMechanic2,
  useUpdateGameCustomTitle
} from "@/hooks/useBGG";

import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryStats } from "@/components/library/LibraryStats";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { GamesList } from "@/components/library/GamesList";
import { EditGameDialog } from "@/components/library/EditGameDialog";
import { SearchGameDialog } from "@/components/library/SearchGameDialog";
import { SyncDialog } from "@/components/library/SyncDialog";

import { useLibraryFilters } from "@/hooks/useLibraryFilters";
import { useGameSelection } from "@/hooks/useGameSelection";

const Library = () => {
  const { user } = useAuth();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [allBaseGames, setAllBaseGames] = useState<any[]>([]);

  // Hooks
  const { searchResults, search, isLoading: isSearching } = useBGGSearch();
  const { data: userLibrary, isLoading: isLoadingLibrary } = useUserLibrary();
  const { data: groupedLibrary } = useGroupedLibrary();
  
  const addGameMutation = useAddGameToLibrary();
  const removeGameMutation = useRemoveGameFromLibrary();
  const updateGameMutation = useUpdateUserGame();
  const syncCollectionMutation = useSyncBGGCollection();
  const updateExpansionMutation = useUpdateGameExpansionRelationship();
  const updateCoreMechanicMutation = useUpdateGameCoreMechanic();
  const updateAdditionalMechanic1Mutation = useUpdateGameAdditionalMechanic1();
  const updateAdditionalMechanic2Mutation = useUpdateGameAdditionalMechanic2();
  const updateCustomTitleMutation = useUpdateGameCustomTitle();

  // Custom hooks
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    gameTypeFilter,
    setGameTypeFilter,
    sortedFilteredLibrary,
    getDisplayTitle
  } = useLibraryFilters(groupedLibrary);

  const {
    selectedGames,
    isSelectionMode,
    handleGameSelection,
    selectAllGames,
    deselectAllGames,
    toggleSelectionMode
  } = useGameSelection();

  // Fetch base games for expansion selection
  useEffect(() => {
    const fetchBaseGames = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('games')
          .select('*')
          .eq('is_expansion', false)
          .order('name');
        
        setAllBaseGames(data || []);
      } catch (error) {
        console.error('Error fetching base games:', error);
      }
    };

    fetchBaseGames();
  }, [user]);

  // Event handlers
  const handleAddGame = async (game: any, status: any) => {
    if (!user) return;
    
    try {
      await addGameMutation.mutateAsync({ bggId: game.bgg_id, status });
      setSearchDialogOpen(false);
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const handleSyncCollection = async (username: string) => {
    try {
      await syncCollectionMutation.mutateAsync(username);
      setSyncDialogOpen(false);
    } catch (error) {
      console.error('Error syncing collection:', error);
    }
  };

  const handleEditGame = (userGame: any) => {
    setEditingGame(userGame);
  };

  const handleSaveEdit = async (updates: any) => {
    try {
      // Update user game data
      await updateGameMutation.mutateAsync({
        userGameId: updates.userGameId,
        updates: updates.userUpdates
      });

      // Update game metadata
      await updateExpansionMutation.mutateAsync({
        gameId: updates.gameId,
        isExpansion: updates.gameUpdates.isExpansion,
        baseGameBggId: updates.gameUpdates.baseGameBggId
      });

      await updateCoreMechanicMutation.mutateAsync({
        gameId: updates.gameId,
        coreMechanic: updates.gameUpdates.coreMechanic
      });

      await updateAdditionalMechanic1Mutation.mutateAsync({
        gameId: updates.gameId,
        additionalMechanic1: updates.gameUpdates.additionalMechanic1
      });

      await updateAdditionalMechanic2Mutation.mutateAsync({
        gameId: updates.gameId,
        additionalMechanic2: updates.gameUpdates.additionalMechanic2
      });

      await updateCustomTitleMutation.mutateAsync({
        gameId: updates.gameId,
        customTitle: updates.gameUpdates.customTitle
      });

      setEditingGame(null);
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleSelectAllGames = () => {
    const allGameIds = sortedFilteredLibrary.flatMap(group => [
      group.baseGame.id,
      ...group.expansions.map((exp: any) => exp.id)
    ]);
    selectAllGames(allGameIds);
  };

  const handleBulkDelete = async () => {
    if (selectedGames.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedGames).map(gameId => 
          removeGameMutation.mutateAsync(gameId)
        )
      );
      deselectAllGames();
      toggleSelectionMode();
    } catch (error) {
      console.error('Error removing games:', error);
    }
  };

  const handleStatusChange = async (userGameId: string, newStatus: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_games')
        .update({ status: newStatus })
        .eq('id', userGameId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating game status:', error);
        return;
      }
    } catch (error) {
      console.error('Error updating game status:', error);
    }
  };

  const handleGroupGames = async (draggedGameId: string, targetGameId: string) => {
    if (!userLibrary) return;
    
    // Find the dragged and target games
    const draggedGame = userLibrary.find((game: any) => game.id === draggedGameId);
    const targetGame = userLibrary.find((game: any) => game.id === targetGameId);
    
    if (!draggedGame || !targetGame) {
      console.error('Could not find games for grouping');
      return;
    }

    try {
      // If target is already an expansion, group with its base game instead
      if (targetGame.game.is_expansion && targetGame.game.base_game_bgg_id) {
        await updateExpansionMutation.mutateAsync({
          gameId: draggedGame.game.bgg_id,
          isExpansion: true,
          baseGameBggId: targetGame.game.base_game_bgg_id.toString()
        });
      } else {
        // Make dragged game an expansion of the target game
        await updateExpansionMutation.mutateAsync({
          gameId: draggedGame.game.bgg_id,
          isExpansion: true,
          baseGameBggId: targetGame.game.bgg_id.toString()
        });
      }
    } catch (error) {
      console.error('Error grouping games:', error);
    }
  };

  const handleFilterChange = (filter: 'all' | 'base_games' | 'expansions') => {
    setGameTypeFilter(filter);
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please sign in to view your library</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      {/* Hero Section with glassmorphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gaming opacity-5 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <LibraryHeader
            onSearchClick={() => setSearchDialogOpen(true)}
            onSyncClick={() => setSyncDialogOpen(true)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-8">
        {/* Stats Section with enhanced visual appeal */}
        <div className="animate-fade-in">
          <LibraryStats userLibrary={userLibrary} onFilterChange={handleFilterChange} />
        </div>

        {/* Filters and Controls in a sticky section */}
        {userLibrary && userLibrary.length > 0 && (
          <div className="sticky top-4 z-40 mb-8">
            <div className="bg-card/90 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-deep">
              <LibraryFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                isSelectionMode={isSelectionMode}
                selectedGames={selectedGames}
                onToggleSelectionMode={toggleSelectionMode}
                onSelectAll={handleSelectAllGames}
                onDeselectAll={deselectAllGames}
                onBulkDelete={handleBulkDelete}
                totalGames={userLibrary.length}
                isDeleting={removeGameMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Games List in a beautiful container */}
        <div className="animate-fade-in">
          <GamesList
            sortedFilteredLibrary={sortedFilteredLibrary}
            isSelectionMode={isSelectionMode}
            selectedGames={selectedGames}
            onEditGame={handleEditGame}
            onRemoveGame={(gameId) => removeGameMutation.mutate(gameId)}
            onSelectGame={handleGameSelection}
            onStatusChange={handleStatusChange}
            onSearchClick={() => setSearchDialogOpen(true)}
            onSyncClick={() => setSyncDialogOpen(true)}
            getDisplayTitle={getDisplayTitle}
            isRemoving={removeGameMutation.isPending}
            isLoading={isLoadingLibrary}
            onGroupGames={handleGroupGames}
          />
        </div>
      </div>

      {/* Dialogs */}
      <EditGameDialog
        editingGame={editingGame}
        onClose={() => setEditingGame(null)}
        onSave={handleSaveEdit}
        allBaseGames={allBaseGames}
        getDisplayTitle={getDisplayTitle}
        isSaving={updateGameMutation.isPending}
      />

      <SearchGameDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onSearch={search}
        onAddGame={handleAddGame}
        searchResults={searchResults}
        isSearching={isSearching}
        isAdding={addGameMutation.isPending}
      />

      <SyncDialog
        open={syncDialogOpen}
        onClose={() => setSyncDialogOpen(false)}
        onSync={handleSyncCollection}
        isSyncing={syncCollectionMutation.isPending}
      />
    </div>
  );
};

export default Library;