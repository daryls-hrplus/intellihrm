import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Database, Link2, RefreshCw, Shield, CheckCircle2 } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function BIIntegration() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          BI Integration enables connecting HRplus workforce data to external Business 
          Intelligence tools. Export data to Power BI, Tableau, and other analytics 
          platforms for advanced visualization and cross-functional analysis.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Supported BI Platforms</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">PBI</div>
                Microsoft Power BI
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <Badge className="bg-green-500 mb-2">Native Connector</Badge>
              <ul className="space-y-1 text-muted-foreground">
                <li>• DirectQuery support</li>
                <li>• Scheduled refresh</li>
                <li>• Pre-built templates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">T</div>
                Tableau
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <Badge className="bg-green-500 mb-2">Native Connector</Badge>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Live connection</li>
                <li>• Extract scheduling</li>
                <li>• Web Data Connector</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-500" />
                Generic ODBC/API
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <Badge variant="outline" className="mb-2">Standard</Badge>
              <ul className="space-y-1 text-muted-foreground">
                <li>• REST API access</li>
                <li>• ODBC driver</li>
                <li>• Custom integrations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.6.1: BI Integration settings with connector configuration"
        alt="Integration panel showing Power BI and Tableau connection setup"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Available Data Sets</h3>
        <div className="border rounded-lg p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Core HR Data</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Employee Demographics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Organization Structure
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Position & Job Data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Headcount Snapshots
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Analytics Data</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Turnover Metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Diversity Statistics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Compensation Summaries
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Movement Analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Connection Setup</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <p className="font-medium">Generate API Credentials</p>
              <p className="text-sm text-muted-foreground">Create service account with appropriate data access scope</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <p className="font-medium">Configure Data Sets</p>
              <p className="text-sm text-muted-foreground">Select which data entities to expose to external BI tool</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <p className="font-medium">Set Refresh Schedule</p>
              <p className="text-sm text-muted-foreground">Configure how often data syncs to BI platform</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
            <div>
              <p className="font-medium">Test Connection</p>
              <p className="text-sm text-muted-foreground">Verify data flows correctly and validate security</p>
            </div>
          </li>
        </ol>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.6.2: API credential generation and data set configuration"
        alt="Connection wizard showing API key generation and data scope selection"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Refresh Options</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Scheduled Refresh
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Hourly, daily, or weekly options</li>
              <li>• Off-peak scheduling available</li>
              <li>• Incremental refresh supported</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              Live Connection
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Real-time data access</li>
              <li>• Query performance optimization</li>
              <li>• Connection pooling</li>
            </ul>
          </div>
        </div>
      </section>

      <Alert variant="destructive" className="border-destructive/20">
        <Shield className="h-4 w-4" />
        <AlertTitle>Data Security</AlertTitle>
        <AlertDescription>
          External BI connections expose sensitive workforce data. Ensure your BI 
          platform has equivalent security controls. API credentials should be 
          stored securely and rotated regularly.
        </AlertDescription>
      </Alert>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Pre-Built Templates</AlertTitle>
        <AlertDescription>
          Download ready-to-use Power BI and Tableau templates from the Admin → 
          Integrations → BI Templates section to accelerate your analytics deployment.
        </AlertDescription>
      </Alert>
    </div>
  );
}
