import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Engineering", value: 145, color: "hsl(168, 76%, 36%)" },
  { name: "Sales", value: 89, color: "hsl(199, 89%, 48%)" },
  { name: "Marketing", value: 56, color: "hsl(38, 92%, 50%)" },
  { name: "Operations", value: 78, color: "hsl(142, 76%, 36%)" },
  { name: "HR", value: 32, color: "hsl(280, 65%, 60%)" },
];

export function EmployeeDistribution() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "500ms" }}>
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Employee Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
