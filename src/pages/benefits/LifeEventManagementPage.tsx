import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Building2, Calendar, Check, X } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useTranslation } from "react-i18next";
import { getTodayString, toDateString, parseLocalDate } from "@/utils/dateUtils";
import { addDays } from "date-fns";

const LIFE_EVENT_TYPES = [
  { value: "marriage", label: "Marriage" },
  { value: "divorce", label: "Divorce" },
  { value: "birth", label: "Birth of Child" },
  { value: "adoption", label: "Adoption" },
  { value: "death", label: "Death of Dependent" },
  { value: "loss_of_coverage", label: "Loss of Other Coverage" },
  { value: "gain_of_coverage", label: "Gain of Other Coverage" },
  { value: "relocation", label: "Relocation" },
  { value: "employment_change", label: "Spouse Employment Change" }
];

export default function LifeEventManagementPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [lifeEvents, setLifeEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    event_type: "",
    event_date: getTodayString(),
    description: "",
    enrollment_window_start: "",
    enrollment_window_end: ""
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchEmployees();
      fetchLifeEvents();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, company_id")
      .eq("company_id", selectedCompany);
    setEmployees(data || []);
  };

  const fetchLifeEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("benefit_life_events")
        .select(`
          *,
          employee:profiles(full_name, email),
          processor:profiles!benefit_life_events_processed_by_fkey(full_name)
        `)
        .eq("company_id", selectedCompany)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLifeEvents(data || []);
    } catch (error) {
      console.error("Error fetching life events:", error);
      toast.error("Failed to load life events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.event_type || !formData.event_date) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      // Calculate enrollment window (typically 30 days from event)
      const eventDate = parseLocalDate(formData.event_date);
      const windowStart = formData.enrollment_window_start || formData.event_date;
      const windowEnd = formData.enrollment_window_end || (eventDate ? toDateString(addDays(eventDate, 30)) : getTodayString());

      const { error } = await supabase
        .from("benefit_life_events")
        .insert([{
          company_id: selectedCompany,
          employee_id: formData.employee_id,
          event_type: formData.event_type,
          event_date: formData.event_date,
          description: formData.description,
          enrollment_window_start: windowStart,
          enrollment_window_end: windowEnd,
          status: "pending"
        }]);

      if (error) throw error;

      await logAction({
        action: "CREATE",
        entityType: "benefit_life_events",
        entityName: `${formData.event_type} for employee`
      });

      toast.success("Life event recorded successfully");
      setIsDialogOpen(false);
      resetForm();
      fetchLifeEvents();
    } catch (error) {
      console.error("Error saving life event:", error);
      toast.error("Failed to save life event");
    }
  };

  const handleProcess = async (event: any, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("benefit_life_events")
        .update({
          status,
          processed_by: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq("id", event.id);

      if (error) throw error;

      await logAction({
        action: "UPDATE",
        entityType: "benefit_life_events",
        entityId: event.id,
        entityName: `${event.event_type} - ${status}`
      });

      toast.success(`Life event ${status}`);
      fetchLifeEvents();
    } catch (error) {
      console.error("Error processing life event:", error);
      toast.error("Failed to process life event");
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      event_type: "",
      event_date: getTodayString(),
      description: "",
      enrollment_window_start: "",
      enrollment_window_end: ""
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Life Event Management" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Life Event Management</h1>
            <p className="text-muted-foreground">Handle qualifying life events for mid-year benefit changes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Record Life Event</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Record Qualifying Life Event</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employee">Employee *</Label>
                    <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LIFE_EVENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_date">Event Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional details about the life event..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="window_start">Enrollment Window Start</Label>
                      <Input
                        id="window_start"
                        type="date"
                        value={formData.enrollment_window_start}
                        onChange={(e) => setFormData({ ...formData, enrollment_window_start: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="window_end">Enrollment Window End</Label>
                      <Input
                        id="window_end"
                        type="date"
                        value={formData.enrollment_window_end}
                        onChange={(e) => setFormData({ ...formData, enrollment_window_end: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Default enrollment window is 30 days from the event date
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>Record Event</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Life Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Enrollment Window</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lifeEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No life events recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  lifeEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.employee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{event.employee?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {LIFE_EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                      </TableCell>
                      <TableCell>{event.event_date}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{event.enrollment_window_start}</p>
                          <p className="text-muted-foreground">to {event.enrollment_window_end}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event.processor?.full_name || "-"}
                      </TableCell>
                      <TableCell>
                        {event.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleProcess(event, "approved")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleProcess(event, "rejected")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
