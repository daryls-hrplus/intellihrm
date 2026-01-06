import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, UserCog, Users, Lock, CheckCircle, XCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout, InfoCallout, ScreenshotPlaceholder } from '../../../manual/components';

const adminLevels = [
  {
    level: 1,
    name: 'Super Admin',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Full system access with governance oversight',
    capabilities: [
      'Full access to all modules and configurations',
      'Create and manage other administrator accounts',
      'Configure system-wide security policies',
      'Access all audit logs and compliance reports',
      'Manage AI governance settings',
      'Override module-level restrictions'
    ],
    restrictions: [
      'Cannot delete audit logs',
      'Actions are fully logged and immutable',
      'Requires MFA at all times'
    ],
    typicalUsers: 'IT Director, HRIS Manager, Implementation Lead'
  },
  {
    level: 2,
    name: 'Security Admin',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Security policies and access control management',
    capabilities: [
      'Configure authentication and MFA policies',
      'Manage role-based permissions',
      'Review security audit logs',
      'Configure session and password policies',
      'Monitor security dashboards',
      'Manage user access requests'
    ],
    restrictions: [
      'Cannot modify organization hierarchy',
      'Cannot access payroll processing',
      'Cannot create Super Admin accounts'
    ],
    typicalUsers: 'IT Security Officer, Compliance Manager'
  },
  {
    level: 3,
    name: 'Module Admin',
    icon: UserCog,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Specific module configuration and management',
    capabilities: [
      'Full access to assigned modules',
      'Configure module-specific settings',
      'Manage module workflows',
      'Run module reports',
      'Configure module notifications'
    ],
    restrictions: [
      'Access limited to assigned modules only',
      'Cannot modify security policies',
      'Cannot create administrator accounts'
    ],
    typicalUsers: 'Payroll Manager, Recruitment Lead, L&D Manager'
  },
  {
    level: 4,
    name: 'HR Admin/User',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Day-to-day HR operations and employee management',
    capabilities: [
      'Manage employee records (within scope)',
      'Process HR transactions',
      'Run operational reports',
      'Approve requests (based on workflow)',
      'View assigned dashboards'
    ],
    restrictions: [
      'Access based on data scope (company/department)',
      'Cannot modify system configuration',
      'Cannot create any administrator accounts',
      'Cannot access security settings'
    ],
    typicalUsers: 'HR Business Partner, HR Officer, HR Assistant'
  }
];

export function UsersAdminLevels() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          'Understand the four-tier administrator hierarchy',
          'Identify capabilities and restrictions for each level',
          'Apply the principle of least privilege in role assignment',
          'Match administrator levels to job responsibilities'
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Administrator Hierarchy Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HRplus implements a <strong>four-tier administrator hierarchy</strong> based on the 
            principle of least privilege. Each level provides progressively broader access, 
            with corresponding accountability and audit requirements.
          </p>
          
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium mb-3">Hierarchy Pyramid</h4>
            <div className="space-y-2">
              {adminLevels.map((level) => (
                <div 
                  key={level.level}
                  className="flex items-center gap-3"
                  style={{ paddingLeft: `${(level.level - 1) * 24}px` }}
                >
                  <Badge variant="outline" className={level.color}>L{level.level}</Badge>
                  <span className="font-medium">{level.name}</span>
                  <span className="text-sm text-muted-foreground">— {level.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 3.1.1: Administrator hierarchy pyramid showing the four-tier access model"
        alt="Visual pyramid showing Super Admin at top, followed by Security Admin, Module Admin, and HR Admin/User at base"
        aspectRatio="wide"
      />

      {adminLevels.map((level) => {
        const IconComponent = level.icon;
        return (
          <Card key={level.level} id={`admin-level-${level.level}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${level.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${level.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span>Level {level.level}: {level.name}</span>
                    <Badge variant="outline">{level.typicalUsers.split(',')[0]}</Badge>
                  </div>
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    {level.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Capabilities
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {level.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Lock className="h-4 w-4" />
                    Restrictions
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {level.restrictions.map((res, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <XCircle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                        {res}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">Typical Users: </span>
                <span className="text-sm">{level.typicalUsers}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <WarningCallout title="Segregation of Duties">
        Never assign Super Admin to users who also perform day-to-day transactions. 
        The person who configures payroll should not be the same person who runs payroll. 
        This prevents fraud and ensures proper oversight.
      </WarningCallout>

      <TipCallout title="Starting Point Recommendation">
        For new implementations, start with 1-2 Super Admins (IT/HRIS), 1 Security Admin, 
        and Module Admins for each functional area. Add HR Admin/Users as the system scales.
      </TipCallout>

      <InfoCallout title="Emergency Access">
        For emergency situations, Super Admins can grant temporary elevated access. 
        All emergency access is logged and automatically expires after 24 hours unless renewed.
      </InfoCallout>
    </div>
  );
}
