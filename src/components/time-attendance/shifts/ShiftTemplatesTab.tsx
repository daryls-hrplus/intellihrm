import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useShiftTemplates } from "@/hooks/useShiftTemplates";
import { LayoutTemplate, Plus, Trash2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShiftTemplatesTabProps {
  companyId: string;
}

export function ShiftTemplatesTab({ companyId }: ShiftTemplatesTabProps) {
  const { t } = useTranslation();
  const { templates, isLoading, createTemplate, addTemplateEntry, removeTemplateEntry, deleteTemplate, toggleTemplateActive } = useShiftTemplates(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [shifts, setShifts] = useState<{ id: string; name: string; code: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_type: "weekly",
    department_id: "",
  });

  const [entryData, setEntryData] = useState({
    shift_id: "",
    day_offset: 0,
    employee_count: 1,
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [shiftRes, deptRes] = await Promise.all([
        supabase.from("shifts").select("id, name, code").eq("company_id", companyId).eq("is_active", true),
        supabase.from("departments").select("id, name").eq("company_id", companyId),
      ]);
      setShifts(shiftRes.data || []);
      setDepartments(deptRes.data || []);
    };
    loadData();
  }, [companyId]);

  const handleCreateTemplate = async () => {
    await createTemplate({
      name: formData.name,
      description: formData.description || undefined,
      template_type: formData.template_type,
      department_id: formData.department_id || undefined,
    });
    setDialogOpen(false);
    setFormData({ name: "", description: "", template_type: "weekly", department_id: "" });
  };

  const handleAddEntry = async () => {
    if (!selectedTemplate) return;
    await addTemplateEntry({
      template_id: selectedTemplate,
      shift_id: entryData.shift_id,
      day_offset: entryData.day_offset,
      employee_count: entryData.employee_count,
      notes: entryData.notes || undefined,
    });
    setEntryDialogOpen(false);
    setEntryData({ shift_id: "", day_offset: 0, employee_count: 1, notes: "" });
  };

  const getDayLabel = (offset: number, type: string) => {
    if (type === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[offset % 7];
    }
    return `Day ${offset + 1}`;
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            {t("timeAttendance.shifts.templates.title")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.templates.weeklyTemplate")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("timeAttendance.shifts.templates.createTemplate")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("timeAttendance.shifts.templates.createTemplate")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("timeAttendance.shifts.templates.templateName")}</Label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder={t("timeAttendance.shifts.templates.templateNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.description")}</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.templates.templateType")}</Label>
                  <Select value={formData.template_type} onValueChange={v => setFormData(p => ({ ...p, template_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t("timeAttendance.shifts.templates.daily")}</SelectItem>
                      <SelectItem value="weekly">{t("timeAttendance.shifts.templates.weekly")}</SelectItem>
                      <SelectItem value="biweekly">{t("timeAttendance.shifts.templates.biweekly")}</SelectItem>
                      <SelectItem value="monthly">{t("timeAttendance.shifts.templates.monthly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("common.department")}</Label>
                  <Select value={formData.department_id || "_all"} onValueChange={v => setFormData(p => ({ ...p, department_id: v === "_all" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder={t("timeAttendance.shifts.templates.allDepartments")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">{t("timeAttendance.shifts.templates.allDepartments")}</SelectItem>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleCreateTemplate} disabled={!formData.name}>{t("common.create")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("timeAttendance.shifts.templates.templatesList")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">{t("common.loading")}</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">{t("timeAttendance.shifts.templates.noTemplates")}</div>
            ) : (
              <div className="space-y-2">
                {templates.map(template => (
                  <div 
                    key={template.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTemplate === template.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.template_type} • {template.entries?.length || 0} {t("timeAttendance.shifts.templates.shifts")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? t("timeAttendance.shifts.templates.active") : t("timeAttendance.shifts.templates.inactive")}
                        </Badge>
                        <Switch 
                          checked={template.is_active} 
                          onCheckedChange={(checked) => toggleTemplateActive(template.id, checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {currentTemplate ? currentTemplate.name : t("timeAttendance.shifts.templates.selectTemplate")}
            </CardTitle>
            {currentTemplate && (
              <div className="flex gap-2">
                <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      {t("timeAttendance.shifts.templates.addShift")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("timeAttendance.shifts.templates.addShiftToTemplate")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.templates.shift")}</Label>
                        <Select value={entryData.shift_id} onValueChange={v => setEntryData(p => ({ ...p, shift_id: v }))}>
                          <SelectTrigger><SelectValue placeholder={t("timeAttendance.shifts.templates.selectShift")} /></SelectTrigger>
                          <SelectContent>
                            {shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("timeAttendance.shifts.templates.dayOffset")}</Label>
                          <Input type="number" min={0} value={entryData.day_offset} onChange={e => setEntryData(p => ({ ...p, day_offset: parseInt(e.target.value) || 0 }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("timeAttendance.shifts.templates.headcount")}</Label>
                          <Input type="number" min={1} value={entryData.employee_count} onChange={e => setEntryData(p => ({ ...p, employee_count: parseInt(e.target.value) || 1 }))} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEntryDialogOpen(false)}>{t("common.cancel")}</Button>
                        <Button onClick={handleAddEntry} disabled={!entryData.shift_id}>{t("common.add")}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="ghost" onClick={() => currentTemplate && deleteTemplate(currentTemplate.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!currentTemplate ? (
              <div className="text-center py-8 text-muted-foreground">{t("timeAttendance.shifts.templates.selectTemplateDetails")}</div>
            ) : currentTemplate.entries?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t("timeAttendance.shifts.templates.noShiftsInTemplate")}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("timeAttendance.shifts.templates.day")}</TableHead>
                    <TableHead>{t("timeAttendance.shifts.templates.shift")}</TableHead>
                    <TableHead>{t("timeAttendance.shifts.templates.time")}</TableHead>
                    <TableHead>{t("timeAttendance.shifts.templates.staff")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTemplate.entries?.sort((a, b) => a.day_offset - b.day_offset).map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {getDayLabel(entry.day_offset, currentTemplate.template_type)}
                      </TableCell>
                      <TableCell>{entry.shift?.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.shift?.start_time} - {entry.shift?.end_time}
                      </TableCell>
                      <TableCell>{entry.employee_count}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => removeTemplateEntry(entry.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
