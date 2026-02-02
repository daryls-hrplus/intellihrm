import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Edit, Trash2, Loader2, Shield, ChevronDown } from "lucide-react";

interface AttendancePolicy {
  id: string;
  name: string;
  code: string;
  description: string | null;
  grace_period_minutes: number;
  late_threshold_minutes: number;
  early_departure_threshold_minutes: number;
  auto_deduct_late: boolean;
  late_deduction_minutes: number;
  round_clock_in: string;
  round_clock_out: string;
  require_photo_clock_in: boolean;
  require_photo_clock_out: boolean;
  require_geolocation: boolean;
  max_daily_hours: number;
  min_break_duration_minutes: number;
  auto_clock_out_hours: number | null;
  is_default: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  name_en: string | null;
  description_en: string | null;
}

export default function AttendancePoliciesPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null);
  const [i18nOpen, setI18nOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    grace_period_minutes: 0,
    late_threshold_minutes: 15,
    early_departure_threshold_minutes: 15,
    auto_deduct_late: false,
    late_deduction_minutes: 0,
    round_clock_in: "none",
    round_clock_out: "none",
    require_photo_clock_in: false,
    require_photo_clock_out: false,
    require_geolocation: false,
    max_daily_hours: 24,
    min_break_duration_minutes: 0,
    auto_clock_out_hours: null as number | null,
    is_default: false,
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: null as string | null,
    name_en: "",
    description_en: "",
  });

  const roundingOptions = [
    { value: "none", label: t("timeAttendance.policies.noRounding") },
    { value: "nearest_5", label: t("timeAttendance.policies.nearest5") },
    { value: "nearest_6", label: t("timeAttendance.policies.nearest6") },
    { value: "nearest_10", label: t("timeAttendance.policies.nearest10") },
    { value: "nearest_15", label: t("timeAttendance.policies.nearest15") },
    { value: "nearest_30", label: t("timeAttendance.policies.nearest30") },
    { value: "up", label: t("timeAttendance.policies.roundUp") },
    { value: "down", label: t("timeAttendance.policies.roundDown") },
  ];

  useEffect(() => {
    if (profile?.company_id) loadPolicies();
  }, [profile?.company_id]);

  const loadPolicies = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("attendance_policies")
      .select("*")
      .eq("company_id", profile?.company_id)
      .order("name");
    if (data) setPolicies(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!profile?.company_id) return;
    try {
      const payload = { 
        ...formData, 
        company_id: profile.company_id,
        auto_clock_out_hours: formData.auto_clock_out_hours || null,
        end_date: formData.end_date || null,
        name_en: formData.name_en || null,
        description_en: formData.description_en || null,
      };
      if (editingPolicy) {
        await supabase.from("attendance_policies").update(payload).eq("id", editingPolicy.id);
        toast({ title: t("timeAttendance.policies.policyUpdated") });
      } else {
        await supabase.from("attendance_policies").insert(payload);
        toast({ title: t("timeAttendance.policies.policyCreated") });
      }
      setDialogOpen(false);
      resetForm();
      loadPolicies();
    } catch (error) {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("attendance_policies").delete().eq("id", id);
    toast({ title: t("timeAttendance.policies.policyDeleted") });
    loadPolicies();
  };

  const openEdit = (policy: AttendancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      code: policy.code,
      description: policy.description || "",
      grace_period_minutes: policy.grace_period_minutes,
      late_threshold_minutes: policy.late_threshold_minutes,
      early_departure_threshold_minutes: policy.early_departure_threshold_minutes,
      auto_deduct_late: policy.auto_deduct_late,
      late_deduction_minutes: policy.late_deduction_minutes,
      round_clock_in: policy.round_clock_in,
      round_clock_out: policy.round_clock_out,
      require_photo_clock_in: policy.require_photo_clock_in,
      require_photo_clock_out: policy.require_photo_clock_out,
      require_geolocation: policy.require_geolocation,
      max_daily_hours: policy.max_daily_hours,
      min_break_duration_minutes: policy.min_break_duration_minutes || 0,
      auto_clock_out_hours: policy.auto_clock_out_hours,
      is_default: policy.is_default,
      is_active: policy.is_active,
      start_date: policy.start_date,
      end_date: policy.end_date,
      name_en: policy.name_en || "",
      description_en: policy.description_en || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPolicy(null);
    setI18nOpen(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      grace_period_minutes: 0,
      late_threshold_minutes: 15,
      early_departure_threshold_minutes: 15,
      auto_deduct_late: false,
      late_deduction_minutes: 0,
      round_clock_in: "none",
      round_clock_out: "none",
      require_photo_clock_in: false,
      require_photo_clock_out: false,
      require_geolocation: false,
      max_daily_hours: 24,
      min_break_duration_minutes: 0,
      auto_clock_out_hours: null,
      is_default: false,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      name_en: "",
      description_en: "",
    });
  };

  if (isLoading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("timeAttendance.title"), href: "/time-attendance" }, { label: t("timeAttendance.policies.title") }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold">{t("timeAttendance.policies.title")}</h1>
              <p className="text-muted-foreground">{t("timeAttendance.policies.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />{t("timeAttendance.policies.addPolicy")}</Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("timeAttendance.policies.gracePeriod")}</TableHead>
                <TableHead>{t("timeAttendance.policies.lateThreshold")}</TableHead>
                <TableHead>{t("timeAttendance.policies.rounding")}</TableHead>
                <TableHead>{t("timeAttendance.policies.requirements")}</TableHead>
                <TableHead>{t("timeAttendance.policies.default")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">{t("timeAttendance.policies.noPolicies")}</TableCell></TableRow>
              ) : policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div className="font-medium">{policy.name}</div>
                    <div className="text-sm text-muted-foreground">{policy.code}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={policy.is_active ? "default" : "secondary"}>
                      {policy.is_active ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>{policy.grace_period_minutes} min</TableCell>
                  <TableCell>{policy.late_threshold_minutes} min</TableCell>
                  <TableCell>
                    <div className="text-sm">In: {roundingOptions.find(r => r.value === policy.round_clock_in)?.label}</div>
                    <div className="text-sm">Out: {roundingOptions.find(r => r.value === policy.round_clock_out)?.label}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {policy.require_photo_clock_in && <Badge variant="outline">{t("timeAttendance.policies.photoIn")}</Badge>}
                      {policy.require_photo_clock_out && <Badge variant="outline">{t("timeAttendance.policies.photoOut")}</Badge>}
                      {policy.require_geolocation && <Badge variant="outline">{t("timeAttendance.policies.gps")}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{policy.is_default && <Badge>{t("timeAttendance.policies.default")}</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(policy)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(policy.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader><DialogTitle>{editingPolicy ? t("timeAttendance.policies.editPolicy") : t("timeAttendance.policies.addPolicy")}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {/* Identity Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("common.name")} *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("common.code")} *</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t("common.description")}</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            
            {/* Time Thresholds Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{t("timeAttendance.policies.timeThresholds")}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>{t("timeAttendance.policies.gracePeriod")} (min)</Label><Input type="number" value={formData.grace_period_minutes} onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>{t("timeAttendance.policies.lateThreshold")} (min)</Label><Input type="number" value={formData.late_threshold_minutes} onChange={(e) => setFormData({ ...formData, late_threshold_minutes: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>{t("timeAttendance.policies.earlyDeparture")} (min)</Label><Input type="number" value={formData.early_departure_threshold_minutes} onChange={(e) => setFormData({ ...formData, early_departure_threshold_minutes: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>

            {/* Punch Rounding Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{t("timeAttendance.policies.roundingRules")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.policies.clockInRounding")}</Label>
                  <Select value={formData.round_clock_in} onValueChange={(v) => setFormData({ ...formData, round_clock_in: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roundingOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("timeAttendance.policies.clockOutRounding")}</Label>
                  <Select value={formData.round_clock_out} onValueChange={(v) => setFormData({ ...formData, round_clock_out: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roundingOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Time Collection Requirements Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{t("timeAttendance.policies.requirementsOptions")}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>{t("timeAttendance.policies.requirePhotoIn")}</Label><Switch checked={formData.require_photo_clock_in} onCheckedChange={(v) => setFormData({ ...formData, require_photo_clock_in: v })} /></div>
                <div className="flex items-center justify-between"><Label>{t("timeAttendance.policies.requirePhotoOut")}</Label><Switch checked={formData.require_photo_clock_out} onCheckedChange={(v) => setFormData({ ...formData, require_photo_clock_out: v })} /></div>
                <div className="flex items-center justify-between"><Label>{t("timeAttendance.policies.requireGeolocation")}</Label><Switch checked={formData.require_geolocation} onCheckedChange={(v) => setFormData({ ...formData, require_geolocation: v })} /></div>
              </div>
            </div>

            {/* Late Deduction Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{t("timeAttendance.policies.lateDeduction")}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>{t("timeAttendance.policies.autoDeductLate")}</Label><Switch checked={formData.auto_deduct_late} onCheckedChange={(v) => setFormData({ ...formData, auto_deduct_late: v })} /></div>
                {formData.auto_deduct_late && (
                  <div className="space-y-2 ml-6">
                    <Label>{t("timeAttendance.policies.lateDeductionMinutes")}</Label>
                    <Input type="number" value={formData.late_deduction_minutes} onChange={(e) => setFormData({ ...formData, late_deduction_minutes: parseInt(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
            </div>

            {/* Operational Limits Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{t("timeAttendance.policies.operationalLimits")}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.policies.maxDailyHours")}</Label>
                  <Input type="number" value={formData.max_daily_hours} onChange={(e) => setFormData({ ...formData, max_daily_hours: parseFloat(e.target.value) || 24 })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("timeAttendance.policies.minBreakDuration")} (min)</Label>
                  <Input type="number" value={formData.min_break_duration_minutes} onChange={(e) => setFormData({ ...formData, min_break_duration_minutes: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("timeAttendance.policies.autoClockOut")} (hrs)</Label>
                  <Input type="number" placeholder={t("common.optional")} value={formData.auto_clock_out_hours || ""} onChange={(e) => setFormData({ ...formData, auto_clock_out_hours: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
              </div>
            </div>

            {/* Policy Lifecycle Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{t("timeAttendance.policies.policyLifecycle")}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>{t("common.active")}</Label><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.policies.startDate")} *</Label>
                    <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.policies.endDate")}</Label>
                    <Input type="date" value={formData.end_date || ""} onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })} />
                  </div>
                </div>
                <div className="flex items-center justify-between"><Label>{t("timeAttendance.policies.setAsDefault")}</Label><Switch checked={formData.is_default} onCheckedChange={(v) => setFormData({ ...formData, is_default: v })} /></div>
              </div>
            </div>

            {/* Internationalization Section (Collapsible) */}
            <Collapsible open={i18nOpen} onOpenChange={setI18nOpen} className="border-t pt-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h4 className="font-medium">{t("timeAttendance.policies.internationalization")}</h4>
                <ChevronDown className={`h-4 w-4 transition-transform ${i18nOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.policies.englishName")}</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("timeAttendance.policies.englishDescription")}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.code || !formData.start_date}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
