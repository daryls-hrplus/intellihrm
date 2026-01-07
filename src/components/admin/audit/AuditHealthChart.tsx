import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { format, subDays } from "date-fns";
import { BarChart3 } from "lucide-react";

interface VolumeData {
  date: string;
  module: string;
  count: number;
}

interface AuditHealthChartProps {
  volumeData: VolumeData[];
  isLoading?: boolean;
}

// Color palette for modules
const moduleColors: Record<string, string> = {
  'Admin': 'hsl(var(--primary))',
  'Workforce': 'hsl(217, 91%, 60%)',
  'Payroll': 'hsl(142, 76%, 36%)',
  'Compensation': 'hsl(45, 93%, 47%)',
  'Benefits': 'hsl(340, 82%, 52%)',
  'Leave': 'hsl(262, 83%, 58%)',
  'Time & Attendance': 'hsl(199, 89%, 48%)',
  'Performance': 'hsl(24, 95%, 53%)',
  'Recruitment': 'hsl(280, 68%, 60%)',
  'Training': 'hsl(162, 73%, 46%)',
  'Succession': 'hsl(328, 85%, 70%)',
  'HSE': 'hsl(0, 72%, 51%)',
  'Employee Relations': 'hsl(210, 40%, 60%)',
  'ESS': 'hsl(180, 60%, 50%)',
  'MSS': 'hsl(200, 50%, 55%)',
};

export function AuditHealthChart({ volumeData, isLoading }: AuditHealthChartProps) {
  // Process data for stacked area chart
  const chartData = useMemo(() => {
    if (!volumeData.length) return [];

    // Get all unique dates and modules
    const dates = new Set<string>();
    const modules = new Set<string>();
    
    volumeData.forEach(v => {
      dates.add(v.date);
      modules.add(v.module);
    });

    // Create a map for quick lookups
    const dataMap = new Map<string, Record<string, number>>();
    volumeData.forEach(v => {
      const key = v.date;
      if (!dataMap.has(key)) {
        dataMap.set(key, {});
      }
      dataMap.get(key)![v.module] = v.count;
    });

    // Fill in missing dates
    const sortedDates = Array.from(dates).sort();
    const result = [];

    // Ensure we have all 7 days
    const endDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(endDate, i), 'yyyy-MM-dd');
      const displayDate = format(subDays(endDate, i), 'MMM d');
      
      const dayData: Record<string, unknown> = { 
        date, 
        displayDate,
        total: 0 
      };
      
      const existingData = dataMap.get(date) || {};
      modules.forEach(module => {
        dayData[module] = existingData[module] || 0;
        dayData.total = (dayData.total as number) + (dayData[module] as number);
      });
      
      result.push(dayData);
    }

    return result;
  }, [volumeData]);

  // Get active modules (those with data)
  const activeModules = useMemo(() => {
    const modules = new Set<string>();
    volumeData.forEach(v => modules.add(v.module));
    return Array.from(modules).sort();
  }, [volumeData]);

  const totalEvents = chartData.reduce((sum, d) => sum + (d.total as number), 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Volume (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Audit Volume (7 Days)
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalEvents.toLocaleString()} total events
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || totalEvents === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No audit data available for the past 7 days
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {activeModules.map((module, index) => (
                    <linearGradient 
                      key={module} 
                      id={`gradient-${index}`} 
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop 
                        offset="5%" 
                        stopColor={moduleColors[module] || `hsl(${index * 40}, 70%, 50%)`} 
                        stopOpacity={0.8}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={moduleColors[module] || `hsl(${index * 40}, 70%, 50%)`} 
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                  iconSize={10}
                />
                {activeModules.slice(0, 8).map((module, index) => (
                  <Area
                    key={module}
                    type="monotone"
                    dataKey={module}
                    stackId="1"
                    stroke={moduleColors[module] || `hsl(${index * 40}, 70%, 50%)`}
                    fill={`url(#gradient-${index})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
