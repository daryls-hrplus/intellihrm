import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Award, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, addMonths } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface RecertificationTabProps {
  companyId: string;
}

interface Requirement {
  id: string;
  certification_name: string;
  description: string | null;
  validity_months: number;
  reminder_days_before: number;
  is_active: boolean;
  course: { title: string } | null;
}

interface EmployeeCert {
  id: string;
  certification_date: string;
  expiry_date: string;
  certificate_number: string | null;
  status: string;
  requirement: { certification_name: string } | null;
  employee: { full_name: string } | null;
}

export function RecertificationTab({ companyId }: RecertificationTabProps) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [certifications, setCertifications] = useState<EmployeeCert[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [reqDialogOpen, setReqDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"requirements" | "certifications">("certifications");
  const [formData, setFormData] = useState({
    certification_name: "",
    description: "",
    validity_months: "12",
    reminder_days_before: "30",
    renewal_course_id: "",
  });
  const [certFormData, setCertFormData] = useState({
    requirement_id: "",
    employee_id: "",
    certification_date: "",
    certificate_number: "",
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    
    // @ts-ignore - Supabase type instantiation issue
    const reqRes = await supabase
      .from("recertification_requirements")
      .select("*, course:lms_courses(title)")
      .eq("company_id", companyId)
      .order("certification_name");
    
    // @ts-ignore - Supabase type instantiation issue
    const certRes = await supabase
      .from("employee_recertifications")
      .select("*, requirement:recertification_requirements(certification_name), employee:profiles(full_name)")
      .order("expiry_date");
    
    // @ts-ignore - Supabase type instantiation issue
    const coursesRes = await supabase
      .from("lms_courses")
      .select("id, title")
      .eq("company_id", companyId)
      .eq("is_active", true);
    
    // @ts-ignore - Supabase type instantiation issue
    const empRes = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId)
      .eq("is_active", true);

    if (reqRes.data) setRequirements(reqRes.data);
    if (certRes.data) setCertifications(certRes.data);
    if (coursesRes.data) setCourses(coursesRes.data);
    if (empRes.data) setEmployees(empRes.data);
    setLoading(false);
  };

  const handleReqSubmit = async () => {
    if (!formData.certification_name) {
      toast.error("Certification name is required");
      return;
    }

    const { error } = await supabase.from("recertification_requirements").insert({
      company_id: companyId,
      certification_name: formData.certification_name,
      description: formData.description || null,
      validity_months: parseInt(formData.validity_months),
      reminder_days_before: parseInt(formData.reminder_days_before),
      renewal_course_id: formData.renewal_course_id || null,
      is_active: true,
    });

    if (error) {
      toast.error("Failed to create requirement");
    } else {
      toast.success("Requirement created");
      setReqDialogOpen(false);
      setFormData({ certification_name: "", description: "", validity_months: "12", reminder_days_before: "30", renewal_course_id: "" });
      loadData();
    }
  };

  const handleCertSubmit = async () => {
    if (!certFormData.requirement_id || !certFormData.employee_id || !certFormData.certification_date) {
      toast.error("All fields are required");
      return;
    }

    const req = requirements.find((r) => r.id === certFormData.requirement_id);
    const expiryDate = addMonths(new Date(certFormData.certification_date), req?.validity_months || 12);

    const { error } = await supabase.from("employee_recertifications").insert({
      requirement_id: certFormData.requirement_id,
      employee_id: certFormData.employee_id,
      certification_date: certFormData.certification_date,
      expiry_date: expiryDate.toISOString().split("T")[0],
      certificate_number: certFormData.certificate_number || null,
      status: "active",
    });

    if (error) {
      toast.error("Failed to add certification");
    } else {
      toast.success("Certification added");
      setCertDialogOpen(false);
      setCertFormData({ requirement_id: "", employee_id: "", certification_date: "", certificate_number: "" });
      loadData();
    }
  };

  const getStatusBadge = (status: string, expiryDate: string) => {
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    if (status === "expired" || daysUntilExpiry < 0) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
    if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Expiring Soon</Badge>;
    }
    return <Badge variant="default" className="bg-green-600"><Award className="h-3 w-3 mr-1" />Active</Badge>;
  };

  const stats = {
    total: certifications.length,
    active: certifications.filter((c) => differenceInDays(new Date(c.expiry_date), new Date()) > 30).length,
    expiringSoon: certifications.filter((c) => {
      const days = differenceInDays(new Date(c.expiry_date), new Date());
      return days >= 0 && days <= 30;
    }).length,
    expired: certifications.filter((c) => differenceInDays(new Date(c.expiry_date), new Date()) < 0).length,
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Certifications</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expiring Soon</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expired</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.expired}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === "certifications" ? "default" : "outline"} onClick={() => setActiveTab("certifications")}>Certifications</Button>
        <Button variant={activeTab === "requirements" ? "default" : "outline"} onClick={() => setActiveTab("requirements")}>Requirements</Button>
      </div>

      {activeTab === "certifications" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee Certifications</CardTitle>
            <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Certification</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Employee Certification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Certification *</Label>
                    <Select value={certFormData.requirement_id} onValueChange={(v) => setCertFormData({ ...certFormData, requirement_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select certification" /></SelectTrigger>
                      <SelectContent>
                        {requirements.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.certification_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Employee *</Label>
                    <Select value={certFormData.employee_id} onValueChange={(v) => setCertFormData({ ...certFormData, employee_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Certification Date *</Label>
                    <Input type="date" value={certFormData.certification_date} onChange={(e) => setCertFormData({ ...certFormData, certification_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Certificate Number</Label>
                    <Input value={certFormData.certificate_number} onChange={(e) => setCertFormData({ ...certFormData, certificate_number: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setCertDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCertSubmit}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Certified</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.employee?.full_name}</TableCell>
                    <TableCell>{c.requirement?.certification_name}</TableCell>
                    <TableCell>{c.certificate_number || "-"}</TableCell>
                    <TableCell>{formatDateForDisplay(c.certification_date)}</TableCell>
                    <TableCell>{formatDateForDisplay(c.expiry_date)}</TableCell>
                    <TableCell>{getStatusBadge(c.status, c.expiry_date)}</TableCell>
                  </TableRow>
                ))}
                {certifications.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No certifications</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "requirements" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certification Requirements</CardTitle>
            <Dialog open={reqDialogOpen} onOpenChange={setReqDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Requirement</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Certification Requirement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Certification Name *</Label>
                    <Input value={formData.certification_name} onChange={(e) => setFormData({ ...formData, certification_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Validity (months)</Label>
                      <Input type="number" value={formData.validity_months} onChange={(e) => setFormData({ ...formData, validity_months: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reminder (days before)</Label>
                      <Input type="number" value={formData.reminder_days_before} onChange={(e) => setFormData({ ...formData, reminder_days_before: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Renewal Course</Label>
                    <Select value={formData.renewal_course_id} onValueChange={(v) => setFormData({ ...formData, renewal_course_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select course (optional)" /></SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setReqDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleReqSubmit}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Reminder</TableHead>
                  <TableHead>Renewal Course</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.certification_name}</TableCell>
                    <TableCell>{r.validity_months} months</TableCell>
                    <TableCell>{r.reminder_days_before} days before</TableCell>
                    <TableCell>{r.course?.title || "-"}</TableCell>
                    <TableCell><Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  </TableRow>
                ))}
                {requirements.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No requirements defined</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
