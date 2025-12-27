import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString } from "@/utils/dateUtils";
import { Clock, Plus, Edit, Trash2, Sun, Moon } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  start_time: string;
  end_time: string;
  crosses_midnight: boolean;
  break_duration_minutes: number;
  minimum_hours: number;
  is_overnight: boolean;
  color: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

export default function ShiftsPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    start_time: "09:00",
    end_time: "17:00",
    crosses_midnight: false,
    break_duration_minutes: 60,
    minimum_hours: 8,
    is_overnight: false,
    color: "#3b82f6",
    is_active: true,
    start_date: getTodayString(),
    end_date: ""
  });

  const breadcrumbItems = [
    { label: t("timeAttendance.title"), href: "/time-attendance" },
    { label: t("timeAttendance.modules.shifts.title"), href: "/time-attendance/shifts" },
    { label: t("timeAttendance.shifts.shiftsTab") }
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadShifts();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (error) {
      console.error("Failed to load shifts:", error);
      return;
    }
    setShifts(data || []);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast.error(t("common.fillRequired"));
      return;
    }

    const payload = {
      company_id: selectedCompany,
      name: form.name,
      code: form.code,
      description: form.description || null,
      start_time: form.start_time,
      end_time: form.end_time,
      crosses_midnight: form.crosses_midnight,
      break_duration_minutes: form.break_duration_minutes,
      minimum_hours: form.minimum_hours,
      is_overnight: form.is_overnight,
      color: form.color,
      is_active: form.is_active,
      start_date: form.start_date,
      end_date: form.end_date || null
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('shifts').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('shifts').insert(payload));
    }

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(editing ? t("timeAttendance.shifts.shiftUpdated") : t("timeAttendance.shifts.shiftCreated"));
    setDialogOpen(false);
    resetForm();
    loadShifts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.shiftDeleted"));
    loadShifts();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      code: "",
      description: "",
      start_time: "09:00",
      end_time: "17:00",
      crosses_midnight: false,
      break_duration_minutes: 60,
      minimum_hours: 8,
      is_overnight: false,
      color: "#3b82f6",
      is_active: true,
      start_date: getTodayString(),
      end_date: ""
    });
  };

  const openEdit = (shift: Shift) => {
    setEditing(shift);
    setForm({
      name: shift.name,
      code: shift.code,
      description: shift.description || "",
      start_time: shift.start_time,
      end_time: shift.end_time,
      crosses_midnight: shift.crosses_midnight,
      break_duration_minutes: shift.break_duration_minutes,
      minimum_hours: shift.minimum_hours,
      is_overnight: shift.is_overnight,
      color: shift.color,
      is_active: shift.is_active,
      start_date: shift.start_date,
      end_date: shift.end_date || ""
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("timeAttendance.shifts.shiftsTab")}</h1>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>{t("timeAttendance.shifts.shiftsTab")}</CardTitle>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("timeAttendance.shifts.createShift")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editing ? t("common.edit") : t("timeAttendance.shifts.createShift")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("common.name")} *</Label>
                      <Input 
                        value={form.name} 
                        onChange={(e) => setForm({...form, name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.code")} *</Label>
                      <Input 
                        value={form.code} 
                        onChange={(e) => setForm({...form, code: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.description")}</Label>
                    <Textarea 
                      value={form.description} 
                      onChange={(e) => setForm({...form, description: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.startTime")}</Label>
                      <Input 
                        type="time"
                        value={form.start_time} 
                        onChange={(e) => setForm({...form, start_time: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.endTime")}</Label>
                      <Input 
                        type="time"
                        value={form.end_time} 
                        onChange={(e) => setForm({...form, end_time: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.breakDuration")}</Label>
                      <Input 
                        type="number"
                        value={form.break_duration_minutes} 
                        onChange={(e) => setForm({...form, break_duration_minutes: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.minimumHours")}</Label>
                      <Input 
                        type="number"
                        value={form.minimum_hours} 
                        onChange={(e) => setForm({...form, minimum_hours: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("common.startDate")}</Label>
                      <Input 
                        type="date"
                        value={form.start_date} 
                        onChange={(e) => setForm({...form, start_date: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.endDate")}</Label>
                      <Input 
                        type="date"
                        value={form.end_date} 
                        onChange={(e) => setForm({...form, end_date: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.shifts.color")}</Label>
                    <Input 
                      type="color"
                      value={form.color} 
                      onChange={(e) => setForm({...form, color: e.target.value})} 
                      className="h-10"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label>{t("timeAttendance.shifts.crossesMidnight")}</Label>
                      <Switch 
                        checked={form.crosses_midnight} 
                        onCheckedChange={(v) => setForm({...form, crosses_midnight: v})} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("common.active")}</Label>
                      <Switch 
                        checked={form.is_active} 
                        onCheckedChange={(v) => setForm({...form, is_active: v})} 
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full">{t("common.save")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.code")}</TableHead>
                  <TableHead>{t("common.time")}</TableHead>
                  <TableHead>{t("timeAttendance.schedules.break")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t("timeAttendance.shifts.noShifts")}
                    </TableCell>
                  </TableRow>
                ) : shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: shift.color }}
                        />
                        <span className="font-medium">{shift.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{shift.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {shift.is_overnight ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                        {shift.start_time} - {shift.end_time}
                      </div>
                    </TableCell>
                    <TableCell>{shift.break_duration_minutes} min</TableCell>
                    <TableCell>
                      <Badge className={shift.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                        {shift.is_active ? t("common.active") : t("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(shift)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(shift.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
