import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  User, 
  Users, 
  UserCircle, 
  TrendingUp,
  Clock,
  FileText,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuditLog } from "@/hooks/useAuditLog";

interface InvestigationResponseViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  cycleId: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
}

interface IndividualResponse {
  id: string;
  reviewer_type: string;
  question_text: string;
  competency_name: string | null;
  rating: number | null;
  text_response: string | null;
  submitted_at: string;
}

const reviewerTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  self: { label: 'Self', icon: <User className="h-4 w-4" />, color: 'text-blue-600' },
  manager: { label: 'Manager', icon: <UserCircle className="h-4 w-4" />, color: 'text-purple-600' },
  peer: { label: 'Peer', icon: <Users className="h-4 w-4" />, color: 'text-green-600' },
  direct_report: { label: 'Direct Report', icon: <TrendingUp className="h-4 w-4" />, color: 'text-orange-600' },
};

export function InvestigationResponseViewer({
  open,
  onOpenChange,
  requestId,
  cycleId,
  targetEmployeeId,
  targetEmployeeName,
}: InvestigationResponseViewerProps) {
  const [hasLoggedAccess, setHasLoggedAccess] = useState(false);
  const { logAction } = useAuditLog();

  // Fetch individual responses - placeholder until proper table access is configured
  const { data: responses, isLoading } = useQuery({
    queryKey: ['investigation-responses', cycleId, targetEmployeeId],
    queryFn: async () => {
      // For now, return empty array - actual implementation requires RLS bypass for HR
      // This will be populated when the investigation access RLS policies are configured
      return [] as IndividualResponse[];
    },
    enabled: open && !!cycleId && !!targetEmployeeId,
  });

  // Mutation to increment access count
  const incrementAccessMutation = useMutation({
    mutationFn: async () => {
      // Update access count directly
      const { data: current } = await supabase
        .from('feedback_investigation_requests')
        .select('access_count')
        .eq('id', requestId)
        .single();
      
      await supabase
        .from('feedback_investigation_requests')
        .update({ 
          access_count: (current?.access_count || 0) + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', requestId);
    },
  });

  // Log access when dialog opens
  useEffect(() => {
    if (open && !hasLoggedAccess && responses) {
      // Increment access count
      incrementAccessMutation.mutate();
      
      // Log to audit trail
      logAction({
        action: 'VIEW',
        entityType: 'investigation_response',
        entityId: requestId,
        entityName: `Investigation responses for ${targetEmployeeName}`,
        newValues: {
          cycle_id: cycleId,
          target_employee_id: targetEmployeeId,
          response_count: responses.length,
        },
      });
      
      setHasLoggedAccess(true);
    }
  }, [open, hasLoggedAccess, responses]);

  // Reset logged state when dialog closes
  useEffect(() => {
    if (!open) {
      setHasLoggedAccess(false);
    }
  }, [open]);

  // Group responses by reviewer type
  const groupedResponses = responses?.reduce((acc, response) => {
    if (!acc[response.reviewer_type]) {
      acc[response.reviewer_type] = [];
    }
    acc[response.reviewer_type].push(response);
    return acc;
  }, {} as Record<string, IndividualResponse[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <DialogTitle>Investigation Mode - Individual Responses</DialogTitle>
          </div>
          <DialogDescription>
            Viewing individual 360 feedback responses for {targetEmployeeName}
          </DialogDescription>
        </DialogHeader>

        {/* Warning Banner */}
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Anonymity Broken - Access Logged</AlertTitle>
          <AlertDescription>
            You are viewing individual responses that would normally be anonymous.
            This access has been logged with your user ID, timestamp, and IP address.
            All viewing activity may be audited.
          </AlertDescription>
        </Alert>

        {/* Access Info */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Access logged at:</span>
            <span className="font-medium">{format(new Date(), 'PPpp')}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !responses || responses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No individual responses found for this employee in this cycle.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResponses || {}).map(([reviewerType, typeResponses]) => {
              const config = reviewerTypeConfig[reviewerType] || { 
                label: reviewerType, 
                icon: <User className="h-4 w-4" />,
                color: 'text-muted-foreground'
              };
              
              return (
                <Card key={reviewerType}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className={config.color}>{config.icon}</span>
                      <CardTitle className="text-base">{config.label} Feedback</CardTitle>
                      <Badge variant="outline" className="ml-auto">
                        {typeResponses.length} responses
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {typeResponses.map((response, idx) => (
                      <div key={response.id}>
                        {idx > 0 && <Separator className="my-4" />}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              {response.competency_name && (
                                <Badge variant="secondary" className="mb-1 text-xs">
                                  {response.competency_name}
                                </Badge>
                              )}
                              <p className="text-sm font-medium">{response.question_text}</p>
                            </div>
                            {response.rating && (
                              <Badge variant="outline" className="shrink-0">
                                Rating: {response.rating}/5
                              </Badge>
                            )}
                          </div>
                          {response.text_response && (
                            <div className="p-3 rounded-lg bg-muted/30 border text-sm">
                              {response.text_response}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Submitted: {format(new Date(response.submitted_at), 'PPp')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            All access to these responses is logged and auditable.
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
