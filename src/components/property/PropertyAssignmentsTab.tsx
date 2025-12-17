import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Users, Loader2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  companyId?: string;
}

const CONDITIONS = ["excellent", "good", "fair", "poor", "damaged"];

const PropertyAssignmentsTab = ({ companyId }: Props) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState("good");
  const [returnNotes, setReturnNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    property_id: "",
    employee_id: "",
    assigned_date: getTodayString(),
    expected_return_date: "",
    condition_at_assignment: "good",
    notes: "",
  });

  const { items, assignments, loadingAssignments, createAssignment, returnAssignment } = usePropertyManagement(companyId);

  const { data: employees = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, email").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const availableItems = items.filter(i => i.status === "available");
  const filteredAssignments = assignments.filter((a) => statusFilter === "all" || a.status === statusFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAssignment.mutateAsync({
      property_id: formData.property_id, employee_id: formData.employee_id, assigned_by: user?.id,
      assigned_date: formData.assigned_date, expected_return_date: formData.expected_return_date || null,
      condition_at_assignment: formData.condition_at_assignment, notes: formData.notes || null, status: "active",
    });
    setIsDialogOpen(false);
    setFormData({ property_id: "", employee_id: "", assigned_date: getTodayString(), expected_return_date: "", condition_at_assignment: "good", notes: "" });
  };

  const handleReturn = async () => {
    if (!selectedAssignment) return;
    await returnAssignment.mutateAsync({ id: selectedAssignment, condition_at_return: returnCondition, notes: returnNotes || undefined });
    setIsReturnDialogOpen(false);
    setSelectedAssignment(null);
    setReturnCondition("good");
    setReturnNotes("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "returned": return "bg-muted text-muted-foreground";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "";
    }
  };

  if (loadingAssignments) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{t("companyProperty.assignments.title")}</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("common.allStatus")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allStatus")}</SelectItem>
                <SelectItem value="active">{t("common.active")}</SelectItem>
                <SelectItem value="returned">{t("companyProperty.assignments.returned")}</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2" disabled={availableItems.length === 0}><Plus className="h-4 w-4" />{t("companyProperty.assignments.assignAsset")}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("companyProperty.assignments.assignAssetTitle")}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label>{t("companyProperty.assignments.asset")} *</Label>
                    <Select value={formData.property_id} onValueChange={(v) => setFormData({ ...formData, property_id: v })} required>
                      <SelectTrigger><SelectValue placeholder={t("companyProperty.assignments.selectAsset")} /></SelectTrigger>
                      <SelectContent>{availableItems.map((item) => <SelectItem key={item.id} value={item.id}>{item.asset_tag} - {item.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t("common.employee")} *</Label>
                    <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })} required>
                      <SelectTrigger><SelectValue placeholder={t("common.selectEmployee")} /></SelectTrigger>
                      <SelectContent>{employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.full_name || emp.email}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t("companyProperty.assignments.assignedDate")} *</Label><Input type="date" value={formData.assigned_date} onChange={(e) => setFormData({ ...formData, assigned_date: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>{t("companyProperty.assignments.expectedReturnDate")}</Label><Input type="date" value={formData.expected_return_date} onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>{t("companyProperty.assignments.conditionAtAssignment")}</Label>
                    <Select value={formData.condition_at_assignment} onValueChange={(v) => setFormData({ ...formData, condition_at_assignment: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{t(`companyProperty.assets.conditions.${c}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t("common.notes")}</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.cancel")}</Button>
                    <Button type="submit" disabled={createAssignment.isPending}>{createAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("companyProperty.assignments.assign")}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>{t("companyProperty.assignments.noAssignments")}</p><p className="text-sm">{t("companyProperty.assignments.noAssignmentsHint")}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>{t("companyProperty.assignments.asset")}</TableHead><TableHead>{t("common.employee")}</TableHead><TableHead>{t("companyProperty.assignments.assignedDate")}</TableHead><TableHead>{t("companyProperty.assignments.expectedReturn")}</TableHead><TableHead>{t("companyProperty.assets.condition")}</TableHead><TableHead>{t("common.status")}</TableHead><TableHead>{t("common.actions")}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell><div><p className="font-medium">{assignment.property?.name}</p><p className="text-xs text-muted-foreground font-mono">{assignment.property?.asset_tag}</p></div></TableCell>
                      <TableCell><div><p className="font-medium">{assignment.employee?.full_name}</p><p className="text-xs text-muted-foreground">{assignment.employee?.email}</p></div></TableCell>
                      <TableCell>{format(new Date(assignment.assigned_date), "PP")}</TableCell>
                      <TableCell>{assignment.expected_return_date ? format(new Date(assignment.expected_return_date), "PP") : "-"}</TableCell>
                      <TableCell>{assignment.condition_at_assignment || "-"}</TableCell>
                      <TableCell><Badge variant="outline" className={getStatusColor(assignment.status)}>{assignment.status}</Badge></TableCell>
                      <TableCell>
                        {assignment.status === "active" && (<Button variant="outline" size="sm" className="gap-1" onClick={() => { setSelectedAssignment(assignment.id); setIsReturnDialogOpen(true); }}><RotateCcw className="h-3 w-3" />{t("companyProperty.assignments.return")}</Button>)}
                        {assignment.status === "returned" && assignment.actual_return_date && (<span className="text-xs text-muted-foreground">{t("companyProperty.assignments.returned")} {format(new Date(assignment.actual_return_date), "PP")}</span>)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("companyProperty.assignments.returnProperty")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{t("companyProperty.assignments.conditionAtReturn")} *</Label>
              <Select value={returnCondition} onValueChange={setReturnCondition}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{t(`companyProperty.assets.conditions.${c}`)}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>{t("common.notes")}</Label><Textarea value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} placeholder={t("companyProperty.assignments.returnNotes")} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleReturn} disabled={returnAssignment.isPending}>{returnAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("companyProperty.assignments.confirmReturn")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyAssignmentsTab;
