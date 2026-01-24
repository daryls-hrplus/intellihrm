import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  FileCheck,
  TrendingUp,
  Gift,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import type { CompensationReviewFlag } from "@/hooks/useCompensationReviewFlags";

interface CompensationReviewFlagsListProps {
  flags: CompensationReviewFlag[];
  loading: boolean;
  onApprove: (flagId: string, userId: string, notes?: string) => Promise<void>;
  onReject: (flagId: string, userId: string, reason: string) => Promise<void>;
  onMarkProcessed: (flagId: string, userId: string) => Promise<void>;
}

const recommendedActionConfig: Record<string, { label: string; icon: typeof TrendingUp; color: string }> = {
  merit_increase: { label: "Merit Increase", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-600" },
  bonus: { label: "Bonus", icon: Gift, color: "bg-amber-500/10 text-amber-600" },
  review: { label: "Review", icon: Eye, color: "bg-blue-500/10 text-blue-600" },
};

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  high: { label: "High", variant: "destructive" },
  normal: { label: "Normal", variant: "secondary" },
  low: { label: "Low", variant: "outline" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  processed: { label: "Processed", variant: "outline" },
};

export function CompensationReviewFlagsList({
  flags,
  loading,
  onApprove,
  onReject,
  onMarkProcessed,
}: CompensationReviewFlagsListProps) {
  const { user } = useAuth();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<CompensationReviewFlag | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async (flag: CompensationReviewFlag) => {
    if (!user?.id) return;
    setActionLoading(true);
    try {
      await onApprove(flag.id, user.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (flag: CompensationReviewFlag) => {
    setSelectedFlag(flag);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!user?.id || !selectedFlag || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await onReject(selectedFlag.id, user.id, rejectReason.trim());
      setRejectDialogOpen(false);
      setSelectedFlag(null);
      setRejectReason("");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkProcessed = async (flag: CompensationReviewFlag) => {
    if (!user?.id) return;
    setActionLoading(true);
    try {
      await onMarkProcessed(flag.id, user.id);
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No review flags found</p>
        <p className="text-sm">Flags will appear here when triggered by performance appraisals</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Recommended Action</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Score / Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags.map((flag) => {
              const actionType = recommendedActionConfig[flag.recommended_action || "review"] || recommendedActionConfig.review;
              const ActionIcon = actionType.icon;
              const priority = priorityConfig[flag.priority || "normal"] || priorityConfig.normal;
              const status = statusConfig[flag.status] || statusConfig.pending;

              return (
                <TableRow key={flag.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={flag.employee?.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(flag.employee?.first_name, flag.employee?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {flag.employee?.first_name} {flag.employee?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {flag.employee?.employee_id || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${actionType.color}`}>
                      <ActionIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{actionType.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priority.variant}>{priority.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium capitalize">{flag.source_type}</p>
                      {flag.appraisal_cycle?.name && (
                        <p className="text-muted-foreground text-xs">
                          {flag.appraisal_cycle.name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {flag.performance_score != null ? (
                      <div className="text-sm">
                        <p className="font-medium">
                          {flag.performance_score.toFixed(2)}
                        </p>
                        {flag.performance_category_code && (
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {flag.performance_category_code}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(flag.created_at), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {flag.status === "pending" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={actionLoading}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleApprove(flag)}>
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRejectClick(flag)}>
                            <XCircle className="h-4 w-4 mr-2 text-destructive" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkProcessed(flag)}>
                            <FileCheck className="h-4 w-4 mr-2" />
                            Mark Processed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Review Flag</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this compensation review flag.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || actionLoading}
            >
              Reject Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
