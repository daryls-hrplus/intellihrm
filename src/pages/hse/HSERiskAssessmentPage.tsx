import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHSE, HSERiskAssessment, HSEHazard } from "@/hooks/useHSE";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Plus,
  Search,
  ChevronLeft,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { NavLink } from "react-router-dom";

const riskLevels = [
  { value: "low", label: "Low", color: "bg-success/10 text-success" },
  { value: "medium", label: "Medium", color: "bg-warning/10 text-warning" },
  { value: "high", label: "High", color: "bg-orange-500/10 text-orange-500" },
  { value: "critical", label: "Critical", color: "bg-destructive/10 text-destructive" },
];

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-muted text-muted-foreground" },
  { value: "pending_review", label: "Pending Review", color: "bg-warning/10 text-warning" },
  { value: "approved", label: "Approved", color: "bg-success/10 text-success" },
  { value: "requires_update", label: "Requires Update", color: "bg-orange-500/10 text-orange-500" },
  { value: "archived", label: "Archived", color: "bg-muted text-muted-foreground" },
];

const hazardTypes = [
  { value: "physical", label: "Physical" },
  { value: "chemical", label: "Chemical" },
  { value: "biological", label: "Biological" },
  { value: "ergonomic", label: "Ergonomic" },
  { value: "psychosocial", label: "Psychosocial" },
  { value: "environmental", label: "Environmental" },
];

