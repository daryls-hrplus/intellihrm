import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, TrendingUp, Route, Target, BookOpen, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CareerPath {
  id: string;
  name: string;
  description: string | null;
  target_position_title: string | null;
  milestones: CareerMilestone[];
}

interface CareerMilestone {
  id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  is_completed: boolean;
  required_skills: string[];
}

interface SkillGap {
  skill_name: string;
  current_level: number;
  required_level: number;
  gap: number;
}

interface RecommendedCourse {
  id: string;
  title: string;
  duration_minutes: number | null;
  skill_addressed: string;
}

export default function MyCareerPathsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: t("ess.title"), href: "/ess" },
    { label: t("ess.modules.careerPaths.title", "My Career Paths") },
  ];

  useEffect(() => {
    if (profile?.id) {
      loadCareerData();
    }
  }, [profile?.id]);

  const loadCareerData = async () => {
    setLoading(true);

    // Load career paths assigned to employee
    const { data: pathAssignments } = await (supabase
      .from('career_path_employees' as any) as any)
      .select(`
        career_path_id,
        career_path:career_paths(
          id,
          name,
          description,
          target_position:positions(title)
        )
      `)
      .eq('employee_id', profile?.id);

    // Load milestones for each path
    const paths: CareerPath[] = [];
    if (pathAssignments) {
      for (const assignment of pathAssignments) {
        if (assignment.career_path) {
          const { data: milestones } = await (supabase
            .from('career_path_milestones' as any) as any)
            .select('id, title, description, sequence_order, required_skills')
            .eq('career_path_id', assignment.career_path.id)
            .order('sequence_order');

          // Check completion status for each milestone
          const { data: completions } = await (supabase
            .from('career_path_milestone_completions' as any) as any)
            .select('milestone_id')
            .eq('employee_id', profile?.id);

          const completedIds = new Set(completions?.map((c: any) => c.milestone_id) || []);

          paths.push({
            id: assignment.career_path.id,
            name: assignment.career_path.name,
            description: assignment.career_path.description,
            target_position_title: assignment.career_path.target_position?.title || null,
            milestones: (milestones || []).map((m: any) => ({
              ...m,
              is_completed: completedIds.has(m.id),
              required_skills: m.required_skills || [],
            })),
          });
        }
      }
    }

    setCareerPaths(paths);
    if (paths.length > 0) {
      setSelectedPathId(paths[0].id);
    }

    // Load skill gaps (from employee competencies vs job requirements)
    const { data: employeeSkills } = await (supabase
      .from('employee_competencies' as any) as any)
      .select('competency_id, proficiency_level, competency:competencies(name)')
      .eq('employee_id', profile?.id);

    const { data: requiredSkills } = await (supabase
      .from('position_competencies' as any) as any)
      .select('competency_id, required_level, competency:competencies(name)')
      .eq('position_id', (profile as any)?.position_id);

    const gaps: SkillGap[] = [];
    if (requiredSkills) {
      for (const req of requiredSkills) {
        const current = employeeSkills?.find((e: any) => e.competency_id === req.competency_id);
        const currentLevel = current?.proficiency_level || 0;
        const requiredLevel = req.required_level || 3;
        if (currentLevel < requiredLevel) {
          gaps.push({
            skill_name: req.competency?.name || 'Unknown',
            current_level: currentLevel,
            required_level: requiredLevel,
            gap: requiredLevel - currentLevel,
          });
        }
      }
    }
    setSkillGaps(gaps.slice(0, 5)); // Top 5 gaps

    // Load recommended courses based on gaps
    const gapSkillNames = gaps.map(g => g.skill_name);
    if (gapSkillNames.length > 0) {
      const { data: courses } = await (supabase
        .from('training_courses' as any) as any)
        .select('id, title, duration_minutes')
        .eq('is_active', true)
        .limit(5);
      
      setRecommendedCourses((courses || []).map((c: any) => ({
        ...c,
        skill_addressed: gapSkillNames[0] || 'General',
      })));
    }

    setLoading(false);
  };

  const selectedPath = careerPaths.find(p => p.id === selectedPathId);
  const completedMilestones = selectedPath?.milestones.filter(m => m.is_completed).length || 0;
  const totalMilestones = selectedPath?.milestones.length || 0;
  const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
            <Route className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("ess.modules.careerPaths.title", "My Career Paths")}
            </h1>
            <p className="text-muted-foreground">
              {t("ess.modules.careerPaths.description", "Explore your career progression opportunities")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : careerPaths.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("career.noPathsAssigned", "No Career Paths Assigned")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("career.noPathsDescription", "Career paths will appear here once assigned by HR. Discuss your career aspirations with your manager.")}
              </p>
              <Button variant="outline" asChild>
                <a href="/ess/development">
                  View Development Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Career Path Selector */}
            <div className="lg:col-span-2 space-y-4">
              {/* Path Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {careerPaths.map((path) => {
                  const completed = path.milestones.filter(m => m.is_completed).length;
                  const total = path.milestones.length;
                  const progress = total > 0 ? (completed / total) * 100 : 0;
                  
                  return (
                    <Card 
                      key={path.id} 
                      className={`cursor-pointer transition-all ${selectedPathId === path.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                      onClick={() => setSelectedPathId(path.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          {path.name}
                        </CardTitle>
                        {path.target_position_title && (
                          <CardDescription className="text-xs">
                            Target: {path.target_position_title}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{completed}/{total} milestones</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Selected Path Milestones */}
              {selectedPath && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      {selectedPath.name} - Milestones
                    </CardTitle>
                    {selectedPath.description && (
                      <CardDescription>{selectedPath.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPath.milestones.map((milestone, idx) => (
                        <div 
                          key={milestone.id} 
                          className={`flex items-start gap-4 p-4 rounded-lg border ${milestone.is_completed ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-muted/30'}`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${milestone.is_completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {milestone.is_completed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{milestone.title}</p>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                            )}
                            {milestone.required_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {milestone.required_skills.map((skill, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {milestone.is_completed && (
                            <Badge className="bg-green-500 text-white">Complete</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Skill Gaps */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Skill Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {skillGaps.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No skill gaps identified
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {skillGaps.map((gap, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{gap.skill_name}</span>
                            <span className="text-muted-foreground">
                              {gap.current_level}/{gap.required_level}
                            </span>
                          </div>
                          <Progress 
                            value={(gap.current_level / gap.required_level) * 100} 
                            className="h-1.5" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Courses */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    Recommended Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendedCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No courses recommended
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recommendedCourses.map((course) => (
                        <a
                          key={course.id}
                          href={`/ess/training/${course.id}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{course.title}</p>
                            {course.duration_minutes && (
                              <p className="text-xs text-muted-foreground">
                                {Math.round(course.duration_minutes / 60)}h
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/ess/skill-gaps">
                      View Full Skill Analysis
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/ess/development">
                      Development Plan
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/ess/mentorship">
                      Find a Mentor
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
