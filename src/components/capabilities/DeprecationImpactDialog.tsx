import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Briefcase,
  Users,
  Calendar,
  Loader2,
  Building2,
  ChevronRight,
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Capability } from "@/hooks/useCapabilities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AffectedJob {
  id: string;
  job_title: string;
  department_name: string | null;
  required_level: number;
}

interface AffectedEmployee {
  id: string;
  employee_name: string;
  department_name: string | null;
  proficiency_level: number;
}

interface DeprecationImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capability: Capability | null;
  onConfirm: (effectiveTo: string) => Promise<void>;
}

export function DeprecationImpactDialog({
  open,
  onOpenChange,
  capability,
  onConfirm,
}: DeprecationImpactDialogProps) {
  const [affectedJobs, setAffectedJobs] = useState<AffectedJob[]>([]);
  const [affectedEmployees, setAffectedEmployees] = useState<AffectedEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sunsetDate, setSunsetDate] = useState(
    format(addMonths(new Date(), 6), "yyyy-MM-dd")
  );

  useEffect(() => {
    if (open && capability) {
      fetchImpactData();
      // Reset sunset date to 6 months from now
      setSunsetDate(format(addMonths(new Date(), 6), "yyyy-MM-dd"));
    }
  }, [open, capability?.id]);

  const fetchImpactData = async () => {
    if (!capability) return;
    setLoading(true);
    try {
      // Fetch affected jobs
      const { data: jobData, error: jobError } = await supabase
        .from("job_capability_requirements")
        .select(`
          id,
          required_level,
          job_id
        `)
        .eq("capability_id", capability.id);

      if (jobError) {
        console.error("Error fetching affected jobs:", jobError);
      } else if (jobData && jobData.length > 0) {
        // Fetch job details separately
        const jobIds = jobData.map((r: any) => r.job_id);
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("id, job_title, department_id")
          .in("id", jobIds);
        
        const jobs: AffectedJob[] = (jobsData || []).map((job: any) => {
          const req = jobData.find((r: any) => r.job_id === job.id);
          return {
            id: job.id,
            job_title: job.job_title,
            department_name: null,
            required_level: req?.required_level || 0,
          };
        });
        setAffectedJobs(jobs);
      }

      // Fetch affected employees
      const { data: empData, error: empError } = await supabase
        .from("employee_competencies")
        .select(`
          id,
          proficiency_level,
          profiles!inner(
            id,
            first_name,
            last_name,
            departments(name)
          )
        `)
        .eq("capability_id", capability.id);

      if (empError) {
        console.error("Error fetching affected employees:", empError);
      } else {
        const employees: AffectedEmployee[] = (empData || []).map((row: any) => ({
          id: row.profiles.id,
          employee_name: `${row.profiles.first_name || ""} ${row.profiles.last_name || ""}`.trim() || "Unknown",
          department_name: row.profiles.departments?.name || null,
          proficiency_level: row.proficiency_level,
        }));
        setAffectedEmployees(employees);
      }
    } catch (err) {
      console.error("Error fetching impact data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(sunsetDate);
      onOpenChange(false);
    } finally {
      setConfirming(false);
    }
  };

  const totalImpact = affectedJobs.length + affectedEmployees.length;
  const hasHighImpact = totalImpact > 10;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={cn(
              "h-5 w-5",
              hasHighImpact ? "text-destructive" : "text-amber-500"
            )} />
            Deprecation Impact Analysis
          </AlertDialogTitle>
          <AlertDialogDescription>
            Review the impact of deprecating <strong>{capability?.name}</strong> before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1 max-h-[400px] pr-4">
            <div className="space-y-6">
              {/* Impact Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "p-4 rounded-lg border",
                  affectedJobs.length > 0 
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                    : "bg-muted"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className={cn(
                      "h-5 w-5",
                      affectedJobs.length > 0 ? "text-amber-600" : "text-muted-foreground"
                    )} />
                    <span className="font-semibold text-lg">{affectedJobs.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jobs require this {capability?.type === "SKILL" ? "skill" : "competency"}
                  </p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg border",
                  affectedEmployees.length > 0
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                    : "bg-muted"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className={cn(
                      "h-5 w-5",
                      affectedEmployees.length > 0 ? "text-amber-600" : "text-muted-foreground"
                    )} />
                    <span className="font-semibold text-lg">{affectedEmployees.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Employees have this {capability?.type === "SKILL" ? "skill" : "competency"}
                  </p>
                </div>
              </div>

              {/* Warning message */}
              {hasHighImpact && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ High Impact Warning: This {capability?.type === "SKILL" ? "skill" : "competency"} is 
                    widely used across your organization. Consider communicating the deprecation plan 
                    to affected teams.
                  </p>
                </div>
              )}

              {/* Affected Jobs List */}
              {affectedJobs.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Affected Jobs
                  </h4>
                  <div className="space-y-1">
                    {affectedJobs.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span>{job.job_title}</span>
                          {job.department_name && (
                            <Badge variant="outline" className="text-xs">
                              <Building2 className="h-3 w-3 mr-1" />
                              {job.department_name}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Level {job.required_level}
                        </Badge>
                      </div>
                    ))}
                    {affectedJobs.length > 5 && (
                      <p className="text-xs text-muted-foreground pl-5">
                        +{affectedJobs.length - 5} more jobs
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Affected Employees List */}
              {affectedEmployees.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Affected Employees
                  </h4>
                  <div className="space-y-1">
                    {affectedEmployees.slice(0, 5).map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span>{emp.employee_name}</span>
                          {emp.department_name && (
                            <Badge variant="outline" className="text-xs">
                              <Building2 className="h-3 w-3 mr-1" />
                              {emp.department_name}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Level {emp.proficiency_level}
                        </Badge>
                      </div>
                    ))}
                    {affectedEmployees.length > 5 && (
                      <p className="text-xs text-muted-foreground pl-5">
                        +{affectedEmployees.length - 5} more employees
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Sunset Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="sunset-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Sunset Date (Effective To)
                </Label>
                <Input
                  id="sunset-date"
                  type="date"
                  value={sunsetDate}
                  onChange={(e) => setSunsetDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  The {capability?.type === "SKILL" ? "skill" : "competency"} will remain 
                  visible until this date, then be filtered out by default.
                </p>
              </div>
            </div>
          </ScrollArea>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirming || loading}
            className={cn(
              hasHighImpact && "bg-destructive hover:bg-destructive/90"
            )}
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deprecating...
              </>
            ) : (
              <>Confirm Deprecation</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
