import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShiftCoverage } from "@/hooks/useShiftCoverage";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface ShiftCoverageTabProps {
  companyId: string;
}

export function ShiftCoverageTab({ companyId }: ShiftCoverageTabProps) {
  const { t } = useTranslation();
  const { 
    coverageSnapshots, 
    costProjections, 
    demandForecasts, 
    isLoading, 
    getCoverageMetrics, 
    getCostMetrics 
  } = useShiftCoverage(companyId);

  const coverageMetrics = getCoverageMetrics();
  const costMetrics = getCostMetrics();

  // Prepare chart data
  const coverageChartData = coverageSnapshots
    .slice(0, 30)
    .reverse()
    .map(s => ({
      date: formatDateForDisplay(s.snapshot_date),
      coverage: s.coverage_percentage || 0,
      scheduled: s.scheduled_headcount,
      required: s.required_headcount,
    }));

  const costChartData = costProjections
    .slice(0, 30)
    .reverse()
    .map(p => ({
      date: formatDateForDisplay(p.projection_date),
      regular: p.regular_cost,
      overtime: p.overtime_cost,
      premium: p.premium_cost,
      total: p.total_cost,
    }));

  const forecastChartData = demandForecasts
    .slice(0, 30)
    .map(f => ({
      date: formatDateForDisplay(f.forecast_date),
      predicted: f.predicted_demand,
      actual: f.actual_demand || 0,
      confidence: f.confidence_level || 0,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t("timeAttendance.shifts.coverage.title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.coverage.demandForecasts")}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{coverageMetrics.avgCoverage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Coverage</div>
              </div>
              <div className={`p-3 rounded-full ${coverageMetrics.avgCoverage >= 95 ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                <Users className={`h-6 w-6 ${coverageMetrics.avgCoverage >= 95 ? "text-green-500" : "text-amber-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{coverageMetrics.understaffedDays}</div>
                <div className="text-sm text-muted-foreground">Understaffed Days</div>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${costMetrics.totalProjectedCost.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Projected Labor Cost</div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{costMetrics.overtimePercentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Overtime Rate</div>
              </div>
              <div className={`p-3 rounded-full ${costMetrics.overtimePercentage > 10 ? "bg-amber-500/10" : "bg-green-500/10"}`}>
                <Clock className={`h-6 w-6 ${costMetrics.overtimePercentage > 10 ? "text-amber-500" : "text-green-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coverage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staffing Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coverageChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No coverage data available
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={coverageChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="coverage" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.2}
                      name="Coverage %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Labor Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {costChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No cost data available
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="regular" stackId="a" fill="#3b82f6" name="Regular" />
                    <Bar dataKey="overtime" stackId="a" fill="#f59e0b" name="Overtime" />
                    <Bar dataKey="premium" stackId="a" fill="#8b5cf6" name="Premium" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Demand Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Demand Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecastChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No forecast data available</p>
                <p className="text-sm">AI forecasting will generate predictions based on historical data</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2}
                    name="Predicted Demand"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2}
                    name="Actual Demand"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {coverageMetrics.understaffedDays > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <div className="font-medium">Staffing Alert</div>
                <p className="text-sm text-muted-foreground">
                  {coverageMetrics.understaffedDays} days with understaffing detected. 
                  Total of {coverageMetrics.totalUnderstaffedHours.toFixed(1)} understaffed hours.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
