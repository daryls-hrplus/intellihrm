import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, ArrowRight } from "lucide-react";
import { FeedbackFormDialog } from "@/components/performance/FeedbackFormDialog";
import { format, differenceInDays } from "date-fns";

interface PendingReview {
  id: string;
  participant_id: string;
  employee_name: string;
  reviewer_type: string;
  cycle_name: string;
  deadline: string | null;
}

interface PendingReviewsCardProps {
  review: PendingReview;
  onComplete: () => void;
}

const reviewerTypeLabels: Record<string, string> = {
  self: "Self Review",
  manager: "Manager Review",
  peer: "Peer Review",
  direct_report: "Upward Review",
};

const reviewerTypeColors: Record<string, string> = {
  self: "bg-primary/10 text-primary",
  manager: "bg-info/10 text-info",
  peer: "bg-warning/10 text-warning",
  direct_report: "bg-success/10 text-success",
};

export function PendingReviewsCard({ review, onComplete }: PendingReviewsCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const daysUntilDeadline = review.deadline
    ? differenceInDays(new Date(review.deadline), new Date())
    : null;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(review.employee_name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{review.employee_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{review.cycle_name}</p>
              </div>
            </div>
            <Badge className={reviewerTypeColors[review.reviewer_type]}>
              {reviewerTypeLabels[review.reviewer_type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {review.deadline && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Due: {format(new Date(review.deadline), "MMM d, yyyy")}
                {daysUntilDeadline !== null && (
                  <span
                    className={
                      daysUntilDeadline < 0
                        ? "text-destructive ml-1"
                        : daysUntilDeadline <= 3
                        ? "text-warning ml-1"
                        : ""
                    }
                  >
                    ({daysUntilDeadline < 0
                      ? `${Math.abs(daysUntilDeadline)} days overdue`
                      : `${daysUntilDeadline} days left`})
                  </span>
                )}
              </span>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => setDialogOpen(true)}
          >
            Start Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <FeedbackFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        submissionId={review.id}
        participantId={review.participant_id}
        employeeName={review.employee_name}
        reviewerType={review.reviewer_type}
        onSuccess={() => {
          setDialogOpen(false);
          onComplete();
        }}
      />
    </>
  );
}