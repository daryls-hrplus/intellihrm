import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Baby, 
  Calendar, 
  Clock, 
  Plus, 
  Search,
  Building2,
  Users,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useMaternityLeaveRequests } from "@/hooks/useMaternityLeave";
import { MaternityLeaveRequestForm } from "./MaternityLeaveRequestForm";
import { MaternityLeaveDetails } from "./MaternityLeaveDetails";
import { MaternityCompliancePanel } from "./MaternityCompliancePanel";
import { MaternityPaymentConfigPanel } from "./MaternityPaymentConfigPanel";
import { STATUS_LABELS, type MaternityLeaveStatus } from "@/types/maternityLeave";

const statusColors: Record<MaternityLeaveStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  active_prenatal: "bg-purple-100 text-purple-800",
  active_postnatal: "bg-pink-100 text-pink-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  extended: "bg-orange-100 text-orange-800",
};

export function MaternityLeaveDashboard({ companyId: propCompanyId }: { companyId?: string } = {}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(propCompanyId || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("requests");

  const effectiveCompanyId = selectedCompanyId || propCompanyId;

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: requests = [], isLoading, refetch } = useMaternityLeaveRequests(effectiveCompanyId);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      !searchTerm ||
      req.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    active: requests.filter((r) => ["active_prenatal", "active_postnatal"].includes(r.status)).length,
    upcoming: requests.filter((r) => {
      if (!r.expected_due_date) return false;
      const daysUntil = differenceInDays(new Date(r.expected_due_date), new Date());
      return daysUntil > 0 && daysUntil <= 30;
    }).length,
  };

  if (selectedRequestId) {
    return (
      <MaternityLeaveDetails
        requestId={selectedRequestId}
        onBack={() => setSelectedRequestId(null)}
      />
    );
  }

  if (showCreateForm) {
    return (
      <MaternityLeaveRequestForm
        companyId={effectiveCompanyId!}
        onCancel={() => setShowCreateForm(false)}
        onSuccess={() => {
          setShowCreateForm(false);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="h-6 w-6 text-pink-500" />
            Maternity Leave Processing
          </h1>
          <p className="text-muted-foreground">
            Manage maternity leave requests, payments, and return-to-work planning
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-pink-100">
                <Baby className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currently Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due in 30 Days</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="compliance">Regional Compliance</TabsTrigger>
          <TabsTrigger value="payments">Payment Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Maternity Leave Requests</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Baby className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No maternity leave requests found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedRequestId(request.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-pink-100">
                          <Baby className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.employee?.full_name}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Due: {format(new Date(request.expected_due_date), "MMM d, yyyy")}
                            </span>
                            {request.prenatal_start_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Leave starts:{" "}
                                {format(new Date(request.prenatal_start_date), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={statusColors[request.status]}>
                          {STATUS_LABELS[request.status]}
                        </Badge>
                        {request.phased_return_enabled && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Phased Return
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <MaternityCompliancePanel />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <MaternityPaymentConfigPanel companyId={effectiveCompanyId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
