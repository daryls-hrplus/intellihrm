import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Pencil, 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  FileText,
  Wand2,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { 
  useAppraisalFeedbackAssistant, 
  Suggestion, 
  FeedbackContext 
} from '@/hooks/useAppraisalFeedbackAssistant';
import { cn } from '@/lib/utils';

interface AIFeedbackAssistantPanelProps {
  employeeId: string;
  cycleId: string;
  participantId?: string;
  context?: FeedbackContext;
  onAcceptSuggestion?: (suggestion: Suggestion) => void;
  onCommentImproved?: (improvedComment: string) => void;
  className?: string;
}

export function AIFeedbackAssistantPanel({
  employeeId,
  cycleId,
  participantId,
  context,
  onAcceptSuggestion,
  onCommentImproved,
  className
}: AIFeedbackAssistantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [commentToImprove, setCommentToImprove] = useState('');
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  
  const {
    loading,
    response,
    generateStrengths,
    generateDevelopment,
    improveComment,
    detectBias,
    suggestEvidence,
    generateSummary,
    reset
  } = useAppraisalFeedbackAssistant();

  const handleGenerateStrengths = () => {
    generateStrengths(employeeId, cycleId, context);
  };

  const handleGenerateDevelopment = () => {
    generateDevelopment(employeeId, cycleId, context);
  };

  const handleImproveComment = () => {
    if (commentToImprove.trim()) {
      improveComment(employeeId, cycleId, commentToImprove);
    }
  };

  const handleDetectBias = () => {
    if (commentToImprove.trim()) {
      detectBias(employeeId, cycleId, commentToImprove);
    }
  };

  const handleSuggestEvidence = () => {
    suggestEvidence(employeeId, cycleId, context);
  };

  const handleGenerateSummary = () => {
    generateSummary(employeeId, cycleId, participantId);
  };

  const handleAccept = (suggestion: Suggestion) => {
    if (suggestion.type === 'improvement' && onCommentImproved) {
      onCommentImproved(suggestion.suggested);
    }
    if (onAcceptSuggestion) {
      onAcceptSuggestion(suggestion);
    }
  };

  const handleEdit = (suggestion: Suggestion, index: number) => {
    setEditingSuggestion(`${index}`);
    setEditedText(suggestion.suggested);
  };

  const handleSaveEdit = (suggestion: Suggestion) => {
    const edited: Suggestion = { ...suggestion, suggested: editedText };
    handleAccept(edited);
    setEditingSuggestion(null);
    setEditedText('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'strength': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'development': return <TrendingDown className="h-4 w-4 text-amber-600" />;
      case 'improvement': return <Wand2 className="h-4 w-4 text-blue-600" />;
      case 'summary': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getSuggestionBadgeVariant = (type: Suggestion['type']) => {
    switch (type) {
      case 'strength': return 'default';
      case 'development': return 'secondary';
      case 'improvement': return 'outline';
      case 'summary': return 'default';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-background to-primary/5", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Feedback Assistant
              </CardTitle>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateStrengths}
                  disabled={loading}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Generate Strengths
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateDevelopment}
                  disabled={loading}
                  className="text-xs"
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Development Areas
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSuggestEvidence}
                  disabled={loading}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Suggest Evidence
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateSummary}
                  disabled={loading}
                  className="text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate Summary
                </Button>
              </div>
            </div>

            {/* Comment Improvement */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground font-medium">Improve a Comment</p>
              <Textarea
                placeholder="Paste a comment to improve or check for bias..."
                value={commentToImprove}
                onChange={(e) => setCommentToImprove(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleImproveComment}
                  disabled={loading || !commentToImprove.trim()}
                  className="text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Improve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleDetectBias}
                  disabled={loading || !commentToImprove.trim()}
                  className="text-xs"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Check Bias
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Generating suggestions...</span>
              </div>
            )}

            {/* Bias Warnings */}
            {response?.biasFlags && response.biasFlags.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Potential Bias Detected</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    {response.biasFlags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Evidence Recommendations */}
            {response?.evidenceRecommendations && response.evidenceRecommendations.length > 0 && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Missing Evidence</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    {response.evidenceRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Suggestions */}
            {response?.suggestions && response.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">
                    AI Suggestions ({response.suggestions.length})
                  </p>
                  <Button size="sm" variant="ghost" onClick={reset} className="text-xs h-6 px-2">
                    Clear
                  </Button>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-4">
                    {response.suggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg border bg-card space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            <Badge variant={getSuggestionBadgeVariant(suggestion.type)} className="text-xs capitalize">
                              {suggestion.type}
                            </Badge>
                            <span className={cn("text-xs", getConfidenceColor(suggestion.confidence))}>
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>

                        {suggestion.original && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            <span className="font-medium">Original: </span>
                            {suggestion.original}
                          </div>
                        )}

                        {editingSuggestion === `${index}` ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              rows={3}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveEdit(suggestion)}>
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingSuggestion(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{suggestion.suggested}</p>
                            <p className="text-xs text-muted-foreground italic">{suggestion.reasoning}</p>
                            
                            <div className="flex gap-1 pt-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-xs"
                                onClick={() => handleAccept(suggestion)}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-xs"
                                onClick={() => handleEdit(suggestion, index)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-xs"
                                onClick={() => handleCopy(suggestion.suggested)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
