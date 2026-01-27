import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useTabState } from "@/hooks/useTabState";
import { 
  FunctionalAreaFilter,
  ManualsActSection,
} from "@/components/enablement/manuals";
import {
  type FunctionalArea,
  MANUALS_BY_ACT,
  getFilteredActsWithManuals,
  getFilteredChapterCount,
  getFilteredManualCount,
  getTotalChapters,
  getAllManuals,
} from "@/constants/manualsStructure";

export default function ManualsIndexPage() {
  const { navigateToRecord, navigateToList } = useWorkspaceNavigation();
  
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeFunctionalArea: "all" as FunctionalArea | "all",
      expandedActs: MANUALS_BY_ACT.map(a => a.id),
    },
  });

  const { activeFunctionalArea, expandedActs } = tabState;
  
  const filteredActs = getFilteredActsWithManuals(activeFunctionalArea);
  const filteredChapters = getFilteredChapterCount(activeFunctionalArea);
  const filteredManuals = getFilteredManualCount(activeFunctionalArea);
  const totalChapters = getTotalChapters();
  const totalManuals = getAllManuals().length;

  const handleFilterChange = (filter: FunctionalArea | "all") => {
    setTabState({ activeFunctionalArea: filter });
  };

  const handleToggleAct = (actId: string) => {
    setTabState({
      expandedActs: expandedActs.includes(actId)
        ? expandedActs.filter(id => id !== actId)
        : [...expandedActs, actId],
    });
  };

  const handleManualClick = (manualId: string, manualTitle: string, href: string) => {
    navigateToRecord({
      route: href,
      title: manualTitle,
      subtitle: "Manual",
      moduleCode: "enablement",
      contextType: "manual",
      contextId: manualId,
      icon: BookOpen,
    });
  };

  const handlePublishClick = () => {
    navigateToList({
      route: "/enablement/manual-publishing",
      title: "Manual Publishing",
      moduleCode: "enablement",
    });
  };

  const isFiltered = activeFunctionalArea !== "all";

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Administrator Manuals" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Administrator Manuals
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive configuration guides organized by employee lifecycle
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">
                {isFiltered ? filteredChapters : totalChapters}
              </p>
              <p className="text-sm text-muted-foreground">
                {isFiltered ? "Filtered Chapters" : "Total Chapters"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {isFiltered ? filteredManuals : totalManuals}
              </p>
              <p className="text-sm text-muted-foreground">
                {isFiltered ? "Filtered Guides" : "Guides"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                <p className="font-medium">Complete Administrator Documentation</p>
                  <p className="text-sm text-muted-foreground">
                    {totalChapters} chapters covering all administrative functions across {totalManuals} comprehensive guides
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Functional Area Filter */}
        <Card>
          <CardContent className="p-4">
            <FunctionalAreaFilter
              activeFilter={activeFunctionalArea}
              onFilterChange={handleFilterChange}
            />
          </CardContent>
        </Card>

        {/* Filter Status */}
        {isFiltered && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing</span>
            <Badge variant="secondary">{filteredManuals} guides</Badge>
            <span>with</span>
            <Badge variant="secondary">{filteredChapters} chapters</Badge>
            <span>in</span>
            <Badge variant="secondary">{filteredActs.length} lifecycle stages</Badge>
          </div>
        )}

        {/* Acts with Manuals */}
        <div className="space-y-4">
          {filteredActs.map((act) => (
            <ManualsActSection
              key={act.id}
              act={act}
              isExpanded={expandedActs.includes(act.id)}
              onToggle={() => handleToggleAct(act.id)}
              onManualClick={handleManualClick}
            />
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigateToList({
                  route: "/enablement/create",
                  title: "Content Creation Studio",
                  moduleCode: "enablement",
                })}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Documentation
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigateToList({
                  route: "/enablement/release-center?activeTab=publishing",
                  title: "Release Command Center",
                  moduleCode: "enablement",
                })}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Manage Publishing
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigateToList({
                  route: "/enablement",
                  title: "Content Hub",
                  moduleCode: "enablement",
                })}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Back to Content Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
