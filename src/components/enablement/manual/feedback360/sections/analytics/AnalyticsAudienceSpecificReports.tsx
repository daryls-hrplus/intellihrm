import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Briefcase, UserCircle, User, Shield, CheckCircle2, Info } from 'lucide-react';

const audienceConfigurations = [
  {
    type: 'Executive',
    icon: Briefcase,
    contentDepth: 'High Level',
    sections: ['Executive Summary', 'Score Breakdown', 'Comparison to Norm'],
    anonymity: 'Strict',
    verbatim: 'Themes only',
    useCase: 'Strategic workforce insights for C-suite and board reporting',
  },
  {
    type: 'Manager',
    icon: UserCircle,
    contentDepth: 'Summary',
    sections: ['Executive Summary', 'Score Breakdown', 'Category Analysis', 'Development Suggestions'],
    anonymity: 'Standard',
    verbatim: 'Themes + Selected quotes',
    useCase: 'Coaching conversations and development planning with direct reports',
  },
  {
    type: 'Individual Contributor',
    icon: User,
    contentDepth: 'Detailed',
    sections: ['All sections enabled'],
    anonymity: 'Standard',
    verbatim: 'Full (anonymized)',
    useCase: 'Complete self-development view for the feedback recipient',
  },
  {
    type: 'HR',
    icon: Users,
    contentDepth: 'Comprehensive',
    sections: ['All sections + Analytics metadata'],
    anonymity: 'Relaxed',
    verbatim: 'Full with response metadata',
    useCase: 'Talent analytics, compliance monitoring, and program evaluation',
  },
  {
    type: 'Self',
    icon: Shield,
    contentDepth: 'Summary',
    sections: ['Self-assessment comparison', 'Blind spots', 'Development Suggestions'],
    anonymity: 'N/A',
    verbatim: 'N/A (self-ratings only)',
    useCase: 'Self-reflection on perception gaps and development opportunities',
  },
];

export function AnalyticsAudienceSpecificReports() {
  return (
    <section id="sec-6-2" data-manual-anchor="sec-6-2" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            6.2 Audience-Specific Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Admin</Badge>
            <span>→</span>
            <Badge variant="outline">Performance</Badge>
            <span>→</span>
            <Badge variant="outline">360 Feedback</Badge>
            <span>→</span>
            <Badge variant="secondary">Report Templates</Badge>
            <span>→</span>
            <Badge variant="secondary">Audience Configuration</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand the purpose and configuration of each audience type</li>
                <li>Configure appropriate content depth for different stakeholders</li>
                <li>Apply section visibility rules based on audience needs</li>
                <li>Balance transparency with anonymity protection</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Audience-Based Report Design</h4>
            <p className="text-muted-foreground">
              Different stakeholders need different views of 360 feedback data. Executives need strategic 
              insights, managers need coaching information, and employees need development-focused reports. 
              The audience-specific configuration ensures each recipient sees relevant, actionable information 
              while maintaining appropriate confidentiality.
            </p>
          </div>

          {/* Audience Configuration Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Audience</TableHead>
                  <TableHead>Content Depth</TableHead>
                  <TableHead>Key Sections</TableHead>
                  <TableHead>Anonymity</TableHead>
                  <TableHead>Verbatim Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audienceConfigurations.map((config) => {
                  const Icon = config.icon;
                  return (
                    <TableRow key={config.type}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{config.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.contentDepth}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {config.sections.join(', ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.anonymity === 'Strict' ? 'destructive' : 'secondary'}>
                          {config.anonymity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{config.verbatim}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Audience Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audienceConfigurations.map((config) => {
              const Icon = config.icon;
              return (
                <Card key={config.type} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {config.type} Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{config.useCase}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Business Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Configuration Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Manager reports automatically exclude self-assessment comparison unless explicitly enabled</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Executive reports aggregate data across participants; individual-level data is hidden</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>HR reports include response metadata for compliance but require audit logging access</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Advisory</Badge>
                  <span>Self reports should emphasize development suggestions over raw scores</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Wrong sections appearing:</strong> Check template audience_type matches recipient role</li>
                <li><strong>Too much detail for executives:</strong> Verify content_depth is set to "high_level"</li>
                <li><strong>Missing manager coaching prompts:</strong> Enable development_suggestions in sections_config</li>
                <li><strong>Self-comparison not showing:</strong> Check if cycle has self-assessment enabled</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
