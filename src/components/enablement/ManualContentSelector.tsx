// Manual/Chapter/Section cascading selector component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  RefreshCw,
  Loader2,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { ManualDefinition, ManualSection } from "@/hooks/useManualGeneration";
import { ChapterInfo } from "@/hooks/useChapterGeneration";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface ManualContentSelectorProps {
  // Data
  manuals: ManualDefinition[];
  chapters: ChapterInfo[];
  sectionsForChapter: ManualSection[];
  selectedSection: ManualSection | null;
  
  // Selection state
  selectedManualId: string;
  selectedChapter: string;
  selectedSectionId: string;
  
  // Callbacks
  onManualChange: (manualId: string) => void;
  onChapterChange: (chapterNumber: string) => void;
  onSectionChange: (sectionId: string) => void;
  onPreviewChanges: () => void;
  onRegenerateSection: () => void;
  onRegenerateChapter: () => void;
  
  // Loading states
  isLoadingManuals?: boolean;
  isLoadingSections?: boolean;
  isGeneratingPreview?: boolean;
  isApplying?: boolean;
}

export function ManualContentSelector({
  manuals,
  chapters,
  sectionsForChapter,
  selectedSection,
  selectedManualId,
  selectedChapter,
  selectedSectionId,
  onManualChange,
  onChapterChange,
  onSectionChange,
  onPreviewChanges,
  onRegenerateSection,
  onRegenerateChapter,
  isLoadingManuals = false,
  isLoadingSections = false,
  isGeneratingPreview = false,
  isApplying = false,
}: ManualContentSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const isLoading = isGeneratingPreview || isApplying;
  
  // Format section content preview
  const getSectionContentPreview = (section: ManualSection): string => {
    if (!section.content) return "No content generated yet";
    
    const content = section.content as Record<string, unknown>;
    if (typeof content.markdown === 'string') {
      return content.markdown.substring(0, 150) + "...";
    }
    if (typeof content.content === 'string') {
      return content.content.substring(0, 150) + "...";
    }
    
    return "Content available";
  };
  
  // Check if section has content
  const hasContent = (section: ManualSection): boolean => {
    if (!section.content) return false;
    const content = section.content as Record<string, unknown>;
    return !!(content.markdown || content.content);
  };

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Manual Content
              </CardTitle>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Manual Selector */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Manual</label>
              <Select 
                value={selectedManualId || "__none__"} 
                onValueChange={(v) => onManualChange(v === "__none__" ? "" : v)}
                disabled={isLoadingManuals}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a manual..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a manual...</SelectItem>
                  {manuals.map((manual) => (
                    <SelectItem key={manual.id} value={manual.id}>
                      <div className="flex items-center gap-2">
                        <span>{manual.manual_name}</span>
                        <Badge variant="outline" className="text-[10px] px-1">
                          v{manual.current_version}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Selector */}
            {selectedManualId && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Chapter</label>
                <Select 
                  value={selectedChapter || "__none__"} 
                  onValueChange={(v) => onChapterChange(v === "__none__" ? "" : v)}
                  disabled={isLoadingSections || chapters.length === 0}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={isLoadingSections ? "Loading..." : "Select a chapter..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select a chapter...</SelectItem>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.chapterNumber} value={chapter.chapterNumber}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {chapter.chapterNumber}.
                          </span>
                          <span className="truncate max-w-[200px]">{chapter.title}</span>
                          <Badge variant="secondary" className="text-[10px] px-1 ml-auto">
                            {chapter.sectionCount}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Section Selector */}
            {selectedChapter && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Section</label>
                <Select 
                  value={selectedSectionId || "__none__"} 
                  onValueChange={(v) => onSectionChange(v === "__none__" ? "" : v)}
                  disabled={sectionsForChapter.length === 0}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a section..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select a section...</SelectItem>
                    {sectionsForChapter.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        <div className="flex items-center gap-2 w-full">
                          <span className="font-mono text-xs text-muted-foreground">
                            {section.section_number}
                          </span>
                          <span className="truncate max-w-[180px]">{section.title}</span>
                          {section.needs_regeneration && (
                            <AlertCircle className="h-3 w-3 text-amber-500 ml-auto flex-shrink-0" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected Section Info */}
            {selectedSection && (
              <>
                <Separator className="my-3" />
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {selectedSection.section_number}
                        </Badge>
                        {selectedSection.needs_regeneration && (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
                            Needs Update
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1 truncate">
                        {selectedSection.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedSection.last_generated_at 
                        ? formatDistanceToNow(new Date(selectedSection.last_generated_at), { addSuffix: true })
                        : "Never generated"
                      }
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {hasContent(selectedSection) ? "Has content" : "No content"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onPreviewChanges}
                disabled={!selectedSectionId || isLoading}
                className="flex-1"
              >
                {isGeneratingPreview ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Eye className="h-3 w-3 mr-1" />
                )}
                Preview Changes
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onRegenerateSection}
                disabled={!selectedSectionId || isLoading}
                className="flex-1"
              >
                {isApplying && selectedSectionId ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Regenerate
              </Button>
            </div>

            {selectedChapter && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onRegenerateChapter}
                disabled={isLoading}
                className="w-full"
              >
                {isApplying && !selectedSectionId ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-2" />
                )}
                Regenerate Chapter {selectedChapter}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
