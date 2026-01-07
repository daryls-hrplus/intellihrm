import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Brain, TrendingUp, TrendingDown, Target, AlertTriangle, Sparkles } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function WorkforceForecasting() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          AI-powered workforce forecasting uses machine learning to predict attrition, 
          model growth scenarios, and identify workforce risks before they impact operations. 
          Enable proactive workforce planning with data-driven predictions.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Prediction Models</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                Attrition Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground mb-3">
                Identify employees at risk of leaving based on behavioral patterns and historical data.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Model Accuracy</span>
                  <Badge variant="outline">85-92%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Prediction Window</span>
                  <Badge variant="outline">3-12 months</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Growth Modeling
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground mb-3">
                Project future headcount needs based on business growth patterns and hiring trends.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Forecast Range</span>
                  <Badge variant="outline">6-24 months</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scenario Support</span>
                  <Badge variant="outline">Multiple</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.3.1: AI Workforce Forecasting dashboard with attrition risk scores"
        alt="Forecasting view showing employee risk heatmap and predicted turnover trends"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Risk Factors Analyzed</h3>
        <div className="border rounded-lg p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Employee Behavior</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Engagement survey scores</li>
                <li>• Training completion</li>
                <li>• System login patterns</li>
                <li>• Time-off patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Career Factors</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Time since promotion</li>
                <li>• Performance ratings</li>
                <li>• Compensation percentile</li>
                <li>• Manager tenure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">External Signals</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Market demand trends</li>
                <li>• Industry turnover rates</li>
                <li>• Geographic factors</li>
                <li>• Competitive hiring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">AI-Powered Insights</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Retention Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  AI generates personalized retention action recommendations for 
                  high-risk, high-value employees including compensation adjustments, 
                  career development opportunities, and engagement interventions.
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Skills Gap Forecasting</h4>
                <p className="text-sm text-muted-foreground">
                  Predict future skills shortages based on attrition forecasts and 
                  business growth plans. Proactively plan recruitment and training.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.3.2: AI retention recommendations with confidence scores"
        alt="Recommendation panel showing suggested actions for at-risk employees"
      />

      <Alert variant="destructive" className="border-destructive/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Ethical AI Usage</AlertTitle>
        <AlertDescription>
          Attrition predictions should inform proactive retention efforts, not 
          punitive actions. All AI recommendations require human review before action.
        </AlertDescription>
      </Alert>

      <Alert className="border-primary/20 bg-primary/5">
        <Brain className="h-4 w-4" />
        <AlertTitle>Model Transparency</AlertTitle>
        <AlertDescription>
          All predictions include explainability reports showing contributing factors 
          and confidence levels. View model details in Admin → AI → Model Registry.
        </AlertDescription>
      </Alert>
    </div>
  );
}
