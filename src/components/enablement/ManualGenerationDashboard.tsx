// Dashboard for AI-powered manual generation workflow

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  FileText
} from "lucide-react";
import { 
  useManualDefinitions, 
  useManualSections,
  useManualGenerationRuns,
  useSectionsNeedingRegeneration,
  ManualDefinition
} from "@/hooks/useManualGeneration";
import { ManualChangeDetector } from "./ManualChangeDetector";
import { SectionRegenerationPanel } from "./SectionRegenerationPanel";
import { formatDistanceToNow } from "date-fns";

export function ManualGenerationDashboard() {
  const [selectedManualId, setSelectedManualId] = useState<string | null>(null);
  
  const { data: manuals = [], isLoading: loadingManuals } = useManualDefinitions();
  const { data: sections = [], refetch: refetchSections } = useManualSections(selectedManualId);
  const { data: runs = [] } = useManualGenerationRuns(selectedManualId);
  const { data: sectionsNeedingRegen = 0 } = useSectionsNeedingRegeneration(selectedManualId);

  const selectedManual = manuals.find(m => m.id === selectedManualId) || null;

  const getStatusIcon = (status: ManualDefinition['generation_status']) => {
    switch (status) {
      case 'generating': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'review_pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: ManualDefinition['generation_status']) => {
    switch (status) {
      case 'generating': return <Badge variant="secondary">Generating...</Badge>;
      case 'review_pending': return <Badge variant="outline" className="border-orange-500 text-orange-500">Review Pending</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline" className="border-green-500 text-green-500">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                AI Documentation Generator
              </CardTitle>
              <CardDescription>
                Automatically generate and maintain manual documentation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select 
                value={selectedManualId || ""} 
                onValueChange={(v) => setSelectedManualId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manual to manage" />
                </SelectTrigger>
                <SelectContent>
                  {manuals.map((manual) => (
                    <SelectItem key={manual.id} value={manual.id}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(manual.generation_status)}
                        <span>{manual.manual_name}</span>
                        <Badge variant="outline" className="ml-2">v{manual.current_version}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedManual && (
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedManual.generation_status)}
                {sectionsNeedingRegen > 0 && (
                  <Badge variant="destructive">
                    {sectionsNeedingRegen} outdated
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Cards Overview */}
      {!selectedManualId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manuals.map((manual) => (
            <Card 
              key={manual.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedManualId(manual.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{manual.manual_name}</CardTitle>
                  {getStatusIcon(manual.generation_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">v{manual.current_version}</Badge>
                  {manual.last_generated_at && (
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(manual.last_generated_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  Manage <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Manual Dashboard */}
      {selectedManual && (
        <Tabs defaultValue="sections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sections">
              <FileText className="h-4 w-4 mr-2" />
              Sections ({sections.length})
            </TabsTrigger>
            <TabsTrigger value="changes">
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Detection
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Generation History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sections">
            <SectionRegenerationPanel
              manual={selectedManual}
              sections={sections}
              onSectionUpdated={() => refetchSections()}
            />
          </TabsContent>
          
          <TabsContent value="changes">
            <ManualChangeDetector
              manualId={selectedManual.id}
              onSectionSelect={(sectionId) => {
                // Could expand that section in the sections tab
                console.log('Navigate to section:', sectionId);
              }}
              onRegenerateClick={(sectionIds) => {
                // Trigger regeneration of affected sections
                console.log('Regenerate sections:', sectionIds);
              }}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Generation History
                </CardTitle>
                <CardDescription>
                  Past AI generation runs for this manual
                </CardDescription>
              </CardHeader>
              <CardContent>
                {runs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No generation runs yet</p>
                    <p className="text-xs">Generate sections to create history</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {runs.map((run) => (
                        <div 
                          key={run.id} 
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  run.status === 'completed' ? 'default' :
                                  run.status === 'failed' ? 'destructive' :
                                  run.status === 'running' ? 'secondary' : 'outline'
                                }
                              >
                                {run.status}
                              </Badge>
                              <Badge variant="outline">{run.run_type}</Badge>
                              {run.version_bump && (
                                <Badge variant="outline">{run.version_bump}</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {run.from_version && run.to_version && (
                              <span>
                                v{run.from_version} → v{run.to_version}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              {run.sections_regenerated}/{run.sections_total} sections
                            </span>
                            {run.sections_failed > 0 && (
                              <span className="text-destructive">
                                {run.sections_failed} failed
                              </span>
                            )}
                          </div>
                          
                          {run.changelog && (
                            <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                              {run.changelog}
                            </div>
                          )}
                          
                          {run.error_message && (
                            <div className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                              {run.error_message}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
