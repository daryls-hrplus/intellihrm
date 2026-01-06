import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileCheck, Search, Download, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PolicyAcknowledgmentTrackerProps {
  companyId: string;
}

interface LeaveType {
  id: string;
  name: string;
  code: string;
}

interface Acknowledgment {
  id: string;
  employee_id: string;
  policy_type: string;
  policy_name: string;
  policy_version: number;
  acknowledged_at: string;
  profiles?: { full_name: string; email: string };
}

export function PolicyAcknowledgmentTracker({ companyId }: PolicyAcknowledgmentTrackerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPolicyType, setFilterPolicyType] = useState<string>("all");
  const [showAcknowledgeDialog, setShowAcknowledgeDialog] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  // Fetch acknowledgments
  const { data: acknowledgments = [], isLoading: loadingAcks } = useQuery({
    queryKey: ["policy-acknowledgments", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_policy_acknowledgments")
        .select(`*, profiles:employee_id(full_name, email)`)
        .eq("company_id", companyId)
        .order("acknowledged_at", { ascending: false });
      if (error) throw error;
      return data as Acknowledgment[];
    },
    enabled: !!companyId,
  });

  // Fetch leave types for policy list
  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leave-types-for-ack", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_types")
        .select("id, name, code")
        .eq("company_id", companyId)
        .eq("is_active", true);
      if (error) throw error;
      return data as LeaveType[];
    },
    enabled: !!companyId,
  });

  // Create acknowledgment
  const acknowledgeMutation = useMutation({
    mutationFn: async (policies: { type: string; id: string; name: string }[]) => {
      const records = policies.map((p) => ({
        company_id: companyId,
        employee_id: user?.id,
        policy_type: p.type,
        policy_id: p.id,
        policy_name: p.name,
        policy_version: 1,
      }));
      const { error } = await supabase.from("leave_policy_acknowledgments").insert(records);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Policies acknowledged successfully");
      queryClient.invalidateQueries({ queryKey: ["policy-acknowledgments"] });
      setShowAcknowledgeDialog(false);
      setSelectedPolicies([]);
    },
    onError: (error) => toast.error(`Failed to acknowledge: ${error.message}`),
  });

  // Calculate compliance stats
  const totalEmployees = new Set(acknowledgments.map((a) => a.employee_id)).size;
  const totalPolicies = leaveTypes.length;
  const compliantCount = acknowledgments.filter(
    (a) => a.policy_type === "leave_type"
  ).length;

  const filteredAcks = acknowledgments.filter((ack) => {
    const matchesSearch =
      ack.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ack.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterPolicyType === "all" || ack.policy_type === filterPolicyType;
    return matchesSearch && matchesType;
  });

  const handleAcknowledge = () => {
    const policies = selectedPolicies.map((id) => {
      const lt = leaveTypes.find((l) => l.id === id);
      return { type: "leave_type", id, name: lt?.name || "Unknown" };
    });
    acknowledgeMutation.mutate(policies);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Acknowledgments</p>
                <p className="text-2xl font-bold">{acknowledgments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees Acknowledged</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Policies</p>
                <p className="text-2xl font-bold">{totalPolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{Math.max(0, totalPolicies - compliantCount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Policy Acknowledgments</CardTitle>
              <CardDescription>Track employee sign-offs on leave policies</CardDescription>
            </div>
            <Dialog open={showAcknowledgeDialog} onOpenChange={setShowAcknowledgeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Acknowledge Policies
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Acknowledge Leave Policies</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Select the policies you have read and understood:
                  </p>
                  {leaveTypes.map((lt) => (
                    <div key={lt.id} className="flex items-center gap-3">
                      <Checkbox
                        id={lt.id}
                        checked={selectedPolicies.includes(lt.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPolicies([...selectedPolicies, lt.id]);
                          } else {
                            setSelectedPolicies(selectedPolicies.filter((id) => id !== lt.id));
                          }
                        }}
                      />
                      <label htmlFor={lt.id} className="text-sm cursor-pointer">
                        {lt.name} ({lt.code})
                      </label>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAcknowledgeDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAcknowledge}
                    disabled={selectedPolicies.length === 0 || acknowledgeMutation.isPending}
                  >
                    {acknowledgeMutation.isPending ? "Submitting..." : "Confirm Acknowledgment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee or policy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPolicyType} onValueChange={setFilterPolicyType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="leave_type">Leave Types</SelectItem>
                <SelectItem value="accrual_rule">Accrual Rules</SelectItem>
                <SelectItem value="general_policy">General Policies</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Acknowledged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAcks ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAcks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No acknowledgments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAcks.map((ack) => (
                    <TableRow key={ack.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ack.profiles?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{ack.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ack.policy_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ack.policy_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>v{ack.policy_version}</TableCell>
                      <TableCell>{format(new Date(ack.acknowledged_at), "PPp")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
