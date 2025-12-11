import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2,
  Users,
  UserPlus,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PositionSummary {
  position_id: string;
  position_title: string;
  department_name: string;
  authorized_headcount: number;
  filled_count: number;
  vacancy_count: number;
}

interface VacancyDashboardProps {
  companyId: string;
}

export function VacancyDashboard({ companyId }: VacancyDashboardProps) {
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchVacancyData();
    }
  }, [companyId]);

  const fetchVacancyData = async () => {
    setIsLoading(true);
    try {
      // Fetch positions with employee counts
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id")
        .eq("company_id", companyId);

      if (deptError) throw deptError;

      const deptIds = (deptData || []).map(d => d.id);

      if (deptIds.length > 0) {
        const { data: posData, error: posError } = await supabase
          .from("positions")
          .select(`
            id,
            title,
            authorized_headcount,
            department:departments(name)
          `)
          .in("department_id", deptIds)
          .eq("is_active", true);

        if (posError) throw posError;

        // Get employee counts for each position
        const { data: epData, error: epError } = await supabase
          .from("employee_positions")
          .select("position_id")
          .eq("is_active", true);

        if (epError) throw epError;

        // Count employees per position
        const countMap = new Map<string, number>();
        (epData || []).forEach(ep => {
          countMap.set(ep.position_id, (countMap.get(ep.position_id) || 0) + 1);
        });

        // Build summary
        const summary: PositionSummary[] = (posData || []).map(pos => ({
          position_id: pos.id,
          position_title: pos.title,
          department_name: (pos.department as any)?.name || "Unknown",
          authorized_headcount: pos.authorized_headcount,
          filled_count: countMap.get(pos.id) || 0,
          vacancy_count: pos.authorized_headcount - (countMap.get(pos.id) || 0),
        }));

        // Sort by vacancy count descending
        summary.sort((a, b) => b.vacancy_count - a.vacancy_count);
        setPositions(summary);
      }
    } catch (error) {
      console.error("Error fetching vacancy data:", error);
      toast.error("Failed to load vacancy data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalAuthorized = positions.reduce((sum, p) => sum + p.authorized_headcount, 0);
  const totalFilled = positions.reduce((sum, p) => sum + p.filled_count, 0);
  const totalVacancies = positions.reduce((sum, p) => sum + p.vacancy_count, 0);
  const fillRate = totalAuthorized > 0 ? (totalFilled / totalAuthorized) * 100 : 0;

  const positionsWithVacancies = positions.filter(p => p.vacancy_count > 0);
  const overstaffedPositions = positions.filter(p => p.vacancy_count < 0);
  const fullyStaffedPositions = positions.filter(p => p.vacancy_count === 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Position Control & Vacancies
        </h3>
        <p className="text-sm text-muted-foreground">
          Track authorized headcount, filled positions, and vacancies
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Authorized</CardDescription>
            <CardTitle className="text-2xl">{totalAuthorized}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Approved positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Filled Positions</CardDescription>
            <CardTitle className="text-2xl text-green-600">{totalFilled}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={fillRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{fillRate.toFixed(1)}% fill rate</p>
          </CardContent>
        </Card>

        <Card className={cn(totalVacancies > 0 && "border-amber-500/50")}>
          <CardHeader className="pb-2">
            <CardDescription>Open Vacancies</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{totalVacancies > 0 ? totalVacancies : 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {positionsWithVacancies.length} position types
            </p>
          </CardContent>
        </Card>

        <Card className={cn(overstaffedPositions.length > 0 && "border-red-500/50")}>
          <CardHeader className="pb-2">
            <CardDescription>Overstaffed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{Math.abs(overstaffedPositions.reduce((sum, p) => sum + p.vacancy_count, 0))}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {overstaffedPositions.length} position types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vacancies List */}
      {positionsWithVacancies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-600" />
              Open Vacancies
            </CardTitle>
            <CardDescription>
              Positions that need to be filled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positionsWithVacancies.map((pos) => (
                <div
                  key={pos.position_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{pos.position_title}</p>
                    <p className="text-sm text-muted-foreground">{pos.department_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {pos.filled_count} / {pos.authorized_headcount}
                        </span>
                        <Progress 
                          value={(pos.filled_count / pos.authorized_headcount) * 100} 
                          className="w-20 h-2"
                        />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      {pos.vacancy_count} vacant
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overstaffed Positions */}
      {overstaffedPositions.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Overstaffed Positions
            </CardTitle>
            <CardDescription>
              Positions exceeding authorized headcount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overstaffedPositions.map((pos) => (
                <div
                  key={pos.position_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-50/50 dark:bg-red-950/20"
                >
                  <div>
                    <p className="font-medium">{pos.position_title}</p>
                    <p className="text-sm text-muted-foreground">{pos.department_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      {pos.filled_count} / {pos.authorized_headcount} filled
                    </span>
                    <Badge variant="destructive">
                      +{Math.abs(pos.vacancy_count)} over
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fully Staffed */}
      {fullyStaffedPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Fully Staffed ({fullyStaffedPositions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fullyStaffedPositions.map((pos) => (
                <Badge key={pos.position_id} variant="secondary">
                  {pos.position_title} ({pos.filled_count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {positions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No positions found. Create positions first to track vacancies.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
