import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { useCalibrationSessions } from "@/hooks/useCalibrationSessions";
import { CalibrationSessionDialog } from "@/components/performance/CalibrationSessionDialog";
import { CalibrationSessionCard } from "@/components/calibration/CalibrationSessionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Calendar, Users, BarChart3, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { STATUS_CONFIG } from "@/types/calibration";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useTabState } from "@/hooks/useTabState";

export default function CalibrationSessionsPage() {
  const { profile } = useAuth();
  const { navigateToRecord } = useWorkspaceNavigation();
  const companyId = profile?.company_id || "";
  
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSession, setEditingSession] = React.useState<any>(null);
  
  const [tabState, setTabState] = useTabState({
    defaultState: { searchQuery: "", statusFilter: "all" },
  });
  
  const { searchQuery, statusFilter } = tabState;
  const setSearchQuery = (v: string) => setTabState({ searchQuery: v });
  const setStatusFilter = (v: string) => setTabState({ statusFilter: v });
  
  const { sessions, isLoading, error, refetch } = useCalibrationSessions({ companyId });

  // Fetch appraisal cycles for the dialog
  const { data: appraisalCycles = [] } = useQuery({
    queryKey: ["appraisal-cycles", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appraisal_cycles")
        .select("id, name")
        .eq("company_id", companyId)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenSession = (sessionId: string, sessionName: string) => {
    navigateToRecord({
      route: `/performance/calibration/${sessionId}`,
      title: sessionName,
      subtitle: "Calibration",
      moduleCode: "performance",
      contextType: "calibration_session",
      contextId: sessionId,
      icon: Scale,
    });
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingSession(null);
    setDialogOpen(true);
  };

  const stats = {
    total: sessions.length,
    pending: sessions.filter(s => s.status === 'pending').length,
    inProgress: sessions.filter(s => s.status === 'in_progress').length,
    completed: sessions.filter(s => s.status === 'completed').length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumbs 
          items={[
            { label: "Performance", href: "/performance" },
            { label: "Calibration" },
          ]}
        />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Rating Calibration</h1>
              <p className="text-muted-foreground">
                Manage calibration sessions to ensure fair and consistent performance ratings
              </p>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No calibration sessions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your filters"
                  : "Create your first calibration session to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <CalibrationSessionCard
                key={session.id}
                session={session}
                onOpen={() => handleOpenSession(session.id, session.name)}
                onEdit={() => handleEditSession(session)}
              />
            ))}
          </div>
        )}

        {/* Dialog */}
        <CalibrationSessionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyId={companyId}
          editingSession={editingSession}
          appraisalCycles={appraisalCycles}
          onSuccess={() => {
            refetch();
            setDialogOpen(false);
            setEditingSession(null);
          }}
        />
      </div>
    </AppLayout>
  );
}