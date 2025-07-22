interface LibraryHeaderProps {
  onSearchClick: () => void;
  onSyncClick: () => void;
}

export const LibraryHeader = ({ onSearchClick, onSyncClick }: LibraryHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Game Library</h1>
          <p className="text-muted-foreground">
            Manage your board game collection, track ratings, and organize your games
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onSyncClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Sync BGG Collection
          </button>
          <button
            onClick={onSearchClick}
            className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
          >
            Add Manual Game
          </button>
        </div>
      </div>
    </div>
  );
};