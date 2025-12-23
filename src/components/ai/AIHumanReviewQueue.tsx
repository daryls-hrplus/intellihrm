import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIRiskBadge } from "./AIRiskBadge";
import { useAIGovernance, AIRiskAssessment } from "@/hooks/useAIGovernance";
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AIHumanReviewQueue() {
  const { pendingReviews, completeReview, isLoading } = useAIGovernance();
  const [selectedReview, setSelectedReview] = useState<AIRiskAssessment | null>(null);
  const [reviewOutcome, setReviewOutcome] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");

  const handleCompleteReview = () => {
    if (!selectedReview || !reviewOutcome) return;
    
    completeReview({
      assessmentId: selectedReview.id,
      outcome: reviewOutcome,
      notes: reviewNotes,
    });
    
    setSelectedReview(null);
    setReviewOutcome("");
    setReviewNotes("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Human Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Human Review Queue
            {pendingReviews.length > 0 && (
              <Badge variant="destructive">{pendingReviews.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            AI interactions requiring human oversight per ISO 42001
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No pending reviews</p>
              <p className="text-sm">All AI interactions are within acceptable parameters</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {pendingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AIRiskBadge riskScore={review.risk_score} size="sm" />
                        <Badge variant="outline">{review.risk_category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.created_at && formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                      {review.risk_factors && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Factors: {Array.isArray(review.risk_factors) 
                            ? review.risk_factors.slice(0, 3).join(", ")
                            : JSON.stringify(review.risk_factors).slice(0, 50)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReview(review)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review AI Interaction</DialogTitle>
            <DialogDescription>
              Evaluate this AI interaction and provide your decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Risk Score</label>
                  <div className="mt-1">
                    <AIRiskBadge riskScore={selectedReview.risk_score} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="mt-1">
                    <Badge variant="outline">{selectedReview.risk_category}</Badge>
                  </p>
                </div>
              </div>

              {selectedReview.risk_factors && (
                <div>
                  <label className="text-sm font-medium">Risk Factors</label>
                  <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedReview.risk_factors, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedReview.mitigation_applied && selectedReview.mitigation_applied.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Mitigations Applied</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedReview.mitigation_applied.map((m, i) => (
                      <Badge key={i} variant="secondary">{m}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Review Decision</label>
                <Select value={reviewOutcome} onValueChange={setReviewOutcome}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Approved
                      </div>
                    </SelectItem>
                    <SelectItem value="modified">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Modified Required
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  className="mt-1"
                  placeholder="Document your review decision and any required actions..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReview(null)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteReview} disabled={!reviewOutcome}>
              Complete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
