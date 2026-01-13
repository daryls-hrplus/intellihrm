import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Sparkles, ExternalLink, Calendar, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProficiencyLevelBadge } from "@/components/capabilities";

export interface JobRequirement {
  job_id: string;
  job_name: string;
  required_proficiency_level: number;
  weighting: number;
  is_required: boolean;
  is_preferred: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface SkillMapping {
  skill_id: string;
  skill_name: string;
  min_proficiency_level: number;
  weight: number;
  is_required: boolean;
}

interface Props {
  competencyId: string;
  jobRequirements: JobRequirement[];
  skillMappings: SkillMapping[];
}

export function CompetencyExpandedDetails({ competencyId, jobRequirements, skillMappings }: Props) {
  const navigate = useNavigate();
  
  const getRequirementTypeBadge = (isRequired: boolean, isPreferred: boolean) => {
    if (isRequired) {
      return <Badge variant="default" className="bg-red-500/10 text-red-600 border-red-500/20">Required</Badge>;
    }
    if (isPreferred) {
      return <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Preferred</Badge>;
    }
    return <Badge variant="secondary">Optional</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="py-3 px-2">
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="jobs" className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Job Requirements ({jobRequirements.length})
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Supporting Skills ({skillMappings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="mt-3">
          {jobRequirements.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No jobs linked to this competency
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Job</TableHead>
                    <TableHead className="text-center">Required Level</TableHead>
                    <TableHead className="text-center">Weighting</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Effective Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobRequirements.map((req) => (
                    <TableRow key={req.job_id}>
                      <TableCell className="font-medium">{req.job_name}</TableCell>
                      <TableCell className="text-center">
                        <ProficiencyLevelBadge level={req.required_proficiency_level} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span>{req.weighting}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getRequirementTypeBadge(req.is_required, req.is_preferred)}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(req.start_date)} - {formatDate(req.end_date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/workforce/jobs?id=${req.job_id}`)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Job
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="skills" className="mt-3">
          {skillMappings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No skills mapped to this competency
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Skill</TableHead>
                    <TableHead className="text-center">Min Level Required</TableHead>
                    <TableHead className="text-center">Weight Contribution</TableHead>
                    <TableHead className="text-center">Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skillMappings.map((mapping) => (
                    <TableRow key={mapping.skill_id}>
                      <TableCell className="font-medium">{mapping.skill_name}</TableCell>
                      <TableCell className="text-center">
                        <ProficiencyLevelBadge level={mapping.min_proficiency_level} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span>{mapping.weight}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {mapping.is_required ? (
                          <Badge variant="default" className="bg-red-500/10 text-red-600 border-red-500/20">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
