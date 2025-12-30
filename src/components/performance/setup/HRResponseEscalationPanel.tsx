import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Shield,
  User,
  XCircle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useHRResponseEscalations, HRAction, useEmployeeReviewResponse } from "@/hooks/useEmployeeReviewResponse";

interface HRResponseEscalationPanelProps {
  companyId: string;
}

const HR_ACTIONS: { value: HRAction; label: string; description: string }[] = [
  { value: 'no_action', label: 'No Action Required', description: 'Close with acknowledgment, no changes needed' },
  { value: 'manager_discussion', label: 'Request Manager Discussion', description: 'Ask manager to discuss concerns with employee' },
  { value: 'rating_adjusted', label: 'Rating Adjustment', description: 'Recommend rating adjustment based on review' },
  { value: 'escalated_to_dispute', label: 'Escalate to Formal Dispute', description: 'Convert to formal dispute process' },
  { value: 'closed', label: 'Close Case', description: 'Close without further action' },
];

const ESCALATION_CATEGORY_LABELS: Record<string, string> = {
  clarification_needed: 'Clarification Needed',
  process_concern: 'Process Concern',
  rating_discussion: 'Rating Discussion',
  manager_feedback: 'Manager Feedback',
  other: 'Other',
};

export function HRResponseEscalationPanel({ companyId }: HRResponseEscalationPanelProps) {
  const { escalations, pendingEscalations, resolvedEscalations, isLoading, refetch } = useHRResponseEscalations(companyId);
  const { respondToEscalation, isLoading: responding } = useEmployeeReviewResponse({ companyId });
  
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [hrResponse, setHrResponse] = useState('');
  const [hrAction, setHrAction] = useState<HRAction | null>(null);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getCategoryBadgeVariant = (category: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (category) {
      case 'rating_discussion': return 'destructive';
      case 'process_concern': return 'secondary';
      case 'clarification_needed': return 'outline';
      default: return 'outline';
    }
  };

  const handleOpenResponse = (escalation: any) => {
    setSelectedEscalation(escalation);
    setHrResponse('');
    setHrAction(null);
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedEscalation || !hrAction) return;

    const result = await respondToEscalation(selectedEscalation.id, hrResponse, hrAction);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Response submitted successfully');
      setResponseDialogOpen(false);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Employee Response Escalations
              </CardTitle>
              <CardDescription>
                Review and respond to employee escalations from performance reviews
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-600">
                <Clock className="h-3 w-3 mr-1" />
                {pendingEscalations.length} Pending
              </Badge>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {resolvedEscalations.length} Resolved
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'resolved')}>
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pending ({pendingEscalations.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolved ({resolvedEscalations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              {pendingEscalations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
                  <p className="font-medium">No pending escalations</p>
                  <p className="text-sm">All employee escalations have been addressed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingEscalations.map((escalation: any) => (
                    <EscalationCard
                      key={escalation.id}
                      escalation={escalation}
                      onRespond={() => handleOpenResponse(escalation)}
                      getInitials={getInitials}
                      getCategoryBadgeVariant={getCategoryBadgeVariant}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="mt-4">
              {resolvedEscalations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No resolved escalations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resolvedEscalations.map((escalation: any) => (
                    <EscalationCard
                      key={escalation.id}
                      escalation={escalation}
                      isResolved
                      getInitials={getInitials}
                      getCategoryBadgeVariant={getCategoryBadgeVariant}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Respond to Escalation
            </DialogTitle>
            <DialogDescription>
              Review the employee's concerns and provide your response
            </DialogDescription>
          </DialogHeader>

          {selectedEscalation && (
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedEscalation.employee?.avatar_url} />
                  <AvatarFallback>
                    {getInitials(selectedEscalation.employee?.first_name, selectedEscalation.employee?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedEscalation.employee?.first_name} {selectedEscalation.employee?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Escalated {selectedEscalation.escalated_at && format(new Date(selectedEscalation.escalated_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge className="ml-auto" variant={getCategoryBadgeVariant(selectedEscalation.escalation_category)}>
                  {ESCALATION_CATEGORY_LABELS[selectedEscalation.escalation_category] || selectedEscalation.escalation_category}
                </Badge>
              </div>

              {/* Response Type */}
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Employee Response</p>
                <Badge variant={selectedEscalation.response_type === 'disagree' ? 'destructive' : 'secondary'}>
                  {selectedEscalation.response_type?.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Escalation Reason */}
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Escalation Reason</p>
                <p className="text-sm">{selectedEscalation.escalation_reason || 'No reason provided'}</p>
              </div>

              {/* Employee Comments */}
              {selectedEscalation.employee_comments && (
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Employee Comments</p>
                  <p className="text-sm">{selectedEscalation.employee_comments}</p>
                </div>
              )}

              {/* HR Action Selection */}
              <div className="space-y-2">
                <Label>Select Action</Label>
                <Select value={hrAction || ''} onValueChange={(v) => setHrAction(v as HRAction)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {HR_ACTIONS.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div>
                          <p className="font-medium">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* HR Response */}
              <div className="space-y-2">
                <Label>Your Response</Label>
                <Textarea
                  value={hrResponse}
                  onChange={(e) => setHrResponse(e.target.value)}
                  placeholder="Provide your response and any guidance for the employee or manager..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitResponse} 
              disabled={responding || !hrAction}
            >
              {responding ? 'Submitting...' : 'Submit Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Escalation Card Component
interface EscalationCardProps {
  escalation: any;
  isResolved?: boolean;
  onRespond?: () => void;
  getInitials: (firstName?: string, lastName?: string) => string;
  getCategoryBadgeVariant: (category: string) => "default" | "destructive" | "outline" | "secondary";
}

function EscalationCard({ 
  escalation, 
  isResolved, 
  onRespond, 
  getInitials, 
  getCategoryBadgeVariant 
}: EscalationCardProps) {
  const HR_ACTION_LABELS: Record<string, string> = {
    no_action: 'No Action',
    manager_discussion: 'Manager Discussion',
    rating_adjusted: 'Rating Adjusted',
    escalated_to_dispute: 'Escalated to Dispute',
    closed: 'Closed',
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={escalation.employee?.avatar_url} />
            <AvatarFallback>
              {getInitials(escalation.employee?.first_name, escalation.employee?.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">
                {escalation.employee?.first_name} {escalation.employee?.last_name}
              </p>
              <Badge variant={getCategoryBadgeVariant(escalation.escalation_category)} className="text-xs">
                {ESCALATION_CATEGORY_LABELS[escalation.escalation_category] || escalation.escalation_category}
              </Badge>
              <Badge variant={escalation.response_type === 'disagree' ? 'destructive' : 'secondary'} className="text-xs">
                {escalation.response_type?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {escalation.escalation_reason || escalation.employee_comments || 'No details provided'}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>
                Manager: {escalation.manager?.first_name} {escalation.manager?.last_name || 'N/A'}
              </span>
              <span>
                {escalation.escalated_at && format(new Date(escalation.escalated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isResolved ? (
            <div className="text-right">
              <Badge variant="outline" className="text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {HR_ACTION_LABELS[escalation.hr_action_taken] || 'Resolved'}
              </Badge>
              {escalation.hr_reviewed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(escalation.hr_reviewed_at), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={onRespond}>
              Respond
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
