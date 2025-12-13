import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, MapPin, Building2, Clock, DollarSign, Briefcase, CheckCircle, Send } from "lucide-react";
import { format } from "date-fns";

interface JobRequisition {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  location: string | null;
  employment_type: string;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  is_remote: boolean | null;
  posted_date: string | null;
  department?: { name: string } | null;
  company?: { name: string } | null;
}

export default function EssJobOpeningsPage() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");

  // Fetch open internal job requisitions
  const { data: openJobs, isLoading } = useQuery({
    queryKey: ["internal-job-openings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_requisitions")
        .select(`
          id, title, description, requirements, responsibilities, benefits,
          location, employment_type, experience_level, salary_min, salary_max,
          salary_currency, is_remote, posted_date,
          department:departments(name),
          company:companies(name)
        `)
        .eq("status", "open")
        .order("posted_date", { ascending: false });
      
      if (error) throw error;
      return data as JobRequisition[];
    },
  });

  // Fetch employee's existing applications
  const { data: myApplications } = useQuery({
    queryKey: ["my-internal-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First check if employee has a candidate record
      const { data: candidateData } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", profile?.email || "")
        .maybeSingle();
      
      if (!candidateData) return [];
      
      const { data, error } = await supabase
        .from("applications")
        .select("requisition_id, status, stage")
        .eq("candidate_id", candidateData.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!profile?.email,
  });

  // Apply for job mutation
  const applyForJob = useMutation({
    mutationFn: async ({ requisitionId, coverLetter, expectedSalary }: { 
      requisitionId: string; 
      coverLetter: string;
      expectedSalary: number | null;
    }) => {
      if (!profile?.email || !profile?.full_name) {
        throw new Error("Profile information is required");
      }

      // Get company ID from the requisition
      const { data: requisition } = await supabase
        .from("job_requisitions")
        .select("company_id")
        .eq("id", requisitionId)
        .single();

      if (!requisition) throw new Error("Job requisition not found");

      // Check if candidate record exists, create if not
      let candidateId: string;
      const { data: existingCandidate } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", profile.email)
        .maybeSingle();

      if (existingCandidate) {
        candidateId = existingCandidate.id;
      } else {
        const nameParts = profile.full_name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { data: newCandidate, error: candidateError } = await supabase
          .from("candidates")
          .insert({
            company_id: requisition.company_id,
            first_name: firstName,
            last_name: lastName,
            email: profile.email,
            source: "internal",
            status: "active",
          })
          .select("id")
          .single();

        if (candidateError) throw candidateError;
        candidateId = newCandidate.id;
      }

      // Create application
      const { data, error } = await supabase
        .from("applications")
        .insert({
          requisition_id: requisitionId,
          candidate_id: candidateId,
          source: "internal",
          cover_letter: coverLetter || null,
          expected_salary: expectedSalary,
          status: "active",
          stage: "applied",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-internal-applications"] });
      toast.success("Application submitted successfully!");
      setApplyDialogOpen(false);
      setSelectedJob(null);
      setCoverLetter("");
      setExpectedSalary("");
    },
    onError: (error) => {
      toast.error(`Failed to apply: ${error.message}`);
    },
  });

  const hasApplied = (requisitionId: string) => {
    return myApplications?.some(app => app.requisition_id === requisitionId);
  };

  const getApplicationStatus = (requisitionId: string) => {
    const app = myApplications?.find(app => app.requisition_id === requisitionId);
    return app?.stage || null;
  };

  const filteredJobs = openJobs?.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
    job.location?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleApply = () => {
    if (!selectedJob) return;
    
    applyForJob.mutate({
      requisitionId: selectedJob.id,
      coverLetter,
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
    });
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const curr = currency || "USD";
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${curr} ${min.toLocaleString()}+`;
    if (max) return `Up to ${curr} ${max.toLocaleString()}`;
    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Employee Self Service", href: "/ess" },
            { label: "Job Openings" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internal Job Openings</h1>
          <p className="text-muted-foreground">
            Browse and apply for open positions within the organization
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, department, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading job openings...</div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No open positions available at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => {
              const applied = hasApplied(job.id);
              const appStatus = getApplicationStatus(job.id);
              const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

              return (
                <Card 
                  key={job.id} 
                  className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company?.name} {job.department?.name && `• ${job.department.name}`}
                        </CardDescription>
                      </div>
                      {applied ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Applied {appStatus && `(${appStatus})`}
                        </Badge>
                      ) : (
                        <Badge>Open</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                          {job.is_remote && " (Remote)"}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {job.employment_type}
                      </span>
                      {job.experience_level && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {job.experience_level}
                        </span>
                      )}
                      {salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {salary}
                        </span>
                      )}
                    </div>
                    {job.description && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Job Details Dialog */}
        <Dialog open={!!selectedJob && !applyDialogOpen} onOpenChange={(open) => !open && setSelectedJob(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedJob && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {selectedJob.company?.name}
                    {selectedJob.department?.name && ` • ${selectedJob.department.name}`}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Job Meta */}
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.location && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedJob.location}
                        {selectedJob.is_remote && " (Remote)"}
                      </Badge>
                    )}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {selectedJob.employment_type}
                    </Badge>
                    {selectedJob.experience_level && (
                      <Badge variant="outline">
                        {selectedJob.experience_level}
                      </Badge>
                    )}
                    {formatSalary(selectedJob.salary_min, selectedJob.salary_max, selectedJob.salary_currency) && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatSalary(selectedJob.salary_min, selectedJob.salary_max, selectedJob.salary_currency)}
                      </Badge>
                    )}
                  </div>

                  {selectedJob.posted_date && (
                    <p className="text-sm text-muted-foreground">
                      Posted: {format(new Date(selectedJob.posted_date), "MMMM d, yyyy")}
                    </p>
                  )}

                  {selectedJob.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                    </div>
                  )}

                  {selectedJob.responsibilities && (
                    <div>
                      <h4 className="font-semibold mb-2">Responsibilities</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                    </div>
                  )}

                  {selectedJob.requirements && (
                    <div>
                      <h4 className="font-semibold mb-2">Requirements</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.requirements}</p>
                    </div>
                  )}

                  {selectedJob.benefits && (
                    <div>
                      <h4 className="font-semibold mb-2">Benefits</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.benefits}</p>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-4">
                  {hasApplied(selectedJob.id) ? (
                    <Badge variant="secondary" className="flex items-center gap-1 px-4 py-2">
                      <CheckCircle className="h-4 w-4" />
                      You have already applied for this position
                    </Badge>
                  ) : (
                    <Button onClick={() => setApplyDialogOpen(true)}>
                      <Send className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
              <DialogDescription>
                Submit your application for this position
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                <Textarea
                  id="cover-letter"
                  placeholder="Tell us why you're interested in this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-salary">Expected Salary (Optional)</Label>
                <Input
                  id="expected-salary"
                  type="number"
                  placeholder="Enter your expected salary"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={applyForJob.isPending}>
                {applyForJob.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
