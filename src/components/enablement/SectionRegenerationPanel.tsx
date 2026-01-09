// Panel for regenerating and previewing manual sections

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Save,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { 
  ManualSection, 
  ManualDefinition,
  useGenerateSection,
  useRegenerateManual,
  useUpdateSectionContent
} from "@/hooks/useManualGeneration";

interface SectionRegenerationPanelProps {
  manual: ManualDefinition | null;
  sections: ManualSection[];
  onSectionUpdated?: () => void;
}

export function SectionRegenerationPanel({ 
  manual, 
  sections,
  onSectionUpdated 
}: SectionRegenerationPanelProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [versionBump, setVersionBump] = useState<'initial' | 'major' | 'minor' | 'patch'>('minor');
  const [previewContent, setPreviewContent] = useState<Record<string, any> | null>(null);
  const [previewSectionId, setPreviewSectionId] = useState<string | null>(null);
  
  const generateSection = useGenerateSection();
  const regenerateManual = useRegenerateManual();
  const updateSectionContent = useUpdateSectionContent();

  const sectionsNeedingRegen = sections.filter(s => s.needs_regeneration);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSections(sections.map(s => s.id));
    } else {
      setSelectedSections([]);
    }
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections(prev => [...prev, sectionId]);
    } else {
      setSelectedSections(prev => prev.filter(id => id !== sectionId));
    }
  };

  const handleGenerateSection = async (sectionId: string) => {
    const result = await generateSection.mutateAsync({
      sectionId,
      regenerationType: 'full',
      customInstructions: customInstructions || undefined
    });
    
    setPreviewContent(result.content);
    setPreviewSectionId(sectionId);
    onSectionUpdated?.();
  };

  const handleRegenerateSelected = async () => {
    if (!manual || selectedSections.length === 0) return;
    
    await regenerateManual.mutateAsync({
      manualCode: manual.manual_code,
      runType: 'section',
      versionBump,
      sectionIds: selectedSections
    });
    
    setSelectedSections([]);
    onSectionUpdated?.();
  };

  const handleRegenerateAll = async (type: 'full' | 'incremental') => {
    if (!manual) return;
    
    await regenerateManual.mutateAsync({
      manualCode: manual.manual_code,
      runType: type,
      versionBump
    });
    
    onSectionUpdated?.();
  };

  const handleSaveContent = async (sectionId: string, content: Record<string, any>) => {
    await updateSectionContent.mutateAsync({
      sectionId,
      content
    });
    
    setPreviewContent(null);
    setPreviewSectionId(null);
    onSectionUpdated?.();
  };

  if (!manual) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Select a manual to view sections</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Section Regeneration
            </CardTitle>
            <CardDescription>
              {manual.manual_name} • v{manual.current_version}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {sectionsNeedingRegen.length > 0 && (
              <Badge variant="destructive">
                {sectionsNeedingRegen.length} need update
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Regeneration Controls */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex-1 space-y-2">
            <Label>Version Bump</Label>
            <Select value={versionBump} onValueChange={(v: any) => setVersionBump(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Initial (1.0.0)</SelectItem>
                <SelectItem value="patch">Patch (x.x.+1)</SelectItem>
                <SelectItem value="minor">Minor (x.+1.0)</SelectItem>
                <SelectItem value="major">Major (+1.0.0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleRegenerateAll('incremental')}
              disabled={regenerateManual.isPending || sectionsNeedingRegen.length === 0}
            >
              {regenerateManual.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Regenerate Changed ({sectionsNeedingRegen.length})
            </Button>
            
            <Button
              onClick={() => handleRegenerateAll('full')}
              disabled={regenerateManual.isPending}
            >
              {regenerateManual.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Full Regeneration
            </Button>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2">
          <Label>Custom Instructions (optional)</Label>
          <Textarea
            placeholder="Add specific instructions for AI generation, e.g., 'Focus on administrator workflows' or 'Include more examples for new users'"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={2}
          />
        </div>

        {/* Sections List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Sections ({sections.length})</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSections.length === sections.length && sections.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
          
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-2 space-y-1">
              {sections.map((section) => (
                <div key={section.id} className="border rounded-lg">
                  <div 
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedSection(
                      expandedSection === section.id ? null : section.id
                    )}
                  >
                    <Checkbox
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={(checked) => handleSectionToggle(section.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {section.section_number}
                        </span>
                        <span className="text-sm truncate">{section.title}</span>
                      </div>
                      {section.last_generated_at && (
                        <p className="text-xs text-muted-foreground">
                          Generated: {new Date(section.last_generated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {section.needs_regeneration && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Outdated
                        </Badge>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateSection(section.id);
                        }}
                        disabled={generateSection.isPending}
                      >
                        {generateSection.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {expandedSection === section.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  
                  {expandedSection === section.id && (
                    <div className="p-3 pt-0 border-t bg-muted/20">
                      <Tabs defaultValue="content">
                        <TabsList className="mb-2">
                          <TabsTrigger value="content">Content</TabsTrigger>
                          <TabsTrigger value="sources">Sources</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="content">
                          <ScrollArea className="h-[200px]">
                            <pre className="text-xs whitespace-pre-wrap">
                              {JSON.stringify(section.content, null, 2)}
                            </pre>
                          </ScrollArea>
                        </TabsContent>
                        
                        <TabsContent value="sources">
                          <div className="space-y-2 text-sm">
                            <div>
                              <Label className="text-xs">Feature Codes:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(section.source_feature_codes || []).map((code) => (
                                  <Badge key={code} variant="outline" className="text-xs">
                                    {code}
                                  </Badge>
                                ))}
                                {(!section.source_feature_codes || section.source_feature_codes.length === 0) && (
                                  <span className="text-muted-foreground text-xs">None linked</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Module Codes:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(section.source_module_codes || []).map((code) => (
                                  <Badge key={code} variant="outline" className="text-xs">
                                    {code}
                                  </Badge>
                                ))}
                                {(!section.source_module_codes || section.source_module_codes.length === 0) && (
                                  <span className="text-muted-foreground text-xs">None linked</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </div>
              ))}
              
              {sections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No sections defined yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Actions */}
        {selectedSections.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">
              {selectedSections.length} section(s) selected
            </span>
            <Button
              size="sm"
              onClick={handleRegenerateSelected}
              disabled={regenerateManual.isPending}
            >
              {regenerateManual.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Regenerate Selected
            </Button>
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog 
          open={!!previewContent && !!previewSectionId} 
          onOpenChange={(open) => {
            if (!open) {
              setPreviewContent(null);
              setPreviewSectionId(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Generated Content Preview
              </DialogTitle>
              <DialogDescription>
                Review the AI-generated content before saving
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[500px] mt-4">
              {previewContent && (
                <div className="space-y-4 pr-4">
                  <div>
                    <h3 className="text-xl font-bold">{previewContent.title}</h3>
                    <p className="text-muted-foreground mt-1">{previewContent.overview}</p>
                  </div>
                  
                  {previewContent.learningObjectives && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Learning Objectives</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {previewContent.learningObjectives.map((obj: string, i: number) => (
                          <li key={i} className="text-sm">{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {previewContent.content?.map((section: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <h4 className="font-semibold">{section.heading}</h4>
                      <p className="text-sm">{section.body}</p>
                      
                      {section.steps?.map((step: any) => (
                        <div key={step.stepNumber} className="ml-4 p-3 border-l-2 border-primary/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{step.stepNumber}</Badge>
                            <span className="font-medium text-sm">{step.title}</span>
                          </div>
                          <p className="text-sm">{step.instruction}</p>
                          {step.tip && (
                            <p className="text-xs text-green-600 mt-1">💡 {step.tip}</p>
                          )}
                          {step.warning && (
                            <p className="text-xs text-destructive mt-1">⚠️ {step.warning}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {previewContent.keyTakeaways && (
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-semibold mb-2">Key Takeaways</h4>
                      <ul className="space-y-1">
                        {previewContent.keyTakeaways.map((point: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPreviewContent(null);
                  setPreviewSectionId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (previewSectionId && previewContent) {
                    handleSaveContent(previewSectionId, previewContent);
                  }
                }}
                disabled={updateSectionContent.isPending}
              >
                {updateSectionContent.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Content
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
