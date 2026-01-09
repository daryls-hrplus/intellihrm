// Smart section selection toolbar with AI-powered quick actions

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCw, Trash2, CheckSquare, GitMerge } from "lucide-react";
import { toast } from "sonner";
import type { ManualSection } from "@/types/kb.types";
import { supabase } from "@/integrations/supabase/client";

interface SmartSectionActionsProps {
  sections: ManualSection[];
  selectedSections: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function SmartSectionActions({
  sections,
  selectedSections,
  onSelectionChange,
}: SmartSectionActionsProps) {
  const [isAnalyzingDeps, setIsAnalyzingDeps] = useState(false);
  const [suggestedSections, setSuggestedSections] = useState<string[]>([]);

  // Count sections by status
  const statusCounts = sections.reduce((acc, s) => {
    const status = s.status || 'unchanged';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Select all sections
  const handleSelectAll = () => {
    onSelectionChange(sections.map(s => s.id));
    toast.success(`Selected all ${sections.length} sections`);
  };

  // Clear all selections
  const handleClearAll = () => {
    onSelectionChange([]);
    setSuggestedSections([]);
    toast.success("Cleared selection");
  };

  // Select only changed or new sections
  const handleSelectChanged = () => {
    const changedIds = sections
      .filter(s => s.status === 'changed' || s.status === 'new')
      .map(s => s.id);
    
    if (changedIds.length === 0) {
      toast.info("No changed or new sections found");
      return;
    }
    
    onSelectionChange(changedIds);
    toast.success(`Selected ${changedIds.length} changed/new sections`);
  };

  // Analyze dependencies with AI
  const handleAnalyzeDependencies = async () => {
    if (selectedSections.length === 0) {
      toast.warning("Select at least one section first");
      return;
    }

    setIsAnalyzingDeps(true);
    setSuggestedSections([]);

    try {
      const selectedTitles = sections
        .filter(s => selectedSections.includes(s.id))
        .map(s => ({ id: s.id, title: s.title, content: s.content?.substring(0, 300) || '' }));

      const unselectedSections = sections
        .filter(s => !selectedSections.includes(s.id))
        .map(s => ({ id: s.id, title: s.title, content: s.content?.substring(0, 300) || '' }));

      const { data, error } = await supabase.functions.invoke('analyze-section-dependencies', {
        body: {
          selectedSections: selectedTitles,
          availableSections: unselectedSections,
        },
      });

      if (error) throw error;

      if (data?.suggestedSections && data.suggestedSections.length > 0) {
        setSuggestedSections(data.suggestedSections);
        toast.success(`Found ${data.suggestedSections.length} related sections`);
      } else {
        toast.info("No additional dependencies found");
      }
    } catch (error) {
      console.error('Dependency analysis error:', error);
      toast.error("Failed to analyze dependencies");
    } finally {
      setIsAnalyzingDeps(false);
    }
  };

  // Add suggested sections
  const handleAddSuggested = () => {
    const newSelection = [...new Set([...selectedSections, ...suggestedSections])];
    onSelectionChange(newSelection);
    setSuggestedSections([]);
    toast.success(`Added ${suggestedSections.length} suggested sections`);
  };

  // Dismiss suggestions
  const handleDismissSuggestions = () => {
    setSuggestedSections([]);
  };

  return (
    <div className="space-y-3">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          <CheckSquare className="h-4 w-4 mr-1.5" />
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          disabled={selectedSections.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Clear All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectChanged}
          disabled={(statusCounts.changed || 0) + (statusCounts.new || 0) === 0}
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Select Changed Only
          {((statusCounts.changed || 0) + (statusCounts.new || 0)) > 0 && (
            <Badge variant="secondary" className="ml-1.5">
              {(statusCounts.changed || 0) + (statusCounts.new || 0)}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyzeDependencies}
          disabled={isAnalyzingDeps || selectedSections.length === 0}
        >
          {isAnalyzingDeps ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <GitMerge className="h-4 w-4 mr-1.5" />
          )}
          Include Dependencies
        </Button>
      </div>

      {/* Status Counts */}
      <div className="flex flex-wrap gap-2 text-sm">
        {statusCounts.new && statusCounts.new > 0 && (
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            {statusCounts.new} New
          </Badge>
        )}
        {statusCounts.changed && statusCounts.changed > 0 && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
            {statusCounts.changed} Changed
          </Badge>
        )}
        {statusCounts.unchanged && statusCounts.unchanged > 0 && (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {statusCounts.unchanged} Unchanged
          </Badge>
        )}
      </div>

      {/* AI Suggestions Banner */}
      {suggestedSections.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              AI found {suggestedSections.length} related sections
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {sections
                .filter(s => suggestedSections.includes(s.id))
                .map(s => s.title)
                .slice(0, 3)
                .join(', ')}
              {suggestedSections.length > 3 && ` and ${suggestedSections.length - 3} more`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="ghost" onClick={handleDismissSuggestions}>
              Dismiss
            </Button>
            <Button size="sm" onClick={handleAddSuggested}>
              Add All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
