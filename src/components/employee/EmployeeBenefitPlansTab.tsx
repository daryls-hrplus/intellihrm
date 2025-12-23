import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, DollarSign, Shield, Users, FileText, Loader2 } from "lucide-react";

interface EmployeeBenefitPlansTabProps {
  employeeId: string;
}

export function EmployeeBenefitPlansTab({ employeeId }: EmployeeBenefitPlansTabProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [totals, setTotals] = useState({ employer: 0, employee: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBenefitPlans();
  }, [employeeId]);

  const fetchBenefitPlans = async () => {
    setIsLoading(true);
    try {
      const { data: enrollmentData } = await supabase
        .from("benefit_enrollments")
        .select(`
          *,
          plan:benefit_plans(*, category:benefit_categories(*))
        `)
        .eq("employee_id", employeeId)
        .eq("status", "active");

      setEnrollments(enrollmentData || []);

      const employerTotal = (enrollmentData || []).reduce((sum: number, e: any) => sum + (e.employer_contribution || 0), 0);
      const employeeTotal = (enrollmentData || []).reduce((sum: number, e: any) => sum + (e.employee_contribution || 0), 0);
      setTotals({ employer: employerTotal, employee: employeeTotal });
    } catch (error) {
      console.error("Error fetching benefit plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryType: string) => {
    switch (categoryType?.toLowerCase()) {
      case "health": return <Heart className="h-5 w-5 text-red-500" />;
      case "retirement": return <DollarSign className="h-5 w-5 text-green-500" />;
      case "life": return <Shield className="h-5 w-5 text-blue-500" />;
      case "wellness": return <Users className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground">Benefit enrollments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employer Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.employer.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employee Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.employee.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments List */}
      <div className="grid gap-4 md:grid-cols-2">
        {enrollments.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              No active benefit enrollments
            </CardContent>
          </Card>
        ) : (
          enrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(enrollment.plan?.category?.category_type)}
                    <div>
                      <CardTitle className="text-lg">{enrollment.plan?.name}</CardTitle>
                      <CardDescription>{enrollment.plan?.category?.name}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Coverage Level</p>
                    <p className="font-medium">{enrollment.coverage_level || "Individual"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Effective Date</p>
                    <p className="font-medium">{enrollment.effective_date}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employer Pays</p>
                    <p className="font-medium text-green-600">
                      ${(enrollment.employer_contribution || 0).toLocaleString()}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Employee Pays</p>
                    <p className="font-medium">
                      ${(enrollment.employee_contribution || 0).toLocaleString()}/mo
                    </p>
                  </div>
                </div>
                {enrollment.plan?.provider_name && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Provider</p>
                      <p className="font-medium">{enrollment.plan.provider_name}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
