import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Clock, Users, CheckCircle, ArrowUp, ArrowRight, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, InfoCallout } from '../../components/Callout';
import { StepByStep } from '../../components/StepByStep';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const NINE_BOX_STEPS = [
  {
    title: 'Access Nine-Box View',
    description: 'Open the nine-box grid visualization.',
    substeps: [
      'In the calibration workspace, click "Nine-Box View" toggle',
      'Or navigate to Performance → Talent → Nine-Box Grid',
      'Select the appraisal cycle to visualize',
      'Grid populates with employee positions'
    ],
    expectedResult: 'Nine-box grid displays with employees placed according to performance and potential'
  },
  {
    title: 'Understand Grid Placement',
    description: 'Learn how employees are positioned on the grid.',
    substeps: [
      'X-axis (horizontal): Performance score from appraisal',
      'Y-axis (vertical): Potential assessment',
      'Each cell represents a talent category',
      'Hover over employees to see details'
    ],
    expectedResult: 'Clear understanding of placement logic'
  },
  {
    title: 'Review and Adjust Placements',
    description: 'Discuss and modify employee positions during calibration.',
    substeps: [
      'Identify employees in unexpected cells',
      'Discuss with presenting manager',
      'Drag employees to new positions if agreed',
      'System prompts for justification on moves'
    ],
    expectedResult: 'Calibrated nine-box positions with documented rationale'
  },
  {
    title: 'Generate Talent Actions',
    description: 'Create development plans based on grid positions.',
    substeps: [
      'Select employees or entire cells',
      'Click "Generate Actions"',
      'System suggests role-appropriate actions',
      'Assign actions to managers for follow-up'
    ],
    expectedResult: 'Action items created and assigned'
  }
];

const BUSINESS_RULES = [
  { rule: 'Performance axis uses calibrated appraisal scores', enforcement: 'System' as const, description: 'Automatic placement based on final overall rating from the current appraisal cycle.' },
  { rule: 'Potential assessment requires separate input', enforcement: 'Policy' as const, description: 'Potential is not automatically derived—must be assessed by manager or HR.' },
  { rule: 'Grid movements require documented justification', enforcement: 'System' as const, description: 'Any manual repositioning creates an audit record with stated rationale.' },
  { rule: 'Succession nominations trigger from top-right cells', enforcement: 'Policy' as const, description: 'Employees in "Star" and "Future Star" cells are automatically flagged for succession review.' }
];

const TROUBLESHOOTING = [
  { issue: 'Employee not appearing on grid', cause: 'Missing performance score or potential assessment.', solution: 'Ensure appraisal is complete. Check if potential assessment has been entered for the employee.' },
  { issue: 'Cannot drag employee to new cell', cause: 'Insufficient permissions or session not in edit mode.', solution: 'Only Facilitators and Chairs can move employees. Ensure session is "In Progress" status.' },
  { issue: 'Grid shows too many employees in one cell', cause: 'Normal for large populations—clustering is expected.', solution: 'Use zoom and filter controls. Click cell to expand and see individual names.' },
  { issue: 'Potential scores not available', cause: 'Potential assessment module not configured or data not entered.', solution: 'Contact HR to enable potential assessment. Managers must complete potential evaluations.' }
];

const NINE_BOX_CELLS = [
  { row: 0, col: 0, name: 'Enigma', color: 'bg-amber-100 border-amber-300', description: 'High potential, low performance. May be in wrong role or need support.' },
  { row: 0, col: 1, name: 'Growth Employee', color: 'bg-blue-100 border-blue-300', description: 'High potential, moderate performance. Invest in development.' },
  { row: 0, col: 2, name: 'Future Star', color: 'bg-green-100 border-green-300', description: 'High potential, high performance. Fast-track for leadership.' },
  { row: 1, col: 0, name: 'Inconsistent Performer', color: 'bg-amber-100 border-amber-300', description: 'Moderate potential, low performance. Address performance gaps.' },
  { row: 1, col: 1, name: 'Core Contributor', color: 'bg-slate-100 border-slate-300', description: 'Moderate potential, moderate performance. Backbone of the organization.' },
  { row: 1, col: 2, name: 'High Performer', color: 'bg-green-100 border-green-300', description: 'Moderate potential, high performance. Recognize and retain.' },
  { row: 2, col: 0, name: 'Underperformer', color: 'bg-red-100 border-red-300', description: 'Low potential, low performance. Performance improvement or exit.' },
  { row: 2, col: 1, name: 'Effective Contributor', color: 'bg-slate-100 border-slate-300', description: 'Low potential, moderate performance. Reliable, stable performer.' },
  { row: 2, col: 2, name: 'Star', color: 'bg-green-200 border-green-400', description: 'High performance achieved ceiling. Maximize contribution in current role.' }
];

