import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Plus, Search, Send, ExternalLink } from "lucide-react";
import { useRecruitment } from "@/hooks/useRecruitment";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";

export default function RequisitionsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequisitionDialogOpen, setIsRequisitionDialogOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<string | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const { 
    requisitions, 
    requisitionsLoading, 
    jobBoardConfigs,
    createRequisition,
    postJobToBoard,
  } = useRecruitment(selectedCompanyId || undefined);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const [requisitionForm, setRequisitionForm] = useState({
    title: "",
    department_id: "",
    location: "",
    employment_type: "full_time",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: "",
    openings: "1",
    is_remote: false,
  });

  const handleCreateRequisition = async () => {
    if (!selectedCompanyId) return;
    
    await createRequisition.mutateAsync({
      company_id: selectedCompanyId,
      title: requisitionForm.title,
      department_id: requisitionForm.department_id || null,
      location: requisitionForm.location || null,
      employment_type: requisitionForm.employment_type,
      experience_level: requisitionForm.experience_level || null,
      salary_min: requisitionForm.salary_min ? parseFloat(requisitionForm.salary_min) : null,
      salary_max: requisitionForm.salary_max ? parseFloat(requisitionForm.salary_max) : null,
      description: requisitionForm.description || null,
      requirements: requisitionForm.requirements || null,
      openings: parseInt(requisitionForm.openings) || 1,
      is_remote: requisitionForm.is_remote,
      status: "draft",
    });

    setIsRequisitionDialogOpen(false);
    setRequisitionForm({
      title: "",
      department_id: "",
      location: "",
      employment_type: "full_time",
      experience_level: "",
      salary_min: "",
      salary_max: "",
      description: "",
      requirements: "",
      openings: "1",
      is_remote: false,
    });
  };

  const handlePostJob = async (jobBoardConfigId: string) => {
    if (!selectedRequisition) return;
    await postJobToBoard.mutateAsync({
      requisitionId: selectedRequisition,
      jobBoardConfigId,
    });
    setIsPostDialogOpen(false);
    setSelectedRequisition(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      pending: "secondary",
      approved: "default",
      open: "default",
      on_hold: "secondary",
      filled: "secondary",
      cancelled: "destructive",
      closed: "secondary",
    };
    const colors: Record<string, string> = {
      approved: "bg-blue-100 text-blue-800",
      open: "bg-green-100 text-green-800",
      filled: "bg-purple-100 text-purple-800",
    };
    return <Badge variant={variants[status] || "outline"} className={colors[status]}>{status}</Badge>;
  };

  const filteredRequisitions = requisitions?.filter(req => 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requisition_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("recruitment.dashboard.title"), href: "/recruitment" },
            { label: t("recruitment.tabs.requisitions") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("recruitment.tabs.requisitions")}</h1>
              <p className="text-muted-foreground">{t("recruitment.modules.management.description")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("recruitment.actions.searchRequisitions")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isRequisitionDialogOpen} onOpenChange={setIsRequisitionDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedCompanyId}>
                <Plus className="mr-2 h-4 w-4" />
                {t("recruitment.actions.newRequisition")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("recruitment.form.createRequisition")}</DialogTitle>
                <DialogDescription>{t("recruitment.form.createRequisitionDesc")}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={requisitionForm.title}
                    onChange={(e) => setRequisitionForm({ ...requisitionForm, title: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={requisitionForm.department_id}
                      onValueChange={(v) => setRequisitionForm({ ...requisitionForm, department_id: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={requisitionForm.location}
                      onChange={(e) => setRequisitionForm({ ...requisitionForm, location: e.target.value })}
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select
                      value={requisitionForm.employment_type}
                      onValueChange={(v) => setRequisitionForm({ ...requisitionForm, employment_type: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={requisitionForm.experience_level}
                      onValueChange={(v) => setRequisitionForm({ ...requisitionForm, experience_level: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary Min</Label>
                    <Input
                      type="number"
                      value={requisitionForm.salary_min}
                      onChange={(e) => setRequisitionForm({ ...requisitionForm, salary_min: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Max</Label>
                    <Input
                      type="number"
                      value={requisitionForm.salary_max}
                      onChange={(e) => setRequisitionForm({ ...requisitionForm, salary_max: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={requisitionForm.description}
                    onChange={(e) => setRequisitionForm({ ...requisitionForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea
                    value={requisitionForm.requirements}
                    onChange={(e) => setRequisitionForm({ ...requisitionForm, requirements: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRequisitionDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRequisition} disabled={!requisitionForm.title || createRequisition.isPending}>
                  {createRequisition.isPending ? "Creating..." : "Create Requisition"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("recruitment.tabs.requisitions")}</CardTitle>
            <CardDescription>{t("recruitment.modules.management.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {requisitionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredRequisitions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedCompanyId ? "No requisitions found" : "Please select a company"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requisition #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequisitions.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">{req.requisition_number}</TableCell>
                      <TableCell className="font-medium">{req.title}</TableCell>
                      <TableCell>{req.location || "-"}</TableCell>
                      <TableCell><Badge variant="outline">{req.employment_type}</Badge></TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>{formatDateForDisplay(req.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequisition(req.id);
                              setIsPostDialogOpen(true);
                            }}
                            disabled={req.status !== "open"}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Post to Job Board Dialog */}
        <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post to Job Board</DialogTitle>
              <DialogDescription>Select a job board to post this requisition</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {jobBoardConfigs?.map((config) => (
                <Button
                  key={config.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handlePostJob(config.id)}
                  disabled={postJobToBoard.isPending}
                >
                  {config.name}
                </Button>
              ))}
              {(!jobBoardConfigs || jobBoardConfigs.length === 0) && (
                <p className="text-muted-foreground text-sm">No job boards configured</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
