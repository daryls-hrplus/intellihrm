import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";

const jobPostings = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    applicants: 45,
    posted: "5 days ago",
    status: "active",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    applicants: 62,
    posted: "1 week ago",
    status: "active",
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Design",
    location: "New York, NY",
    type: "Full-time",
    applicants: 38,
    posted: "2 weeks ago",
    status: "active",
  },
  {
    id: 4,
    title: "Sales Representative",
    department: "Sales",
    location: "Chicago, IL",
    type: "Full-time",
    applicants: 29,
    posted: "3 days ago",
    status: "active",
  },
];

const pipelineStages = [
  { stage: "Applied", count: 156, color: "bg-muted-foreground" },
  { stage: "Screening", count: 45, color: "bg-info" },
  { stage: "Interview", count: 28, color: "bg-warning" },
  { stage: "Offer", count: 8, color: "bg-primary" },
  { stage: "Hired", count: 12, color: "bg-success" },
];

export default function RecruitmentPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Recruitment
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage job postings and track candidates
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create Job Posting
          </button>
        </div>

        {/* Pipeline Overview */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Recruitment Pipeline
          </h2>
          <div className="flex flex-wrap gap-4">
            {pipelineStages.map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold text-primary-foreground",
                    stage.color
                  )}
                >
                  {stage.count}
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{stage.stage}</p>
                  <p className="text-sm text-muted-foreground">candidates</p>
                </div>
                {index < pipelineStages.length - 1 && (
                  <ArrowRight className="mx-2 h-4 w-4 text-muted-foreground hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Job Postings */}
        <div className="rounded-xl border border-border bg-card shadow-card animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-lg font-semibold text-card-foreground">
              Active Job Postings
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {jobPostings.length} open positions
            </span>
          </div>
          <div className="divide-y divide-border">
            {jobPostings.map((job, index) => (
              <div
                key={job.id}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-card-foreground">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-card-foreground">
                      {job.applicants}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      applicants
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Posted {job.posted}
                  </span>
                  <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
