import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Sun, 
  Moon,
  RefreshCw,
  Search,
  Brain,
  Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface WellnessIndicator {
  id: string;
  employee_id: string;
  assessment_date: string;
  consecutive_work_days: number;
  avg_daily_hours_last_7_days: number;
  avg_daily_hours_last_30_days: number;
  total_overtime_hours_last_7_days: number;
  total_overtime_hours_last_30_days: number;
  fatigue_risk_score: number;
  burnout_risk_score: number;
  overall_wellness_score: number;
  risk_level: string;
  ai_analysis: string | null;
  ai_recommendations: unknown;
  ai_confidence_score: number | null;
  calculated_at: string;
  profiles?: { full_name: string; email: string; avatar_url: string };
}

const RISK_CONFIG: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  low: { color: "text-green-600", bgColor: "bg-green-500/10", icon: <Heart className="h-4 w-4" /> },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-500/10", icon: <Activity className="h-4 w-4" /> },
  high: { color: "text-orange-600", bgColor: "bg-orange-500/10", icon: <AlertTriangle className="h-4 w-4" /> },
  critical: { color: "text-red-600", bgColor: "bg-red-500/10", icon: <AlertTriangle className="h-4 w-4" /> },
};

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "Wellness Monitoring" },
];

export default function WellnessMonitoringPage() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [selectedIndicator, setSelectedIndicator] = useState<WellnessIndicator | null>(null);

  const { data: indicators = [], isLoading } = useQuery({
    queryKey: ["wellness-indicators", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_wellness_indicators")
        .select(`*, profiles!employee_wellness_indicators_employee_id_fkey(full_name, email, avatar_url)`)
        .eq("company_id", company?.id)
        .order("burnout_risk_score", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as WellnessIndicator[];
    },
    enabled: !!company?.id,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-wellness", {
        body: { employeeId, companyId: company?.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Wellness analysis completed");
      queryClient.invalidateQueries({ queryKey: ["wellness-indicators"] });
    },
    onError: (error) => toast.error(`Analysis failed: ${error.message}`),
  });

  const analyzeAllMutation = useMutation({
    mutationFn: async () => {
      const { data: employees } = await supabase
        .from("profiles")
        .select("id")
        .eq("company_id", company?.id)
        .eq("status", "active");

      if (!employees) return;

      for (const emp of employees.slice(0, 20)) { // Limit to 20 for performance
        await supabase.functions.invoke("analyze-wellness", {
          body: { employeeId: emp.id, companyId: company?.id },
        });
      }
    },
    onSuccess: () => {
      toast.success("Bulk wellness analysis completed");
      queryClient.invalidateQueries({ queryKey: ["wellness-indicators"] });
    },
    onError: (error) => toast.error(`Bulk analysis failed: ${error.message}`),
  });

  const stats = {
    total: indicators.length,
    critical: indicators.filter(i => i.risk_level === "critical").length,
    high: indicators.filter(i => i.risk_level === "high").length,
    avgWellness: indicators.length > 0 
      ? Math.round(indicators.reduce((sum, i) => sum + i.overall_wellness_score, 0) / indicators.length) 
      : 0,
  };

  const filteredIndicators = indicators.filter(ind => {
    const matchesSearch = ind.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "all" || ind.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Wellness Monitoring</h1>
            <p className="text-muted-foreground">
              AI-powered fatigue detection and burnout risk analysis
            </p>
          </div>
          <Button 
            onClick={() => analyzeAllMutation.mutate()}
            disabled={analyzeAllMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analyzeAllMutation.isPending ? "animate-spin" : ""}`} />
            Analyze All Employees
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees Tracked</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical Risk</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wellness Score</p>
                  <p className="text-2xl font-bold">{stats.avgWellness}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Wellness Dashboard</CardTitle>
            <CardDescription>Monitor fatigue and burnout risk across your workforce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-center">Consecutive Days</TableHead>
                    <TableHead className="text-center">Avg Hours/Day</TableHead>
                    <TableHead className="text-center">Fatigue Risk</TableHead>
                    <TableHead className="text-center">Burnout Risk</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>AI Insights</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredIndicators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No wellness data. Click "Analyze All Employees" to start monitoring.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIndicators.map((ind) => {
                      const riskConfig = RISK_CONFIG[ind.risk_level] || RISK_CONFIG.low;
                      return (
                        <TableRow key={ind.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ind.profiles?.full_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{ind.profiles?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={ind.consecutive_work_days > 7 ? "destructive" : "secondary"}>
                              {ind.consecutive_work_days} days
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {ind.avg_daily_hours_last_7_days?.toFixed(1) || "—"}h
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={ind.fatigue_risk_score} className="w-16 h-2" />
                              <span className="text-sm font-medium">{ind.fatigue_risk_score}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={ind.burnout_risk_score} className="w-16 h-2" />
                              <span className="text-sm font-medium">{ind.burnout_risk_score}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${riskConfig.bgColor} ${riskConfig.color}`}>
                              <span className="flex items-center gap-1">
                                {riskConfig.icon}
                                {ind.risk_level.charAt(0).toUpperCase() + ind.risk_level.slice(1)}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ind.ai_analysis ? (
                              <Badge variant="outline" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                AI Available
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIndicator(ind)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => analyzeMutation.mutate(ind.employee_id)}
                                disabled={analyzeMutation.isPending}
                              >
                                <RefreshCw className={`h-3 w-3 ${analyzeMutation.isPending ? "animate-spin" : ""}`} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedIndicator} onOpenChange={() => setSelectedIndicator(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Wellness Details: {selectedIndicator?.profiles?.full_name}</DialogTitle>
            </DialogHeader>
            {selectedIndicator && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Consecutive Work Days</p>
                      <p className="text-2xl font-bold">{selectedIndicator.consecutive_work_days}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg Daily Hours (7 days)</p>
                      <p className="text-2xl font-bold">{selectedIndicator.avg_daily_hours_last_7_days?.toFixed(1)}h</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Overtime (30 days)</p>
                      <p className="text-2xl font-bold">{selectedIndicator.total_overtime_hours_last_30_days?.toFixed(1)}h</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Overall Wellness</p>
                      <p className="text-2xl font-bold">{selectedIndicator.overall_wellness_score}%</p>
                    </div>
                  </div>

                  {/* Risk Scores */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Fatigue Risk</span>
                        <span className="text-sm font-bold">{selectedIndicator.fatigue_risk_score}%</span>
                      </div>
                      <Progress value={selectedIndicator.fatigue_risk_score} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Burnout Risk</span>
                        <span className="text-sm font-bold">{selectedIndicator.burnout_risk_score}%</span>
                      </div>
                      <Progress value={selectedIndicator.burnout_risk_score} className="h-3" />
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {selectedIndicator.ai_analysis && (
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        AI Analysis
                        {selectedIndicator.ai_confidence_score && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(selectedIndicator.ai_confidence_score * 100)}% confidence
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                        {selectedIndicator.ai_analysis}
                      </p>

                      {selectedIndicator.ai_recommendations && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Recommendations</h5>
                          {selectedIndicator.ai_recommendations.map((rec, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-sm"><strong>For Employee:</strong> {rec.for_employee}</p>
                              {rec.for_manager && (
                                <p className="text-sm mt-1"><strong>For Manager:</strong> {rec.for_manager}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Last calculated: {format(new Date(selectedIndicator.calculated_at), "PPp")}
                  </p>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}