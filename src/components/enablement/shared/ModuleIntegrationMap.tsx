import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Building2, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  Briefcase,
  GraduationCap,
  DollarSign,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ModuleCode = 'workforce' | 'hr_hub' | 'appraisals' | 'recruitment' | 'learning' | 'payroll' | 'time_attendance';

interface IntegrationPoint {
  sourceSection: string;
  targetSection: string;
  type: 'data_flow' | 'prerequisite' | 'bidirectional';
  label: string;
}

interface ModuleInfo {
  code: ModuleCode;
  name: string;
  icon: React.ElementType;
  color: string;
}

interface ModuleIntegrationMapProps {
  currentModule: ModuleCode;
  integrations: {
    module: ModuleCode;
    points: IntegrationPoint[];
  }[];
  title?: string;
  className?: string;
}

const moduleConfig: Record<ModuleCode, ModuleInfo> = {
  workforce: {
    code: 'workforce',
    name: 'Workforce',
    icon: Building2,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30'
  },
  hr_hub: {
    code: 'hr_hub',
    name: 'HR Hub',
    icon: FileText,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30'
  },
  appraisals: {
    code: 'appraisals',
    name: 'Appraisals',
    icon: BarChart3,
    color: 'text-green-500 bg-green-500/10 border-green-500/30'
  },
  recruitment: {
    code: 'recruitment',
    name: 'Recruitment',
    icon: Users,
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/30'
  },
  learning: {
    code: 'learning',
    name: 'Learning',
    icon: GraduationCap,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30'
  },
  payroll: {
    code: 'payroll',
    name: 'Payroll',
    icon: DollarSign,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
  },
  time_attendance: {
    code: 'time_attendance',
    name: 'Time & Attendance',
    icon: Clock,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
  }
};

export function ModuleIntegrationMap({
  currentModule,
  integrations,
  title = 'Module Integration Points',
  className
}: ModuleIntegrationMapProps) {
  const currentModuleInfo = moduleConfig[currentModule];
  const CurrentIcon = currentModuleInfo.icon;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          {/* Current Module (Center) */}
          <div 
            className={cn(
              'flex items-center gap-3 px-6 py-4 rounded-xl border-2',
              currentModuleInfo.color
            )}
          >
            <CurrentIcon className="h-8 w-8" />
            <div>
              <p className="font-semibold text-lg">{currentModuleInfo.name}</p>
              <p className="text-xs text-muted-foreground">Current Manual</p>
            </div>
          </div>

          {/* Integration Lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {integrations.map((integration) => {
              const targetModule = moduleConfig[integration.module];
              const TargetIcon = targetModule.icon;
              
              return (
                <div
                  key={integration.module}
                  className="relative p-4 rounded-lg border bg-card"
                >
                  {/* Module Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('p-2 rounded-lg', targetModule.color)}>
                      <TargetIcon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">{targetModule.name}</span>
                  </div>

                  {/* Integration Points */}
                  <div className="space-y-2">
                    {integration.points.map((point, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 text-xs"
                      >
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {point.label}
                        </span>
                        <Badge variant="outline" className="text-[10px] ml-auto flex-shrink-0">
                          {point.type === 'prerequisite' ? 'Prereq' : 
                           point.type === 'bidirectional' ? '↔' : '→'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
