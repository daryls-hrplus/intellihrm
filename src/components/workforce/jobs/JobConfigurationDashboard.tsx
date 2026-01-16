import { useState } from "react";
import { UnifiedStatCard } from "@/components/dashboard/UnifiedStatCard";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Award,
  ListChecks,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  X,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfigFilter } from "@/hooks/useJobConfigurationStats";
import { JobQuickConfigSheet } from "./JobQuickConfigSheet";

interface JobConfigStats {
  jobId: string;
  jobName: string;
  jobCode: string;
  isActive: boolean;
  hasCompetencies: boolean;
  hasResponsibilities: boolean;
  hasGoals: boolean;
  hasSkills: boolean;
  competencyCount: number;
  responsibilityCount: number;
  goalCount: number;
  skillCount: number;
  isFullyConfigured: boolean;
}

interface ConfigurationSummary {
  totalActiveJobs: number;
  jobsWithCompetencies: number;
  jobsWithResponsibilities: number;
  jobsWithGoals: number;
  jobsWithSkills: number;
  fullyConfiguredJobs: number;
  jobStats: JobConfigStats[];
}

interface JobConfigurationDashboardProps {
  stats: ConfigurationSummary | null;
  isLoading: boolean;
  activeFilter: ConfigFilter;
  onFilterChange: (filter: ConfigFilter) => void;
  getPercentage: (count: number, total: number) => string;
  companyId: string;
  onRefresh: () => void;
}

interface FilterChip {
  filter: ConfigFilter;
  label: string;
  variant: "default" | "outline" | "secondary" | "destructive";
}

const filterChips: FilterChip[] = [
  { filter: "all", label: "All Jobs", variant: "default" },
  { filter: "with-competencies", label: "With Competencies", variant: "outline" },
  { filter: "with-responsibilities", label: "With Responsibilities", variant: "outline" },
  { filter: "with-goals", label: "With Goals", variant: "outline" },
  { filter: "with-skills", label: "With Skills", variant: "outline" },
  { filter: "fully-configured", label: "Fully Configured", variant: "outline" },
  { filter: "incomplete", label: "Incomplete", variant: "outline" },
];

