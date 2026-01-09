// Rich content editor for manual sections

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Sparkles, 
  Eye, 
  Code2, 
  FileText,
  Loader2,
  X,
  Check
} from "lucide-react";
import { 
  ManualSection,
  useUpdateSectionContent,
  useGenerateSection
} from "@/hooks/useManualGeneration";
import { toast } from "sonner";

interface SectionContentEditorProps {
  section: ManualSection;
  onClose: () => void;
  onSaved?: () => void;
}

export function SectionContentEditor({ 
  section, 
  onClose,
  onSaved 
}: SectionContentEditorProps) {
  const [content, setContent] = useState<Record<string, any>>(section.content || {});
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const updateContent = useUpdateSectionContent();
  const generateSection = useGenerateSection();

  useEffect(() => {
    setJsonText(JSON.stringify(content, null, 2));
  }, [content]);

  const handleContentChange = (key: string, value: any) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    setHasChanges(true);
    try {
      const parsed = JSON.parse(text);
      setContent(parsed);
    } catch {
      // Invalid JSON, keep the text for editing
    }
  };

  const handleSave = async () => {
    try {
      if (jsonMode) {
        const parsed = JSON.parse(jsonText);
        await updateContent.mutateAsync({ sectionId: section.id, content: parsed });
      } else {
        await updateContent.mutateAsync({ sectionId: section.id, content });
      }
      setHasChanges(false);
      onSaved?.();
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format");
      }
    }
  };

  const handleRegenerate = async () => {
    const result = await generateSection.mutateAsync({
      sectionId: section.id,
      regenerationType: 'full'
    });
    
    if (result.content) {
      setContent(result.content);
      setJsonText(JSON.stringify(result.content, null, 2));
      setHasChanges(true);
    }
  };

  // Extract common content fields
  const title = content.title || "";
  const overview = content.overview || "";
  const learningObjectives = content.learningObjectives || [];
  const keyTakeaways = content.keyTakeaways || [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Section Content
            </CardTitle>
            <CardDescription>
              {section.section_number} - {section.title}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-500 border-orange-500">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="visual" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="visual" onClick={() => setJsonMode(false)}>
                <Eye className="h-4 w-4 mr-2" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="json" onClick={() => setJsonMode(true)}>
                <Code2 className="h-4 w-4 mr-2" />
                JSON Editor
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRegenerate}
                disabled={generateSection.isPending}
              >
                {generateSection.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Regenerate
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || updateContent.isPending}
              >
                {updateContent.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>

          <TabsContent value="visual" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px]">
              <div className="space-y-6 pr-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => handleContentChange("title", e.target.value)}
                    placeholder="Section title..."
                  />
                </div>

                {/* Overview */}
                <div className="space-y-2">
                  <Label>Overview</Label>
                  <Textarea
                    value={overview}
                    onChange={(e) => handleContentChange("overview", e.target.value)}
                    placeholder="Brief overview of this section..."
                    rows={3}
                  />
                </div>

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <Label>Learning Objectives</Label>
                  <div className="space-y-2">
                    {learningObjectives.map((obj: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge variant="secondary">{idx + 1}</Badge>
                        <Input
                          value={obj}
                          onChange={(e) => {
                            const updated = [...learningObjectives];
                            updated[idx] = e.target.value;
                            handleContentChange("learningObjectives", updated);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updated = learningObjectives.filter((_: string, i: number) => i !== idx);
                            handleContentChange("learningObjectives", updated);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContentChange("learningObjectives", [...learningObjectives, ""])}
                    >
                      Add Objective
                    </Button>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2">
                  <Label>Key Takeaways</Label>
                  <div className="space-y-2">
                    {keyTakeaways.map((takeaway: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <Input
                          value={takeaway}
                          onChange={(e) => {
                            const updated = [...keyTakeaways];
                            updated[idx] = e.target.value;
                            handleContentChange("keyTakeaways", updated);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updated = keyTakeaways.filter((_: string, i: number) => i !== idx);
                            handleContentChange("keyTakeaways", updated);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContentChange("keyTakeaways", [...keyTakeaways, ""])}
                    >
                      Add Takeaway
                    </Button>
                  </div>
                </div>

                {/* Raw content display for other fields */}
                {Object.keys(content).filter(k => 
                  !['title', 'overview', 'learningObjectives', 'keyTakeaways'].includes(k)
                ).length > 0 && (
                  <div className="space-y-2">
                    <Label>Additional Content</Label>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[200px]">
                        {JSON.stringify(
                          Object.fromEntries(
                            Object.entries(content).filter(([k]) => 
                              !['title', 'overview', 'learningObjectives', 'keyTakeaways'].includes(k)
                            )
                          ), 
                          null, 
                          2
                        )}
                      </pre>
                      <p className="text-xs text-muted-foreground mt-2">
                        Use JSON Editor for advanced content editing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="flex-1 overflow-hidden">
            <Textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="h-[500px] font-mono text-sm resize-none"
              placeholder="{}"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
