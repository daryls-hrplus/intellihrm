import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  AlertTriangle,
  Send,
  User,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { 
  type EmployeeReviewResponse,
  type SpecificDisagreement,
  getResponseTypeLabelUtil as getResponseTypeLabel,
  getDisagreementCategoryLabel,
} from "@/hooks/useEmployeeReviewResponse";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface ManagerRebuttalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: EmployeeReviewResponse;
  onSuccess?: () => void;
}

export function ManagerRebuttalDialog({
  open,
  onOpenChange,
  response,
  onSuccess,
}: ManagerRebuttalDialogProps) {
  const queryClient = useQueryClient();
  const [rebuttalText, setRebuttalText] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const { mutate: submitRebuttal, isPending: isSubmitting } = useMutation({
    mutationFn: async (params: { responseId: string; rebuttalText: string }) => {
      const { data, error } = await supabase
        .from('employee_review_responses')
        .update({
          manager_rebuttal: params.rebuttalText,
          manager_rebuttal_at: new Date().toISOString(),
          status: 'manager_responded',
        })
        .eq('id', params.responseId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['manager-employee-responses'] });
    },
  });

  const handleSubmit = () => {
    submitRebuttal(
      { responseId: response.id, rebuttalText },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRebuttalText("");
          setIsAcknowledged(false);
          onSuccess?.();
        },
      }
    );
  };

  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case "agree":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "agree_with_comments":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "partially_disagree":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "disagree":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getResponseTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      agree: "default",
      agree_with_comments: "secondary",
      partially_disagree: "outline",
      disagree: "destructive",
    };
    return (
      <Badge variant={variants[type] || "outline"}>
        {getResponseTypeLabel(type)}
      </Badge>
    );
  };

  const specificDisagreements = response.specific_disagreements as SpecificDisagreement[] | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Respond to Employee Feedback
          </DialogTitle>
          <DialogDescription>
            Review the employee's response to your evaluation and provide your rebuttal if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Response Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Employee Response
                </CardTitle>
                {getResponseTypeBadge(response.response_type)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Submitted: {format(new Date(response.submitted_at!), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              {response.employee_comments && (
                <div>
                  <Label className="text-sm font-medium">Employee Comments</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                    {response.employee_comments}
                  </p>
                </div>
              )}

              {/* Specific Disagreements */}
              {specificDisagreements && specificDisagreements.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Specific Areas of Disagreement</Label>
                  <div className="mt-2 space-y-2">
                    {specificDisagreements.map((item, index) => (
                      <div key={index} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-md">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {getDisagreementCategoryLabel(item.area)} - Rating: {item.original_rating} → Expected: {item.expected_rating}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          {item.reason}
                        </p>
                        {item.item_title && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Item: {item.item_title}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {response.is_escalated_to_hr && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This response has been escalated to HR for review.
                    {response.escalation_reason && (
                      <span className="block mt-1 text-xs">Reason: {response.escalation_reason}</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Manager Rebuttal Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rebuttal">Response / Clarification</Label>
                <Textarea
                  id="rebuttal"
                  placeholder="Provide your response or clarification to the employee's feedback..."
                  value={rebuttalText}
                  onChange={(e) => setRebuttalText(e.target.value)}
                  className="mt-1.5 min-h-[120px]"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acknowledge"
                  checked={isAcknowledged}
                  onCheckedChange={(checked) => setIsAcknowledged(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="acknowledge"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I acknowledge this response
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By checking this, you confirm that you have reviewed the employee's feedback and are providing your response.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!rebuttalText.trim() || !isAcknowledged || isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
