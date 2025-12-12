import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, UserPlus, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Participant {
  id: string;
  employee_id: string;
  status: string;
  employee?: {
    full_name: string;
    email: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface CycleParticipantsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string;
  cycleName: string;
  companyId: string;
  onUpdate: () => void;
}

export function CycleParticipantsManager({
  open,
  onOpenChange,
  cycleId,
  cycleName,
  companyId,
  onUpdate,
}: CycleParticipantsManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);

  useEffect(() => {
    if (open && cycleId) {
      fetchData();
    }
  }, [open, cycleId]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchParticipants(), fetchEmployees(), fetchDepartments()]);
    setLoading(false);
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from("review_participants")
      .select(`
        id,
        employee_id,
        status
      `)
      .eq("review_cycle_id", cycleId);

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    // Fetch employee details
    const participantsWithDetails = await Promise.all(
      (data || []).map(async (p) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", p.employee_id)
          .single();
        return { ...p, employee: profile };
      })
    );

    setParticipants(participantsWithDetails);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("company_id", companyId)
      .order("full_name");

    if (error) {
      console.error("Error fetching employees:", error);
      return;
    }

    setEmployees(data || []);
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("id, name")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching departments:", error);
      return;
    }

    setDepartments(data || []);
  };

  const handleAddParticipants = async () => {
    if (selectedEmployees.length === 0) return;

    setAdding(true);
    try {
      const newParticipants = selectedEmployees.map((empId) => ({
        review_cycle_id: cycleId,
        employee_id: empId,
        status: "pending",
      }));

      const { error } = await supabase
        .from("review_participants")
        .insert(newParticipants);

      if (error) throw error;

      toast.success(`Added ${selectedEmployees.length} participant(s)`);
      setSelectedEmployees([]);
      setShowAddPanel(false);
      fetchParticipants();
      onUpdate();
    } catch (error) {
      console.error("Error adding participants:", error);
      toast.error("Failed to add participants");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("review_participants")
        .delete()
        .eq("id", participantId);

      if (error) throw error;

      toast.success("Participant removed");
      fetchParticipants();
      onUpdate();
    } catch (error) {
      console.error("Error removing participant:", error);
      toast.error("Failed to remove participant");
    }
  };

  const handleAddAll = async () => {
    const existingIds = new Set(participants.map((p) => p.employee_id));
    const newEmployees = filteredEmployees.filter((e) => !existingIds.has(e.id));

    if (newEmployees.length === 0) {
      toast.info("All employees are already participants");
      return;
    }

    setAdding(true);
    try {
      const newParticipants = newEmployees.map((emp) => ({
        review_cycle_id: cycleId,
        employee_id: emp.id,
        status: "pending",
      }));

      const { error } = await supabase
        .from("review_participants")
        .insert(newParticipants);

      if (error) throw error;

      toast.success(`Added ${newEmployees.length} participant(s)`);
      fetchParticipants();
      onUpdate();
    } catch (error) {
      console.error("Error adding participants:", error);
      toast.error("Failed to add participants");
    } finally {
      setAdding(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const existingParticipantIds = new Set(participants.map((p) => p.employee_id));
  const filteredEmployees = employees.filter(
    (e) =>
      !existingParticipantIds.has(e.id) &&
      (e.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    in_progress: "bg-info/10 text-info",
    completed: "bg-success/10 text-success",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Participants
          </DialogTitle>
          <DialogDescription>{cycleName}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{participants.length} participants</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddPanel(!showAddPanel)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Participants
              </Button>
            </div>
          </div>

          {showAddPanel && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add Employees</h4>
                <Button variant="outline" size="sm" onClick={handleAddAll} disabled={adding}>
                  Add All ({filteredEmployees.length})
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-48 border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => {
                        setSelectedEmployees((prev) =>
                          prev.includes(employee.id)
                            ? prev.filter((id) => id !== employee.id)
                            : [...prev, employee.id]
                        );
                      }}
                    >
                      <Checkbox checked={selectedEmployees.includes(employee.id)} />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(employee.full_name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{employee.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <p className="text-center py-4 text-sm text-muted-foreground">
                      No employees found
                    </p>
                  )}
                </div>
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddPanel(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddParticipants}
                  disabled={selectedEmployees.length === 0 || adding}
                >
                  {adding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Add Selected ({selectedEmployees.length})
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No participants added yet</p>
                <p className="text-sm">Click "Add Participants" to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(participant.employee?.full_name || "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {participant.employee?.full_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {participant.employee?.email}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[participant.status]}>
                          {participant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
