import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

interface BoardMember {
  id: string;
  board_id: string;
  employee_id: string | null;
  external_member_name: string | null;
  external_member_email: string | null;
  board_role: string;
  appointment_type: string | null;
  is_independent: boolean;
  has_voting_rights: boolean;
  appointment_date: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
  is_renewable: boolean;
  is_active: boolean;
  notes: string | null;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface BoardMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string | null;
  member: BoardMember | null;
  onSaved: () => void;
}

const boardRoleOptions = [
  { value: "chairperson", label: "Chairperson" },
  { value: "vice_chairperson", label: "Vice Chairperson" },
  { value: "director", label: "Director" },
  { value: "secretary", label: "Secretary" },
  { value: "member", label: "Member" },
  { value: "observer", label: "Observer" },
];

const appointmentTypeOptions = [
  { value: "elected", label: "Elected" },
  { value: "appointed", label: "Appointed" },
  { value: "ex_officio", label: "Ex-Officio" },
  { value: "co_opted", label: "Co-opted" },
];

const emptyForm = {
  memberType: "internal" as "internal" | "external",
  employee_id: "",
  external_member_name: "",
  external_member_email: "",
  board_role: "member",
  appointment_type: "appointed",
  is_independent: false,
  has_voting_rights: true,
  appointment_date: "",
  term_start_date: "",
  term_end_date: "",
  is_renewable: false,
  is_active: true,
  notes: "",
};

export function BoardMembersDialog({
  open,
  onOpenChange,
  boardId,
  member,
  onSaved,
}: BoardMembersDialogProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  useEffect(() => {
    if (open) {
      fetchEmployees();
      if (member) {
        setFormData({
          memberType: member.employee_id ? "internal" : "external",
          employee_id: member.employee_id || "",
          external_member_name: member.external_member_name || "",
          external_member_email: member.external_member_email || "",
          board_role: member.board_role,
          appointment_type: member.appointment_type || "appointed",
          is_independent: member.is_independent,
          has_voting_rights: member.has_voting_rights,
          appointment_date: member.appointment_date || "",
          term_start_date: member.term_start_date || "",
          term_end_date: member.term_end_date || "",
          is_renewable: member.is_renewable,
          is_active: member.is_active,
          notes: member.notes || "",
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [open, member]);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("is_active", true)
      .order("full_name");
    if (data) setEmployees(data);
  };

  const handleSubmit = async () => {
    if (!boardId) return;

    if (formData.memberType === "internal" && !formData.employee_id) {
      toast.error("Please select an employee");
      return;
    }

    if (formData.memberType === "external" && !formData.external_member_name) {
      toast.error("Please enter the member name");
      return;
    }

    setLoading(true);

    const payload = {
      board_id: boardId,
      employee_id: formData.memberType === "internal" ? formData.employee_id : null,
      external_member_name: formData.memberType === "external" ? formData.external_member_name : null,
      external_member_email: formData.memberType === "external" ? formData.external_member_email || null : null,
      board_role: formData.board_role,
      appointment_type: formData.appointment_type || null,
      is_independent: formData.is_independent,
      has_voting_rights: formData.has_voting_rights,
      appointment_date: formData.appointment_date || null,
      term_start_date: formData.term_start_date || null,
      term_end_date: formData.term_end_date || null,
      is_renewable: formData.is_renewable,
      is_active: formData.is_active,
      notes: formData.notes || null,
    };

    try {
      if (member) {
        const { error } = await supabase
          .from("company_board_members")
          .update(payload)
          .eq("id", member.id);

        if (error) throw error;
        toast.success("Member updated successfully");
        logAction({ action: "UPDATE", entityType: "company_board_members", entityId: member.id });
      } else {
        const { error } = await supabase.from("company_board_members").insert(payload);

        if (error) throw error;
        toast.success("Member added successfully");
        logAction({ action: "CREATE", entityType: "company_board_members" });
      }
      onSaved();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Board Member" : "Add Board Member"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs
            value={formData.memberType}
            onValueChange={(v) => setFormData({ ...formData, memberType: v as "internal" | "external" })}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="internal">Internal Employee</TabsTrigger>
              <TabsTrigger value="external">External Director</TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="space-y-4 mt-4">
              <div>
                <Label>Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="external" className="space-y-4 mt-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.external_member_name}
                  onChange={(e) => setFormData({ ...formData, external_member_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.external_member_email}
                  onChange={(e) => setFormData({ ...formData, external_member_email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Board Role *</Label>
              <Select
                value={formData.board_role}
                onValueChange={(v) => setFormData({ ...formData, board_role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boardRoleOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Appointment Type</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(v) => setFormData({ ...formData, appointment_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_independent}
                onCheckedChange={(v) => setFormData({ ...formData, is_independent: v })}
              />
              <Label>Independent Director</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.has_voting_rights}
                onCheckedChange={(v) => setFormData({ ...formData, has_voting_rights: v })}
              />
              <Label>Has Voting Rights</Label>
            </div>
          </div>

          <div>
            <Label>Appointment Date</Label>
            <Input
              type="date"
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Term Start Date</Label>
              <Input
                type="date"
                value={formData.term_start_date}
                onChange={(e) => setFormData({ ...formData, term_start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Term End Date</Label>
              <Input
                type="date"
                value={formData.term_end_date}
                onChange={(e) => setFormData({ ...formData, term_end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_renewable}
              onCheckedChange={(v) => setFormData({ ...formData, is_renewable: v })}
            />
            <Label>Term is Renewable</Label>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
            />
            <Label>Active Member</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : member ? "Update" : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
