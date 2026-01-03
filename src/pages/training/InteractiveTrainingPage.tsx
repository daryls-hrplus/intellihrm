import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Search, 
  GraduationCap, 
  BookOpen, 
  Award,
  Clock,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrainingProgramCard, 
  TrainingPlayer 
} from "@/components/training/interactive";
import {
  useMyEnrollments,
  useAvailablePrograms,
  useEnrollInProgram,
} from "@/hooks/useInteractiveTraining";

export default function InteractiveTrainingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-training");
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(
    searchParams.get("enrollment")
  );
  const [selectedProgram, setSelectedProgram] = useState<string | null>(
    searchParams.get("program")
  );
  
  const { data: enrollments, isLoading: enrollmentsLoading } = useMyEnrollments();
  const { data: availablePrograms, isLoading: programsLoading } = useAvailablePrograms();
  const enrollInProgram = useEnrollInProgram();
  
  // Filter out programs user is already enrolled in
  const enrolledProgramIds = enrollments?.map(e => e.program_id) || [];
  const unenrolledPrograms = availablePrograms?.filter(
    p => !enrolledProgramIds.includes(p.id)
  ) || [];
  
  // Stats
  const completedCount = enrollments?.filter(e => e.status === "completed").length || 0;
  const inProgressCount = enrollments?.filter(e => e.status === "in_progress").length || 0;
  const totalEnrollments = enrollments?.length || 0;
  
  const handleStartProgram = async (programId: string) => {
    try {
      const enrollment = await enrollInProgram.mutateAsync(programId);
      toast.success("Enrolled successfully!");
      setSelectedEnrollment(enrollment.id);
      setSelectedProgram(programId);
    } catch (error) {
      toast.error("Failed to enroll in program");
    }
  };
  
  const handleContinueProgram = (enrollmentId: string, programId: string) => {
    setSelectedEnrollment(enrollmentId);
    setSelectedProgram(programId);
  };
  
  const handleBackToList = () => {
    setSelectedEnrollment(null);
    setSelectedProgram(null);
    navigate("/training/interactive");
  };
  
  // If viewing a specific program
  if (selectedEnrollment && selectedProgram) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Training
          </Button>
          
          <TrainingPlayer
            enrollmentId={selectedEnrollment}
            programId={selectedProgram}
            onComplete={handleBackToList}
          />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink to="/training">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Interactive Training
              </h1>
              <p className="text-muted-foreground">
                Complete video-based training with quizzes and certificates
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalEnrollments}</div>
                  <div className="text-sm text-muted-foreground">Enrolled</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{inProgressCount}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Certificates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="my-training">My Training</TabsTrigger>
              <TabsTrigger value="browse">Browse Programs</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </TabsList>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search training..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <TabsContent value="my-training" className="mt-6">
            {enrollmentsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : enrollments && enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments
                  .filter(e => 
                    !searchQuery || 
                    e.program?.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((enrollment) => (
                    <TrainingProgramCard
                      key={enrollment.id}
                      program={enrollment.program!}
                      enrollment={enrollment}
                      onStart={() => handleContinueProgram(enrollment.id, enrollment.program_id)}
                      onContinue={() => handleContinueProgram(enrollment.id, enrollment.program_id)}
                    />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Training Assigned</h3>
                  <p className="text-muted-foreground mt-2">
                    Browse available programs to get started
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("browse")}>
                    Browse Programs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="browse" className="mt-6">
            {programsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : unenrolledPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unenrolledPrograms
                  .filter(p => 
                    !searchQuery || 
                    p.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((program) => (
                    <TrainingProgramCard
                      key={program.id}
                      program={program}
                      onStart={() => handleStartProgram(program.id)}
                      onContinue={() => {}}
                    />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All Caught Up!</h3>
                  <p className="text-muted-foreground mt-2">
                    You're enrolled in all available programs
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="certificates" className="mt-6">
            {enrollments?.filter(e => e.status === "completed").length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments
                  .filter(e => e.status === "completed")
                  .map((enrollment) => (
                    <Card key={enrollment.id} className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Award className="h-16 w-16 text-primary/40" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{enrollment.program?.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Completed on {new Date(enrollment.completed_at!).toLocaleDateString()}</span>
                        </div>
                        {enrollment.final_score && (
                          <Badge className="mt-2">Score: {enrollment.final_score}%</Badge>
                        )}
                        {enrollment.certificate_verification_code && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Verification: {enrollment.certificate_verification_code}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Certificates Yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Complete training programs to earn certificates
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
