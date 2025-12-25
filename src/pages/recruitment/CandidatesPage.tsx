import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search } from "lucide-react";
import { useRecruitment } from "@/hooks/useRecruitment";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";

export default function CandidatesPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);

  const { candidates, candidatesLoading, createCandidate } = useRecruitment(selectedCompanyId || undefined);

  const [candidateForm, setCandidateForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    current_company: "",
    current_title: "",
    years_experience: "",
  });

  const handleCreateCandidate = async () => {
    if (!selectedCompanyId) return;

    await createCandidate.mutateAsync({
      company_id: selectedCompanyId,
      first_name: candidateForm.first_name,
      last_name: candidateForm.last_name,
      email: candidateForm.email,
      phone: candidateForm.phone || null,
      location: candidateForm.location || null,
      current_company: candidateForm.current_company || null,
      current_title: candidateForm.current_title || null,
      years_experience: candidateForm.years_experience ? parseInt(candidateForm.years_experience) : null,
      source: "direct",
    });

    setIsCandidateDialogOpen(false);
    setCandidateForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      location: "",
      current_company: "",
      current_title: "",
      years_experience: "",
    });
  };

  const filteredCandidates = candidates?.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("recruitment.dashboard.title"), href: "/recruitment" },
            { label: t("recruitment.tabs.candidates") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("recruitment.tabs.candidates")}</h1>
              <p className="text-muted-foreground">{t("recruitment.modules.candidates.description")}</p>
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
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isCandidateDialogOpen} onOpenChange={setIsCandidateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedCompanyId}>
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>Add a candidate to the talent pool</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={candidateForm.first_name}
                      onChange={(e) => setCandidateForm({ ...candidateForm, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={candidateForm.last_name}
                      onChange={(e) => setCandidateForm({ ...candidateForm, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={candidateForm.phone}
                      onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={candidateForm.location}
                      onChange={(e) => setCandidateForm({ ...candidateForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Company</Label>
                    <Input
                      value={candidateForm.current_company}
                      onChange={(e) => setCandidateForm({ ...candidateForm, current_company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Title</Label>
                    <Input
                      value={candidateForm.current_title}
                      onChange={(e) => setCandidateForm({ ...candidateForm, current_title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    value={candidateForm.years_experience}
                    onChange={(e) => setCandidateForm({ ...candidateForm, years_experience: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCandidateDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateCandidate} 
                  disabled={!candidateForm.first_name || !candidateForm.last_name || !candidateForm.email || createCandidate.isPending}
                >
                  {createCandidate.isPending ? "Adding..." : "Add Candidate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("recruitment.tabs.candidates")}</CardTitle>
            <CardDescription>Manage your candidate talent pool</CardDescription>
          </CardHeader>
          <CardContent>
            {candidatesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedCompanyId ? "No candidates found" : "Please select a company"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        {candidate.first_name} {candidate.last_name}
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phone || "-"}</TableCell>
                      <TableCell>
                        {candidate.current_title ? (
                          <span>{candidate.current_title} at {candidate.current_company || "—"}</span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{candidate.years_experience ? `${candidate.years_experience} yrs` : "-"}</TableCell>
                      <TableCell><Badge variant="outline">{candidate.source || "direct"}</Badge></TableCell>
                      <TableCell>{formatDateForDisplay(candidate.created_at)}</TableCell>
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
