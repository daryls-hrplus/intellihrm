import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { ClipboardList, Loader2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

interface Props { companyId?: string; }

const PropertyRequestsTab = ({ companyId }: Props) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { requests, loadingRequests, updateRequest } = usePropertyManagement(companyId);

  const filteredRequests = requests.filter((r) => statusFilter === "all" || r.status === statusFilter);

  const handleReview = async () => {
    if (!selectedRequest) return;
    await updateRequest.mutateAsync({ id: selectedRequest, status: reviewAction, reviewed_by: user?.id, reviewed_at: new Date().toISOString(), review_notes: reviewNotes || null });
    setIsReviewDialogOpen(false);
    setSelectedRequest(null);
    setReviewNotes("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "approved": return "bg-success/10 text-success border-success/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "fulfilled": return "bg-info/10 text-info border-info/20";
      default: return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive/10 text-destructive";
      case "high": return "bg-warning/10 text-warning";
      case "medium": return "bg-info/10 text-info";
      case "low": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  if (loadingRequests) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />{t("companyProperty.requests.title")}</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("common.allStatus")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatus")}</SelectItem>
              <SelectItem value="pending">{t("companyProperty.requests.statuses.pending")}</SelectItem>
              <SelectItem value="approved">{t("companyProperty.requests.statuses.approved")}</SelectItem>
              <SelectItem value="rejected">{t("companyProperty.requests.statuses.rejected")}</SelectItem>
              <SelectItem value="fulfilled">{t("companyProperty.requests.statuses.fulfilled")}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>{t("companyProperty.requests.noRequests")}</p><p className="text-sm">{t("companyProperty.requests.noRequestsHint")}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>{t("common.employee")}</TableHead><TableHead>{t("common.name")}</TableHead><TableHead>{t("companyProperty.requests.requestType")}</TableHead><TableHead>{t("common.category")}</TableHead><TableHead>{t("common.priority")}</TableHead><TableHead>{t("common.status")}</TableHead><TableHead>{t("companyProperty.requests.submitted")}</TableHead><TableHead>{t("common.actions")}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell><div><p className="font-medium">{request.employee?.full_name}</p><p className="text-xs text-muted-foreground">{request.employee?.email}</p></div></TableCell>
                      <TableCell><div><p className="font-medium">{request.title}</p>{request.description && <p className="text-xs text-muted-foreground line-clamp-1">{request.description}</p>}</div></TableCell>
                      <TableCell>{t(`companyProperty.requests.types.${request.request_type}`) || request.request_type}</TableCell>
                      <TableCell>{request.category?.name || "-"}</TableCell>
                      <TableCell><Badge variant="outline" className={getPriorityColor(request.priority)}>{t(`companyProperty.requests.priorities.${request.priority}`) || request.priority}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={getStatusColor(request.status)}>{t(`companyProperty.requests.statuses.${request.status}`) || request.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(request.created_at), "PP")}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="gap-1 text-success hover:text-success" onClick={() => { setSelectedRequest(request.id); setReviewAction("approved"); setIsReviewDialogOpen(true); }}><Check className="h-3 w-3" /></Button>
                            <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => { setSelectedRequest(request.id); setReviewAction("rejected"); setIsReviewDialogOpen(true); }}><X className="h-3 w-3" /></Button>
                          </div>
                        )}
                        {request.status !== "pending" && request.reviewed_at && <span className="text-xs text-muted-foreground">{format(new Date(request.reviewed_at), "PP")}</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{reviewAction === "approved" ? t("companyProperty.requests.approveRequest") : t("companyProperty.requests.rejectRequest")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{reviewAction === "approved" ? t("companyProperty.requests.confirmApprove") : t("companyProperty.requests.confirmReject")}</p>
            <div className="space-y-2"><Label>{t("companyProperty.requests.reviewNotes")}</Label><Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder={reviewAction === "rejected" ? t("companyProperty.requests.rejectionReason") : t("companyProperty.requests.optionalNotes")} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleReview} disabled={updateRequest.isPending} variant={reviewAction === "rejected" ? "destructive" : "default"}>{updateRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{reviewAction === "approved" ? t("common.approve") : t("common.reject")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyRequestsTab;
