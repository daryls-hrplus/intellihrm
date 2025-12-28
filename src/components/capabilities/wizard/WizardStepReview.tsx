import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap, Target, AlertTriangle, Building, Users, CheckCircle2,
} from "lucide-react";
import { MasterSkill, MasterCompetency } from "./types";

interface WizardStepReviewProps {
  selectedIndustries: string[];
  selectedOccupations: string[];
  occupationLabels: Record<string, string>;
  selectedSkills: Set<string>;
  selectedCompetencies: Set<string>;
  allSkills: MasterSkill[];
  allCompetencies: MasterCompetency[];
}

export function WizardStepReview({
  selectedIndustries,
  selectedOccupations,
  occupationLabels,
  selectedSkills,
  selectedCompetencies,
  allSkills,
  allCompetencies,
}: WizardStepReviewProps) {
  // Calculate stats
  const selectedSkillsList = allSkills.filter(s => selectedSkills.has(s.id) && !s.alreadyExists);
  const selectedCompetenciesList = allCompetencies.filter(c => selectedCompetencies.has(c.id) && !c.alreadyExists);
  
  const newSkillsCount = selectedSkillsList.length;
  const newCompetenciesCount = selectedCompetenciesList.length;
  const skippedSkillsCount = allSkills.filter(s => selectedSkills.has(s.id) && s.alreadyExists).length;
  const skippedCompetenciesCount = allCompetencies.filter(c => selectedCompetencies.has(c.id) && c.alreadyExists).length;

  // Group by category
  const skillsByCategory = selectedSkillsList.reduce((acc, skill) => {
    const cat = skill.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, MasterSkill[]>);

  const competenciesByCategory = selectedCompetenciesList.reduce((acc, comp) => {
    const cat = comp.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(comp);
    return acc;
  }, {} as Record<string, MasterCompetency[]>);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">Review Your Import</h3>
        <p className="text-sm text-muted-foreground">
          Review the summary below before importing to your capability library.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Building className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{selectedIndustries.length}</p>
            <p className="text-xs text-muted-foreground">Industries</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{selectedOccupations.length}</p>
            <p className="text-xs text-muted-foreground">Occupations</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">{newSkillsCount}</p>
            <p className="text-xs text-muted-foreground">New Skills</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">{newCompetenciesCount}</p>
            <p className="text-xs text-muted-foreground">New Competencies</p>
          </CardContent>
        </Card>
      </div>

      {/* Skipped items warning */}
      {(skippedSkillsCount > 0 || skippedCompetenciesCount > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {skippedSkillsCount > 0 && (
              <span>{skippedSkillsCount} skill(s) already exist and will be skipped. </span>
            )}
            {skippedCompetenciesCount > 0 && (
              <span>{skippedCompetenciesCount} competency(ies) already exist and will be skipped.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Occupations selected */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Selected Occupations</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {selectedOccupations.slice(0, 10).map(id => (
              <Badge key={id} variant="secondary" className="text-xs">
                {occupationLabels[id] || id}
              </Badge>
            ))}
            {selectedOccupations.length > 10 && (
              <Badge variant="outline" className="text-xs">
                +{selectedOccupations.length - 10} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills by category */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Skills to Import ({newSkillsCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {Object.keys(skillsByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground">No new skills to import</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{category}</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 8).map(skill => (
                      <Badge key={skill.id} variant="outline" className="text-xs">
                        {skill.skill_name}
                      </Badge>
                    ))}
                    {skills.length > 8 && (
                      <Badge variant="secondary" className="text-xs">
                        +{skills.length - 8}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competencies by category */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Competencies to Import ({newCompetenciesCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {Object.keys(competenciesByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground">No new competencies to import</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(competenciesByCategory).map(([category, competencies]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{category}</p>
                  <div className="flex flex-wrap gap-1">
                    {competencies.slice(0, 6).map(comp => (
                      <Badge key={comp.id} variant="outline" className="text-xs">
                        {comp.competency_name}
                      </Badge>
                    ))}
                    {competencies.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{competencies.length - 6}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Alert className="bg-primary/5 border-primary/20">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertDescription>
          Click "Start Import" to add {newSkillsCount} skills and {newCompetenciesCount} competencies to your company's capability library.
        </AlertDescription>
      </Alert>
    </div>
  );
}