export default function HSERiskAssessmentPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hazardDialogOpen, setHazardDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<HSERiskAssessment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HSERiskAssessment>>({});
  const [hazardFormData, setHazardFormData] = useState<Partial<HSEHazard>>({});

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
      return data || [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!companyId,
  });

  const {
    riskAssessments,
    assessmentsLoading,
    createRiskAssessment,
    updateRiskAssessment,
    useHazards,
    createHazard,
  } = useHSE(companyId || undefined);

  const { data: hazards = [] } = useHazards(expandedId || undefined);

  const filteredAssessments = riskAssessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.assessment_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (assessment?: HSERiskAssessment) => {
    if (assessment) {
      setSelectedAssessment(assessment);
      setFormData(assessment);
    } else {
      setSelectedAssessment(null);
      setFormData({
        company_id: companyId,
        status: "draft",
        assessment_date: format(new Date(), "yyyy-MM-dd"),
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssessment) {
      await updateRiskAssessment.mutateAsync({ id: selectedAssessment.id, ...formData });
    } else {
      await createRiskAssessment.mutateAsync(formData);
    }
    setDialogOpen(false);
  };

  const handleAddHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expandedId) {
      await createHazard.mutateAsync({ ...hazardFormData, assessment_id: expandedId });
      setHazardDialogOpen(false);
      setHazardFormData({});
    }
  };

  const getRiskBadge = (level: string | null) => {
    if (!level) return null;
    const risk = riskLevels.find((r) => r.value === level);
    return <Badge className={risk?.color}>{risk?.label || level}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return <Badge className={option?.color}>{option?.label || status}</Badge>;
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 5) return "text-success";
    if (score <= 10) return "text-warning";
    if (score <= 15) return "text-orange-500";
    return "text-destructive";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <NavLink to="/hse" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </NavLink>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Risk Assessment</h1>
            <p className="text-muted-foreground">Workplace hazard evaluation</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
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
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => handleOpenDialog()} disabled={!companyId}>
                <Plus className="mr-2 h-4 w-4" />
                New Assessment
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
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Assessment #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No risk assessments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <>
                      <TableRow key={assessment.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setExpandedId(expandedId === assessment.id ? null : assessment.id)
                            }
                          >
                            {expandedId === assessment.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell
                          className="font-mono text-sm"
                          onClick={() => handleOpenDialog(assessment)}
                        >
                          {assessment.assessment_number}
                        </TableCell>
                        <TableCell
                          className="font-medium"
                          onClick={() => handleOpenDialog(assessment)}
                        >
                          {assessment.title}
                        </TableCell>
                        <TableCell onClick={() => handleOpenDialog(assessment)}>
                          {assessment.department?.name || "-"}
                        </TableCell>
                        <TableCell onClick={() => handleOpenDialog(assessment)}>
                          {getRiskBadge(assessment.overall_risk_level)}
                        </TableCell>
                        <TableCell onClick={() => handleOpenDialog(assessment)}>
                          {format(new Date(assessment.assessment_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell onClick={() => handleOpenDialog(assessment)}>
                          {assessment.review_date
                            ? format(new Date(assessment.review_date), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell onClick={() => handleOpenDialog(assessment)}>
                          {getStatusBadge(assessment.status)}
                        </TableCell>
                      </TableRow>
                      {expandedId === assessment.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/30 p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Identified Hazards
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setHazardFormData({ likelihood: 1, severity: 1 });
                                    setHazardDialogOpen(true);
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Hazard
                                </Button>
                              </div>
                              {hazards.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No hazards identified yet
                                </p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead>L</TableHead>
                                      <TableHead>S</TableHead>
                                      <TableHead>Risk Score</TableHead>
                                      <TableHead>Controls</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {hazards.map((hazard) => (
                                      <TableRow key={hazard.id}>
                                        <TableCell>
                                          {hazardTypes.find((t) => t.value === hazard.hazard_type)
                                            ?.label || hazard.hazard_type}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                          {hazard.description}
                                        </TableCell>
                                        <TableCell>{hazard.likelihood}</TableCell>
                                        <TableCell>{hazard.severity}</TableCell>
                                        <TableCell>
                                          <span
                                            className={`font-bold ${getRiskScoreColor(
                                              hazard.risk_score
                                            )}`}
                                          >
                                            {hazard.risk_score}
                                          </span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                          {hazard.existing_controls || "-"}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{hazard.status}</Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assessment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAssessment ? "Edit Risk Assessment" : "New Risk Assessment"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.department_id || ""}
                    onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assessment Date *</Label>
                  <Input
                    type="date"
                    value={formData.assessment_date || ""}
                    onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review Date</Label>
                  <Input
                    type="date"
                    value={formData.review_date || ""}
                    onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overall Risk Level</Label>
                  <Select
                    value={formData.overall_risk_level || ""}
                    onValueChange={(v) => setFormData({ ...formData, overall_risk_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
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
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Scope</Label>
                  <Textarea
                    value={formData.scope || ""}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Recommendations</Label>
                  <Textarea
                    value={formData.recommendations || ""}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRiskAssessment.isPending || updateRiskAssessment.isPending}
                >
                  {selectedAssessment ? "Update" : "Create"} Assessment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Hazard Dialog */}
        <Dialog open={hazardDialogOpen} onOpenChange={setHazardDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Hazard</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHazard} className="space-y-4">
              <div className="space-y-2">
                <Label>Hazard Type *</Label>
                <Select
                  value={hazardFormData.hazard_type || ""}
                  onValueChange={(v) => setHazardFormData({ ...hazardFormData, hazard_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hazardTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={hazardFormData.description || ""}
                  onChange={(e) =>
                    setHazardFormData({ ...hazardFormData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Likelihood (1-5) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={hazardFormData.likelihood || 1}
                    onChange={(e) =>
                      setHazardFormData({
                        ...hazardFormData,
                        likelihood: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Severity (1-5) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={hazardFormData.severity || 1}
                    onChange={(e) =>
                      setHazardFormData({
                        ...hazardFormData,
                        severity: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Existing Controls</Label>
                <Textarea
                  value={hazardFormData.existing_controls || ""}
                  onChange={(e) =>
                    setHazardFormData({ ...hazardFormData, existing_controls: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Controls Required</Label>
                <Textarea
                  value={hazardFormData.additional_controls || ""}
                  onChange={(e) =>
                    setHazardFormData({ ...hazardFormData, additional_controls: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setHazardDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createHazard.isPending}>
                  Add Hazard
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
