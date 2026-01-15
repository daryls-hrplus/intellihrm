import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserCheck, Building2, AlertTriangle } from "lucide-react";

interface CommentsSectionProps {
  employeeComments?: string;
  managerComments?: string;
  hrComments?: string;
  developmentalIssues?: string;
  strengthsAndGaps?: {
    type: "strength" | "gap";
    description: string;
  }[];
}

export function CommentsSection({
  employeeComments,
  managerComments,
  hrComments,
  developmentalIssues,
  strengthsAndGaps,
}: CommentsSectionProps) {
  const strengths = strengthsAndGaps?.filter((item) => item.type === "strength") || [];
  const gaps = strengthsAndGaps?.filter((item) => item.type === "gap") || [];

  return (
    <div className="space-y-6 mb-6">
      {/* Comments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employee Comments */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Employee Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[80px]">
              {employeeComments || "No comments provided"}
            </p>
          </CardContent>
        </Card>

        {/* Manager Comments */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Manager Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[80px]">
              {managerComments || "No comments provided"}
            </p>
          </CardContent>
        </Card>

        {/* HR Comments */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              HR Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[80px]">
              {hrComments || "No HR comments"}
            </p>
          </CardContent>
        </Card>

        {/* Developmental Issues */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Developmental Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[80px]">
              {developmentalIssues || "None identified"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Gaps */}
      {(strengths.length > 0 || gaps.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengths.length > 0 && (
            <Card className="border border-green-200 dark:border-green-800">
              <CardHeader className="pb-2 bg-green-50 dark:bg-green-950/30">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Identified Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <ul className="space-y-2">
                  {strengths.map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {gaps.length > 0 && (
            <Card className="border border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2 bg-amber-50 dark:bg-amber-950/30">
                <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  Development Areas (Gaps)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <ul className="space-y-2">
                  {gaps.map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
