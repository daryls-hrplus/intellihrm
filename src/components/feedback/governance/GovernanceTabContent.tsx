import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  FileText,
  Users,
  Brain,
  AlertTriangle,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { ConsentManagementPanel } from "./ConsentManagementPanel";
import { DataPolicyConfigPanel } from "./DataPolicyConfigPanel";
import { FeedbackAuditLogViewer } from "./FeedbackAuditLogViewer";
import { ExceptionRequestDialog } from "./ExceptionRequestDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface GovernanceTabContentProps {
  companyId: string;
  cycles: { id: string; name: string }[];
}

export function GovernanceTabContent({ companyId, cycles }: GovernanceTabContentProps) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState("policies");
  const [selectedCycleId, setSelectedCycleId] = useState<string>(cycles[0]?.id || "");
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch exceptions for this company
  const { data: exceptions = [], refetch: refetchExceptions } = useQuery({
    queryKey: ["feedback-exceptions", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_exceptions")
        .select(`
          *,
          employee:profiles!feedback_exceptions_employee_id_fkey(full_name),
          cycle:review_cycles(name),
          approver:profiles!feedback_exceptions_approved_by_fkey(full_name)
        `)
        .eq("company_id", companyId)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  // Fetch consent summary for dashboard
  const { data: consentSummary } = useQuery({
    queryKey: ["consent-summary", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_consent_records")
        .select("consent_type, consent_given, withdrawn_at")
        .eq("company_id", companyId);

      if (error) throw error;

      const summary = {
        total: data?.length || 0,
        given: data?.filter(c => c.consent_given && !c.withdrawn_at).length || 0,
        declined: data?.filter(c => !c.consent_given).length || 0,
        withdrawn: data?.filter(c => c.withdrawn_at).length || 0,
      };

      return summary;
    },
    enabled: !!companyId,
  });

  const getExceptionStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success/10 text-success">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive">Rejected</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
    }
  };

  const filteredExceptions = exceptions.filter((ex: any) =>
    ex.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.exception_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consent Rate</p>
                <p className="text-2xl font-bold">
                  {consentSummary?.total ? Math.round((consentSummary.given / consentSummary.total) * 100) : 0}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Consents</p>
                <p className="text-2xl font-bold">{consentSummary?.given || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Exceptions</p>
                <p className="text-2xl font-bold">
                  {exceptions.filter((e: any) => e.status === "pending").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Actions Logged</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <Brain className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies" className="gap-2">
            <FileText className="h-4 w-4" />
            Data Policies
          </TabsTrigger>
          <TabsTrigger value="consents" className="gap-2">
            <Shield className="h-4 w-4" />
            Consent Records
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Audit Log
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Exceptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          <DataPolicyConfigPanel companyId={companyId} />
        </TabsContent>

        <TabsContent value="consents" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consent Records by Cycle</CardTitle>
                  <CardDescription>View and manage employee consent status</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCycleId}
                    onChange={(e) => setSelectedCycleId(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    {cycles.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedCycleId ? (
                <ConsentManagementPanel
                  cycleId={selectedCycleId}
                  companyId={companyId}
                  mode="view"
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Select a cycle to view consent records
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <FeedbackAuditLogViewer companyId={companyId} />
        </TabsContent>

        <TabsContent value="exceptions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Governance Exceptions</CardTitle>
                  <CardDescription>Manage exception requests for anonymity bypass, deadline extensions, etc.</CardDescription>
                </div>
                <Button onClick={() => setExceptionDialogOpen(true)}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  New Exception Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exceptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredExceptions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No exception requests found
                    </p>
                  ) : (
                    filteredExceptions.map((exception: any) => (
                      <div
                        key={exception.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{exception.employee?.full_name}</p>
                            {getExceptionStatusBadge(exception.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {exception.exception_type?.replace(/_/g, " ")} • {exception.cycle?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {format(new Date(exception.requested_at), "MMM d, yyyy")}
                            {exception.approved_by && ` • Approved by: ${exception.approver?.full_name}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {exception.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline">
                                Reject
                              </Button>
                              <Button size="sm">
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Exception Request Dialog */}
      <ExceptionRequestDialog
        open={exceptionDialogOpen}
        onOpenChange={setExceptionDialogOpen}
        cycleId={selectedCycleId}
        companyId={companyId}
        employeeId={user?.id || ""}
        employeeName="Current User"
        onSuccess={() => {
          setExceptionDialogOpen(false);
          refetchExceptions();
        }}
      />
    </div>
  );
}
