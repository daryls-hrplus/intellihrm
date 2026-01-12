import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronRight, 
  Star, 
  Target, 
  MessageSquare, 
  Calendar, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  User
} from "lucide-react";
import { format } from "date-fns";

interface MobileAppraisalData {
  id: string;
  employeeName: string;
  employeeRole: string;
  cycleId: string;
  cycleName: string;
  status: string;
  dueDate: string;
  progress: number;
  overallScore?: number;
  sections: {
    name: string;
    completed: boolean;
    score?: number;
  }[];
}

interface MobileAppraisalViewProps {
  appraisals?: MobileAppraisalData[];
  onSelectAppraisal?: (id: string) => void;
  role?: "employee" | "manager";
}

// Mock data for demonstration
const mockAppraisals: MobileAppraisalData[] = [
  {
    id: "1",
    employeeName: "John Smith",
    employeeRole: "Senior Developer",
    cycleId: "c1",
    cycleName: "Annual Review 2024",
    status: "in_progress",
    dueDate: "2024-12-31",
    progress: 65,
    sections: [
      { name: "Goals", completed: true, score: 4.2 },
      { name: "Competencies", completed: true, score: 3.8 },
      { name: "Manager Feedback", completed: false },
      { name: "Self Reflection", completed: true },
    ],
  },
  {
    id: "2",
    employeeName: "Sarah Johnson",
    employeeRole: "Product Manager",
    cycleId: "c1",
    cycleName: "Annual Review 2024",
    status: "pending",
    dueDate: "2024-12-31",
    progress: 30,
    sections: [
      { name: "Goals", completed: true, score: 4.5 },
      { name: "Competencies", completed: false },
      { name: "Manager Feedback", completed: false },
      { name: "Self Reflection", completed: false },
    ],
  },
  {
    id: "3",
    employeeName: "Mike Chen",
    employeeRole: "UX Designer",
    cycleId: "c1",
    cycleName: "Annual Review 2024",
    status: "completed",
    dueDate: "2024-12-15",
    progress: 100,
    overallScore: 4.2,
    sections: [
      { name: "Goals", completed: true, score: 4.0 },
      { name: "Competencies", completed: true, score: 4.3 },
      { name: "Manager Feedback", completed: true, score: 4.2 },
      { name: "Self Reflection", completed: true },
    ],
  },
];

export function MobileAppraisalView({ 
  appraisals = mockAppraisals, 
  onSelectAppraisal,
  role = "manager" 
}: MobileAppraisalViewProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

  const pendingAppraisals = appraisals.filter(a => a.status !== "completed");
  const completedAppraisals = appraisals.filter(a => a.status === "completed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 text-xs">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-600 text-xs">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 text-xs">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-500/10 text-red-600 text-xs">Overdue</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const AppraisalCard = ({ appraisal }: { appraisal: MobileAppraisalData }) => (
    <Card 
      className="mb-3 cursor-pointer active:scale-[0.98] transition-transform touch-manipulation"
      onClick={() => onSelectAppraisal?.(appraisal.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(appraisal.employeeName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold truncate">{appraisal.employeeName}</h4>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">{appraisal.employeeRole}</p>
            
            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge(appraisal.status)}
              {isOverdue(appraisal.dueDate) && appraisal.status !== "completed" && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{appraisal.progress}%</span>
              </div>
              <Progress value={appraisal.progress} className="h-2" />
            </div>

            {/* Section Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {appraisal.sections.map((section, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    section.completed 
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {section.completed ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {section.name}
                  {section.score && (
                    <span className="font-medium ml-0.5">{section.score}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Due: {format(new Date(appraisal.dueDate), "MMM d, yyyy")}
            </div>

            {/* Overall Score (if completed) */}
            {appraisal.overallScore && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-primary/5">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Overall Score: {appraisal.overallScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Appraisals</h1>
          <p className="text-sm text-muted-foreground">
            {role === "manager" ? "Review your team's performance" : "Your performance reviews"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-primary/10 text-primary">
            <div className="text-lg font-bold">{pendingAppraisals.length}</div>
            <div className="text-xs">Pending</div>
          </div>
          <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-green-500/10 text-green-600">
            <div className="text-lg font-bold">{completedAppraisals.length}</div>
            <div className="text-xs">Completed</div>
          </div>
          <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-red-500/10 text-red-600">
            <div className="text-lg font-bold">
              {pendingAppraisals.filter(a => isOverdue(a.dueDate)).length}
            </div>
            <div className="text-xs">Overdue</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pending" | "completed")}>
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="pending" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending ({pendingAppraisals.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed ({completedAppraisals.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab}>
          <TabsContent value="pending" className="mt-0">
            {pendingAppraisals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <h3 className="font-medium mb-1">All caught up!</h3>
                <p className="text-sm text-muted-foreground">
                  No pending appraisals to review
                </p>
              </div>
            ) : (
              pendingAppraisals.map(appraisal => (
                <AppraisalCard key={appraisal.id} appraisal={appraisal} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {completedAppraisals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">No completed appraisals</h3>
                <p className="text-sm text-muted-foreground">
                  Completed reviews will appear here
                </p>
              </div>
            ) : (
              completedAppraisals.map(appraisal => (
                <AppraisalCard key={appraisal.id} appraisal={appraisal} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile FAB for quick actions */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => {/* Quick feedback action */}}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
