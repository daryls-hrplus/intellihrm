import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Clock, CheckCircle2, Settings, Fingerprint, MapPin,
  Timer, Shield, Scale, Target
} from 'lucide-react';
import { LearningObjectives } from '@/components/enablement/manual/components';
import { 
  TAFoundationPrerequisites,
  TAFoundationTimePolicies,
  TAFoundationPolicyAssignments,
  TAFoundationOvertimeRates,
  TAFoundationDevices,
  TAFoundationBiometricTemplates,
  TAFoundationFaceVerification,
  TAFoundationPunchImport,
  TAFoundationGeofencing,
  TAFoundationGeofenceAssignments,
  TAFoundationCompTime,
  TAFoundationFlexTime,
  TAFoundationTimekeeperDelegation,
  TAFoundationAuditConfig,
  TAFoundationCBARules,
  TAFoundationShiftRoundingRules
} from './sections/foundation';

const chapterObjectives = [
  'Complete all prerequisite checks before T&A configuration',
  'Configure attendance policies, rounding, and overtime rules',
  'Set up time collection methods (devices, biometrics, mobile)',
  'Establish location validation with geofencing',
  'Configure comp time and flex time policies',
  'Set up governance controls and audit logging'
];

const sectionGroups = [
  {
    id: 'prerequisites',
    label: 'A. Prerequisites',
    color: 'amber',
    icon: CheckCircle2,
    sections: [
      { number: '2.1', title: 'Prerequisites Checklist', time: '6 min' }
    ]
  },
  {
    id: 'policies',
    label: 'B. Core Policies',
    color: 'blue',
    icon: Settings,
    sections: [
      { number: '2.2', title: 'Attendance Policies', time: '12 min' },
      { number: '2.3', title: 'Policy Assignments', time: '8 min' },
      { number: '2.4', title: 'Overtime Rate Tiers', time: '10 min' }
    ]
  },
  {
    id: 'collection',
    label: 'C. Time Collection',
    color: 'green',
    icon: Fingerprint,
    sections: [
      { number: '2.5', title: 'Timeclock Devices', time: '10 min' },
      { number: '2.6', title: 'Biometric Templates', time: '8 min' },
      { number: '2.7', title: 'Face Verification', time: '8 min' },
      { number: '2.8', title: 'Punch Import', time: '8 min' }
    ]
  },
  {
    id: 'location',
    label: 'D. Location Validation',
    color: 'purple',
    icon: MapPin,
    sections: [
      { number: '2.9', title: 'Geofencing Config', time: '10 min' },
      { number: '2.10', title: 'Geofence Assignments', time: '7 min' }
    ]
  },
  {
    id: 'banking',
    label: 'E. Time Banking',
    color: 'teal',
    icon: Timer,
    sections: [
      { number: '2.11', title: 'Comp Time Policies', time: '9 min' },
      { number: '2.12', title: 'Flex Time Config', time: '9 min' }
    ]
  },
  {
    id: 'governance',
    label: 'F. Governance',
    color: 'red',
    icon: Shield,
    sections: [
      { number: '2.13', title: 'Timekeeper Delegation', time: '7 min' },
      { number: '2.14', title: 'Audit Trail Config', time: '8 min' }
    ]
  },
  {
    id: 'advanced',
    label: 'G. Advanced',
    color: 'indigo',
    icon: Scale,
    sections: [
      { number: '2.15', title: 'CBA/Union Rules', time: '10 min' }
    ]
  },
  {
    id: 'shift-overrides',
    label: 'H. Shift-Level Overrides',
    color: 'cyan',
    icon: Timer,
    sections: [
      { number: '2.16', title: 'Shift Rounding Rules', time: '12 min' }
    ]
  }
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-600' },
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-600' },
    green: { border: 'border-green-500/30', bg: 'bg-green-500/5', text: 'text-green-600' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-600' },
    teal: { border: 'border-teal-500/30', bg: 'bg-teal-500/5', text: 'text-teal-600' },
    red: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-600' },
    indigo: { border: 'border-indigo-500/30', bg: 'bg-indigo-500/5', text: 'text-indigo-600' },
    cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', text: 'text-cyan-600' }
  };
  return colorMap[color] || colorMap.blue;
};

