import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Crown,
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Users,
  Building,
  Gavel,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString } from "@/utils/dateUtils";

interface GovernanceBody {
  id: string;
  company_id: string;
  name: string;
  body_type: string;
  description: string | null;
  can_approve_headcount: boolean;
  is_active: boolean;
}

interface GovernanceMember {
  id: string;
  governance_body_id: string;
  employee_id: string;
  role_in_body: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  employee?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface GovernanceManagementProps {
  companyId: string;
}

const bodyTypeLabels: Record<string, { label: string; icon: any }> = {
  board: { label: "Board of Directors", icon: Crown },
  management: { label: "Management Team", icon: Building },
  committee: { label: "Committee", icon: Gavel },
};

const roleLabels: Record<string, string> = {
  chair: "Chair",
  vice_chair: "Vice Chair",
  secretary: "Secretary",
  member: "Member",
};

export function GovernanceManagement({ companyId }: GovernanceManagementProps) {
  const [bodies, setBodies] = useState<GovernanceBody[]>([]);
  const [members, setMembers] = useState<GovernanceMember[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);

  // Body dialog state
  const [bodyDialogOpen, setBodyDialogOpen] = useState(false);
  const [editingBody, setEditingBody] = useState<GovernanceBody | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Body form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("board");
  const [formDescription, setFormDescription] = useState("");
  const [formCanApprove, setFormCanApprove] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Member dialog state
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GovernanceMember | null>(null);

  // Member form state
  const [memberEmployeeId, setMemberEmployeeId] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [memberStartDate, setMemberStartDate] = useState("");
  const [memberEndDate, setMemberEndDate] = useState("");
  const [memberIsActive, setMemberIsActive] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bodiesRes, employeesRes] = await Promise.all([
        supabase
          .from("governance_bodies")
          .select("*")
          .eq("company_id", companyId)
          .order("name"),
        supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .order("full_name"),
      ]);

      if (bodiesRes.error) throw bodiesRes.error;
      if (employeesRes.error) throw employeesRes.error;

      setBodies(bodiesRes.data || []);
      setEmployees(employeesRes.data || []);

