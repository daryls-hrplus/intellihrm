import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  AlertTriangle,
  Star,
  Target,
  FileText,
  MessageSquare,
  Shield,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Send,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { MyAppraisal } from "@/hooks/useMyAppraisals";
import { 
  useEmployeeReviewResponse, 
  ResponseType, 
  EscalationCategory,
  SpecificDisagreement 
} from "@/hooks/useEmployeeReviewResponse";
import { useTranslation } from "react-i18next";

interface EmployeeReviewResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisal: MyAppraisal;
  companyId: string;
  onSuccess?: () => void;
}

const RESPONSE_OPTIONS: { value: ResponseType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'agree',
    label: 'I Agree',
    icon: <ThumbsUp className="h-5 w-5 text-green-600" />,
    description: 'I accept my evaluation and have no additional comments.',
  },
  {
    value: 'agree_with_comments',
    label: 'Agree with Comments',
    icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
    description: 'I accept my evaluation but would like to add some comments.',
  },
  {
    value: 'partial_disagree',
    label: 'Partially Disagree',
    icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
    description: 'I agree with most areas but have specific concerns about certain ratings.',
  },
  {
    value: 'disagree',
    label: 'Disagree',
    icon: <ThumbsDown className="h-5 w-5 text-red-600" />,
    description: 'I do not agree with this evaluation and want to provide feedback.',
  },
];

const ESCALATION_CATEGORIES: { value: EscalationCategory; label: string }[] = [
  { value: 'clarification_needed', label: 'Clarification Needed' },
  { value: 'process_concern', label: 'Process Concern' },
  { value: 'rating_discussion', label: 'Rating Discussion Request' },
  { value: 'manager_feedback', label: 'Manager Feedback Concern' },
  { value: 'other', label: 'Other' },
];

const DISAGREEMENT_AREAS = [
  { value: 'goals', label: 'Goals' },
  { value: 'competencies', label: 'Competencies' },
  { value: 'responsibilities', label: 'Responsibilities' },
  { value: 'values', label: 'Values' },
  { value: 'overall', label: 'Overall Score' },
];

