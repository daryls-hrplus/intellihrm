import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  BookOpen, 
  Award, 
  Play, 
  CheckCircle2,
  AlertCircle,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrainingProgram, TrainingEnrollment } from "@/hooks/useInteractiveTraining";

interface TrainingProgramCardProps {
  program: TrainingProgram;
  enrollment?: TrainingEnrollment;
  onStart: () => void;
  onContinue: () => void;
  onViewCertificate?: () => void;
  className?: string;
}

export function TrainingProgramCard({
  program,
  enrollment,
  onStart,
  onContinue,
  onViewCertificate,
  className,
}: TrainingProgramCardProps) {
  const getStatusBadge = () => {
    if (!enrollment) {
      return <Badge variant="outline">Not Started</Badge>;
    }
    
    switch (enrollment.status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Expired</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };
  
  const getProgramTypeBadge = () => {
    const typeColors: Record<string, string> = {
      onboarding: "bg-blue-100 text-blue-700",
      compliance: "bg-red-100 text-red-700",
      skills: "bg-purple-100 text-purple-700",
      leadership: "bg-amber-100 text-amber-700",
      custom: "bg-gray-100 text-gray-700",
    };
    
    return (
      <Badge className={cn("capitalize", typeColors[program.program_type] || typeColors.custom)}>
        {program.program_type}
      </Badge>
    );
  };
  
  const getProgress = () => {
    if (!enrollment || enrollment.status === "not_started") return 0;
    if (enrollment.status === "completed") return 100;
    // Calculate from final_score or default to 50 for in_progress
    return enrollment.final_score || 50;
  };
  
  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
        {program.thumbnail_url ? (
          <img
            src={program.thumbnail_url}
            alt={program.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary/40" />
          </div>
        )}
        
        {/* Status overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {getProgramTypeBadge()}
          {program.is_mandatory && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Required
            </Badge>
          )}
        </div>
        
        {enrollment?.status === "completed" && (
          <div className="absolute top-3 right-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{program.title}</h3>
          {getStatusBadge()}
        </div>
        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {program.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-4 text-center py-3 border-y">
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium">
              {program.estimated_duration_minutes 
                ? `${program.estimated_duration_minutes} min`
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Award className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium">{program.passing_score}%</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium">{program.max_attempts} tries</div>
          </div>
        </div>
        
        {enrollment && enrollment.status !== "not_started" && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
            
            {enrollment.final_score !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Score</span>
                <span className={cn(
                  "font-medium",
                  enrollment.final_score >= program.passing_score
                    ? "text-green-600"
                    : "text-red-600"
                )}>
                  {enrollment.final_score}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        {enrollment?.status === "completed" ? (
          <div className="w-full flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onContinue}>
              Review
            </Button>
            {enrollment.certificate_url && onViewCertificate && (
              <Button className="flex-1 gap-2" onClick={onViewCertificate}>
                <Award className="h-4 w-4" />
                Certificate
              </Button>
            )}
          </div>
        ) : enrollment?.status === "in_progress" ? (
          <Button className="w-full gap-2" onClick={onContinue}>
            <Play className="h-4 w-4" />
            Continue
          </Button>
        ) : (
          <Button className="w-full gap-2" onClick={onStart}>
            <Play className="h-4 w-4" />
            Start Training
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