      if (bodiesRes.data && bodiesRes.data.length > 0) {
        const bodyIds = bodiesRes.data.map(b => b.id);
        const { data: membersData, error: membersError } = await supabase
          .from("governance_members")
          .select(`
            *,
            employee:profiles(full_name, email, avatar_url)
          `)
          .in("governance_body_id", bodyIds)
          .order("role_in_body");

        if (membersError) throw membersError;
        setMembers(membersData || []);

        if (!selectedBodyId) {
          setSelectedBodyId(bodiesRes.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load governance data");
    } finally {
      setIsLoading(false);
    }
  };

  const getMembersForBody = (bodyId: string) =>
    members.filter(m => m.governance_body_id === bodyId);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  // Body CRUD
  const openCreateBody = () => {
    setEditingBody(null);
    setFormName("");
    setFormType("board");
    setFormDescription("");
    setFormCanApprove(false);
    setFormIsActive(true);
    setBodyDialogOpen(true);
  };

  const openEditBody = (body: GovernanceBody) => {
    setEditingBody(body);
    setFormName(body.name);
    setFormType(body.body_type);
    setFormDescription(body.description || "");
    setFormCanApprove(body.can_approve_headcount);
    setFormIsActive(body.is_active);
    setBodyDialogOpen(true);
  };

  const handleSaveBody = async () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsProcessing(true);
    try {
      const data = {
        company_id: companyId,
        name: formName.trim(),
        body_type: formType,
        description: formDescription.trim() || null,
        can_approve_headcount: formCanApprove,
        is_active: formIsActive,
      };

      if (editingBody) {
        const { error } = await supabase
          .from("governance_bodies")
          .update(data)
          .eq("id", editingBody.id);
        if (error) throw error;
        toast.success("Governance body updated");
      } else {
        const { error } = await supabase
          .from("governance_bodies")
          .insert(data);
        if (error) throw error;
        toast.success("Governance body created");
      }

      setBodyDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBody = async (id: string) => {
    if (!confirm("Are you sure? This will remove all members.")) return;

    try {
      const { error } = await supabase.from("governance_bodies").delete().eq("id", id);
      if (error) throw error;
      toast.success("Governance body deleted");
      if (selectedBodyId === id) {
        setSelectedBodyId(null);
      }
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete");
    }
  };

  // Member CRUD
  const openAddMember = (bodyId: string) => {
    setSelectedBodyId(bodyId);
    setEditingMember(null);
    setMemberEmployeeId("");
    setMemberRole("member");
    setMemberStartDate(getTodayString());
    setMemberEndDate("");
    setMemberIsActive(true);
    setMemberDialogOpen(true);
  };

  const openEditMember = (member: GovernanceMember) => {
    setEditingMember(member);
    setMemberEmployeeId(member.employee_id);
    setMemberRole(member.role_in_body);
    setMemberStartDate(member.start_date);
    setMemberEndDate(member.end_date || "");
    setMemberIsActive(member.is_active);
    setMemberDialogOpen(true);
  };

  const handleSaveMember = async () => {
    if (!memberEmployeeId || !selectedBodyId) {
      toast.error("Employee is required");
      return;
    }

    setIsProcessing(true);
    try {
      const data = {
        governance_body_id: selectedBodyId,
        employee_id: memberEmployeeId,
        role_in_body: memberRole,
        start_date: memberStartDate,
        end_date: memberEndDate || null,
        is_active: memberIsActive,
      };

      if (editingMember) {
        const { error } = await supabase
          .from("governance_members")
          .update(data)
          .eq("id", editingMember.id);
        if (error) throw error;
        toast.success("Member updated");
      } else {
        const { error } = await supabase
          .from("governance_members")
          .insert(data);
        if (error) throw error;
        toast.success("Member added");
      }

      setMemberDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save member");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Remove this member?")) return;

    try {
      const { error } = await supabase.from("governance_members").delete().eq("id", id);
      if (error) throw error;
      toast.success("Member removed");
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to remove member");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Governance Bodies
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage boards, management teams, and committees with headcount approval authority
          </p>
        </div>
        <Button onClick={openCreateBody}>
          <Plus className="h-4 w-4 mr-2" />
          Add Body
        </Button>
      </div>

      {bodies.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No governance bodies yet. Create a board or management team to manage position control.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {bodies.map((body) => {
            const bodyMembers = getMembersForBody(body.id);
            const TypeIcon = bodyTypeLabels[body.body_type]?.icon || Users;

            return (
              <Card key={body.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{body.name}</CardTitle>
                        <CardDescription>
                          {bodyTypeLabels[body.body_type]?.label || body.body_type}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {body.can_approve_headcount && (
                        <Badge variant="default" className="text-xs">Can Approve</Badge>
                      )}
                      {!body.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEditBody(body)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteBody(body.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {body.description && (
                    <p className="text-sm text-muted-foreground mt-2">{body.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Members ({bodyMembers.length})</span>
                    <Button size="sm" variant="outline" onClick={() => openAddMember(body.id)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {bodyMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bodyMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.employee?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(member.employee?.full_name || null, member.employee?.email || "")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {member.employee?.full_name || member.employee?.email}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {roleLabels[member.role_in_body] || member.role_in_body}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!member.is_active && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => openEditMember(member)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Body Dialog */}
      <Dialog open={bodyDialogOpen} onOpenChange={setBodyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBody ? "Edit" : "Add"} Governance Body</DialogTitle>
            <DialogDescription>
              Create boards, management teams, or committees to control position headcount
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Board of Directors"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">Board of Directors</SelectItem>
                  <SelectItem value="management">Management Team</SelectItem>
                  <SelectItem value="committee">Committee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={formCanApprove} onCheckedChange={setFormCanApprove} />
                <Label>Can Approve Headcount</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBodyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBody} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBody ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit" : "Add"} Member</DialogTitle>
            <DialogDescription>
              Assign an employee to this governance body
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={memberEmployeeId} onValueChange={setMemberEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name || emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chair">Chair</SelectItem>
                  <SelectItem value="vice_chair">Vice Chair</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={memberStartDate}
                  onChange={(e) => setMemberStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={memberEndDate}
                  onChange={(e) => setMemberEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={memberIsActive} onCheckedChange={setMemberIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingMember ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