export function EmployeeReviewResponseDialog({
  open,
  onOpenChange,
  appraisal,
  companyId,
  onSuccess,
}: EmployeeReviewResponseDialogProps) {
  const { t } = useTranslation();
  const { submitResponse, isLoading } = useEmployeeReviewResponse({ companyId });
  
  const [responseType, setResponseType] = useState<ResponseType | null>(null);
  const [comments, setComments] = useState("");
  const [specificDisagreements, setSpecificDisagreements] = useState<SpecificDisagreement[]>([]);
  const [escalateToHR, setEscalateToHR] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationCategory, setEscalationCategory] = useState<EscalationCategory | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setResponseType(null);
      setComments("");
      setSpecificDisagreements([]);
      setEscalateToHR(false);
      setEscalationReason("");
      setEscalationCategory(null);
      setAcknowledged(false);
    }
  }, [open]);

  const showDisagreementDetails = responseType === 'partial_disagree' || responseType === 'disagree';
  const requiresComments = responseType === 'agree_with_comments' || showDisagreementDetails;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-blue-600";
    if (score >= 2) return "text-amber-600";
    return "text-red-600";
  };

  const renderStars = (score: number | null, max: number = 5) => {
    if (score === null) return <span className="text-muted-foreground text-sm">Not rated</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.round(score) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className={`ml-1 text-sm font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
      </div>
    );
  };

  const addDisagreement = () => {
    setSpecificDisagreements([
      ...specificDisagreements,
      { area: 'goals', original_rating: 0, expected_rating: 0, reason: '' },
    ]);
  };

  const updateDisagreement = (index: number, field: keyof SpecificDisagreement, value: any) => {
    const updated = [...specificDisagreements];
    updated[index] = { ...updated[index], [field]: value };
    setSpecificDisagreements(updated);
  };

  const removeDisagreement = (index: number) => {
    setSpecificDisagreements(specificDisagreements.filter((_, i) => i !== index));
  };

  const canSubmit = () => {
    if (!responseType) return false;
    if (!acknowledged) return false;
    if (requiresComments && !comments.trim()) return false;
    if (escalateToHR && (!escalationReason.trim() || !escalationCategory)) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit() || !responseType) return;

    const result = await submitResponse({
      appraisalParticipantId: appraisal.id,
      responseType,
      employeeComments: comments || undefined,
      specificDisagreements: showDisagreementDetails ? specificDisagreements : undefined,
      isEscalatedToHr: escalateToHR,
      escalationReason: escalateToHR ? escalationReason : undefined,
      escalationCategory: escalateToHR ? escalationCategory! : undefined,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        escalateToHR 
          ? "Response submitted and escalated to HR" 
          : "Response submitted successfully"
      );
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Respond to Manager Review
          </DialogTitle>
          <DialogDescription>
            {appraisal.cycle_name} • Review your evaluation and provide your response
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Review Summary */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Your Performance Review
                </div>
                {appraisal.overall_score !== null && (
                  <Badge variant="outline" className={getScoreColor(appraisal.overall_score)}>
                    Overall: {appraisal.overall_score.toFixed(1)} / 5.0
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <Target className="h-5 w-5 mx-auto text-pink-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Goals</p>
                  {renderStars(appraisal.goal_score)}
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Competencies</p>
                  {renderStars(appraisal.competency_score)}
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <FileText className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Responsibilities</p>
                  {renderStars(appraisal.responsibility_score)}
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <Star className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Overall</p>
                  {renderStars(appraisal.overall_score)}
                </div>
              </div>

              {appraisal.final_comments && (
                <div className="mt-4 p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Manager's Feedback</p>
                  <p className="text-sm">{appraisal.final_comments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Response Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Your Response</Label>
            <RadioGroup
              value={responseType || ""}
              onValueChange={(value) => setResponseType(value as ResponseType)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {RESPONSE_OPTIONS.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                  >
                    {option.icon}
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Comments Section */}
          {responseType && (
            <div className="space-y-2">
              <Label htmlFor="comments">
                Your Comments {requiresComments ? "(Required)" : "(Optional)"}
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  showDisagreementDetails
                    ? "Please explain your concerns about the evaluation..."
                    : "Add any additional comments about your evaluation..."
                }
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          {/* Specific Disagreements */}
          {showDisagreementDetails && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Specific Concerns</Label>
                <Button variant="outline" size="sm" onClick={addDisagreement}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Area
                </Button>
              </div>
              
              {specificDisagreements.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Add Area" to specify which areas of your evaluation you disagree with.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {specificDisagreements.map((disagreement, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Area</Label>
                          <Select
                            value={disagreement.area}
                            onValueChange={(value) => updateDisagreement(index, 'area', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DISAGREEMENT_AREAS.map((area) => (
                                <SelectItem key={area.value} value={area.value}>
                                  {area.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Given Rating</Label>
                          <Select
                            value={String(disagreement.original_rating)}
                            onValueChange={(value) => updateDisagreement(index, 'original_rating', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Expected Rating</Label>
                          <Select
                            value={String(disagreement.expected_rating)}
                            onValueChange={(value) => updateDisagreement(index, 'expected_rating', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDisagreement(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-xs">Reason</Label>
                        <Textarea
                          value={disagreement.reason}
                          onChange={(e) => updateDisagreement(index, 'reason', e.target.value)}
                          placeholder="Explain why you believe this rating should be different..."
                          rows={2}
                          className="resize-none mt-1"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HR Escalation Option */}
          {responseType && (responseType === 'disagree' || responseType === 'partial_disagree') && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="escalate"
                    checked={escalateToHR}
                    onCheckedChange={(checked) => setEscalateToHR(checked === true)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="escalate" className="cursor-pointer font-medium">
                      Request HR Review (Optional)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      If you'd like HR to review your concerns, check this box. This is not a formal dispute—HR will facilitate a discussion.
                    </p>
                  </div>
                </div>

                {escalateToHR && (
                  <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="escalation-category">Escalation Category</Label>
                      <Select
                        value={escalationCategory || ""}
                        onValueChange={(value) => setEscalationCategory(value as EscalationCategory)}
                      >
                        <SelectTrigger id="escalation-category">
                          <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ESCALATION_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="escalation-reason">Reason for HR Escalation</Label>
                      <Textarea
                        id="escalation-reason"
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        placeholder="Explain what you would like HR to help with..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Acknowledgment */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="acknowledge" className="cursor-pointer font-medium">
                I confirm that I have reviewed my performance evaluation
              </Label>
              <p className="text-xs text-muted-foreground">
                By checking this box, you acknowledge that you have reviewed your scores and manager feedback. 
                Your response will be recorded and shared with your manager{escalateToHR ? " and HR" : ""}.
              </p>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your response is visible to your manager and HR. This is a constructive feedback mechanism, 
              not an adversarial process. If you need to file a formal dispute, you can do so after submitting your response.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit()}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "Submitting..." : escalateToHR ? "Submit & Escalate to HR" : "Submit Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
