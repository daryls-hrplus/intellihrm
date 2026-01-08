import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Settings, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function AISystemSettings() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        AI System Settings control how artificial intelligence features are enabled and configured across Intelli HRM.
        This includes enabling AI capabilities, selecting allowed models, and setting token consumption limits.
      </p>

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertTitle>AI-First Architecture</AlertTitle>
        <AlertDescription>
          Intelli HRM is designed with AI at its core. Enabling AI unlocks predictive insights, automated recommendations,
          and intelligent workflows across all modules.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 6.1.1: AI System Settings dashboard showing enablement status and model configuration"
        alt="AI settings page with toggle for AI enablement, model selection, and token limits"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">AI Enablement Options</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setting</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">AI Enabled</TableCell>
              <TableCell>Master toggle for all AI features</TableCell>
              <TableCell><Badge>Enabled</Badge></TableCell>
              <TableCell>Controls all AI-powered features</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Voice AI</TableCell>
              <TableCell>Enable voice-based AI interactions</TableCell>
              <TableCell><Badge variant="secondary">Disabled</Badge></TableCell>
              <TableCell>Voice commands and responses</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Auto-Suggestions</TableCell>
              <TableCell>Proactive AI recommendations</TableCell>
              <TableCell><Badge>Enabled</Badge></TableCell>
              <TableCell>Inline suggestions across modules</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Allowed AI Models</h4>
        <p className="text-sm text-muted-foreground">
          Configure which AI models are available for different use cases. Model selection affects response quality,
          speed, and cost.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Purpose
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• GPT-4 (Default for complex tasks)</li>
              <li>• GPT-3.5 (Faster, cost-effective)</li>
              <li>• Claude 3 (Analytical tasks)</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Specialized Models
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Document Analysis (PDF, contracts)</li>
              <li>• Code Generation (integrations)</li>
              <li>• Sentiment Analysis (feedback)</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 6.1.2: Model selection interface with performance and cost indicators"
        alt="Model configuration panel showing available AI models with usage metrics"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Token Limits</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Limit Type</TableHead>
              <TableHead>Default Value</TableHead>
              <TableHead>Configurable Range</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Daily User Limit</TableCell>
              <TableCell>50,000 tokens</TableCell>
              <TableCell>10,000 - 500,000</TableCell>
              <TableCell>Per-user daily cap</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Monthly User Limit</TableCell>
              <TableCell>1,000,000 tokens</TableCell>
              <TableCell>100,000 - 10,000,000</TableCell>
              <TableCell>Resets on billing cycle</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Company Monthly</TableCell>
              <TableCell>Based on plan</TableCell>
              <TableCell>Varies by subscription</TableCell>
              <TableCell>Aggregate for all users</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cost Management</AlertTitle>
        <AlertDescription>
          Token consumption directly affects billing. Monitor usage patterns and adjust limits to prevent unexpected costs.
          Set up alerts when usage reaches 80% of allocated limits.
        </AlertDescription>
      </Alert>
    </div>
  );
}