export function TimeAttendanceManualFoundationSection() {
  const totalReadTime = sectionGroups.reduce((acc, group) => {
    return acc + group.sections.reduce((sum, s) => sum + parseInt(s.time), 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Chapter Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Chapter 2</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{totalReadTime} min read</span>
            <span>•</span>
            <span>16 Sections</span>
          </div>
          <CardTitle className="text-2xl">Foundation Setup</CardTitle>
          <p className="text-muted-foreground">
            Configure time policies, collection methods, location validation, and governance controls
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
      <Accordion type="multiple" defaultValue={['prerequisites']} className="space-y-4">
        {/* A. Prerequisites */}
        <AccordionItem 
          value="prerequisites" 
          className={`border rounded-lg ${getColorClasses('amber').border} ${getColorClasses('amber').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`h-5 w-5 ${getColorClasses('amber').text}`} />
              <span className="font-medium">A. Prerequisites</span>
              <Badge variant="secondary" className="ml-2">1 Section</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <TAFoundationPrerequisites />
          </AccordionContent>
        </AccordionItem>

        {/* B. Core Policies */}
        <AccordionItem 
          value="policies" 
          className={`border rounded-lg ${getColorClasses('blue').border} ${getColorClasses('blue').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Settings className={`h-5 w-5 ${getColorClasses('blue').text}`} />
              <span className="font-medium">B. Core Policies</span>
              <Badge variant="secondary" className="ml-2">3 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <TAFoundationTimePolicies />
            <TAFoundationPolicyAssignments />
            <TAFoundationOvertimeRates />
          </AccordionContent>
        </AccordionItem>

        {/* C. Time Collection */}
        <AccordionItem 
          value="collection" 
          className={`border rounded-lg ${getColorClasses('green').border} ${getColorClasses('green').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Fingerprint className={`h-5 w-5 ${getColorClasses('green').text}`} />
              <span className="font-medium">C. Time Collection</span>
              <Badge variant="secondary" className="ml-2">4 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <TAFoundationDevices />
            <TAFoundationBiometricTemplates />
            <TAFoundationFaceVerification />
            <TAFoundationPunchImport />
          </AccordionContent>
        </AccordionItem>

        {/* D. Location Validation */}
        <AccordionItem 
          value="location" 
          className={`border rounded-lg ${getColorClasses('purple').border} ${getColorClasses('purple').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <MapPin className={`h-5 w-5 ${getColorClasses('purple').text}`} />
              <span className="font-medium">D. Location Validation</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <TAFoundationGeofencing />
            <TAFoundationGeofenceAssignments />
          </AccordionContent>
        </AccordionItem>

        {/* E. Time Banking */}
        <AccordionItem 
          value="banking" 
          className={`border rounded-lg ${getColorClasses('teal').border} ${getColorClasses('teal').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Timer className={`h-5 w-5 ${getColorClasses('teal').text}`} />
              <span className="font-medium">E. Time Banking</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <TAFoundationCompTime />
            <TAFoundationFlexTime />
          </AccordionContent>
        </AccordionItem>

        {/* F. Governance */}
        <AccordionItem 
          value="governance" 
          className={`border rounded-lg ${getColorClasses('red').border} ${getColorClasses('red').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Shield className={`h-5 w-5 ${getColorClasses('red').text}`} />
              <span className="font-medium">F. Governance</span>
              <Badge variant="secondary" className="ml-2">2 Sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <TAFoundationTimekeeperDelegation />
            <TAFoundationAuditConfig />
          </AccordionContent>
        </AccordionItem>

        {/* G. Advanced */}
        <AccordionItem 
          value="advanced" 
          className={`border rounded-lg ${getColorClasses('indigo').border} ${getColorClasses('indigo').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Scale className={`h-5 w-5 ${getColorClasses('indigo').text}`} />
              <span className="font-medium">G. Advanced</span>
              <Badge variant="secondary" className="ml-2">1 Section</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <TAFoundationCBARules />
          </AccordionContent>
        </AccordionItem>

        {/* H. Shift-Level Overrides */}
        <AccordionItem 
          value="shift-overrides" 
          className={`border rounded-lg ${getColorClasses('cyan').border} ${getColorClasses('cyan').bg}`}
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Timer className={`h-5 w-5 ${getColorClasses('cyan').text}`} />
              <span className="font-medium">H. Shift-Level Overrides</span>
              <Badge variant="secondary" className="ml-2">1 Section</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <TAFoundationShiftRoundingRules />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
