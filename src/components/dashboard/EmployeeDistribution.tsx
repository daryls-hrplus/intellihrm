import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEmployeeDistribution } from "@/hooks/useDashboardData";
import { Loader2 } from "lucide-react";

export function EmployeeDistribution() {
  const { t } = useTranslation();
  const { data, isLoading } = useEmployeeDistribution();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "500ms" }}>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          {t("dashboard.employeeDistribution", "Employee Distribution")}
        </h3>
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "500ms" }}>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          {t("dashboard.employeeDistribution", "Employee Distribution")}
        </h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          {t("dashboard.noData", "No data available")}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "500ms" }}>
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">
        {t("dashboard.employeeDistribution", "Employee Distribution")}
      </h3>
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
