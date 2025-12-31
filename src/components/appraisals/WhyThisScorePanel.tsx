import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Scale, FileCheck, AlertTriangle, Sparkles } from "lucide-react";
import { useState } from "react";
import { ScoreBreakdown, getScoreComponents } from "@/hooks/useAppraisalScoreBreakdown";
import { PerformanceCategory } from "@/hooks/usePerformanceCategories";
import { PerformanceCategoryBadge } from "./PerformanceCategoryBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface WhyThisScorePanelProps {
  breakdown: ScoreBreakdown | null;
  category: PerformanceCategory | null;
  overallScore: number | null;
  isLoading?: boolean;
}

export function WhyThisScorePanel({ breakdown, category, overallScore, isLoading }: WhyThisScorePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const components = getScoreComponents(breakdown);
  const totalContribution = components.reduce((sum, c) => sum + (c.contribution || 0), 0);

  // Prepare chart data
  const chartData = components.map(c => ({
    name: c.name,
    contribution: c.contribution || 0,
    weight: c.weight || 0,
    rawScore: c.rawScore || 0,
    color: c.color,
  }));

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-muted-foreground">Raw Score: {data.rawScore.toFixed(2)}</p>
          <p className="text-muted-foreground">Weight: {data.weight.toFixed(0)}%</p>
          <p className="font-medium text-primary">Contribution: {data.contribution.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Why This Score?
              </CardTitle>
              <div className="flex items-center gap-3">
                <PerformanceCategoryBadge category={category} score={overallScore} showEligibility={false} size="sm" />
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Chart Type Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score Contribution</span>
              <div className="flex gap-1 border rounded-md p-0.5">
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chartType === "bar" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType("pie")}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chartType === "pie" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  Pie
                </button>
              </div>
            </div>

            {/* Score Contribution Chart */}
            {chartData.length > 0 && (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v) => v.toFixed(2)} />
                      <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        dataKey="contribution"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {/* Stacked Score Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Score</span>
                <span className="font-medium">{totalContribution.toFixed(2)} / 5.00</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex bg-muted">
                {components.map((component, idx) => (
                  <div
                    key={idx}
                    className="h-full transition-all"
                    style={{
                      width: `${((component.contribution || 0) / 5) * 100}%`,
                      backgroundColor: component.color,
                    }}
                    title={`${component.name}: ${(component.contribution || 0).toFixed(3)}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {components.map((component, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: component.color }} />
                    <span>{component.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead className="text-right">Raw Score</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: component.color }} />
                        {component.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{component.rawScore?.toFixed(2) || "—"}</TableCell>
                    <TableCell className="text-right">{component.weight?.toFixed(0)}%</TableCell>
                    <TableCell className="text-right font-medium">{component.contribution?.toFixed(3) || "—"}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{overallScore?.toFixed(2) || "—"}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                  <TableCell className="text-right">{totalContribution.toFixed(3)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Calibration Note */}
            {breakdown?.was_calibrated && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Scale className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-300">Score Calibrated</p>
                  <p className="text-amber-700 dark:text-amber-400">
                    Original: {breakdown.pre_calibration_score?.toFixed(2)} → 
                    Calibrated: {breakdown.post_calibration_score?.toFixed(2)} 
                    ({breakdown.calibration_adjustment && breakdown.calibration_adjustment > 0 ? "+" : ""}
                    {breakdown.calibration_adjustment?.toFixed(2)})
                  </p>
                  {breakdown.calibration_reason && (
                    <p className="text-amber-600 dark:text-amber-500 mt-1">{breakdown.calibration_reason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Evidence Summary */}
            {breakdown && (breakdown.evidence_count > 0 || breakdown.validated_evidence_count > 0) && (
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">{breakdown.evidence_count}</span> evidence items
                  {breakdown.validated_evidence_count > 0 && (
                    <span className="text-green-600 dark:text-green-400 ml-2">
                      ({breakdown.validated_evidence_count} validated)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* AI Flags */}
            {breakdown?.ai_flags && breakdown.ai_flags.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-300">AI Quality Flags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {breakdown.ai_flags.map((flag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900/30">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
