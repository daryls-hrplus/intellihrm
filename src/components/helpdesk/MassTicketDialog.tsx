import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Users, Send, Search, X, CheckCircle } from "lucide-react";

interface MassTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
  department?: { name: string } | null;
}

export function MassTicketDialog({ open, onOpenChange }: MassTicketDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category_id: "",
    priority_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees-for-mass-ticket"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, department:departments(name)")
        .order("full_name");
      if (error) throw error;
      return data as Employee[];
    },
    enabled: open,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["hr-only-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_categories")
        .select("id, name, code, visible_to_hr_only")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: priorities = [] } = useQuery({
    queryKey: ["ticket-priorities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_priorities")
        .select("id, name, code, color")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const filteredEmployees = employees.filter((emp) => {
    const search = searchTerm.toLowerCase();
    return (
      emp.full_name?.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search) ||
      emp.department?.name?.toLowerCase().includes(search)
    );
  });

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAll = () => {
    setSelectedEmployees(filteredEmployees.map((e) => e.id));
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in subject and description");
      return;
    }
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate ticket numbers
      const generateTicketNumber = () => {
        const prefix = "TKT";
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
      };

      // Create tickets for all selected employees
      const tickets = selectedEmployees.map((employeeId) => ({
        ticket_number: generateTicketNumber(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        priority_id: formData.priority_id || null,
        requester_id: employeeId,
        status: "open" as const,
      }));

      const { error } = await supabase.from("tickets").insert(tickets);
      if (error) throw error;

      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      
      // Reset after success
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating mass tickets:", error);
      toast.error(error.message || "Failed to create tickets");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ subject: "", description: "", category_id: "", priority_id: "" });
    setSelectedEmployees([]);
    setSearchTerm("");
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Tickets Created!</h3>
              <p className="text-sm text-muted-foreground">
                {selectedEmployees.length} tickets have been created successfully.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Mass Tickets
          </DialogTitle>
          <DialogDescription>
            Send the same ticket to multiple employees at once. Useful for announcements, compliance follow-ups, or bulk communications.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
          {/* Left: Employee Selection */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employees..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedEmployees.length} of {employees.length} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={selectAll}>
                  Select All
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-lg h-[300px]">
              <div className="p-2 space-y-1">
                {loadingEmployees ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                        selectedEmployees.includes(employee.id) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => toggleEmployee(employee.id)}
                    >
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {employee.full_name || employee.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {employee.email}
                          {employee.department?.name && ` • ${employee.department.name}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                {selectedEmployees.slice(0, 10).map((id) => {
                  const emp = employees.find((e) => e.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {emp?.full_name || emp?.email}
                      <button onClick={() => toggleEmployee(id)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                {selectedEmployees.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedEmployees.length - 10} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right: Ticket Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ticket subject"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {cat.name}
                          {cat.visible_to_hr_only && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1 rounded">HR</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority_id} onValueChange={(v) => setFormData({ ...formData, priority_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ticket description..."
                rows={6}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-1">Preview</p>
              <p className="text-muted-foreground">
                This will create <strong>{selectedEmployees.length}</strong> individual tickets, 
                one for each selected employee. Each employee will see their own ticket in their ESS portal.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || selectedEmployees.length === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create {selectedEmployees.length} Tickets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
