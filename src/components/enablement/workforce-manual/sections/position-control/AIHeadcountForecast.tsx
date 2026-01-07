import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertTriangle,
  Lightbulb,
  Save,
  History,
  GitCompare,
  Building2,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";
import { ScreenshotPlaceholder } from "@/components/enablement/manual/components/ScreenshotPlaceholder";

export function AIHeadcountForecast() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.5</Badge>
          <Badge variant="secondary">Estimated: 12 min</Badge>
          <Badge className="bg-pink-500">AI-Powered</Badge>
        </div>
        <h2 className="text-2xl font-bold">AI-Powered Headcount Forecast</h2>
        <p className="text-muted-foreground mt-2">
          Predictive headcount modeling with machine learning-based workforce prediction
        </p>
      </div>

      <LearningObjectives
        items={[
          "Generate AI-powered headcount forecasts",
          "Interpret confidence levels and predictions",
          "Save and compare forecast versions",
          "Act on AI recommendations"
        ]}
      />

      {/* AI Forecast Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-pink-500" />
            AI Forecast Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The AI-Powered Headcount Forecast analyzes historical request patterns, 
            approval rates, seasonal trends, and department growth to predict future 
            headcount needs over a 3-month horizon.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Navigation</h4>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              Workforce → Headcount Forecast
            </code>
          </div>
          <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-pink-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-pink-800 dark:text-pink-200">How It Works</h4>
                <p className="text-sm text-pink-700 dark:text-pink-300">
                  The system uses machine learning models trained on your organization's 
                  historical data, including request volumes, approval patterns, attrition 
                  rates, and seasonal hiring cycles to generate accurate predictions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generating a Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Generating a Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div className="flex-1">
                <h4 className="font-semibold">Select Company Scope</h4>
                <p className="text-sm text-muted-foreground">
                  Choose to generate forecast for a specific company or all companies. 
                  Multi-company forecasts aggregate data across legal entities.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div className="flex-1">
                <h4 className="font-semibold">Click "Generate Forecast"</h4>
                <p className="text-sm text-muted-foreground">
                  AI analyzes last 6 months of historical data and generates 3-month 
                  predictions. Processing typically takes 5-10 seconds.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div className="flex-1">
                <h4 className="font-semibold">Review Results</h4>
                <p className="text-sm text-muted-foreground">
                  Examine predicted requests, net headcount change, trends, risks, and 
                  AI-generated recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
              <div className="flex-1">
                <h4 className="font-semibold">Save Forecast (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  Save the forecast with a name and notes for future reference and 
                  comparison with later forecasts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Output */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Forecast Output
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each forecast includes monthly predictions, trend analysis, and actionable 
            insights. Example output below:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">February 2024</h4>
              <div className="text-lg font-semibold">8 Requests</div>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4" />
                +5 net change
              </div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">March 2024</h4>
              <div className="text-lg font-semibold">12 Requests</div>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4" />
                +8 net change
              </div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">April 2024</h4>
              <div className="text-lg font-semibold">6 Requests</div>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4" />
                +3 net change
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-2">Forecast Summary (AI-Generated)</h4>
            <p className="text-sm text-muted-foreground italic">
              "Based on historical patterns, expect moderate growth in Q1 with peak hiring 
              activity in March. Engineering and Sales departments will likely drive 70% 
              of new requests. Consider proactive budget allocation for anticipated 
              headcount increase of +16 FTE."
            </p>
          </div>
          <ScreenshotPlaceholder
            caption="Figure 6.5a: AI-generated headcount forecast with monthly predictions and summary"
            alt="AI forecast output showing predicted requests, net change, and narrative summary"
          />
        </CardContent>
      </Card>

      {/* Confidence Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Confidence Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each forecast includes a confidence level indicating the reliability of 
            predictions based on data quality and pattern consistency.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg border-green-500/30 bg-green-50 dark:bg-green-950/20">
              <Badge className="bg-green-500 mb-2">High Confidence</Badge>
              <p className="text-sm text-muted-foreground">
                6+ months of consistent data, clear seasonal patterns, stable organization. 
                Predictions highly reliable.
              </p>
            </div>
            <div className="p-4 border rounded-lg border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
              <Badge className="bg-amber-500 mb-2">Medium Confidence</Badge>
              <p className="text-sm text-muted-foreground">
                3-6 months of data, some variability in patterns. Predictions are reasonable 
                estimates but may vary.
              </p>
            </div>
            <div className="p-4 border rounded-lg border-gray-500/30 bg-gray-50 dark:bg-gray-950/20">
              <Badge variant="outline" className="mb-2">Low Confidence</Badge>
              <p className="text-sm text-muted-foreground">
                Limited historical data, recent org changes, or high variability. Treat 
                predictions as rough estimates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends & Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Trends, Risks & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Key Trends
              </h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Growing demand in Engineering (+15% MoM)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Stable headcount in Operations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Seasonal uptick expected in Q2
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Identified Risks
              </h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Tech talent shortage may extend time-to-fill
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Budget constraints in Q2
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Attrition risk in Sales (market benchmark high)
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-500" />
                Recommendations
              </h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Pre-approve Engineering requisitions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Build talent pipeline for Q2 surge
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Review Sales compensation benchmarks
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save & Compare */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Saving & Comparing Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Save forecasts to track accuracy over time and compare different 
            forecast versions or periods.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Save Forecast</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Give the forecast a descriptive name and add notes about assumptions 
                or context. Saved forecasts appear in the "Saved" tab.
              </p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Compare Forecasts</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Select up to 2 saved forecasts to compare side-by-side. View 
                differences in predictions and analyze forecast accuracy.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Forecast Accuracy Tracking
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Over time, compare past forecasts against actual outcomes to measure 
              AI accuracy. This helps calibrate confidence in future predictions 
              and identify areas where the model needs adjustment.
            </p>
          </div>
          <ScreenshotPlaceholder
            caption="Figure 6.5b: Saved forecasts comparison view for accuracy tracking"
            alt="Side-by-side forecast comparison with variance analysis"
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Industry Context */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Industry Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Frequency:</span>
              <p className="text-muted-foreground">Monthly forecasting, quarterly reviews</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Workday Adaptive, Oracle HCM Insights</p>
            </div>
            <div>
              <span className="font-medium">Data Requirements:</span>
              <p className="text-muted-foreground">Minimum 3 months historical data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
