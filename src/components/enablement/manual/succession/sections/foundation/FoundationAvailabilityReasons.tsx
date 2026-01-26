import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Database,
  Calendar,
  AlertTriangle,
  Clock,
  XCircle,
  Zap,
  Info
} from 'lucide-react';

export function FoundationAvailabilityReasons() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.6 Availability Reasons Configuration</h3>
        <p className="text-muted-foreground">
          Configure vacancy reason codes and categorize planned vs unplanned departures
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure vacancy reason codes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Categorize planned vs unplanned departures</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Understand impact on succession urgency</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-300">System Path:</span>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span>Succession</span>
              <ArrowRight className="h-3 w-3" />
              <span>Setup</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium">Availability</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
            Direct URL: /succession/setup?tab=availability-reasons
          </div>
        </CardContent>
      </Card>

      {/* Database Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Table: succession_availability_reasons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Required</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">code</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Short code (max 5 chars, uppercase)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">label</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Display name (max 50 chars)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">category</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">planned / unplanned</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">typical_notice_months</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">Number</td>
                  <td className="py-2 px-3 text-muted-foreground">Expected lead time (0-36)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">urgency_level</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">low / medium / high / critical</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">triggers_notification</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Boolean</td>
                  <td className="py-2 px-3 text-muted-foreground">Alert HR on selection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Default Availability Reasons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Default Availability Reasons (8 Defaults)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Code</th>
                  <th className="text-left py-2 px-3 font-medium">Label</th>
                  <th className="text-left py-2 px-3 font-medium">Category</th>
                  <th className="text-left py-2 px-3 font-medium">Notice</th>
                  <th className="text-left py-2 px-3 font-medium">Urgency</th>
                  <th className="text-left py-2 px-3 font-medium">Triggers Alert</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">RET</td>
                  <td className="py-2 px-3 font-medium">Retirement</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-blue-50">Planned</Badge></td>
                  <td className="py-2 px-3">12-24 mo</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Medium</Badge></td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">PRO</td>
                  <td className="py-2 px-3 font-medium">Promotion</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-blue-50">Planned</Badge></td>
                  <td className="py-2 px-3">3-6 mo</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Medium</Badge></td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">TRF</td>
                  <td className="py-2 px-3 font-medium">Internal Transfer</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-blue-50">Planned</Badge></td>
                  <td className="py-2 px-3">1-3 mo</td>
                  <td className="py-2 px-3"><Badge className="bg-green-500">Low</Badge></td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">RES</td>
                  <td className="py-2 px-3 font-medium">Resignation</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-amber-50">Unplanned</Badge></td>
                  <td className="py-2 px-3">0-1 mo</td>
                  <td className="py-2 px-3"><Badge className="bg-amber-500">High</Badge></td>
                  <td className="py-2 px-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">TRM</td>
                  <td className="py-2 px-3 font-medium">Termination</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-amber-50">Unplanned</Badge></td>
                  <td className="py-2 px-3">0 mo</td>
                  <td className="py-2 px-3"><Badge variant="destructive">Critical</Badge></td>
                  <td className="py-2 px-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">MED</td>
                  <td className="py-2 px-3 font-medium">Medical Leave</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-amber-50">Unplanned</Badge></td>
                  <td className="py-2 px-3">Variable</td>
                  <td className="py-2 px-3"><Badge className="bg-amber-500">High</Badge></td>
                  <td className="py-2 px-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">REL</td>
                  <td className="py-2 px-3 font-medium">Relocation</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-gray-50">Either</Badge></td>
                  <td className="py-2 px-3">3-12 mo</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Medium</Badge></td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">REO</td>
                  <td className="py-2 px-3 font-medium">Reorganization</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="bg-blue-50">Planned</Badge></td>
                  <td className="py-2 px-3">3-6 mo</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Medium</Badge></td>
                  <td className="py-2 px-3 text-muted-foreground">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Urgency Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Urgency Level → Succession Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    URGENCY LEVEL → SUCCESSION ACTIONS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CRITICAL (Termination, Sudden Departure)                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Immediate successor activation                                           │
│  • Emergency leadership coverage                                            │
│  • Accelerated transition plan                                              │
│  • Executive notification within 24 hours                                   │
│                                                                             │
│  HIGH (Resignation, Medical)                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • 30-day transition plan                                                   │
│  • Successor preparation begins immediately                                 │
│  • Knowledge transfer sessions scheduled                                    │
│  • Interim coverage arrangements                                            │
│                                                                             │
│  MEDIUM (Retirement, Promotion, Reorg)                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • 90-180 day transition plan                                               │
│  • Successor development accelerated                                        │
│  • Shadowing and mentoring initiated                                        │
│  • Stakeholder communication planned                                        │
│                                                                             │
│  LOW (Transfer, Planned Move)                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Standard succession timeline                                             │
│  • Gradual transition                                                       │
│  • Cross-training during overlap                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
