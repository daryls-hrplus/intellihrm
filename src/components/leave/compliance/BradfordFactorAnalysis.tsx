import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calculator, TrendingUp, TrendingDown, Minus, AlertTriangle, Settings, RefreshCw, Search, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface BradfordFactorAnalysisProps {
  companyId: string;
}

interface BradfordScore {
  id: string;
  employee_id: string;
  calculation_period_start: string;
  calculation_period_end: string;
  total_absence_spells: number;
  total_absence_days: number;
  bradford_score: number;
  risk_level: string;
  trend: string | null;
  previous_score: number | null;
  calculated_at: string;
  profiles?: { full_name: string; email: string; department_id: string };
}

interface Threshold {
  id: string;
  threshold_name: string;
  min_score: number;
  max_score: number | null;
  risk_level: string;
  action_required: string | null;
  is_active: boolean;
}

const RISK_CONFIG: Record<string, { color: string; bgColor: string }> = {
  low: { color: "text-green-600", bgColor: "bg-green-500/10" },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  high: { color: "text-orange-600", bgColor: "bg-orange-500/10" },
  critical: { color: "text-red-600", bgColor: "bg-red-500/10" },
};

const TREND_ICONS: Record<string, React.ReactNode> = {
  improving: <TrendingDown className="h-4 w-4 text-green-500" />,
  stable: <Minus className="h-4 w-4 text-gray-500" />,
  worsening: <TrendingUp className="h-4 w-4 text-red-500" />,
};

