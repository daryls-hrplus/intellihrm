import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Layers, 
  Settings, 
  ChevronRight, 
  Sparkles,
  Crown,
  Wrench,
  Rocket,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TalentPoolTypes() {
  const poolTypes = [
    {
      type: 'high_potential',
      label: 'High Potential',
      icon: Sparkles,
      color: 'bg-purple-500',
      description: 'Future leaders with exceptional growth capacity and ability to advance 2+ levels',
      useCase: 'Identify and accelerate development of employees who demonstrate ability to take on significantly larger roles',
      criteria: 'Nine-Box 1-2, Learning agility score ≥4.0, Manager endorsement',
      developmentFocus: 'Strategic thinking, cross-functional exposure, executive coaching'
    },
    {
      type: 'leadership',
      label: 'Leadership Pipeline',
      icon: Crown,
      color: 'bg-amber-500',
      description: 'Prepared for management and executive roles within 1-3 years',
      useCase: 'Ensure bench strength for director and VP-level positions across the organization',
      criteria: 'Current manager or senior individual contributor, Strong performance history',
      developmentFocus: 'People leadership, P&L management, enterprise-level decision making'
    },
    {
      type: 'technical',
      label: 'Technical Expert',
      icon: Wrench,
      color: 'bg-blue-500',
      description: 'Deep specialists in critical technical domains and subject matter experts',
      useCase: 'Retain and develop employees with rare, high-value technical expertise',
      criteria: 'Specialized certifications, Recognized expertise, Innovation contributions',
      developmentFocus: 'Deep specialization, thought leadership, knowledge transfer'
    },
    {
      type: 'emerging',
      label: 'Emerging Talent',
      icon: Rocket,
      color: 'bg-green-500',
      description: 'Early-career employees with high potential identified within first 2-3 years',
      useCase: 'Capture and develop promising new hires before they become flight risks',
      criteria: 'Tenure < 3 years, Above-average performance, High learning agility',
      developmentFocus: 'Rotational programs, mentorship, foundational leadership skills'
    },
    {
      type: 'critical_role',
      label: 'Critical Role',
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Successors specifically identified for hard-to-fill, high-impact positions',
      useCase: 'Mitigate risk for roles where external hiring is difficult or impossible',
      criteria: 'Mapped to specific critical positions, Demonstrated domain expertise',
      developmentFocus: 'Role-specific competencies, stakeholder relationships, institutional knowledge'
    }
  ];

  return (
    <section id="sec-5-2" data-manual-anchor="sec-5-2" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.2 Pool Types & Classification</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Understanding the five standard pool types and their strategic purposes
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Define each of the five standard talent pool types and their strategic purposes',
          'Identify appropriate pool type selection based on organizational needs',
          'Understand the color coding and UI representation of pool types',
          'Apply best practices for pool type assignment and overlap prevention'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Talent Pools</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Pool Type Selection</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pool Type Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5 text-primary" />
            Pool Type Definitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {poolTypes.map((pool) => {
            const IconComponent = pool.icon;
            return (
              <div key={pool.type} className="border rounded-lg overflow-hidden">
                <div className={`${pool.color} px-4 py-2 flex items-center gap-2`}>
                  <IconComponent className="h-4 w-4 text-white" />
                  <span className="font-medium text-white">{pool.label}</span>
                  <Badge variant="outline" className="ml-auto text-white border-white/50 text-xs">
                    {pool.type}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm">{pool.description}</p>
                  
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="p-2 bg-muted/50 rounded">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Use Case</h5>
                      <p className="text-xs mt-1">{pool.useCase}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Typical Criteria</h5>
                      <p className="text-xs mt-1">{pool.criteria}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Development Focus</h5>
                      <p className="text-xs mt-1">{pool.developmentFocus}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pool Type Selection Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Type Selection Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use this decision matrix to determine the most appropriate pool type based on 
            employee characteristics and organizational goals.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Characteristic</TableHead>
                  <TableHead className="font-medium text-center">High Potential</TableHead>
                  <TableHead className="font-medium text-center">Leadership</TableHead>
                  <TableHead className="font-medium text-center">Technical</TableHead>
                  <TableHead className="font-medium text-center">Emerging</TableHead>
                  <TableHead className="font-medium text-center">Critical Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { char: 'Tenure < 3 years', vals: ['', '', '', '●', ''] },
                  { char: 'Nine-Box 1-2', vals: ['●', '●', '', '●', ''] },
                  { char: 'Management experience', vals: ['', '●', '', '', ''] },
                  { char: 'Deep specialization', vals: ['', '', '●', '', '●'] },
                  { char: 'Executive aspiration', vals: ['●', '●', '', '', ''] },
                  { char: 'Mapped to key position', vals: ['', '', '', '', '●'] },
                  { char: 'Learning agility ≥4.0', vals: ['●', '', '', '●', ''] },
                  { char: 'Values alignment ≥4.0', vals: ['●', '●', '', '', ''] }
                ].map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">{row.char}</TableCell>
                    {row.vals.map((val, i) => (
                      <TableCell key={i} className="text-center">
                        {val === '●' && (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 inline-block" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Color Coding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">UI Color Coding Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pool types are consistently color-coded throughout the application for quick visual identification.
          </p>
          <div className="grid gap-3 md:grid-cols-5">
            {poolTypes.map((pool) => (
              <div key={pool.type} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className={`w-4 h-4 rounded ${pool.color}`} />
                <div>
                  <p className="text-xs font-medium">{pool.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{pool.type}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Limit membership to 2 pools maximum per employee to maintain focus',
              'Review pool type definitions annually to ensure alignment with business strategy',
              'Use High Potential sparingly (typically 3-5% of workforce)',
              'Emerging Talent pools should have accelerated review cycles (quarterly vs semi-annual)',
              'Critical Role pools should directly align with key position succession plans',
              'Avoid using pool membership as a retention promise—focus on development'
            ].map((practice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industry Context */}
      <Card>
        <CardContent className="pt-4">
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Industry Benchmark:</strong> High-performing organizations typically 
                maintain 5-7 distinct talent pool types, with High Potential and Leadership 
                Pipeline being the most common (Deloitte Human Capital Trends 2024).
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
