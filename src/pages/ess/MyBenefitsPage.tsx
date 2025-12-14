import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, DollarSign, Users, FileText, Shield, Calendar } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function MyBenefitsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [dependents, setDependents] = useState<any[]>([]);
  const [totals, setTotals] = useState({ employer: 0, employee: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyBenefits();
    }
  }, [user]);

  const fetchMyBenefits = async () => {
    setIsLoading(true);
    try {
      // Fetch enrollments
      const { data: enrollmentData } = await supabase
        .from("benefit_enrollments")
        .select(`
          *,
          plan:benefit_plans(*, category:benefit_categories(*))
        `)
        .eq("employee_id", user?.id)
        .eq("status", "active");

      setEnrollments(enrollmentData || []);

      // Calculate totals
      const employerTotal = (enrollmentData || []).reduce((sum: number, e: any) => sum + (e.employer_contribution || 0), 0);
      const employeeTotal = (enrollmentData || []).reduce((sum: number, e: any) => sum + (e.employee_contribution || 0), 0);
      setTotals({ employer: employerTotal, employee: employeeTotal });

      // Fetch claims
      const { data: claimsData } = await supabase
        .from("benefit_claims")
        .select(`
          *,
          enrollment:benefit_enrollments(plan:benefit_plans(name))
        `)
        .in("enrollment_id", (enrollmentData || []).map((e: any) => e.id))
        .order("claim_date", { ascending: false })
        .limit(10);

      setClaims(claimsData || []);

      // Fetch dependents from enrollments
      const enrollmentIds = (enrollmentData || []).map((e: any) => e.id);
      if (enrollmentIds.length > 0) {
        const { data: dependentsData } = await supabase
          .from("benefit_dependents")
          .select("*")
          .in("enrollment_id", enrollmentIds)
          .eq("is_active", true);

        setDependents(dependentsData || []);
      }

    } catch (error) {
      console.error("Error fetching benefits:", error);
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

  const getClaimStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("ess.title"), href: "/ess" },
          { label: t("pages.myBenefits.title") }
        ]} />
        <div>
          <h1 className="text-3xl font-bold">{t("pages.myBenefits.title")}</h1>
          <p className="text-muted-foreground">{t("pages.myBenefits.subtitle")}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.myBenefits.activePlans")}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">{t("pages.myBenefits.benefitEnrollments")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.myBenefits.employerContribution")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totals.employer.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t("pages.myBenefits.monthly")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.myBenefits.yourContribution")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.employee.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t("pages.myBenefits.monthly")}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">{t("pages.myBenefits.myPlans")}</TabsTrigger>
            <TabsTrigger value="dependents">{t("pages.myBenefits.coveredDependents")}</TabsTrigger>
            <TabsTrigger value="claims">{t("pages.myBenefits.recentClaims")}</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <div className="grid gap-4 md:grid-cols-2">
              {enrollments.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    {t("pages.myBenefits.noActiveEnrollments")}
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
                          <p className="text-muted-foreground">You Pay</p>
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
          </TabsContent>

          <TabsContent value="dependents">
            <Card>
              <CardHeader>
                <CardTitle>Covered Dependents</CardTitle>
                <CardDescription>Family members covered under your benefit plans</CardDescription>
              </CardHeader>
              <CardContent>
                {dependents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No dependents enrolled in your benefit plans.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dependents.map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{dep.full_name}</p>
                            <p className="text-sm text-muted-foreground">{dep.relationship}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Coverage Start</p>
                          <p className="text-sm font-medium">{dep.start_date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Your benefit claim history</CardDescription>
              </CardHeader>
              <CardContent>
                {claims.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No claims submitted yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{claim.claim_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {claim.enrollment?.plan?.name} • {claim.claim_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${claim.amount_claimed.toLocaleString()}</p>
                          <Badge variant={getClaimStatusVariant(claim.status)}>
                            {claim.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
