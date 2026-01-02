import { Shield, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface BusinessRule {
  rule: string;
  enforcement: 'System' | 'Policy' | 'Advisory';
  description: string;
}

interface BusinessRulesProps {
  rules: BusinessRule[];
  title?: string;
}

export function BusinessRules({ rules, title = 'Business Rules & Validation' }: BusinessRulesProps) {
  const getEnforcementColor = (enforcement: BusinessRule['enforcement']) => {
    switch (enforcement) {
      case 'System':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Policy':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Advisory':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="space-y-3">
        {rules.map((item, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.rule}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
              <Badge className={`text-xs flex-shrink-0 ${getEnforcementColor(item.enforcement)}`}>
                {item.enforcement}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>System: Enforced by application</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Policy: HR governance required</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Advisory: Best practice</span>
        </div>
      </div>
    </div>
  );
}
