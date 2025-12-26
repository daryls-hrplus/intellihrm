import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LucideIcon, ChevronDown } from "lucide-react";

export interface GroupedModuleItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  tabCode?: string;
}

export interface ModuleSection {
  titleKey: string;
  items: GroupedModuleItem[];
}

interface GroupedModuleCardsProps {
  sections: ModuleSection[];
  defaultOpen?: boolean;
}

export function GroupedModuleCards({ sections, defaultOpen = true }: GroupedModuleCardsProps) {
  const navigate = useNavigate();
  
  // Initialize all sections as open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(section => {
      initial[section.titleKey] = defaultOpen;
    });
    return initial;
  });

  const toggleSection = (titleKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [titleKey]: !prev[titleKey]
    }));
  };

  // Filter out empty sections
  const nonEmptySections = sections.filter(section => section.items.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {nonEmptySections.map((section) => (
        <Card key={section.titleKey} className={`overflow-hidden transition-all duration-200 ${
          !openSections[section.titleKey] ? 'h-auto' : ''
        }`}>
          <Collapsible 
            open={openSections[section.titleKey]} 
            onOpenChange={() => toggleSection(section.titleKey)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{section.titleKey}</CardTitle>
                  <ChevronDown 
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      openSections[section.titleKey] ? 'rotate-180' : ''
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
      ))}
    </div>
  );
}
