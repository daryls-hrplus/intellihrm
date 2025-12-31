import React, { useState } from 'react';
import { 
  FileText, 
  Wand2, 
  Edit3, 
  Check, 
  RotateCcw,
  Copy,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  useNarrativeIntelligence, 
  NarrativeType, 
  GeneratedNarrative 
} from '@/hooks/performance/useNarrativeIntelligence';

interface NarrativeGeneratorPanelProps {
  employeeId: string;
  companyId: string;
  participantId?: string;
  cycleId?: string;
  narrativeType?: NarrativeType;
  onNarrativeApproved?: (narrative: GeneratedNarrative) => void;
  className?: string;
}

const narrativeTypeConfig: Record<NarrativeType, { label: string; description: string; icon: React.ReactNode }> = {
  performance_summary: {
    label: 'Performance Summary',
    description: 'Comprehensive narrative of overall performance',
    icon: <FileText className="h-4 w-4" />,
  },
  promotion_justification: {
    label: 'Promotion Justification',
    description: 'Documentation supporting career advancement',
    icon: <FileText className="h-4 w-4" />,
  },
  development_narrative: {
    label: 'Development Narrative',
    description: 'Growth-focused feedback and recommendations',
    icon: <FileText className="h-4 w-4" />,
  },
  calibration_notes: {
    label: 'Calibration Notes',
    description: 'Post-calibration documentation',
    icon: <FileText className="h-4 w-4" />,
  },
  pip_rationale: {
    label: 'PIP Rationale',
    description: 'Performance improvement plan documentation',
    icon: <FileText className="h-4 w-4" />,
  },
};

export function NarrativeGeneratorPanel({
  employeeId,
  companyId,
  participantId,
  cycleId,
  narrativeType = 'performance_summary',
  onNarrativeApproved,
  className,
}: NarrativeGeneratorPanelProps) {
  const [selectedType, setSelectedType] = useState<NarrativeType>(narrativeType);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showSources, setShowSources] = useState(false);
  
  const { toast } = useToast();
  const {
    generating,
    narrative,
    generateNarrative,
    saveEditedNarrative,
    approveNarrative,
  } = useNarrativeIntelligence();

  const handleGenerate = async () => {
    const result = await generateNarrative({
      employeeId,
      companyId,
      participantId,
      cycleId,
      narrativeType: selectedType,
    });
    
    if (result) {
      setEditedContent(result.generatedContent);
      toast({
        title: 'Narrative Generated',
        description: 'AI has generated a narrative based on available data.',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (narrative && editedContent !== narrative.generatedContent) {
      const success = await saveEditedNarrative(narrative.id, editedContent);
      if (success) {
        toast({
          title: 'Changes Saved',
          description: 'Your edits have been saved.',
        });
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleApprove = async () => {
    if (narrative) {
      const success = await approveNarrative(narrative.id, employeeId);
      if (success) {
        toast({
          title: 'Narrative Approved',
          description: 'The narrative has been approved and saved.',
        });
        onNarrativeApproved?.(narrative);
      }
    }
  };

  const handleCopy = () => {
    const content = editedContent || narrative?.generatedContent || '';
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Narrative copied to clipboard.',
    });
  };

  const handleReset = () => {
    if (narrative) {
      setEditedContent(narrative.generatedContent);
      setIsEditing(false);
    }
  };

  const config = narrativeTypeConfig[selectedType];

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Narrative Generator</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            ISO 42001
          </Badge>
        </div>
        <CardDescription>
          Generate AI-powered narratives from performance data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type Selection */}
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as NarrativeType)}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-5">
            {Object.entries(narrativeTypeConfig).map(([type, cfg]) => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {cfg.label.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Description */}
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>

        {/* Generate Button or Content */}
        {!narrative && !generating ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Generate an AI narrative based on performance data
            </p>
            <Button onClick={handleGenerate}>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate {config.label}
            </Button>
          </div>
        ) : generating ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : narrative ? (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSources(!showSources)}
              >
                {showSources ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showSources ? 'Hide' : 'Show'} Sources
              </Button>
            </div>

            {/* Content */}
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            ) : (
              <div className="p-4 rounded-lg border bg-background min-h-[200px]">
                <p className="text-sm whitespace-pre-wrap">
                  {editedContent || narrative.generatedContent}
                </p>
              </div>
            )}

            {/* Source Data */}
            {showSources && narrative.sourceData && (
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <p className="text-xs font-medium">Source Data:</p>
                {narrative.sourceData.ratings?.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Ratings:</span> {narrative.sourceData.ratings.length} items
                  </div>
                )}
                {narrative.sourceData.evidence?.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Evidence:</span> {narrative.sourceData.evidence.length} items
                  </div>
                )}
                {narrative.sourceData.goals?.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Goals:</span> {narrative.sourceData.goals.length} items
                  </div>
                )}
              </div>
            )}

            {/* Approval Section */}
            {!narrative.isApproved && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  AI Confidence: {Math.round((narrative.aiConfidenceScore || 0) * 100)}%
                </div>
                <Button onClick={handleApprove}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve Narrative
                </Button>
              </div>
            )}

            {narrative.isApproved && (
              <div className="flex items-center gap-2 pt-4 border-t text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Approved</span>
                {narrative.approvedAt && (
                  <span className="text-xs text-muted-foreground">
                    on {new Date(narrative.approvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {/* Regenerate */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGenerate}
              disabled={generating}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
