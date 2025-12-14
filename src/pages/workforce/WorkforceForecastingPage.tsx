import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Target, Activity, Zap, FlaskConical, Lightbulb, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { HeadcountForecast } from "@/components/admin/HeadcountForecast";
import { ScenarioPlanning, ScenarioParameters } from "@/components/admin/ScenarioPlanning";
import { WhatIfAnalysis } from "@/components/admin/WhatIfAnalysis";
import { MonteCarloSimulation } from "@/components/admin/MonteCarloSimulation";
import { SensitivityAnalysis } from "@/components/admin/SensitivityAnalysis";
import { StressTestAnalysis } from "@/components/admin/StressTestAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

// Default scenarios for analysis tabs when none are loaded
const defaultScenarios: ScenarioParameters[] = [
  {
    id: "default-conservative",
    name: "Conservative Growth",
    description: "Low-risk growth scenario",
    growthRate: 5,
    attritionRate: 10,
    budgetConstraint: 3,
    timeHorizon: 12,
    seasonalAdjustment: true,
    aggressiveHiring: false,
  },
  {
    id: "default-moderate",
    name: "Moderate Expansion",
    description: "Balanced growth scenario",
    growthRate: 15,
    attritionRate: 12,
    budgetConstraint: 8,
    timeHorizon: 12,
    seasonalAdjustment: true,
    aggressiveHiring: false,
  },
  {
    id: "default-aggressive",
    name: "Aggressive Growth",
    description: "High-growth scenario",
    growthRate: 30,
    attritionRate: 15,
    budgetConstraint: 15,
    timeHorizon: 12,
    seasonalAdjustment: true,
    aggressiveHiring: true,
  },
];

export default function WorkforceForecastingPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("headcount");
  const [currentHeadcount, setCurrentHeadcount] = useState(0);

  useEffect(() => {
    fetchHeadcount();
  }, []);

  const fetchHeadcount = async () => {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    setCurrentHeadcount(count || 0);
  };

  const tabs = [
    { id: "headcount", label: t("workforce.forecasting.headcountForecast"), icon: TrendingUp },
    { id: "scenario", label: t("workforce.forecasting.scenarioPlanning"), icon: Target },
    { id: "whatif", label: t("workforce.forecasting.whatIfAnalysis"), icon: Zap },
    { id: "montecarlo", label: t("workforce.forecasting.monteCarlo"), icon: Activity },
    { id: "sensitivity", label: t("workforce.forecasting.sensitivityAnalysis"), icon: FlaskConical },
    { id: "stress", label: t("workforce.forecasting.stressTesting"), icon: Lightbulb },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/workforce">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("navigation.workforce")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("workforce.forecasting.title")}</h1>
            <p className="text-muted-foreground">
              {t("workforce.forecasting.subtitle")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="headcount" className="m-0">
              <HeadcountForecast />
            </TabsContent>

            <TabsContent value="scenario" className="m-0">
              <ScenarioPlanning currentHeadcount={currentHeadcount} />
            </TabsContent>

            <TabsContent value="whatif" className="m-0">
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <CardDescription>
                      {t("workforce.forecasting.defaultScenariosNote")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <WhatIfAnalysis 
                scenarios={defaultScenarios} 
                currentHeadcount={currentHeadcount} 
              />
            </TabsContent>

            <TabsContent value="montecarlo" className="m-0">
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <CardDescription>
                      {t("workforce.forecasting.defaultScenariosNote")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <MonteCarloSimulation 
                scenarios={defaultScenarios} 
                currentHeadcount={currentHeadcount} 
              />
            </TabsContent>

            <TabsContent value="sensitivity" className="m-0">
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <CardDescription>
                      {t("workforce.forecasting.defaultScenariosNote")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <SensitivityAnalysis 
                scenarios={defaultScenarios} 
                currentHeadcount={currentHeadcount} 
              />
            </TabsContent>

            <TabsContent value="stress" className="m-0">
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <CardDescription>
                      {t("workforce.forecasting.defaultScenariosNote")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <StressTestAnalysis 
                scenarios={defaultScenarios} 
                currentHeadcount={currentHeadcount} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
