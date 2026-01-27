import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { 
  FUNCTIONAL_AREAS, 
  type ManualDefinition,
} from "@/constants/manualsStructure";

interface ManualCardProps {
  manual: ManualDefinition;
  onClick: () => void;
}

export function ManualCard({ manual, onClick }: ManualCardProps) {
  const IconComponent = manual.icon;

  return (
    <Card
      className={`group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${manual.color} border`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${manual.color}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <Badge variant="outline" className={manual.badgeColor}>
            v{manual.version}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
          {manual.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {manual.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Functional Area Tags */}
        <div className="flex flex-wrap gap-1.5">
          {manual.functionalAreas.map((area) => (
            <Badge 
              key={area} 
              variant="outline" 
              className={`text-xs ${FUNCTIONAL_AREAS[area].badgeClass}`}
            >
              {FUNCTIONAL_AREAS[area].label}
            </Badge>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="font-medium">
            {manual.chapters} Chapters
          </Badge>
          <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
            View Manual
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
