import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvestigationRequestDialog } from "./InvestigationRequestDialog";
import { formatDistanceToNow } from "date-fns";

interface InvestigationModePanelProps {
  cycleId: string;
  cycleName: string;
  companyId: string;
  cycleStatus?: string;
  targetEmployeeId?: string;
  targetEmployeeName?: string;
}

export function InvestigationModePanel({
  cycleId,
  cycleName,
  companyId,
  cycleStatus,
  targetEmployeeId,
  targetEmployeeName,
}: InvestigationModePanelProps) {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  // Fetch company anonymity policy
  const { data: companyPolicy } = useQuery({
    queryKey: ['company-anonymity-policy', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('feedback_360_anonymity_policy')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      const policy = data?.feedback_360_anonymity_policy;
      if (policy && typeof policy === 'object' && !Array.isArray(policy)) {
        return policy as Record<string, unknown>;
      }
      return { individual_response_access: 'never' };
    },
    enabled: !!companyId,
  });

  const { data: requests, refetch } = useQuery({
    queryKey: ['investigation-requests', cycleId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('feedback_investigation_requests')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const investigationModeEnabled = companyPolicy?.individual_response_access === 'investigation_only';
  const isCycleCompleted = cycleStatus === 'completed' || cycleStatus === 'closed';

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const approvedRequests = requests?.filter(r => r.status === 'approved') || [];
  const activeApprovedRequests = approvedRequests.filter(r => 
    !r.expires_at || new Date(r.expires_at) > new Date()
  );

  const getStatusBadge = (status: string, expiresAt?: string | null) => {
    if (status === 'approved' && expiresAt && new Date(expiresAt) < new Date()) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-success">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If investigation mode is not enabled, show disabled state
  if (!investigationModeEnabled) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Individual Response Access</CardTitle>
          </div>
          <CardDescription>
            Individual responses are protected to maintain feedback anonymity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-dashed">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Access Disabled</p>
              <p className="text-xs text-muted-foreground">
                Individual response access is disabled for this organization. 
                This policy is set in Performance Setup → 360° Feedback → Anonymity & Access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Individual Response Access</CardTitle>
          </div>
          <CardDescription>
            Individual responses are protected to maintain feedback anonymity. 
            Access requires formal investigation approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-2xl font-bold text-warning">{pendingRequests.length}</div>
              <div className="text-xs text-muted-foreground">Pending Requests</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-2xl font-bold text-success">{activeApprovedRequests.length}</div>
              <div className="text-xs text-muted-foreground">Active Approvals</div>
            </div>
          </div>

          {/* Recent Requests */}
          {requests && requests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Requests</h4>
              <div className="space-y-2">
                {requests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && <Clock className="h-4 w-4 text-warning" />}
                      {request.status === 'approved' && <CheckCircle className="h-4 w-4 text-success" />}
                      {request.status === 'denied' && <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="capitalize">{request.request_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status, request.expires_at)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Access Button */}
          {!isCycleCompleted ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground">
                Investigation requests can only be submitted for completed 360 cycles.
              </p>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setRequestDialogOpen(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Request Investigation Access
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            All access is logged and may be audited
          </p>
        </CardContent>
      </Card>

      <InvestigationRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        cycleId={cycleId}
        cycleName={cycleName}
        companyId={companyId}
        targetEmployeeId={targetEmployeeId}
        targetEmployeeName={targetEmployeeName}
        onSuccess={() => refetch()}
      />
    </>
  );
}
