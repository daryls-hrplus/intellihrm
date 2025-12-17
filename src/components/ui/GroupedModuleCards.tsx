import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

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
}

export function GroupedModuleCards({ sections }: GroupedModuleCardsProps) {
  const navigate = useNavigate();

  // Filter out empty sections
  const nonEmptySections = sections.filter(section => section.items.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {nonEmptySections.map((section) => (
        <Card key={section.titleKey} className="overflow-hidden">
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle className="text-lg font-semibold">{section.titleKey}</CardTitle>
          </CardHeader>
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
        </Card>
      ))}
    </div>
  );
}
