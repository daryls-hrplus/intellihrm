import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  Building2,
  Target,
  Loader2,
  Save,
  History,
  GitCompare,
  Trash2,
  Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";

interface ForecastData {
  forecast: {
    month1: { month: string; predictedRequests: number; predictedNetChange: number };
    month2: { month: string; predictedRequests: number; predictedNetChange: number };
    month3: { month: string; predictedRequests: number; predictedNetChange: number };
  };
  trends: string[];
  highDemandDepartments: string[];
  risks: string[];
  recommendations: string[];
  confidenceLevel: "low" | "medium" | "high";
  summary: string;
}

interface HistoricalData {
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  approvalRate: string;
  netHeadcountChange: number;
  monthlyTrend: Record<string, { requests: number; approved: number; netChange: number }>;
  currentVacancies: number;
  fillRate: string;
}

interface SavedForecast {
  id: string;
  company_id: string | null;
  created_by: string;
  created_at: string;
  forecast_data: ForecastData;
  historical_data: HistoricalData;
  name: string | null;
  notes: string | null;
}

interface Company {
  id: string;
  name: string;
}

export function HeadcountForecast() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  
  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [forecastName, setForecastName] = useState("");
  const [forecastNotes, setForecastNotes] = useState("");
  
  // Saved forecasts state
  const [savedForecasts, setSavedForecasts] = useState<SavedForecast[]>([]);
  const [loadingForecasts, setLoadingForecasts] = useState(false);
  
  // Comparison state
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [comparisonForecasts, setComparisonForecasts] = useState<SavedForecast[]>([]);

  useEffect(() => {
    fetchCompanies();
    fetchSavedForecasts();
  }, []);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    
    if (data) setCompanies(data);
  };

  const fetchSavedForecasts = async () => {
    setLoadingForecasts(true);
    const { data, error } = await supabase
      .from("headcount_forecasts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (error) {
      console.error("Error fetching forecasts:", error);
    } else if (data) {
      setSavedForecasts(data.map(d => ({
        ...d,
        forecast_data: d.forecast_data as unknown as ForecastData,
        historical_data: d.historical_data as unknown as HistoricalData,
      })));
    }
    setLoadingForecasts(false);
  };

  const generateForecast = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("headcount-forecast", {
        body: { companyId: selectedCompany === "all" ? null : selectedCompany },
      });

      if (fnError) throw fnError;

      if (data?.success) {
        setForecast(data.forecast);
        setHistoricalData(data.historicalData);
        toast.success("Forecast generated successfully");
      } else {
        throw new Error(data?.error || "Failed to generate forecast");
      }
    } catch (err: any) {
      console.error("Forecast error:", err);
      const message = err.message || "Failed to generate forecast";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveForecast = async () => {
    if (!forecast || !historicalData || !user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("headcount_forecasts")
        .insert({
          company_id: selectedCompany === "all" ? null : selectedCompany,
          created_by: user.id,
          forecast_data: forecast as unknown as Json,
          historical_data: historicalData as unknown as Json,
          name: forecastName || `Forecast ${format(new Date(), "MMM d, yyyy HH:mm")}`,
          notes: forecastNotes || null,
        });

      if (error) throw error;

      toast.success("Forecast saved successfully");
      setShowSaveDialog(false);
      setForecastName("");
      setForecastNotes("");
      fetchSavedForecasts();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save forecast");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteForecast = async (id: string) => {
    try {
      const { error } = await supabase
        .from("headcount_forecasts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Forecast deleted");
      setSavedForecasts(prev => prev.filter(f => f.id !== id));
      setSelectedForComparison(prev => prev.filter(fId => fId !== id));
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Failed to delete forecast");
    }
  };

  const toggleComparisonSelection = (id: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(fId => fId !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id]; // Replace oldest selection
      }
      return [...prev, id];
    });
  };

  const loadComparison = () => {
    const forecasts = savedForecasts.filter(f => selectedForComparison.includes(f.id));
    setComparisonForecasts(forecasts);
    setActiveTab("compare");
  };

  const getConfidenceBadgeVariant = (level: string) => {
    switch (level) {
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high": return "text-success";
      case "medium": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "All Companies";
    return companies.find(c => c.id === companyId)?.name || "Unknown";
  };

  // Prepare chart data for current forecast
  const chartData = forecast && historicalData ? [
    ...Object.entries(historicalData.monthlyTrend).map(([month, data]) => ({
      month,
      requests: data.requests,
      netChange: data.netChange,
      type: "historical",
    })),
    {
      month: forecast.forecast.month1.month,
      requests: forecast.forecast.month1.predictedRequests,
      netChange: forecast.forecast.month1.predictedNetChange,
      type: "forecast",
    },
    {
      month: forecast.forecast.month2.month,
      requests: forecast.forecast.month2.predictedRequests,
      netChange: forecast.forecast.month2.predictedNetChange,
      type: "forecast",
    },
    {
      month: forecast.forecast.month3.month,
      requests: forecast.forecast.month3.predictedRequests,
      netChange: forecast.forecast.month3.predictedNetChange,
      type: "forecast",
    },
  ] : [];

  // Prepare comparison chart data
  const comparisonChartData = comparisonForecasts.length === 2 ? [
    { 
      label: "Month 1",
      forecast1: comparisonForecasts[0].forecast_data.forecast.month1.predictedNetChange,
      forecast2: comparisonForecasts[1].forecast_data.forecast.month1.predictedNetChange,
    },
    { 
      label: "Month 2",
      forecast1: comparisonForecasts[0].forecast_data.forecast.month2.predictedNetChange,
      forecast2: comparisonForecasts[1].forecast_data.forecast.month2.predictedNetChange,
    },
    { 
      label: "Month 3",
      forecast1: comparisonForecasts[0].forecast_data.forecast.month3.predictedNetChange,
      forecast2: comparisonForecasts[1].forecast_data.forecast.month3.predictedNetChange,
    },
  ] : [];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Saved ({savedForecasts.length})
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2" disabled={comparisonForecasts.length < 2}>
            <GitCompare className="h-4 w-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI-Powered Headcount Forecast
              </CardTitle>
              <CardDescription>
                Analyze historical trends and predict future headcount needs using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateForecast} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Forecast
                    </>
                  )}
                </Button>
                {forecast && (
                  <>
                    <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Forecast
                    </Button>
                    <Badge 
                      variant={getConfidenceBadgeVariant(forecast.confidenceLevel)}
                      className={getConfidenceColor(forecast.confidenceLevel)}
                    >
                      <Target className="h-3 w-3 mr-1" />
                      {forecast.confidenceLevel.charAt(0).toUpperCase() + forecast.confidenceLevel.slice(1)} Confidence
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {forecast && historicalData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forecast Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{forecast.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Headcount Trend & Forecast</CardTitle>
                  <CardDescription>Historical data and 3-month prediction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Legend />
                        <Line type="monotone" dataKey="requests" name="Requests" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                        <Line type="monotone" dataKey="netChange" name="Net Change" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                {[forecast.forecast.month1, forecast.forecast.month2, forecast.forecast.month3].map((m, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{m.month}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Predicted Requests</span>
                          <span className="font-semibold">{m.predictedRequests}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Net Change</span>
                          <span className={`font-semibold flex items-center gap-1 ${m.predictedNetChange >= 0 ? "text-success" : "text-destructive"}`}>
                            {m.predictedNetChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {m.predictedNetChange >= 0 ? "+" : ""}{m.predictedNetChange}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Key Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {forecast.trends.map((trend, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-warning" />
                      High Demand Departments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {forecast.highDemandDepartments.map((dept, i) => (
                        <Badge key={i} variant="secondary">{dept}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {forecast.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-destructive mt-1">!</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-success" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {forecast.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-success mt-1">✓</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {!forecast && !isLoading && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Forecast Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Generate Forecast" to analyze historical data and predict future headcount needs.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Saved Forecasts Tab */}
        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Saved Forecasts
                </span>
                {selectedForComparison.length === 2 && (
                  <Button size="sm" onClick={loadComparison}>
                    <GitCompare className="h-4 w-4 mr-2" />
                    Compare Selected
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Select up to 2 forecasts to compare. Click on a forecast to select it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingForecasts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedForecasts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No saved forecasts. Generate and save a forecast first.
                </div>
              ) : (
                <div className="space-y-3">
                  {savedForecasts.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => toggleComparisonSelection(f.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedForComparison.includes(f.id) 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{f.name || "Unnamed Forecast"}</h4>
                            <Badge variant={getConfidenceBadgeVariant(f.forecast_data.confidenceLevel)} className="text-xs">
                              {f.forecast_data.confidenceLevel}
                            </Badge>
                            {selectedForComparison.includes(f.id) && (
                              <Badge variant="default" className="text-xs">Selected</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(f.created_at), "MMM d, yyyy HH:mm")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {getCompanyName(f.company_id)}
                            </span>
                          </div>
                          {f.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{f.notes}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>M1: <strong className={f.forecast_data.forecast.month1.predictedNetChange >= 0 ? "text-success" : "text-destructive"}>
                              {f.forecast_data.forecast.month1.predictedNetChange >= 0 ? "+" : ""}{f.forecast_data.forecast.month1.predictedNetChange}
                            </strong></span>
                            <span>M2: <strong className={f.forecast_data.forecast.month2.predictedNetChange >= 0 ? "text-success" : "text-destructive"}>
                              {f.forecast_data.forecast.month2.predictedNetChange >= 0 ? "+" : ""}{f.forecast_data.forecast.month2.predictedNetChange}
                            </strong></span>
                            <span>M3: <strong className={f.forecast_data.forecast.month3.predictedNetChange >= 0 ? "text-success" : "text-destructive"}>
                              {f.forecast_data.forecast.month3.predictedNetChange >= 0 ? "+" : ""}{f.forecast_data.forecast.month3.predictedNetChange}
                            </strong></span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteForecast(f.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          {comparisonForecasts.length === 2 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5 text-primary" />
                    Forecast Comparison
                  </CardTitle>
                  <CardDescription>
                    Comparing "{comparisonForecasts[0].name}" vs "{comparisonForecasts[1].name}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="forecast1" name={comparisonForecasts[0].name || "Forecast 1"} fill="hsl(var(--primary))" />
                        <Bar dataKey="forecast2" name={comparisonForecasts[1].name || "Forecast 2"} fill="hsl(var(--secondary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {comparisonForecasts.map((f, idx) => (
                  <Card key={f.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{f.name || `Forecast ${idx + 1}`}</CardTitle>
                      <CardDescription>
                        {format(new Date(f.created_at), "MMM d, yyyy HH:mm")} • {getCompanyName(f.company_id)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Predicted Net Changes</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[f.forecast_data.forecast.month1, f.forecast_data.forecast.month2, f.forecast_data.forecast.month3].map((m, i) => (
                            <div key={i} className="text-center p-2 rounded bg-muted">
                              <div className="text-xs text-muted-foreground">{m.month}</div>
                              <div className={`font-semibold ${m.predictedNetChange >= 0 ? "text-success" : "text-destructive"}`}>
                                {m.predictedNetChange >= 0 ? "+" : ""}{m.predictedNetChange}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{f.forecast_data.summary}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Confidence</h4>
                        <Badge variant={getConfidenceBadgeVariant(f.forecast_data.confidenceLevel)}>
                          {f.forecast_data.confidenceLevel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Forecasts Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Go to the "Saved" tab and select 2 forecasts to compare.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("saved")}>
                  <History className="h-4 w-4 mr-2" />
                  View Saved Forecasts
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Forecast</DialogTitle>
            <DialogDescription>
              Give this forecast a name and optional notes for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder={`Forecast ${format(new Date(), "MMM d, yyyy")}`}
                value={forecastName}
                onChange={(e) => setForecastName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any context or notes about this forecast..."
                value={forecastNotes}
                onChange={(e) => setForecastNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveForecast} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
