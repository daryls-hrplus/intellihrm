import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, ChevronRight } from "lucide-react";
import { useRecruitment } from "@/hooks/useRecruitment";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";

export default function ApplicationsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const { applications, applicationsLoading, updateApplication } = useRecruitment(selectedCompanyId || undefined);

  const getApplicationStageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      applied: "bg-blue-100 text-blue-800",
      screening: "bg-yellow-100 text-yellow-800",
      interview: "bg-purple-100 text-purple-800",
      offer: "bg-green-100 text-green-800",
      hired: "bg-green-200 text-green-900",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[stage] || ""}>{stage}</Badge>;
  };

  const handleStageChange = async (applicationId: string, newStage: string) => {
    await updateApplication.mutateAsync({
      id: applicationId,
      stage: newStage,
      status: newStage === "hired" ? "hired" : newStage === "rejected" ? "rejected" : "active",
    });
  };

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = 
      (app as any).candidate?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app as any).candidate?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app as any).requisition?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  }) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("recruitment.dashboard.title"), href: "/recruitment" },
            { label: t("recruitment.tabs.applications") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <FileText className="h-5 w-5 text-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("recruitment.tabs.applications")}</h1>
              <p className="text-muted-foreground">{t("recruitment.modules.applications.description")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("recruitment.tabs.applications")}</CardTitle>
            <CardDescription>Track and manage all job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedCompanyId ? "No applications found" : "Please select a company"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application #</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-sm">{app.application_number}</TableCell>
                      <TableCell className="font-medium">
                        {(app as any).candidate?.first_name} {(app as any).candidate?.last_name}
                      </TableCell>
                      <TableCell>{(app as any).requisition?.title}</TableCell>
                      <TableCell>{getApplicationStageBadge(app.stage)}</TableCell>
                      <TableCell>{formatDateForDisplay(app.applied_at, "MMM d, yyyy")}</TableCell>
                      <TableCell>{app.rating ? `${app.rating}/5` : "-"}</TableCell>
                      <TableCell>
                        <Select
                          value={app.stage}
                          onValueChange={(stage) => handleStageChange(app.id, stage)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="screening">Screening</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