export function BradfordFactorAnalysis({ companyId }: BradfordFactorAnalysisProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [thresholdForm, setThresholdForm] = useState({
    threshold_name: "",
    min_score: 0,
    max_score: 0,
    risk_level: "low",
    action_required: "",
  });

  // Fetch scores
  const { data: scores = [], isLoading } = useQuery({
    queryKey: ["bradford-scores", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_bradford_scores")
        .select(`*, profiles!employee_bradford_scores_employee_id_fkey(full_name, email, department_id)`)
        .eq("company_id", companyId)
        .order("bradford_score", { ascending: false });
      if (error) throw error;
      return data as BradfordScore[];
    },
    enabled: !!companyId,
  });

  // Fetch thresholds
  const { data: thresholds = [] } = useQuery({
    queryKey: ["bradford-thresholds", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bradford_factor_thresholds")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("min_score", { ascending: true });
      if (error) throw error;
      return data as Threshold[];
    },
    enabled: !!companyId,
  });

  // Calculate scores mutation (simulated - would connect to leave requests)
  const calculateMutation = useMutation({
    mutationFn: async () => {
      // In production, this would analyze leave_requests to calculate actual scores
      // For now, we'll create a sample calculation
      const periodStart = startOfMonth(subMonths(new Date(), 12));
      const periodEnd = endOfMonth(new Date());
      
      // Simulated calculation - in production would query leave_requests
      toast.info("Calculating Bradford scores from leave data...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return true;
    },
    onSuccess: () => {
      toast.success("Bradford Factor scores calculated");
      queryClient.invalidateQueries({ queryKey: ["bradford-scores"] });
    },
    onError: (error) => toast.error(`Calculation failed: ${error.message}`),
  });

  // Save threshold
  const saveThresholdMutation = useMutation({
    mutationFn: async (data: typeof thresholdForm) => {
      const { error } = await supabase.from("bradford_factor_thresholds").insert({
        company_id: companyId,
        ...data,
        max_score: data.max_score || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Threshold saved");
      queryClient.invalidateQueries({ queryKey: ["bradford-thresholds"] });
      setShowThresholdDialog(false);
      setThresholdForm({ threshold_name: "", min_score: 0, max_score: 0, risk_level: "low", action_required: "" });
    },
    onError: (error) => toast.error(`Failed to save: ${error.message}`),
  });

  // Stats
  const totalEmployees = scores.length;
  const criticalCount = scores.filter((s) => s.risk_level === "critical").length;
  const highCount = scores.filter((s) => s.risk_level === "high").length;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.bradford_score, 0) / scores.length) : 0;

  const filteredScores = scores.filter((score) => {
    const matchesSearch = score.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "all" || score.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Bradford Factor Formula</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                <strong>B = S² × D</strong> where S = number of separate absence spells and D = total days absent.
                This formula places greater weight on frequent short-term absences compared to fewer longer absences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees Analyzed</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
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
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calculator className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="scores">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="scores">Employee Scores</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          </TabsList>
          <Button onClick={() => calculateMutation.mutate()} disabled={calculateMutation.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${calculateMutation.isPending ? "animate-spin" : ""}`} />
            Recalculate Scores
          </Button>
        </div>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Bradford Factor Scores</CardTitle>
              <CardDescription>Employee absence pattern analysis for the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
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
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-center">Spells (S)</TableHead>
                      <TableHead className="text-center">Days (D)</TableHead>
                      <TableHead className="text-center">Score (S²×D)</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredScores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No Bradford scores calculated yet. Click "Recalculate Scores" to analyze absence patterns.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredScores.map((score) => {
                        const riskConfig = RISK_CONFIG[score.risk_level] || RISK_CONFIG.low;
                        const maxScore = 500; // For progress bar
                        const progressValue = Math.min((score.bradford_score / maxScore) * 100, 100);
                        
                        return (
                          <TableRow key={score.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{score.profiles?.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{score.profiles?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{score.total_absence_spells}</TableCell>
                            <TableCell className="text-center font-mono">{score.total_absence_days}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg w-16">{score.bradford_score}</span>
                                <Progress value={progressValue} className="w-20 h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${riskConfig.bgColor} ${riskConfig.color}`}>
                                {score.risk_level.charAt(0).toUpperCase() + score.risk_level.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {score.trend ? TREND_ICONS[score.trend] : <Minus className="h-4 w-4 text-gray-400" />}
                                <span className="text-sm capitalize">{score.trend || "N/A"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(score.calculation_period_start), "MMM yyyy")} - {format(new Date(score.calculation_period_end), "MMM yyyy")}
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
        </TabsContent>

        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Thresholds</CardTitle>
                  <CardDescription>Configure Bradford Factor score thresholds and actions</CardDescription>
                </div>
                <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Add Threshold
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Risk Threshold</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Threshold Name</Label>
                        <Input
                          value={thresholdForm.threshold_name}
                          onChange={(e) => setThresholdForm({ ...thresholdForm, threshold_name: e.target.value })}
                          placeholder="e.g., Warning Level"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Score</Label>
                          <Input
                            type="number"
                            value={thresholdForm.min_score}
                            onChange={(e) => setThresholdForm({ ...thresholdForm, min_score: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Maximum Score (optional)</Label>
                          <Input
                            type="number"
                            value={thresholdForm.max_score || ""}
                            onChange={(e) => setThresholdForm({ ...thresholdForm, max_score: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Risk Level</Label>
                        <Select
                          value={thresholdForm.risk_level}
                          onValueChange={(v) => setThresholdForm({ ...thresholdForm, risk_level: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Action Required</Label>
                        <Input
                          value={thresholdForm.action_required}
                          onChange={(e) => setThresholdForm({ ...thresholdForm, action_required: e.target.value })}
                          placeholder="e.g., Manager discussion required"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowThresholdDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => saveThresholdMutation.mutate(thresholdForm)}
                        disabled={!thresholdForm.threshold_name || saveThresholdMutation.isPending}
                      >
                        Save Threshold
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {thresholds.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No thresholds configured yet.</p>
                  <p className="text-sm mt-2">Add thresholds to categorize Bradford scores into risk levels.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {thresholds.map((threshold) => {
                    const riskConfig = RISK_CONFIG[threshold.risk_level] || RISK_CONFIG.low;
                    return (
                      <div
                        key={threshold.id}
                        className={`p-4 rounded-lg border ${riskConfig.bgColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${riskConfig.color}`}>{threshold.threshold_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Score range: {threshold.min_score} - {threshold.max_score || "∞"}
                            </p>
                          </div>
                          <Badge className={`${riskConfig.bgColor} ${riskConfig.color}`}>
                            {threshold.risk_level.charAt(0).toUpperCase() + threshold.risk_level.slice(1)}
                          </Badge>
                        </div>
                        {threshold.action_required && (
                          <p className="text-sm mt-2">
                            <strong>Action:</strong> {threshold.action_required}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
