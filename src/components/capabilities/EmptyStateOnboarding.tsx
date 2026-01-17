import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Plus, Upload, Target, Zap, Layers, ArrowRight, Heart } from "lucide-react";

interface EmptyStateOnboardingProps {
  onOpenWizard: () => void;
  onOpenBulkImport: () => void;
  onAddSkill: () => void;
  onAddCompetency: () => void;
  onAddValue?: () => void;
}

export function EmptyStateOnboarding({
  onOpenWizard,
  onOpenBulkImport,
  onAddSkill,
  onAddCompetency,
  onAddValue,
}: EmptyStateOnboardingProps) {
  return (
    <div className="py-12 px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Layers className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Build Your Capability Framework</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Define your organization's values, competencies, and skills to enable performance management, career pathing, and workforce planning.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
        {/* Import from Library Card */}
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer group" onClick={onOpenWizard}>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-colors">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Import from Library</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import industry-standard skills & competencies from ESCO and O*NET in minutes
                </p>
              </div>
              <Button className="w-full group-hover:bg-primary/90">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Import Wizard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Manually Card */}
        <Card className="border-2 border-dashed hover:border-muted-foreground/50 transition-colors">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Create Manually</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build custom values, skills, and competencies tailored to your organization
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {onAddValue && (
                  <Button variant="outline" className="w-full border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={onAddValue}>
                    <Heart className="mr-2 h-4 w-4 text-rose-500" />
                    Add Company Value
                  </Button>
                )}
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={onAddCompetency}>
                    <Target className="mr-2 h-4 w-4" />
                    Add Competency
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={onAddSkill}>
                    <Zap className="mr-2 h-4 w-4" />
                    Add Skill
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSV Import Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Have a spreadsheet?
        </p>
        <Button variant="link" className="text-primary" onClick={onOpenBulkImport}>
          <Upload className="mr-2 h-4 w-4" />
          Import from CSV
        </Button>
      </div>
    </div>
  );
}
