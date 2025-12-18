import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEnablementReleases } from "@/hooks/useEnablementData";
import { format } from "date-fns";

export default function ReleaseCalendarPage() {
  const { releases } = useEnablementReleases();

  const sortedReleases = [...releases].sort((a, b) => 
    new Date(a.release_date || '').getTime() - new Date(b.release_date || '').getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return 'bg-green-500';
      case 'preview': return 'bg-blue-500';
      case 'planning': return 'bg-amber-500';
      default: return 'bg-muted';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink to="/enablement">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <Calendar className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Release Calendar</h1>
              <p className="text-muted-foreground">View release timeline and planning</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming & Past Releases</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedReleases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mb-4 opacity-50" />
                <p>No releases scheduled yet</p>
                <Button variant="outline" className="mt-4" asChild>
                  <NavLink to="/enablement?tab=releases">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Release
                  </NavLink>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedReleases.map((release) => (
                  <div key={release.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(release.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{release.version_number}</span>
                        {release.release_name && (
                          <span className="text-muted-foreground">- {release.release_name}</span>
                        )}
                        <Badge variant="outline">{release.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {release.release_date 
                          ? format(new Date(release.release_date), 'PPP')
                          : 'No date set'}
                        {release.feature_count && ` • ${release.feature_count} features`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
