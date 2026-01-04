import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBehavioralAnchors, QuestionAnchors } from "@/hooks/useBehavioralAnchors";
import { useLanguage } from "@/hooks/useLanguage";
import { Save, Plus, X, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

interface BehavioralAnchorEditorProps {
  questionId?: string;
  competencyId?: string;
  companyId: string;
  scaleMax?: number;
  initialAnchors?: QuestionAnchors;
  onSave?: (anchors: QuestionAnchors) => void;
}

export function BehavioralAnchorEditor({
  questionId,
  competencyId,
  companyId,
  scaleMax = 5,
  initialAnchors,
  onSave,
}: BehavioralAnchorEditorProps) {
  const { t } = useLanguage();
  const { 
    getDefaultAnchors, 
    updateQuestionAnchors, 
    saveAnchorsForCompetency,
    loading 
  } = useBehavioralAnchors();

  const [anchors, setAnchors] = useState<QuestionAnchors>(
    initialAnchors || getDefaultAnchors(scaleMax)
  );
  const [displayMode, setDisplayMode] = useState<'tooltip' | 'inline' | 'popup'>('tooltip');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (initialAnchors) {
      setAnchors(initialAnchors);
    }
  }, [initialAnchors]);

  const handleAnchorChange = (
    scaleValue: string, 
    field: 'label' | 'description', 
    value: string
  ) => {
    setAnchors(prev => ({
      ...prev,
      [scaleValue]: {
        ...prev[scaleValue],
        [field]: value,
      },
    }));
  };

  const handleExampleAdd = (scaleValue: string) => {
    setAnchors(prev => ({
      ...prev,
      [scaleValue]: {
        ...prev[scaleValue],
        examples: [...(prev[scaleValue]?.examples || []), ''],
      },
    }));
  };

  const handleExampleChange = (scaleValue: string, index: number, value: string) => {
    setAnchors(prev => ({
      ...prev,
      [scaleValue]: {
        ...prev[scaleValue],
        examples: prev[scaleValue]?.examples?.map((ex, i) => 
          i === index ? value : ex
        ) || [],
      },
    }));
  };

  const handleExampleRemove = (scaleValue: string, index: number) => {
    setAnchors(prev => ({
      ...prev,
      [scaleValue]: {
        ...prev[scaleValue],
        examples: prev[scaleValue]?.examples?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const handleLoadDefaults = () => {
    setAnchors(getDefaultAnchors(scaleMax));
    toast.success('Default anchors loaded');
  };

  const handleSave = async () => {
    if (questionId) {
      const success = await updateQuestionAnchors(questionId, anchors, displayMode);
      if (success && onSave) {
        onSave(anchors);
      }
    } else if (competencyId) {
      const anchorsArray = Object.entries(anchors).map(([value, anchor]) => ({
        scale_value: parseInt(value),
        scale_label: anchor.label,
        anchor_text: anchor.description,
        examples: anchor.examples,
      }));
      const success = await saveAnchorsForCompetency(competencyId, companyId, anchorsArray);
      if (success && onSave) {
        onSave(anchors);
      }
    }
  };

  const getScaleColor = (value: number): string => {
    if (value <= 2) return 'text-destructive';
    if (value === 3) return 'text-warning';
    return 'text-success';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("feedback.bars.editorTitle")}</CardTitle>
            <CardDescription>
              {t("feedback.bars.editorDescription")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadDefaults}>
              <Copy className="h-4 w-4 mr-1" />
              Load Defaults
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!previewMode ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Display Mode</Label>
              <div className="flex gap-2">
                {(['tooltip', 'inline', 'popup'] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={displayMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDisplayMode(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Tabs defaultValue="1">
              <TabsList className="w-full justify-start">
                {Array.from({ length: scaleMax }, (_, i) => i + 1).map(value => (
                  <TabsTrigger key={value} value={value.toString()}>
                    <span className={getScaleColor(value)}>
                      {value}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {Array.from({ length: scaleMax }, (_, i) => i + 1).map(value => (
                <TabsContent key={value} value={value.toString()} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={anchors[value.toString()]?.label || ''}
                        onChange={(e) => handleAnchorChange(value.toString(), 'label', e.target.value)}
                        placeholder={`Level ${value} label`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Behavioral Description</Label>
                      <Textarea
                        value={anchors[value.toString()]?.description || ''}
                        onChange={(e) => handleAnchorChange(value.toString(), 'description', e.target.value)}
                        placeholder="Describe the behavior expected at this level..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Examples</Label>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleExampleAdd(value.toString())}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Example
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {anchors[value.toString()]?.examples?.map((example, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={example}
                              onChange={(e) => handleExampleChange(value.toString(), index, e.target.value)}
                              placeholder="Enter behavioral example..."
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleExampleRemove(value.toString(), index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium">Preview: Rating Scale with Anchors</h4>
            <div className="grid gap-3">
              {Array.from({ length: scaleMax }, (_, i) => i + 1).map(value => (
                <div 
                  key={value} 
                  className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Badge 
                    variant={value >= 4 ? 'default' : value <= 2 ? 'destructive' : 'secondary'}
                    className="min-w-[32px] justify-center"
                  >
                    {value}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">
                      {anchors[value.toString()]?.label || `Level ${value}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {anchors[value.toString()]?.description || 'No description provided'}
                    </div>
                    {anchors[value.toString()]?.examples?.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium">Examples: </span>
                        {anchors[value.toString()]?.examples?.join('; ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
