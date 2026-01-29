import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Database, Navigation, CheckCircle, Bot, Activity, Zap, BarChart3 } from 'lucide-react';

export function LndAIAgentFramework() {
  return (
    <section id="sec-6-9" data-manual-anchor="sec-6-9" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.9 AI Agent Framework</h2>
        <p className="text-muted-foreground">
          Configurable AI agents for automated L&D workflows including skill gap analysis, course recommendations, and training orchestration.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Understand the AI agent architecture and how agents execute tasks</li>
            <li>Configure agent capabilities and permissions for L&D use cases</li>
            <li>Monitor agent execution logs and performance metrics</li>
            <li>Set up alerts for agent failures or anomalies</li>
          </ul>
        </CardContent>
      </Card>

      {/* Database Schema: ai_agents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: ai_agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3">Primary key</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">company_id</td>
                  <td className="py-2 px-3">FK → companies</td>
                  <td className="py-2 px-3">Company scope (null = system agent)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">agent_code</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Unique identifier (e.g., skill-gap-analyzer)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">agent_name</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Display name</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">agent_type</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">analyzer | recommender | orchestrator | notifier</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">category</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Module category (learning, performance, etc.)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">description</td>
                  <td className="py-2 px-3">text</td>
                  <td className="py-2 px-3">What this agent does</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">function_name</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Edge function to invoke</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">endpoint_url</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">External API endpoint (if applicable)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">capabilities</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">List of agent capabilities</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">input_schema / output_schema</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Expected input/output JSON schemas</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">dependencies</td>
                  <td className="py-2 px-3">string[]</td>
                  <td className="py-2 px-3">Other agents this depends on</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">is_enabled</td>
                  <td className="py-2 px-3">boolean</td>
                  <td className="py-2 px-3">Whether agent is active</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">status</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">active | paused | error | deprecated</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">timeout_seconds</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Max execution time</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">rate_limit_per_minute</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Throttling configuration</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">retry_config</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Retry policy on failure</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">version / metadata</td>
                  <td className="py-2 px-3">string / JSONB</td>
                  <td className="py-2 px-3">Versioning and additional config</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema: ai_agent_capabilities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: ai_agent_capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3">Primary key</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">agent_id</td>
                  <td className="py-2 px-3">FK → ai_agents</td>
                  <td className="py-2 px-3">Parent agent</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">capability_name</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">E.g., analyze_skill_gaps, recommend_courses</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">capability_type</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">read | write | analyze | notify</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">description</td>
                  <td className="py-2 px-3">text</td>
                  <td className="py-2 px-3">What this capability does</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">parameters</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Capability-specific configuration</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">is_enabled</td>
                  <td className="py-2 px-3">boolean</td>
                  <td className="py-2 px-3">Toggle individual capabilities</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">requires_approval</td>
                  <td className="py-2 px-3">boolean</td>
                  <td className="py-2 px-3">Human approval needed before execution</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">risk_level</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">low | medium | high (per ISO 42001)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema: ai_agent_executions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: ai_agent_executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3">Primary key</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">execution_id</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Unique execution reference</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">agent_id</td>
                  <td className="py-2 px-3">FK → ai_agents</td>
                  <td className="py-2 px-3">Agent that was executed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">company_id / user_id</td>
                  <td className="py-2 px-3">FK</td>
                  <td className="py-2 px-3">Context references</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">session_id</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">For multi-step workflows</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">trigger_type</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">scheduled | event | manual | api</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">trigger_source</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">What triggered the execution</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">input_data / output_data</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Execution I/O</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">status</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">pending | running | completed | failed | cancelled</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">started_at / completed_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">Execution timing</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">latency_ms</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Execution duration</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">tokens_used / estimated_cost_usd</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Resource consumption</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">error_code / error_message</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Failure details</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema: ai_agent_metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: ai_agent_metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">agent_id</td>
                  <td className="py-2 px-3">FK → ai_agents</td>
                  <td className="py-2 px-3">Agent being measured</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">metric_date</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Date of aggregation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">metric_hour</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Hour (for hourly granularity)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">total_executions</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Total runs in period</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">successful_executions / failed_executions</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Success/failure counts</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">error_rate</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Percentage of failures</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">avg_latency_ms / p95_latency_ms / p99_latency_ms</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Performance percentiles</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">total_tokens_used</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Cumulative token usage</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">total_cost_usd</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Estimated cost for period</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* L&D Agents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            L&D-Specific Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">skill-gap-processor</code>
                <Badge variant="secondary">Analyzer</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyzes appraisals, 360 feedback, and assessments to identify skill gaps. 
                Creates employee_skill_gaps records with recommended actions.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">course-recommender</code>
                <Badge variant="secondary">Recommender</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Matches skill gaps to courses using competency_course_mappings. 
                Generates explainability logs for each recommendation.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">training-needs-aggregator</code>
                <Badge variant="secondary">Analyzer</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Aggregates individual training needs into organizational analyses. 
                Prioritizes training investments by business impact.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">recertification-reminder</code>
                <Badge variant="outline">Notifier</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitors certification expiration dates and triggers training enrollment 
                for recertification requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UI Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            UI Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Admin → AI Governance → Agents (future tab)
│
├── Agent List:
│   ├── Filter by: Category, Type, Status
│   ├── Enable/Disable toggle
│   └── View execution stats
│
├── Agent Detail:
│   ├── Configuration overview
│   ├── Capabilities list (toggleable)
│   ├── Execution history
│   ├── Performance metrics
│   └── Error logs
│
├── Execution Logs:
│   ├── Filter by: Agent, Status, Date
│   ├── View input/output payloads
│   └── Retry failed executions
│
└── Metrics Dashboard:
    ├── Executions over time
    ├── Error rate trends
    ├── Latency percentiles
    └── Cost breakdown`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Business Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Agents with requires_approval capabilities wait for human review before execution</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Failed executions are retried according to retry_config (max 3 attempts by default)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Error rate &gt; 10% triggers ai_agent_alerts for investigation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Agents exceeding timeout_seconds are automatically terminated</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Rate limiting (rate_limit_per_minute) prevents resource exhaustion</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>All executions are logged for audit and debugging purposes</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
