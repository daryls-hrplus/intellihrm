import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_PROFICIENCY_LEVELS } from "./ProficiencyLevelPicker";

interface SkillProficiencyGuideProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function SkillProficiencyGuide({ trigger, className }: SkillProficiencyGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className={cn("gap-1.5 text-muted-foreground hover:text-foreground", className)}>
            <BookOpen className="h-4 w-4" />
            <span>Proficiency Guide</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Proficiency Level Guide
          </DialogTitle>
          <DialogDescription>
            Understanding what each proficiency level means for capability assessments
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Framework Introduction */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">About This Framework</h3>
              <p className="text-sm text-muted-foreground">
                Our 5-level proficiency model is based on the <strong>Dreyfus Model of Skill Acquisition</strong> combined 
                with industry best practices from the <strong>SFIA Framework</strong>. Each level represents 
                a distinct stage of competence with specific behavioral expectations.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Dreyfus Model
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  SFIA v9
                </Badge>
              </div>
            </div>
            
            {/* Level Cards */}
            <div className="space-y-4">
              {DEFAULT_PROFICIENCY_LEVELS.map((level) => {
                const Icon = level.icon;
                return (
                  <div 
                    key={level.level} 
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn("p-2.5 rounded-lg shrink-0", level.bgColor)}>
                        <Icon className={cn("h-6 w-6", level.color)} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Level {level.level}</span>
                          <Badge variant="secondary" className={cn("text-xs", level.color)}>
                            {level.name}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {level.fullDescription}
                        </p>
                        
                        <Separator className="my-3" />
                        
                        {/* Behavioral Indicators */}
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Behavioral Indicators
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            {level.behavioralIndicators.map((indicator, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", level.bgColor.replace('bg-', 'bg-').replace('/30', ''))} 
                                  style={{ backgroundColor: `hsl(var(--${level.color.replace('text-', '')}))` }}
                                />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Appraisal Guidance */}
                        <div className="bg-muted/50 rounded-md p-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            💡 Appraisal Guidance
                          </h4>
                          <p className="text-sm text-muted-foreground italic">
                            {level.appraisalGuidance}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer Note */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span>📊</span>
                Skill-Specific Context
              </h3>
              <p className="text-sm text-muted-foreground">
                When viewing individual skills, you'll see <strong>skill-specific behavioral indicators</strong> that 
                describe what each level means for that particular skill. These are generated using AI to provide 
                contextually relevant expectations beyond the generic framework.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
