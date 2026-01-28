import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { Clock, ChevronRight, FileText } from "lucide-react";
import type { PendingReview } from "@/hooks/useContentReview";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PendingReviewQueueProps {
  reviews: PendingReview[];
  onSelectSection: (sectionId: string) => void;
  selectedSectionId: string | null;
  onBulkApprove?: (sectionIds: string[]) => void;
}

export function PendingReviewQueue({
  reviews,
  onSelectSection,
  selectedSectionId,
  onBulkApprove,
}: PendingReviewQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map(r => r.id)));
    }
  };

  const handleBulkApprove = () => {
    if (onBulkApprove && selectedIds.size > 0) {
      onBulkApprove(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // Group reviews by manual
  const groupedByManual = reviews.reduce((acc, review) => {
    const manual = review.manual_name || "Unknown Manual";
    if (!acc[manual]) {
      acc[manual] = [];
    }
    acc[manual].push(review);
    return acc;
  }, {} as Record<string, PendingReview[]>);

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {onBulkApprove && reviews.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedIds.size === reviews.length && reviews.length > 0}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size > 0 
                ? `${selectedIds.size} selected` 
                : `Select all (${reviews.length})`}
            </span>
          </div>
          {selectedIds.size > 0 && (
            <Button size="sm" onClick={handleBulkApprove}>
              Approve Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      )}

      {/* Grouped reviews */}
      {Object.entries(groupedByManual).map(([manualName, manualReviews]) => (
        <div key={manualName} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {manualName}
            <Badge variant="secondary" className="ml-auto">
              {manualReviews.length}
            </Badge>
          </h3>
          
          <div className="space-y-2">
            {manualReviews.map((review) => (
              <Card
                key={review.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  selectedSectionId === review.id && "border-primary ring-1 ring-primary"
                )}
                onClick={() => onSelectSection(review.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {onBulkApprove && (
                      <Checkbox
                        checked={selectedIds.has(review.id)}
                        onCheckedChange={() => {
                          toggleSelection(review.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {review.section_number}
                        </Badge>
                        <span className="font-medium truncate">
                          {review.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {review.submitted_for_review_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Submitted {formatDistanceToNow(new Date(review.submitted_for_review_at))} ago
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