export function NineBoxGridIntegration() {
  return (
    <Card id="sec-4-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.5</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin / Leadership</Badge>
        </div>
        <CardTitle className="text-2xl">Nine-Box Grid Integration</CardTitle>
        <CardDescription>Using the performance-potential matrix for talent visualization and calibration decisions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-4-5'] || ['Performance', 'Talent', 'Nine-Box Grid']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the nine-box grid framework</li>
            <li>Interpret employee placements and their implications</li>
            <li>Use the grid during calibration sessions</li>
            <li>Generate talent actions based on grid positions</li>
          </ul>
        </div>

        {/* What is Nine-Box Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Understanding the Nine-Box Grid</h3>
          <p className="text-muted-foreground">
            The nine-box grid is a talent management tool that plots employees on two dimensions: 
            Performance (X-axis) and Potential (Y-axis). It provides a visual framework for 
            talent discussions, succession planning, and development prioritization.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>X-Axis: Performance (from appraisal)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-primary" />
              <span>Y-Axis: Potential (assessed separately)</span>
            </div>
          </div>
        </div>

        {/* Nine-Box Visual */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Nine-Box Grid Layout
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <ArrowUp className="h-3 w-3" />
              <span>High Potential</span>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-lg">
              {[
                ['Enigma', 'Growth Employee', 'Future Star'],
                ['Inconsistent Performer', 'Core Contributor', 'High Performer'],
                ['Underperformer', 'Effective Contributor', 'Star']
              ].map((row, ri) => (
                row.map((cell, ci) => {
                  const cellData = NINE_BOX_CELLS.find(c => c.row === ri && c.col === ci);
                  return (
                    <div 
                      key={`${ri}-${ci}`} 
                      className={`p-3 text-center text-xs border-2 rounded-lg ${cellData?.color}`}
                    >
                      <span className="font-semibold">{cell}</span>
                    </div>
                  );
                })
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>Low Performance</span>
              <ArrowRight className="h-3 w-3" />
              <span>High Performance</span>
            </div>
          </div>
        </div>

        {/* Cell Descriptions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cell Definitions & Talent Actions</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {NINE_BOX_CELLS.map((cell) => (
              <div key={cell.name} className={`p-3 rounded-lg border-2 ${cell.color}`}>
                <h4 className="font-semibold text-sm">{cell.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{cell.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions by Cell */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Recommended Actions by Cell
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Cell</th>
                  <th className="text-left py-2 px-3 font-medium">Development Focus</th>
                  <th className="text-left py-2 px-3 font-medium">Retention Risk</th>
                  <th className="text-left py-2 px-3 font-medium">Suggested Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cell: 'Future Star', focus: 'Accelerated leadership development', risk: 'High', actions: 'Stretch assignments, executive mentoring, succession planning' },
                  { cell: 'Star', focus: 'Role expansion or specialization', risk: 'Medium', actions: 'Recognition, compensation review, lateral moves' },
                  { cell: 'High Performer', focus: 'Skill broadening', risk: 'Medium', actions: 'Cross-functional projects, visibility opportunities' },
                  { cell: 'Growth Employee', focus: 'Performance coaching', risk: 'Low', actions: 'Clear goals, regular feedback, training programs' },
                  { cell: 'Core Contributor', focus: 'Engagement and skill refresh', risk: 'Low', actions: 'Career conversations, new challenges' },
                  { cell: 'Enigma', focus: 'Role fit assessment', risk: 'Medium', actions: 'Role change exploration, manager coaching' },
                  { cell: 'Underperformer', focus: 'Performance improvement', risk: 'N/A', actions: 'PIP, clear expectations, exit planning if no improvement' }
                ].map((item) => (
                  <tr key={item.cell} className="border-b">
                    <td className="py-2 px-3 font-medium">{item.cell}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.focus}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className={
                        item.risk === 'High' ? 'border-red-500 text-red-600' :
                        item.risk === 'Medium' ? 'border-amber-500 text-amber-600' :
                        'border-slate-500 text-slate-600'
                      }>{item.risk}</Badge>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground text-xs">{item.actions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <StepByStep steps={NINE_BOX_STEPS} title="Using Nine-Box in Calibration" />

        {/* Potential Assessment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Potential Assessment
          </h3>
          <InfoCallout title="Understanding Potential">
            Potential is distinct from performance. It represents an employee's capacity to grow 
            into larger, more complex roles—not just their current achievements.
          </InfoCallout>
          <div className="space-y-3">
            <h4 className="font-medium">Key Potential Indicators</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { indicator: 'Learning Agility', desc: 'Ability to learn new skills quickly and apply them in novel situations' },
                { indicator: 'Leadership Capacity', desc: 'Ability to influence, inspire, and develop others' },
                { indicator: 'Strategic Thinking', desc: 'Ability to see the big picture and anticipate future challenges' },
                { indicator: 'Results Orientation', desc: 'Drive to achieve outcomes beyond current role expectations' },
                { indicator: 'Emotional Intelligence', desc: 'Self-awareness and ability to navigate complex relationships' },
                { indicator: 'Change Adaptability', desc: 'Comfort with ambiguity and ability to thrive in changing environments' }
              ].map((item) => (
                <div key={item.indicator} className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm">{item.indicator}</h5>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TipCallout title="Calibration Best Practice">
          Use the nine-box grid as a discussion tool, not a labeling system. The goal is to identify 
          development opportunities and succession candidates—not to permanently categorize employees.
        </TipCallout>

        <WarningCallout title="Common Pitfall">
          Avoid conflating performance with potential. A "Star" performer may have limited potential 
          for leadership roles, while an "Enigma" may be a future leader in the wrong current role.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
