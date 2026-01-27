import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SemanticBadge, SemanticCallout, SemanticTooltip, EntityStatusBadge } from "@/components/ui/semantic-index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Palette, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Circle,
  BookOpen,
  Code,
  Shield,
  Eye,
  EyeOff,
  Lightbulb,
  Tags
} from "lucide-react";

export default function UIColorSemanticsGuidePage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "UI Color Semantics Standard" },
          ]}
        />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Palette className="h-8 w-8 text-primary" />
            UI Color Semantics Standard
          </h1>
          <p className="text-muted-foreground text-lg">
            Enterprise-grade color usage rules for consistent HRMS interfaces
          </p>
        </div>

        {/* Executive Summary */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <blockquote className="text-lg font-medium italic text-foreground/90">
              "Color communicates meaning, not styling. The same meaning must always use the same color across the entire application."
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">
              This standard ensures Intelli HRM communicates status, risk, and guidance consistently, intuitively, and at an enterprise HRMS level — aligned with SAP SuccessFactors, Oracle HCM, and Workday.
            </p>
          </CardContent>
        </Card>

        {/* Critical Rule */}
        <SemanticCallout intent="error" title="Non-Negotiable Rule">
          <p className="font-medium">
            Required / Target / Reference values MUST be Blue (Information) or Neutral — <strong>NEVER Green</strong>.
          </p>
          <p className="mt-2 text-sm">
            Green implies achievement. Requirements are not achievements. When displaying "Required Level 3", use neutral or info blue styling — not success green.
          </p>
        </SemanticCallout>

        <Tabs defaultValue="definitions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="definitions">Definitions</TabsTrigger>
            <TabsTrigger value="entity-state">Entity State</TabsTrigger>
            <TabsTrigger value="rules">HRMS Rules</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="examples">Do/Don't</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* Semantic Color Definitions */}
          <TabsContent value="definitions">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Color Definitions</CardTitle>
                <CardDescription>Each color family has one fixed semantic meaning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Info */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-semantic-info/10 border border-semantic-info/20">
                    <div className="p-2 rounded-full bg-semantic-info/20">
                      <Info className="h-5 w-5 text-semantic-info" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-semantic-info">Information (Blue)</h3>
                        <Badge variant="outline" className="text-xs">--color-semantic-info</Badge>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Tooltips, info icons, guidance text, <strong>required/target levels</strong>, help text, reference values
                      </p>
                      <div className="flex gap-2 mt-3">
                        <SemanticBadge intent="info">Required Level</SemanticBadge>
                        <SemanticBadge intent="info" icon={Info}>Tooltip</SemanticBadge>
                      </div>
                    </div>
                  </div>

                  {/* Success */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-semantic-success/10 border border-semantic-success/20">
                    <div className="p-2 rounded-full bg-semantic-success/20">
                      <CheckCircle2 className="h-5 w-5 text-semantic-success" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-semantic-success">Success / Achieved (Green)</h3>
                        <Badge variant="outline" className="text-xs">--color-semantic-success</Badge>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Completed, met expectations, validated results, gap closed, verified status
                      </p>
                      <div className="flex gap-2 mt-3">
                        <SemanticBadge intent="success" icon={CheckCircle2}>Completed</SemanticBadge>
                        <SemanticBadge intent="success">Meets Requirement</SemanticBadge>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-semantic-warning/10 border border-semantic-warning/20">
                    <div className="p-2 rounded-full bg-semantic-warning/20">
                      <AlertTriangle className="h-5 w-5 text-semantic-warning" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-semantic-warning">Warning / Needs Attention (Amber)</h3>
                        <Badge variant="outline" className="text-xs">--color-semantic-warning</Badge>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Requires attention, approaching limit, in review, below requirement (non-critical)
                      </p>
                      <div className="flex gap-2 mt-3">
                        <SemanticBadge intent="warning" icon={AlertTriangle}>Needs Attention</SemanticBadge>
                        <SemanticBadge intent="warning">Below Target</SemanticBadge>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-semantic-error/10 border border-semantic-error/20">
                    <div className="p-2 rounded-full bg-semantic-error/20">
                      <XCircle className="h-5 w-5 text-semantic-error" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-semantic-error">Error / Risk (Red)</h3>
                        <Badge variant="outline" className="text-xs">--color-semantic-error</Badge>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Validation errors, compliance failures, critical gaps, blocked states, overdue items
                      </p>
                      <div className="flex gap-2 mt-3">
                        <SemanticBadge intent="error" icon={XCircle}>Critical Gap</SemanticBadge>
                        <SemanticBadge intent="error">Overdue</SemanticBadge>
                      </div>
                    </div>
                  </div>

                  {/* Neutral */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-semantic-neutral/10 border border-semantic-neutral/20">
                    <div className="p-2 rounded-full bg-semantic-neutral/20">
                      <Circle className="h-5 w-5 text-semantic-neutral" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-semantic-neutral">Neutral / Inactive (Grey)</h3>
                        <Badge variant="outline" className="text-xs">--color-semantic-neutral</Badge>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Disabled, placeholder, <strong>not yet assessed/pending</strong>, unavailable, draft status
                      </p>
                      <div className="flex gap-2 mt-3">
                        <SemanticBadge intent="neutral">Pending</SemanticBadge>
                        <SemanticBadge intent="neutral">Not Assessed</SemanticBadge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entity State Badges */}
          <TabsContent value="entity-state">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tags className="h-5 w-5" />
                    Entity State Badge Standard
                  </CardTitle>
                  <CardDescription>
                    Canonical color mapping for Admin & Configuration screens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Entity State Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity State</TableHead>
                        <TableHead>Badge</TableHead>
                        <TableHead>Semantic Intent</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Usage Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Active</TableCell>
                        <TableCell><EntityStatusBadge status="active" /></TableCell>
                        <TableCell>Success</TableCell>
                        <TableCell>Green</TableCell>
                        <TableCell className="text-muted-foreground">Enabled, usable, valid</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Inactive</TableCell>
                        <TableCell><EntityStatusBadge status="inactive" /></TableCell>
                        <TableCell>Neutral</TableCell>
                        <TableCell>Grey</TableCell>
                        <TableCell className="text-muted-foreground">Disabled but not an error</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Draft</TableCell>
                        <TableCell><EntityStatusBadge status="draft" /></TableCell>
                        <TableCell>Neutral</TableCell>
                        <TableCell>Grey</TableCell>
                        <TableCell className="text-muted-foreground">Not yet live</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Pending</TableCell>
                        <TableCell><EntityStatusBadge status="pending" /></TableCell>
                        <TableCell>Neutral</TableCell>
                        <TableCell>Grey</TableCell>
                        <TableCell className="text-muted-foreground">Awaiting action</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Needs Review</TableCell>
                        <TableCell><EntityStatusBadge status="needs_review" /></TableCell>
                        <TableCell>Warning</TableCell>
                        <TableCell>Amber</TableCell>
                        <TableCell className="text-muted-foreground">Attention required</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Suspended</TableCell>
                        <TableCell><EntityStatusBadge status="suspended" /></TableCell>
                        <TableCell>Warning</TableCell>
                        <TableCell>Amber</TableCell>
                        <TableCell className="text-muted-foreground">Temporarily restricted</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Rejected</TableCell>
                        <TableCell><EntityStatusBadge status="rejected" /></TableCell>
                        <TableCell>Error</TableCell>
                        <TableCell>Red</TableCell>
                        <TableCell className="text-muted-foreground">Explicit failure</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Blocked</TableCell>
                        <TableCell><EntityStatusBadge status="blocked" /></TableCell>
                        <TableCell>Error</TableCell>
                        <TableCell>Red</TableCell>
                        <TableCell className="text-muted-foreground">Hard stop</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Archived</TableCell>
                        <TableCell><EntityStatusBadge status="archived" /></TableCell>
                        <TableCell>Neutral</TableCell>
                        <TableCell>Grey</TableCell>
                        <TableCell className="text-muted-foreground">Historical, read-only</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {/* Hard Rules */}
                  <SemanticCallout intent="error" title="Hard Rules — Entity State vs Informational">
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Same label = same color everywhere</strong></li>
                      <li>• <strong>Blue is NEVER used for entity state</strong> — Blue is reserved for guidance, help, tooltips, and reference content only</li>
                      <li>• <strong>Green is reserved for "Active / Enabled / Achieved"</strong></li>
                      <li>• <strong>Inactive is not red</strong> unless it represents an error or compliance breach</li>
                    </ul>
                  </SemanticCallout>

                  {/* Usage Examples */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border border-semantic-success/30 bg-semantic-success/5">
                      <h4 className="font-medium text-semantic-success flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4" />
                        ✓ Correct Usage
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Job Families:</span>
                          <EntityStatusBadge status="active" size="sm" />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Master Job Families:</span>
                          <EntityStatusBadge status="active" size="sm" />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Leave Types:</span>
                          <EntityStatusBadge status="active" size="sm" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-semantic-error/30 bg-semantic-error/5">
                      <h4 className="font-medium text-semantic-error flex items-center gap-2 mb-3">
                        <XCircle className="h-4 w-4" />
                        ✗ Incorrect Usage
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Master Job Families:</span>
                          <Badge variant="default" className="text-xs">Active</Badge>
                          <span className="text-semantic-error text-xs">(Blue!)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Different screens:</span>
                          <span className="text-semantic-error text-xs">Different colors for same label</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component Usage */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        How to Use EntityStatusBadge
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto border">
{`import { EntityStatusBadge, ActiveInactiveBadge } from "@/components/ui/semantic-index";

// For explicit status control
<EntityStatusBadge status="active" />
<EntityStatusBadge status="inactive" />
<EntityStatusBadge status="pending" />
<EntityStatusBadge status="needs_review" />
<EntityStatusBadge status="suspended" />
<EntityStatusBadge status="rejected" />
<EntityStatusBadge status="blocked" />
<EntityStatusBadge status="archived" />

// For common boolean is_active pattern
<ActiveInactiveBadge isActive={entity.is_active} />

// With options
<EntityStatusBadge status="active" size="sm" showIcon={false} />
<EntityStatusBadge status="active" customLabel="Enabled" />`}
                      </pre>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* HRMS-Specific Rules */}
          <TabsContent value="rules">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Required vs Assessed Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <h4 className="font-medium mb-2">Required / Target / Reference</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>MUST</strong> be Blue (Info) or Neutral</li>
                        <li>• <strong>MUST NOT</strong> be Green</li>
                        <li>• Represents expectations, not achievements</li>
                      </ul>
                      <div className="mt-3 flex gap-2">
                        <SemanticBadge intent="info">Level 3</SemanticBadge>
                        <SemanticBadge intent="neutral">Target: 80%</SemanticBadge>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <h4 className="font-medium mb-2">Assessed / Actual Values</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Green <strong>only if achieved</strong></li>
                        <li>• Amber if below requirement (needs attention)</li>
                        <li>• Red if critically below or failed</li>
                        <li>• Grey if pending/not yet assessed</li>
                      </ul>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <SemanticBadge intent="success">Met</SemanticBadge>
                        <SemanticBadge intent="warning">Below</SemanticBadge>
                        <SemanticBadge intent="neutral">Pending</SemanticBadge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Tooltips & Info Icons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SemanticCallout intent="info" title="Rule: Tooltips are Always Blue">
                    All tooltip icons, info callouts, and guidance hints must use the Info (Blue) semantic color. 
                    Tooltips are informational — they are <strong>never</strong> success or warning styled.
                  </SemanticCallout>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Correct:</span>
                      <SemanticTooltip content="This is guidance text">
                        <span>Hover for info</span>
                      </SemanticTooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Score & Threshold Display
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    When displaying scores against thresholds:
                  </p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• <strong>Green</strong> only when it communicates achievement (e.g., "Score 85% — Meets Target")</li>
                    <li>• If the score is just a threshold label without judgement, use <strong>neutral/info</strong></li>
                    <li>• The threshold/target value itself should be info or neutral, never green</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Component Reference */}
          <TabsContent value="components">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Semantic Component Library
                </CardTitle>
                <CardDescription>
                  Use these components instead of raw color classes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">SemanticBadge</h4>
                  <code className="text-sm bg-muted p-2 rounded block">
                    {`import { SemanticBadge } from "@/components/ui/semantic-index";`}
                  </code>
                  <div className="flex gap-2 flex-wrap">
                    <SemanticBadge intent="info">Info Badge</SemanticBadge>
                    <SemanticBadge intent="success">Success Badge</SemanticBadge>
                    <SemanticBadge intent="warning">Warning Badge</SemanticBadge>
                    <SemanticBadge intent="error">Error Badge</SemanticBadge>
                    <SemanticBadge intent="neutral">Neutral Badge</SemanticBadge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">SemanticCallout</h4>
                  <code className="text-sm bg-muted p-2 rounded block">
                    {`import { SemanticCallout } from "@/components/ui/semantic-index";`}
                  </code>
                  <SemanticCallout intent="info" title="Information">
                    Guidance or reference information for the user.
                  </SemanticCallout>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">SemanticTooltip</h4>
                  <code className="text-sm bg-muted p-2 rounded block">
                    {`import { SemanticTooltip } from "@/components/ui/semantic-index";`}
                  </code>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Field Label</span>
                    <SemanticTooltip content="This is always blue-styled tooltip content">
                      <span className="sr-only">More info</span>
                    </SemanticTooltip>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">ProficiencyLevelBadge (Context-Aware)</h4>
                  <code className="text-sm bg-muted p-2 rounded block">
                    {`<ProficiencyLevelBadge level={3} context="reference" /> // Neutral style
<ProficiencyLevelBadge level={4} context="assessed" comparedTo={3} /> // Green (meets)`}
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Do/Don't Examples */}
          <TabsContent value="examples">
            <div className="grid gap-4 md:grid-cols-2">
              {/* DO */}
              <Card className="border-semantic-success/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-semantic-success">
                    <Eye className="h-5 w-5" />
                    Do ✓
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded border bg-muted/30">
                    <p className="text-sm font-medium mb-2">Required Level Display</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Required:</span>
                      <SemanticBadge intent="neutral">Level 3</SemanticBadge>
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-muted/30">
                    <p className="text-sm font-medium mb-2">Achievement Status</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Status:</span>
                      <SemanticBadge intent="success" icon={CheckCircle2}>Meets Target</SemanticBadge>
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-muted/30">
                    <p className="text-sm font-medium mb-2">Pending Assessment</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Assessed:</span>
                      <SemanticBadge intent="neutral">Not Yet Assessed</SemanticBadge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DON'T */}
              <Card className="border-semantic-error/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-semantic-error">
                    <EyeOff className="h-5 w-5" />
                    Don't ✗
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded border bg-muted/30">
                    <p className="text-sm font-medium mb-2">Required Level (Wrong)</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Required:</span>
                      <Badge className="bg-emerald-100 text-emerald-700">Level 3</Badge>
                      <span className="text-xs text-semantic-error">← Green implies achievement!</span>
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-muted/30">
                    <p className="text-sm font-medium mb-2">Raw Color Classes</p>
                    <code className="text-xs bg-muted p-1 rounded text-semantic-error">
                      className="bg-green-100 text-green-700"
                    </code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use SemanticBadge instead
                    </p>
                  </div>
                  <div className="p-3 rounded border bg-muted/30">
                    <p className="text-sm font-medium mb-2">Pending as Amber</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Status:</span>
                      <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                      <span className="text-xs text-semantic-error">← Pending = Neutral, not Warning</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Governance */}
          <TabsContent value="governance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Governance & Enforcement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SemanticCallout intent="warning" title="Pre-Commit Enforcement">
                  ESLint rules block raw color class usage (e.g., <code>bg-green-*</code>, <code>text-green-*</code>) 
                  outside of semantic components. This prevents regression.
                </SemanticCallout>

                <div className="space-y-3">
                  <h4 className="font-medium">This Standard Belongs In:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• UI Design System</li>
                    <li>• Product Standards</li>
                    <li>• Developer Component Library</li>
                    <li>• Code Review Checklist</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Compliance Requirements:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All colors must meet WCAG contrast requirements</li>
                    <li>• Color alone is not sufficient — text labels required</li>
                    <li>• Dark mode must maintain semantic meaning</li>
                    <li>• Any new screen must comply before release</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 mt-4">
                  <h4 className="font-medium mb-2">CSS Token Reference</h4>
                  <code className="text-sm block whitespace-pre-wrap">
{`--color-semantic-info: 199 89% 48%;
--color-semantic-success: 168 76% 36%;
--color-semantic-warning: 38 92% 50%;
--color-semantic-error: 0 84% 60%;
--color-semantic-neutral: 215.4 16.3% 46.9%;`}
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
