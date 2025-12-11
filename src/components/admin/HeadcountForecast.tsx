import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  Building2,
  Target,
  Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface Company {
  id: string;
  name: string;
}

export function HeadcountForecast() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    
    if (data) setCompanies(data);
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

  const getConfidenceBadgeVariant = (level: string) => {
    switch (level) {
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-success";
      case "medium":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  // Prepare chart data
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

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
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
              <Badge 
                variant={getConfidenceBadgeVariant(forecast.confidenceLevel)}
                className={getConfidenceColor(forecast.confidenceLevel)}
              >
                <Target className="h-3 w-3 mr-1" />
                {forecast.confidenceLevel.charAt(0).toUpperCase() + forecast.confidenceLevel.slice(1)} Confidence
              </Badge>
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
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Forecast Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{forecast.summary}</p>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
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
                    <Line
                      type="monotone"
                      dataKey="requests"
                      name="Requests"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="netChange"
                      name="Net Change"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Dashed lines indicate AI-predicted values
              </p>
            </CardContent>
          </Card>

          {/* Forecast Details */}
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

          {/* Insights Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Trends */}
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

            {/* High Demand Departments */}
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

            {/* Risks */}
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

            {/* Recommendations */}
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
    </div>
  );
}
