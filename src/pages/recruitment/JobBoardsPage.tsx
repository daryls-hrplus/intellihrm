import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Plus } from "lucide-react";
import { useRecruitment } from "@/hooks/useRecruitment";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";

export default function JobBoardsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const [isJobBoardDialogOpen, setIsJobBoardDialogOpen] = useState(false);

  const { jobBoardConfigs, createJobBoardConfig } = useRecruitment(selectedCompanyId || undefined);

  const [jobBoardForm, setJobBoardForm] = useState({
    name: "",
    code: "",
    api_endpoint: "",
    webhook_secret: "",
    auto_post: false,
  });

  const handleCreateJobBoard = async () => {
    if (!selectedCompanyId) return;

    await createJobBoardConfig.mutateAsync({
      company_id: selectedCompanyId,
      name: jobBoardForm.name,
      code: jobBoardForm.code,
      api_endpoint: jobBoardForm.api_endpoint,
      webhook_secret: jobBoardForm.webhook_secret || null,
      auto_post: jobBoardForm.auto_post,
    });

    setIsJobBoardDialogOpen(false);
    setJobBoardForm({
      name: "",
      code: "",
      api_endpoint: "",
      webhook_secret: "",
      auto_post: false,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("recruitment.dashboard.title"), href: "/recruitment" },
            { label: t("recruitment.tabs.jobBoards") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
              <Settings className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("recruitment.tabs.jobBoards")}</h1>
              <p className="text-muted-foreground">Configure job board integrations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
            <Dialog open={isJobBoardDialogOpen} onOpenChange={setIsJobBoardDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedCompanyId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Job Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Job Board Integration</DialogTitle>
                  <DialogDescription>Configure a new job board for posting requisitions</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={jobBoardForm.name}
                      onChange={(e) => setJobBoardForm({ ...jobBoardForm, name: e.target.value })}
                      placeholder="e.g., LinkedIn Jobs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      value={jobBoardForm.code}
                      onChange={(e) => setJobBoardForm({ ...jobBoardForm, code: e.target.value })}
                      placeholder="e.g., linkedin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Endpoint *</Label>
                    <Input
                      value={jobBoardForm.api_endpoint}
                      onChange={(e) => setJobBoardForm({ ...jobBoardForm, api_endpoint: e.target.value })}
                      placeholder="https://api.example.com/jobs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook Secret</Label>
                    <Input
                      value={jobBoardForm.webhook_secret}
                      onChange={(e) => setJobBoardForm({ ...jobBoardForm, webhook_secret: e.target.value })}
                      type="password"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-post"
                      checked={jobBoardForm.auto_post}
                      onCheckedChange={(checked) => setJobBoardForm({ ...jobBoardForm, auto_post: checked })}
                    />
                    <Label htmlFor="auto-post">Auto-post new requisitions</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsJobBoardDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleCreateJobBoard} 
                    disabled={!jobBoardForm.name || !jobBoardForm.code || !jobBoardForm.api_endpoint || createJobBoardConfig.isPending}
                  >
                    {createJobBoardConfig.isPending ? "Adding..." : "Add Job Board"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("recruitment.tabs.jobBoards")}</CardTitle>
            <CardDescription>Manage job board API integrations</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCompanyId ? (
              <div className="text-center py-8 text-muted-foreground">Please select a company</div>
            ) : !jobBoardConfigs || jobBoardConfigs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No job boards configured</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>API Endpoint</TableHead>
                    <TableHead>Auto Post</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobBoardConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell><code className="text-sm">{config.code}</code></TableCell>
                      <TableCell className="max-w-[200px] truncate">{config.api_endpoint}</TableCell>
                      <TableCell>
                        <Badge variant={config.auto_post ? "default" : "outline"}>
                          {config.auto_post ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? "Active" : "Inactive"}
                        </Badge>
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
