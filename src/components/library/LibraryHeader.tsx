interface LibraryHeaderProps {
  onSearchClick: () => void;
  onSyncClick: () => void;
}

export const LibraryHeader = ({ onSearchClick, onSyncClick }: LibraryHeaderProps) => {
  return (
    <div className="mb-8">
      {/* Header with Friends page aesthetic */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-card/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
                Game Library
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your board game collection, track ratings, and organize your games
              </p>
            </div>
            <div className="flex gap-3 mt-6 md:mt-0">
              <button
                onClick={onSyncClick}
                className="px-6 py-3 bg-gradient-gaming text-white border-0 rounded-lg hover:shadow-glow transition-all duration-300 font-semibold hover-scale shadow-lg"
              >
                Sync BGG Collection
              </button>
              <button
                onClick={onSearchClick}
                className="px-6 py-3 bg-white/20 text-foreground border-2 border-white/40 rounded-lg hover:bg-white/30 backdrop-blur-sm font-semibold shadow-lg hover-scale transition-all duration-300"
              >
                Add Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};