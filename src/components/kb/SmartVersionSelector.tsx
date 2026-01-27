// Smart Version Type selector with AI recommendations

import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type VersionType = 'initial' | 'major' | 'minor' | 'patch';

interface SmartVersionSelectorProps {
  value: VersionType;
  onChange: (type: VersionType) => void;
  isFirstPublication: boolean;
  nextVersions: {
    initial: string;
    major: string;
    minor: string;
    patch: string;
  };
  recommendedType?: VersionType;
  versionFreezeEnabled?: boolean;
  isPreRelease?: boolean;
}

export function SmartVersionSelector({
  value,
  onChange,
  isFirstPublication,
  nextVersions,
  recommendedType,
  versionFreezeEnabled = false,
  isPreRelease = false,
}: SmartVersionSelectorProps) {
  const options: Array<{
    value: VersionType;
    label: string;
    description: string;
    version: string;
    showWhen: 'always' | 'first' | 'update';
  }> = [
    {
      value: 'initial',
      label: 'Initial Release',
      description: 'First publication of this manual',
      version: nextVersions.initial,
      showWhen: 'first',
    },
    {
      value: 'major',
      label: 'Major Update',
      description: 'Breaking changes or significant restructure',
      version: nextVersions.major,
      showWhen: 'always',
    },
    {
      value: 'minor',
      label: 'Minor Update',
      description: 'New content or feature updates',
      version: nextVersions.minor,
      showWhen: 'always',
    },
    {
      value: 'patch',
      label: 'Patch Update',
      description: 'Bug fixes and minor corrections',
      version: nextVersions.patch,
      showWhen: 'update',
    },
  ];

  const visibleOptions = options.filter(opt => {
    // Base visibility rules
    if (opt.showWhen === 'first' && !isFirstPublication) return false;
    if (opt.showWhen === 'update' && isFirstPublication) return false;
    
    // Version freeze rules: when enabled and in pre-release, hide major/minor
    if (versionFreezeEnabled && isPreRelease) {
      if (opt.value === 'major' || opt.value === 'minor') {
        return false; // Only allow initial (first publish) and patch (updates)
      }
    }
    
    return true;
  });

  // For first publication, auto-select initial
  const effectiveValue = isFirstPublication && value !== 'initial' ? 'initial' : value;
  const effectiveRecommended = isFirstPublication ? 'initial' : recommendedType;

  return (
    <RadioGroup
      value={effectiveValue}
      onValueChange={(v) => onChange(v as VersionType)}
      className="space-y-2"
    >
      {visibleOptions.map((option) => {
        const isRecommended = option.value === effectiveRecommended;
        const isSelected = option.value === effectiveValue;

        return (
          <div
            key={option.value}
            className={cn(
              "flex items-start gap-3 p-3 border rounded-lg transition-colors cursor-pointer",
              isSelected && "border-primary bg-primary/5",
              !isSelected && "hover:bg-muted/50"
            )}
            onClick={() => onChange(option.value)}
          >
            <RadioGroupItem 
              value={option.value} 
              id={option.value} 
              className="mt-1" 
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label 
                  htmlFor={option.value} 
                  className="font-medium cursor-pointer"
                >
                  {option.label}
                </label>
                {isRecommended && (
                  <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                isSelected && "bg-primary/10 border-primary text-primary"
              )}
            >
              v{option.version}
            </Badge>
          </div>
        );
      })}
    </RadioGroup>
  );
}