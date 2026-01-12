import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { Users, AlertTriangle, Target, TrendingUp } from "lucide-react";

interface DistributionData {
  rating: number;
  label: string;
  count: number;
  percentage: number;
  target?: number;
  color: string;
}

interface DepartmentDistribution {
  department: string;
  avgRating: number;
  count: number;
  distribution: number[];
}

interface PerformanceDistributionProps {
  companyId: string;
  cycleId?: string;
}

// Mock data
const generateDistributionData = (): DistributionData[] => [
  { rating: 1, label: "Needs Improvement", count: 12, percentage: 4, target: 5, color: "#ef4444" },
  { rating: 2, label: "Developing", count: 45, percentage: 15, target: 15, color: "#f97316" },
  { rating: 3, label: "Meets Expectations", count: 180, percentage: 60, target: 60, color: "#eab308" },
  { rating: 4, label: "Exceeds", count: 48, percentage: 16, target: 15, color: "#22c55e" },
  { rating: 5, label: "Outstanding", count: 15, percentage: 5, target: 5, color: "#10b981" },
];

const generateDepartmentData = (): DepartmentDistribution[] => [
  { department: "Engineering", avgRating: 3.8, count: 85, distribution: [2, 8, 45, 25, 5] },
  { department: "Sales", avgRating: 3.5, count: 62, distribution: [3, 10, 35, 12, 2] },
  { department: "Marketing", avgRating: 3.6, count: 38, distribution: [1, 5, 22, 8, 2] },
  { department: "Operations", avgRating: 3.4, count: 55, distribution: [4, 12, 30, 7, 2] },
  { department: "HR", avgRating: 3.7, count: 28, distribution: [1, 4, 16, 5, 2] },
  { department: "Finance", avgRating: 3.6, count: 32, distribution: [1, 6, 18, 5, 2] },
];

export function PerformanceDistribution({ companyId, cycleId }: PerformanceDistributionProps) {
  const distributionData = generateDistributionData();
  const departmentData = generateDepartmentData();

  const totalCount = useMemo(() => 
    distributionData.reduce((sum, d) => sum + d.count, 0), 
    [distributionData]
  );

  const distributionDeviation = useMemo(() => {
    return distributionData.reduce((sum, d) => {
      const deviation = Math.abs((d.percentage || 0) - (d.target || 0));
      return sum + deviation;
    }, 0);
  }, [distributionData]);

  const isDistributionHealthy = distributionDeviation < 10;

  const pieData = distributionData.map(d => ({
    name: d.label,
    value: d.count,
    fill: d.color,
  }));

  return (
    <div className="space-y-6">
      {/* Distribution Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Performance Distribution
              </CardTitle>
              <CardDescription>
                Rating distribution across the organization
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={isDistributionHealthy 
                ? "bg-green-500/10 text-green-600 border-green-200" 
                : "bg-yellow-500/10 text-yellow-600 border-yellow-200"
              }
            >
              {isDistributionHealthy ? (
                <>
                  <Target className="h-3 w-3 mr-1" />
                  On Target
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs Calibration
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 'auto']} />
                  <YAxis 
                    type="category" 
                    dataKey="label" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} employees (${((value / totalCount) * 100).toFixed(1)}%)`,
                      name
                    ]}
                  />
                  <Bar dataKey="count" name="Employees" radius={[0, 4, 4, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Target vs Actual */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium">Target vs Actual Distribution</h4>
            {distributionData.map((d) => {
              const deviation = (d.percentage || 0) - (d.target || 0);
              const isOver = deviation > 2;
              const isUnder = deviation < -2;
              
              return (
                <div key={d.rating} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: d.color }}
                      />
                      <span>{d.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">Target: {d.target}%</span>
                      <span className={
                        isOver ? "text-yellow-600 font-medium" : 
                        isUnder ? "text-red-600 font-medium" : 
                        "text-green-600 font-medium"
                      }>
                        Actual: {d.percentage}%
                        {isOver && " ↑"}
                        {isUnder && " ↓"}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={d.percentage} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 w-0.5 bg-foreground/50"
                      style={{ left: `${d.target}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Department Performance
          </CardTitle>
          <CardDescription>
            Performance comparison across departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value.toFixed(2),
                    name
                  ]}
                />
                <Bar 
                  dataKey="avgRating" 
                  name="Avg Rating" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Table */}
          <div className="mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Department</th>
                  <th className="text-center py-2 font-medium">Employees</th>
                  <th className="text-center py-2 font-medium">Avg Rating</th>
                  <th className="text-right py-2 font-medium">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept) => (
                  <tr key={dept.department} className="border-b last:border-0">
                    <td className="py-3 font-medium">{dept.department}</td>
                    <td className="py-3 text-center text-muted-foreground">{dept.count}</td>
                    <td className="py-3 text-center">
                      <Badge 
                        variant="outline" 
                        className={
                          dept.avgRating >= 3.7 ? "bg-green-500/10 text-green-600" :
                          dept.avgRating >= 3.3 ? "bg-yellow-500/10 text-yellow-600" :
                          "bg-red-500/10 text-red-600"
                        }
                      >
                        {dept.avgRating.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        {dept.distribution.map((count, idx) => (
                          <div
                            key={idx}
                            className="h-4 rounded-sm"
                            style={{
                              width: `${Math.max(count, 2)}px`,
                              backgroundColor: distributionData[idx]?.color || '#888',
                            }}
                            title={`${distributionData[idx]?.label}: ${count}`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
