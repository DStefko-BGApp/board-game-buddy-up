import { useState } from "react";
import { Plus, TrendingUp, Trophy, Star, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreatePlayReportDialog } from "@/components/playreports/CreatePlayReportDialog";
import { PlayReportCard } from "@/components/playreports/PlayReportCard";
import { usePlayReports, usePlayerStats } from "@/hooks/usePlayReports";
import { useAuth } from "@/contexts/AuthContext";

export default function PlayReports() {
  const { user } = useAuth();
  const { playReports, isLoading, deletePlayReport } = usePlayReports();
  const { data: playerStats } = usePlayerStats();
  const [selectedTab, setSelectedTab] = useState("recent");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleDeletePlayReport = async (id: string) => {
    if (confirm('Are you sure you want to delete this play report? This action cannot be undone.')) {
      await deletePlayReport.mutateAsync(id);
    }
  };

  const recentReports = playReports.slice(0, 10);
  const myReports = playReports.filter(report => report.reporter_id === user?.id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Play Reports</h1>
          <p className="text-muted-foreground mt-2">
            Track your game sessions, scores, and memories
          </p>
        </div>
        <CreatePlayReportDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </CreatePlayReportDialog>
      </div>

      {/* Stats Cards */}
      {playerStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerStats.totalGames}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerStats.winRate}%</div>
              <p className="text-xs text-muted-foreground">
                {playerStats.wins} wins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerStats.averageRating || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                Out of 10
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Game</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {playerStats.favoriteGame || 'None yet'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Play Reports */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-6">
          {recentReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No play reports yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start recording your game sessions to track scores and memories
                </p>
                <CreatePlayReportDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Report
                  </Button>
                </CreatePlayReportDialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {recentReports.map((report) => (
                <PlayReportCard
                  key={report.id}
                  playReport={report}
                  onDelete={handleDeletePlayReport}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-reports" className="space-y-6">
          {myReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports created yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first play report to get started
                </p>
                <CreatePlayReportDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </CreatePlayReportDialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {myReports.map((report) => (
                <PlayReportCard
                  key={report.id}
                  playReport={report}
                  onDelete={handleDeletePlayReport}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}