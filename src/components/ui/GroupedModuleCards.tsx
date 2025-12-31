import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { 
  LucideIcon, 
  ChevronDown, 
  User, 
  Sparkles, 
  Clock, 
  CreditCard, 
  Target, 
  GraduationCap, 
  Rocket, 
  Building2, 
  CheckSquare, 
  HelpCircle,
  Compass
} from "lucide-react";

export interface GroupedModuleItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  tabCode?: string;
}

export interface SectionBadge {
  count: number;
  label: string;
  variant: "default" | "warning" | "destructive";
}

export interface ModuleSection {
  titleKey: string;
  items: GroupedModuleItem[];
}

interface GroupedModuleCardsProps {
  sections: ModuleSection[];
  defaultOpen?: boolean;
  sectionBadges?: Record<string, SectionBadge | null>;
}

// Map section titles to icons
const sectionIcons: Record<string, LucideIcon> = {
  "My Profile": User,
  "Skills & Capabilities": Sparkles,
  "Career": Compass,
  "Time & Absence": Clock,
  "Pay & Benefits": CreditCard,
  "Performance": Target,
  "Learning & Development": GraduationCap,
  "Employee Lifecycle": Rocket,
  "Workplace": Building2,
  "Tasks & Approvals": CheckSquare,
  "Help & Settings": HelpCircle,
};

export function GroupedModuleCards({ sections, defaultOpen = false, sectionBadges = {} }: GroupedModuleCardsProps) {
  const navigate = useNavigate();
  
  // Track open sections - default state based on defaultOpen prop
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Determine if a section is open - use state if set, otherwise use defaultOpen prop
  const isSectionOpen = (titleKey: string) => {
    return openSections[titleKey] ?? defaultOpen;
  };

  const toggleSection = (titleKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [titleKey]: !(prev[titleKey] ?? defaultOpen)
    }));
  };

  // Filter out empty sections
  const nonEmptySections = sections.filter(section => section.items.length > 0);

  const getBadgeVariantClass = (variant: SectionBadge["variant"]) => {
    switch (variant) {
      case "destructive":
        return "bg-destructive text-destructive-foreground";
      case "warning":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {nonEmptySections.map((section) => {
        const SectionIcon = sectionIcons[section.titleKey];
        const badge = sectionBadges[section.titleKey];

        return (
          <Card key={section.titleKey} className={`overflow-hidden transition-all duration-200 ${
            !isSectionOpen(section.titleKey) ? 'h-auto' : ''
          }`}>
            <Collapsible 
              open={isSectionOpen(section.titleKey)} 
              onOpenChange={() => toggleSection(section.titleKey)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {SectionIcon && (
                        <SectionIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-lg font-semibold">{section.titleKey}</CardTitle>
                      {badge && (
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs font-medium ${getBadgeVariantClass(badge.variant)}`}
                        >
                          {badge.label}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                        isSectionOpen(section.titleKey) ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                <CardContent className="space-y-2 pt-4">
                  {section.items.map((item) => (
                    <div
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className="flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-muted hover:shadow-sm cursor-pointer group"
                    >
                      <div className={`p-2 rounded-lg ${item.color} transition-transform group-hover:scale-105`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
