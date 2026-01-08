import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Clock, ArrowRight, GitPullRequest, FileEdit, User, MapPin, Building2, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ChangeRequest {
  id: string;
  request_type: string;
  change_action: string;
  status: string;
  created_at: string;
  review_notes?: string | null;
}

const requestTypeIcons: Record<string, React.ElementType> = {
  name: User,
  address: MapPin,
  emergency_contact: Phone,
  bank_details: Building2,
  default: FileEdit,
};

const requestTypeLabels: Record<string, string> = {
  name: "Name Change",
  address: "Address",
  emergency_contact: "Emergency Contact",
  bank_details: "Bank Details",
  marital_status: "Marital Status",
  phone: "Phone Number",
  email: "Email Address",
};

export function EssChangeRequestsWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["ess-change-requests-widget", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("employee_data_change_requests")
        .select("id, request_type, change_action, status, created_at, review_notes")
        .eq("employee_id", user.id)
        .in("status", ["pending", "info_required"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as ChangeRequest[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) return null;

  const infoRequired = requests.filter((r) => r.status === "info_required");
  const pending = requests.filter((r) => r.status === "pending");
  const hasUrgent = infoRequired.length > 0;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5 text-primary" />
          Change Request Actions
          <Badge variant={hasUrgent ? "destructive" : "secondary"}>
            {requests.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Required Section - Urgent */}
        {infoRequired.length > 0 && (
          <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              Response Required
            </div>
            <div className="space-y-2">
              {infoRequired.map((request) => (
                <RequestCard key={request.id} request={request} variant="urgent" onAction={() => navigate(`/ess/my-change-requests?id=${request.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Pending Section */}
        {pending.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Awaiting HR Review
            </div>
            <div className="space-y-2">
              {pending.slice(0, 3).map((request) => (
                <RequestCard key={request.id} request={request} variant="pending" onAction={() => navigate(`/ess/my-change-requests?id=${request.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* View All Link */}
        <Button variant="ghost" className="w-full justify-center gap-2 text-sm" onClick={() => navigate("/ess/my-change-requests")}>
          View All Change Requests
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function RequestCard({ request, variant, onAction }: { request: ChangeRequest; variant: "urgent" | "pending"; onAction: () => void }) {
  const Icon = requestTypeIcons[request.request_type] || requestTypeIcons.default;
  const typeLabel = requestTypeLabels[request.request_type] || request.request_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const actionLabel = request.change_action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        variant === "urgent"
          ? "bg-destructive/5 border-destructive/20"
          : "bg-muted/50 border-border"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`p-2 rounded-md ${variant === "urgent" ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{typeLabel}</span>
            <span className="text-xs text-muted-foreground">• {actionLabel}</span>
          </div>
          {variant === "urgent" && request.review_notes && (
            <p className="text-xs text-destructive truncate mt-0.5">
              Info needed: {request.review_notes}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Submitted: {format(new Date(request.created_at), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <Button size="sm" variant={variant === "urgent" ? "default" : "ghost"} onClick={onAction}>
        {variant === "urgent" ? "Respond" : "View"}
        <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}
