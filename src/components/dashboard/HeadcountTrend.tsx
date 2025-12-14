import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useHeadcountTrend } from "@/hooks/useDashboardData";
import { Loader2 } from "lucide-react";

export function HeadcountTrend() {
  const { t } = useTranslation();
  const { data, isLoading } = useHeadcountTrend();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "600ms" }}>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          {t("dashboard.headcountTrend", "Headcount Trend")}
        </h3>
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "600ms" }}>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          {t("dashboard.headcountTrend", "Headcount Trend")}
        </h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          {t("dashboard.noData", "No data available")}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "600ms" }}>
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">
        {t("dashboard.headcountTrend", "Headcount Trend")}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
              stroke="hsl(var(--primary))"
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
