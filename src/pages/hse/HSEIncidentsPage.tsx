import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePageAudit } from "@/hooks/usePageAudit";
import { useHSE, HSEIncident } from "@/hooks/useHSE";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import {
  AlertTriangle,
  Plus,
  Search,
  FileText,
  ChevronLeft,
  Calendar,
  Users,
  Activity,
} from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { NavLink } from "react-router-dom";

const incidentTypes = [
  { value: "injury", label: "Injury" },
  { value: "near_miss", label: "Near Miss" },
  { value: "property_damage", label: "Property Damage" },
  { value: "environmental", label: "Environmental" },
  { value: "fire", label: "Fire" },
  { value: "chemical", label: "Chemical" },
];

const severityLevels = [
  { value: "low", label: "Low", color: "bg-success/10 text-success" },
  { value: "medium", label: "Medium", color: "bg-warning/10 text-warning" },
  { value: "high", label: "High", color: "bg-orange-500/10 text-orange-500" },
  { value: "critical", label: "Critical", color: "bg-destructive/10 text-destructive" },
];

const statusOptions = [
  { value: "reported", label: "Reported", color: "bg-info/10 text-info" },
  { value: "investigating", label: "Investigating", color: "bg-warning/10 text-warning" },
  { value: "resolved", label: "Resolved", color: "bg-success/10 text-success" },
  { value: "closed", label: "Closed", color: "bg-muted text-muted-foreground" },
];

const treatmentOptions = [
  { value: "none", label: "None Required" },
  { value: "first_aid", label: "First Aid" },
  { value: "medical_attention", label: "Medical Attention" },
  { value: "hospitalization", label: "Hospitalization" },
];

export default function HSEIncidentsPage() {
  usePageAudit('hse_incidents', 'HSE');
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<HSEIncident | null>(null);
  const [formData, setFormData] = useState<Partial<HSEIncident>>({});

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
      return data || [];
    },
  });

  const { incidents, incidentsLoading, createIncident, updateIncident } = useHSE(companyId || undefined);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incident_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    const matchesType = typeFilter === "all" || incident.incident_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenDialog = (incident?: HSEIncident) => {
    if (incident) {
      setSelectedIncident(incident);
      setFormData(incident);
    } else {
      setSelectedIncident(null);
      setFormData({
        company_id: companyId,
        incident_type: "near_miss",
        severity: "low",
        status: "reported",
        incident_date: getTodayString(),
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIncident) {
      await updateIncident.mutateAsync({ id: selectedIncident.id, ...formData });
    } else {
      await createIncident.mutateAsync(formData);
    }
    setDialogOpen(false);
  };

  const getSeverityBadge = (severity: string) => {
    const level = severityLevels.find((s) => s.value === severity);
    return <Badge className={level?.color}>{level?.label || severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return <Badge className={option?.color}>{option?.label || status}</Badge>;
  };

  // Stats
  const openIncidents = incidents.filter((i) => i.status !== "closed").length;
  const criticalIncidents = incidents.filter((i) => i.severity === "critical" && i.status !== "closed").length;
  const thisMonthIncidents = incidents.filter(
    (i) => new Date(i.incident_date).getMonth() === new Date().getMonth()
  ).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <NavLink to="/hse" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </NavLink>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("hseModule.incidents.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.incidents.subtitle")}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.openIncidents")}</p>
                  <p className="text-2xl font-bold">{openIncidents}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.critical")}</p>
                  <p className="text-2xl font-bold text-destructive">{criticalIncidents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.thisMonth")}</p>
                  <p className="text-2xl font-bold">{thisMonthIncidents}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.totalIncidents")}</p>
                  <p className="text-2xl font-bold">{incidents.length}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("hseModule.common.selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("hseModule.incidents.searchIncidents")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("common.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("hseModule.common.allStatus")}</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("common.type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("hseModule.common.allTypes")}</SelectItem>
                  {incidentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => handleOpenDialog()} disabled={!companyId}>
                <Plus className="mr-2 h-4 w-4" />
                {t("hseModule.incidents.reportIncident")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.incidents.incidentNumber")}</TableHead>
                  <TableHead>{t("hseModule.common.title")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("hseModule.incidents.severity")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("hseModule.common.location")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("hseModule.incidents.reportedBy")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {t("hseModule.common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t("hseModule.incidents.noIncidents")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOpenDialog(incident)}
                    >
                      <TableCell className="font-mono text-sm">
                        {incident.incident_number}
                      </TableCell>
                      <TableCell className="font-medium">{incident.title}</TableCell>
                      <TableCell>
                        {incidentTypes.find((t) => t.value === incident.incident_type)?.label}
                      </TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{formatDateForDisplay(incident.incident_date, "MMM d, yyyy")}</TableCell>
                      <TableCell>{incident.location || "-"}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>{incident.reporter?.full_name || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedIncident ? t("hseModule.incidents.editIncident") : t("hseModule.incidents.newIncident")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Incident Type *</Label>
                  <Select
                    value={formData.incident_type}
                    onValueChange={(v) => setFormData({ ...formData, incident_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Incident Date *</Label>
                  <Input
                    type="date"
                    value={formData.incident_date || ""}
                    onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Incident Time</Label>
                  <Input
                    type="time"
                    value={formData.incident_time || ""}
                    onChange={(e) => setFormData({ ...formData, incident_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Severity *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v) => setFormData({ ...formData, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {formData.incident_type === "injury" && (
                  <>
                    <div className="space-y-2">
                      <Label>Injury Type</Label>
                      <Input
                        value={formData.injury_type || ""}
                        onChange={(e) => setFormData({ ...formData, injury_type: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Body Part Affected</Label>
                      <Input
                        value={formData.body_part_affected || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, body_part_affected: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Treatment Required</Label>
                      <Select
                        value={formData.treatment_required || ""}
                        onValueChange={(v) => setFormData({ ...formData, treatment_required: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select treatment" />
                        </SelectTrigger>
                        <SelectContent>
                          {treatmentOptions.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Days Lost</Label>
                      <Input
                        type="number"
                        value={formData.days_lost || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, days_lost: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </>
                )}

                {selectedIncident && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Root Cause</Label>
                      <Textarea
                        value={formData.root_cause || ""}
                        onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Corrective Actions</Label>
                      <Textarea
                        value={formData.corrective_actions || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, corrective_actions: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Preventive Measures</Label>
                      <Textarea
                        value={formData.preventive_measures || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, preventive_measures: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createIncident.isPending || updateIncident.isPending}>
                  {selectedIncident ? "Update" : "Report"} Incident
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
