import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  FileCheck,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RatingIcon, getRatingIcon } from "./PrintSafeRatingIcons";
import { AppraisalItem } from "./AppraisalItemsTable";

interface ExecutiveSummaryProps {
  employee: {
    name: string;
    position?: string;
    department?: string;
    employeeId?: string;
    hireDate?: string;
    avatarUrl?: string;
  };
  appraisal: {
    period: string;
    status: string;
    startDate?: string;
    endDate?: string;
  };
  overallRating?: number;
  maxRating?: number;
  minRating?: number;
  items: AppraisalItem[];
  managerStatement?: string;
  companyName?: string;
  className?: string;
}

export function ExecutiveSummary({
  employee,
  appraisal,
  overallRating,
  maxRating = 5,
  minRating = 1,
  items,
  managerStatement,
  companyName,
  className,
}: ExecutiveSummaryProps) {
  // Calculate top strengths (highest rated items)
  const ratedItems = items.filter((item) => item.managerRating !== undefined);
  const topStrengths = [...ratedItems]
    .sort((a, b) => (b.managerRating || 0) - (a.managerRating || 0))
    .slice(0, 3);

  // Calculate top development areas (items with negative gaps)
  const developmentAreas = [...ratedItems]
    .filter((item) => (item.gap || 0) < 0)
    .sort((a, b) => (a.gap || 0) - (b.gap || 0))
    .slice(0, 3);

  // Calculate key metrics
  const totalItems = items.length;
  const itemsWithEvidence = items.filter((item) => item.evidence && item.evidence.length > 0).length;
  const avgRequiredLevel = items.reduce((acc, item) => acc + (item.requiredLevel || 3), 0) / (items.length || 1);
  const avgManagerRating = ratedItems.reduce((acc, item) => acc + (item.managerRating || 0), 0) / (ratedItems.length || 1);
  const positiveGapCount = ratedItems.filter((item) => (item.gap || 0) > 0).length;
  const negativeGapCount = ratedItems.filter((item) => (item.gap || 0) < 0).length;
  const meetingExpectations = ratedItems.filter((item) => item.gap === 0).length;

  // Get rating level info for overall rating
  const ratingInfo = overallRating ? getRatingIcon(Math.round(overallRating)) : null;
  const ratingPercentage = overallRating ? ((overallRating - minRating) / (maxRating - minRating)) * 100 : 0;

  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className={cn("executive-summary-section space-y-6 mb-8 print:break-after-page", className)}>
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Executive Summary</h2>
      </div>

      {/* Top Row: Employee Info + Overall Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Employee Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground shrink-0">
                {employee.avatarUrl ? (
                  <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  employee.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Details */}
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-semibold">{employee.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Employee ID:</span>
                  <p className="font-semibold">{employee.employeeId || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <p className="font-semibold">{employee.position || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-semibold">{employee.department || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Hire Date:</span>
                  <p className="font-semibold">{employee.hireDate || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Review Period:</span>
                  <p className="font-semibold">{appraisal.period}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Rating Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Overall Rating
              </span>
              {getStatusBadge(appraisal.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {overallRating !== undefined ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-primary">{overallRating.toFixed(1)}</span>
                  <span className="text-xl text-muted-foreground">/ {maxRating}</span>
                </div>

                {/* Visual Rating Bar */}
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${ratingPercentage}%` }}
                  />
                </div>

                {ratingInfo && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <RatingIcon level={Math.round(overallRating)} size="sm" />
                    <span className={cn("font-medium", ratingInfo.textClass)}>
                      {Math.round(overallRating) === 1 && "Needs Development"}
                      {Math.round(overallRating) === 2 && "Below Expectations"}
                      {Math.round(overallRating) === 3 && "Meets Expectations"}
                      {Math.round(overallRating) === 4 && "Exceeds Expectations"}
                      {Math.round(overallRating) === 5 && "Exceptional"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground italic py-4">
                Rating not yet assigned
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{positiveGapCount}</p>
              <p className="text-xs text-muted-foreground">Above Target</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{negativeGapCount}</p>
              <p className="text-xs text-muted-foreground">Below Target</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{itemsWithEvidence}</p>
              <p className="text-xs text-muted-foreground">With Evidence</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Strengths and Development Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Strengths */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topStrengths.length > 0 ? (
              <ul className="space-y-2">
                {topStrengths.map((item, index) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0 bg-green-50 text-green-700 border-green-200">
                      #{index + 1}
                    </Badge>
                    <span>
                      <strong>{item.name}</strong>
                      {item.managerRating && (
                        <span className="ml-2 text-muted-foreground">
                          (Rating: {item.managerRating}/{maxRating})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Ratings not yet assigned
              </p>
            )}
          </CardContent>
        </Card>

        {/* Development Areas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Development Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {developmentAreas.length > 0 ? (
              <ul className="space-y-2">
                {developmentAreas.map((item, index) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0 bg-amber-50 text-amber-700 border-amber-200">
                      #{index + 1}
                    </Badge>
                    <span>
                      <strong>{item.name}</strong>
                      {item.gap !== undefined && (
                        <span className="ml-2 text-red-600">
                          (Gap: {item.gap})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No development gaps identified
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manager's Summary Statement */}
      {managerStatement && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Manager's Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed italic">"{managerStatement}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