export function JobConfigurationDashboard({
  stats,
  isLoading,
  activeFilter,
  onFilterChange,
  getPercentage,
  companyId,
  onRefresh,
}: JobConfigurationDashboardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const total = stats?.totalActiveJobs || 0;

  // Get incomplete jobs for the sheet
  const incompleteJobs = stats?.jobStats?.filter((j) => !j.isFullyConfigured) || [];

  return (
    <>
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <UnifiedStatCard
            title="Active Jobs"
            value={stats?.totalActiveJobs ?? 0}
            icon={Briefcase}
            loading={isLoading}
            size="sm"
            onClick={() => onFilterChange("all")}
            className={cn(activeFilter === "all" && "ring-2 ring-primary")}
          />
          <UnifiedStatCard
            title="With Competencies"
            value={stats?.jobsWithCompetencies ?? 0}
            change={getPercentage(stats?.jobsWithCompetencies ?? 0, total)}
            changeType={
              (stats?.jobsWithCompetencies ?? 0) === total && total > 0
                ? "positive"
                : (stats?.jobsWithCompetencies ?? 0) === 0
                ? "negative"
                : "warning"
            }
            icon={Award}
            loading={isLoading}
            size="sm"
            onClick={() => onFilterChange("with-competencies")}
            className={cn(activeFilter === "with-competencies" && "ring-2 ring-primary")}
          />
          <UnifiedStatCard
            title="With Responsibilities"
            value={stats?.jobsWithResponsibilities ?? 0}
            change={getPercentage(stats?.jobsWithResponsibilities ?? 0, total)}
            changeType={
              (stats?.jobsWithResponsibilities ?? 0) === total && total > 0
                ? "positive"
                : (stats?.jobsWithResponsibilities ?? 0) === 0
                ? "negative"
                : "warning"
            }
            icon={ListChecks}
            loading={isLoading}
            size="sm"
            onClick={() => onFilterChange("with-responsibilities")}
            className={cn(activeFilter === "with-responsibilities" && "ring-2 ring-primary")}
          />
          <UnifiedStatCard
            title="With Goals"
            value={stats?.jobsWithGoals ?? 0}
            change={getPercentage(stats?.jobsWithGoals ?? 0, total)}
            changeType={
              (stats?.jobsWithGoals ?? 0) === total && total > 0
                ? "positive"
                : (stats?.jobsWithGoals ?? 0) === 0
                ? "negative"
                : "warning"
            }
            icon={Target}
            loading={isLoading}
            size="sm"
            onClick={() => onFilterChange("with-goals")}
            className={cn(activeFilter === "with-goals" && "ring-2 ring-primary")}
          />
          <UnifiedStatCard
            title="With Skills"
            value={stats?.jobsWithSkills ?? 0}
            change={getPercentage(stats?.jobsWithSkills ?? 0, total)}
            changeType={
              (stats?.jobsWithSkills ?? 0) === total && total > 0
                ? "positive"
                : (stats?.jobsWithSkills ?? 0) === 0
                ? "negative"
                : "warning"
            }
            icon={Lightbulb}
            loading={isLoading}
            size="sm"
            onClick={() => onFilterChange("with-skills")}
            className={cn(activeFilter === "with-skills" && "ring-2 ring-primary")}
          />
          <UnifiedStatCard
            title="Fully Configured"
            value={stats?.fullyConfiguredJobs ?? 0}
            change={getPercentage(stats?.fullyConfiguredJobs ?? 0, total)}
            changeType={
              (stats?.fullyConfiguredJobs ?? 0) === total && total > 0
                ? "positive"
                : (stats?.fullyConfiguredJobs ?? 0) === 0
                ? "negative"
                : "warning"
            }
            valueType={
              (stats?.fullyConfiguredJobs ?? 0) === total && total > 0
                ? "positive"
                : "neutral"
            }
            icon={CheckCircle2}
            loading={isLoading}
            size="sm"
            onClick={() => onFilterChange("fully-configured")}
            className={cn(activeFilter === "fully-configured" && "ring-2 ring-primary")}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter:</span>
          {filterChips.map((chip) => (
            <button
              key={chip.filter}
              onClick={() => onFilterChange(chip.filter)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all border",
                activeFilter === chip.filter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-foreground border-border hover:bg-muted"
              )}
            >
              {chip.label}
            </button>
          ))}
          {activeFilter !== "all" && (
            <button
              onClick={() => onFilterChange("all")}
              className="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Warning for incomplete jobs */}
        {stats && stats.fullyConfiguredJobs < stats.totalActiveJobs && stats.totalActiveJobs > 0 && (
          <div className="flex items-start justify-between gap-3 text-sm bg-white dark:bg-card p-3 rounded-lg border border-amber-500 dark:border-amber-600">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
              <div className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {stats.totalActiveJobs - stats.fullyConfiguredJobs} job
                  {stats.totalActiveJobs - stats.fullyConfiguredJobs !== 1 ? "s" : ""} need
                  {stats.totalActiveJobs - stats.fullyConfiguredJobs === 1 ? "s" : ""} configuration.
                </span>{" "}
                Jobs without competencies, responsibilities, goals, or skills may impact performance
                appraisals and succession planning.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(true)}
              className="shrink-0 border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950"
            >
              <Settings2 className="h-4 w-4 mr-1.5" />
              Configure Now
            </Button>
          </div>
        )}
      </div>

      {/* Quick Config Sheet */}
      <JobQuickConfigSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        incompleteJobs={incompleteJobs}
        companyId={companyId}
        onConfigurationChanged={onRefresh}
      />
    </>
  );
}
