import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Brain, ArrowLeft } from "lucide-react";
import { HeadcountForecast } from "@/components/admin/HeadcountForecast";
import { NavLink, useSearchParams } from "react-router-dom";

export default function HeadcountForecastPage() {
  const [searchParams] = useSearchParams();
  const sharedScenarioToken = searchParams.get("scenario");

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Workforce", href: "/workforce" },
            { label: "Headcount Forecast" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink
              to="/workforce"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                <Brain className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Headcount Forecast
                </h1>
                <p className="text-muted-foreground">
                  AI-powered workforce forecasting
                </p>
              </div>
            </div>
          </div>
        </div>

        <HeadcountForecast sharedScenarioToken={sharedScenarioToken || undefined} />
      </div>
    </AppLayout>
  );
}
