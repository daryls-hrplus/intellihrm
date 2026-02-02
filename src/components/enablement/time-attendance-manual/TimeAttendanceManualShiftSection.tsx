import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Clock, Calendar, RotateCcw, DollarSign, Users,
  Layers, ArrowLeftRight, Shield, Target
} from 'lucide-react';
import { LearningObjectives } from '@/components/enablement/manual/components';
import { TAShiftPaymentRules } from './sections/shift';

const chapterObjectives = [
  'Configure shift templates with start/end times and breaks',
  'Set up rotation patterns (4x4, 5x2, Panama, custom)',
  'Assign employees to shifts and manage shift calendar',
  'Configure shift differentials and payment rules',
  'Enable shift swap requests and coverage management'
];

const sectionGroups = [
  {
    id: 'definitions',
    label: 'A. Shift Definitions',
    color: 'blue',
    icon: Layers,
    sections: [
      { number: '3.1', title: 'Shift Architecture Overview', time: '8 min' },
      { number: '3.2', title: 'Shift Templates', time: '10 min' }
    ]
  },
  {
    id: 'scheduling',
    label: 'B. Scheduling',
    color: 'green',
    icon: Calendar,
    sections: [
      { number: '3.3', title: 'Shift Schedules', time: '10 min' },
      { number: '3.4', title: 'Rotation Patterns', time: '10 min' }
    ]
  },
  {
    id: 'assignments',
    label: 'C. Assignments',
    color: 'purple',
    icon: Users,
    sections: [
      { number: '3.5', title: 'Shift Assignments', time: '8 min' },
      { number: '3.6', title: 'Shift Differentials', time: '8 min' }
    ]
  },
  {
    id: 'compensation',
    label: 'D. Compensation',
    color: 'amber',
    icon: DollarSign,
    sections: [
      { number: '3.7', title: 'Rounding Rules', time: '8 min' },
      { number: '3.8', title: 'Payment Rules', time: '14 min' }
    ]
  },
  {
    id: 'advanced',
    label: 'E. Advanced',
    color: 'red',
    icon: ArrowLeftRight,
    sections: [
      { number: '3.9', title: 'Shift Swaps', time: '6 min' },
      { number: '3.10', title: 'Coverage Requirements', time: '6 min' }
    ]
  }
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-600' },
    green: { border: 'border-green-500/30', bg: 'bg-green-500/5', text: 'text-green-600' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-600' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-600' },
    red: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-600' }
  };
  return colorMap[color] || colorMap.blue;
};

export function TimeAttendanceManualShiftSection() {
  const totalReadTime = sectionGroups.reduce((acc, group) => {
    return acc + group.sections.reduce((sum, s) => sum + parseInt(s.time), 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Chapter 3</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{totalReadTime} min read</span>
            <span>•</span>
            <span>10 Sections</span>
          </div>
          <CardTitle className="text-2xl">Shift Management</CardTitle>
          <p className="text-muted-foreground">
            Configure shift templates, schedules, rotation patterns, assignments, and payment rules
          </p>
        </CardHeader>
        <CardContent>
          <LearningObjectives objectives={chapterObjectives} />
        </CardContent>
      </Card>

      {/* Chapter Contents Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Chapter Contents</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionGroups.map((group) => {
            const colors = getColorClasses(group.color);
            return (
              <div key={group.id}>
                <h4 className={`text-sm font-medium ${colors.text} mb-2`}>{group.label}</h4>
                <div className="grid md:grid-cols-4 gap-2">
                  {group.sections.map((section) => (
                    <div 
                      key={section.number}
                      className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-sm"
                    >
                      <Badge variant="outline" className="text-xs shrink-0">{section.number}</Badge>
                      <span className="truncate">{section.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['definitions']} className="space-y-4">
        {/* A. Shift Definitions */}
        <AccordionItem 
          value="definitions" 
          className={`border rounded-lg ${getColorClasses('blue').border} ${getColorClasses('blue').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Layers className={`h-5 w-5 ${getColorClasses('blue').text}`} />
              <span className="font-medium">A. Shift Definitions</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
              <p className="mb-2"><strong>Section 3.1:</strong> Shift Architecture Overview - Coming soon</p>
              <p><strong>Section 3.2:</strong> Shift Templates Configuration - Coming soon</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* B. Scheduling */}
        <AccordionItem 
          value="scheduling" 
          className={`border rounded-lg ${getColorClasses('green').border} ${getColorClasses('green').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Calendar className={`h-5 w-5 ${getColorClasses('green').text}`} />
              <span className="font-medium">B. Scheduling</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
              <p className="mb-2"><strong>Section 3.3:</strong> Shift Schedules Creation - Coming soon</p>
              <p><strong>Section 3.4:</strong> Rotation Patterns Setup - Coming soon</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* C. Assignments */}
        <AccordionItem 
          value="assignments" 
          className={`border rounded-lg ${getColorClasses('purple').border} ${getColorClasses('purple').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Users className={`h-5 w-5 ${getColorClasses('purple').text}`} />
              <span className="font-medium">C. Assignments</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
              <p className="mb-2"><strong>Section 3.5:</strong> Shift Assignments - Coming soon</p>
              <p><strong>Section 3.6:</strong> Shift Differentials - Coming soon</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* D. Compensation */}
        <AccordionItem 
          value="compensation" 
          className={`border rounded-lg ${getColorClasses('amber').border} ${getColorClasses('amber').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <DollarSign className={`h-5 w-5 ${getColorClasses('amber').text}`} />
              <span className="font-medium">D. Compensation</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
              <p><strong>Section 3.7:</strong> Rounding Rules - See Section 2.16 in Foundation chapter for shift-specific rounding.</p>
            </div>
            <TAShiftPaymentRules />
          </AccordionContent>
        </AccordionItem>

        {/* E. Advanced */}
        <AccordionItem 
          value="advanced" 
          className={`border rounded-lg ${getColorClasses('red').border} ${getColorClasses('red').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className={`h-5 w-5 ${getColorClasses('red').text}`} />
              <span className="font-medium">E. Advanced</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
              <p className="mb-2"><strong>Section 3.9:</strong> Shift Swaps - Coming soon</p>
              <p><strong>Section 3.10:</strong> Coverage Requirements - Coming soon</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
