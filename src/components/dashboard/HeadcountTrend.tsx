import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", employees: 380 },
  { month: "Feb", employees: 385 },
  { month: "Mar", employees: 392 },
  { month: "Apr", employees: 388 },
  { month: "May", employees: 395 },
  { month: "Jun", employees: 402 },
  { month: "Jul", employees: 398 },
  { month: "Aug", employees: 410 },
  { month: "Sep", employees: 415 },
  { month: "Oct", employees: 420 },
  { month: "Nov", employees: 428 },
  { month: "Dec", employees: 435 },
];

export function HeadcountTrend() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "600ms" }}>
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Headcount Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="employees"
              stroke="hsl(168, 76%, 36%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEmployees)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
