import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Baby, 
  Calendar, 
  ArrowLeft, 
  User, 
  Clock,
  FileText,
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  Edit,
  RefreshCw
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { 
  useMaternityLeaveRequest, 
  useUpdateMaternityLeaveRequest,
  useMaternityComplianceRule
} from "@/hooks/useMaternityLeave";
import { MaternityDocumentUpload } from "./MaternityDocumentUpload";
import { MaternityReturnPlanForm } from "./MaternityReturnPlanForm";
import { MaternityPaymentSchedule } from "./MaternityPaymentSchedule";
import { STATUS_LABELS, REGION_LABELS, type MaternityLeaveStatus, type ComplianceRegion } from "@/types/maternityLeave";

interface Props {
  requestId: string;
  onBack: () => void;
}

const statusColors: Record<MaternityLeaveStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  active_prenatal: "bg-purple-100 text-purple-800",
  active_postnatal: "bg-pink-100 text-pink-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  extended: "bg-orange-100 text-orange-800",
};

export function MaternityLeaveDetails({ requestId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: request, isLoading } = useMaternityLeaveRequest(requestId);
  const { data: complianceRule } = useMaternityComplianceRule(request?.country_code || "");
  const updateRequest = useUpdateMaternityLeaveRequest();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Request not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const handleApprove = async () => {
    await updateRequest.mutateAsync({
      id: request.id,
      status: "approved",
      approved_at: new Date().toISOString(),
    });
  };

  const handleReject = async () => {
    await updateRequest.mutateAsync({
      id: request.id,
      status: "cancelled",
    });
  };

  const daysUntilDue = request.expected_due_date 
    ? differenceInDays(new Date(request.expected_due_date), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Baby className="h-6 w-6 text-pink-500" />
              {request.employee?.first_name} {request.employee?.last_name}
            </h1>
            <p className="text-muted-foreground">
              Maternity Leave Request • {request.employee?.employee_id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`text-sm ${statusColors[request.status]}`}>
            {STATUS_LABELS[request.status]}
          </Badge>
          
          {request.status === "pending" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReject} disabled={updateRequest.isPending}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={updateRequest.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-semibold">
                  {format(new Date(request.expected_due_date), "MMM d, yyyy")}
                </p>
                {daysUntilDue !== null && daysUntilDue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {daysUntilDue} days away
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Leave</p>
                <p className="font-semibold">{request.total_leave_days} days</p>
                <p className="text-xs text-muted-foreground">
                  {request.statutory_payment_weeks} weeks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-semibold">{request.country_code}</p>
                {request.compliance_region && (
                  <p className="text-xs text-muted-foreground">
                    {REGION_LABELS[request.compliance_region]}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Return Date</p>
                <p className="font-semibold">
                  {request.planned_return_date 
                    ? format(new Date(request.planned_return_date), "MMM d, yyyy")
                    : "Not set"}
                </p>
                {request.phased_return_enabled && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    Phased Return
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="return-plan">Return-to-Work</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="text-sm font-medium text-purple-700">Pre-natal Leave</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start: </span>
                        {request.prenatal_start_date 
                          ? format(new Date(request.prenatal_start_date), "MMM d, yyyy")
                          : "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">End: </span>
                        {request.prenatal_end_date
                          ? format(new Date(request.prenatal_end_date), "MMM d, yyyy")
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-pink-50 border border-pink-200">
                    <p className="text-sm font-medium text-pink-700">Post-natal Leave</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start: </span>
                        {request.postnatal_start_date
                          ? format(new Date(request.postnatal_start_date), "MMM d, yyyy")
                          : "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">End: </span>
                        {request.postnatal_end_date
                          ? format(new Date(request.postnatal_end_date), "MMM d, yyyy")
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {request.actual_delivery_date && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-700">Actual Delivery</p>
                    <p className="text-sm mt-1">
                      {format(new Date(request.actual_delivery_date), "MMM d, yyyy")}
                      {request.number_of_children > 1 && (
                        <Badge variant="secondary" className="ml-2">
                          {request.number_of_children} children
                        </Badge>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Info */}
            {complianceRule && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Regional Compliance ({request.country_code})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Legal Minimum</span>
                      <p className="font-medium">{complianceRule.legal_minimum_weeks} weeks</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment Rate</span>
                      <p className="font-medium">{complianceRule.legal_payment_percentage}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Job Protection</span>
                      <p className="font-medium">{complianceRule.job_protection_weeks} weeks</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Extension Allowed</span>
                      <p className="font-medium">
                        {complianceRule.extension_allowed ? "Yes" : "No"}
                        {complianceRule.max_extension_weeks && ` (max ${complianceRule.max_extension_weeks} weeks)`}
                      </p>
                    </div>
                  </div>

                  {complianceRule.nursing_breaks_daily && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Nursing Breaks</p>
                      <p className="text-sm text-muted-foreground">
                        {complianceRule.nursing_breaks_daily}x {complianceRule.nursing_break_duration_minutes} mins/day
                        for {complianceRule.nursing_breaks_until_months} months after birth
                      </p>
                    </div>
                  )}

                  {complianceRule.legislation_reference && (
                    <p className="text-xs text-muted-foreground">
                      Reference: {complianceRule.legislation_reference}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notes */}
          {request.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{request.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <MaternityDocumentUpload 
            maternityRequestId={request.id}
            companyId={request.company_id}
            requiredDocuments={complianceRule?.required_documents as string[] || []}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <MaternityPaymentSchedule
            maternityRequestId={request.id}
            companyId={request.company_id}
            employeeId={request.employee_id}
            request={request}
          />
        </TabsContent>

        <TabsContent value="return-plan" className="mt-4">
          <MaternityReturnPlanForm
            maternityRequestId={request.id}
            companyId={request.company_id}
            employeeId={request.employee_id}
            plannedReturnDate={request.planned_return_date}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
