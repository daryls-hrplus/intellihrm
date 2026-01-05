import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInYears, isThisMonth, addDays, isBefore, isAfter, startOfMonth, endOfMonth } from "date-fns";
import { Cake, Award, Calendar, Gift, Star, Clock, Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

// Helper to avoid deep type instantiation
const query = (table: string) => supabase.from(table as any);

interface Milestone {
  id: string;
  type: "birthday" | "anniversary" | "probation";
  employee_name: string;
  avatar_url: string | null;
  date: Date;
  years?: number;
  department?: string;
  company_id?: string;
}

export default function HRMilestonesPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [employeeCompanyMap, setEmployeeCompanyMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadCompanies();
    loadMilestones();
  }, []);

  const loadCompanies = async () => {
    const res: any = await query("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCompanies(res.data || []);
  };

  const loadMilestones = async () => {
    setIsLoading(true);
    try {
      const res: any = await query("employee_milestones")
        .select("*")
        .order("milestone_date");

      // Also fetch employee data for birthdays and anniversaries
      const empRes: any = await query("profiles")
        .select("id, full_name, avatar_url, date_of_birth, hire_date, department_id, company_id")
        .eq("is_active", true);

      const employees = empRes.data || [];
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

      const calculatedMilestones: Milestone[] = [];

      employees.forEach((emp: any) => {
        // Birthdays
        if (emp.date_of_birth) {
          const dob = new Date(emp.date_of_birth);
          const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
          if (thisYearBirthday >= thisMonth && thisYearBirthday <= nextMonth) {
            calculatedMilestones.push({
              id: `bday-${emp.id}`,
              type: "birthday",
              employee_name: emp.full_name,
              avatar_url: emp.avatar_url,
              date: thisYearBirthday,
              company_id: emp.company_id,
            });
          }
        }

        // Work anniversaries
        if (emp.hire_date) {
          const hireDate = new Date(emp.hire_date);
          const thisYearAnniversary = new Date(today.getFullYear(), hireDate.getMonth(), hireDate.getDate());
          const years = differenceInYears(today, hireDate);
          if (years > 0 && thisYearAnniversary >= thisMonth && thisYearAnniversary <= nextMonth) {
            calculatedMilestones.push({
              id: `anniv-${emp.id}`,
              type: "anniversary",
              employee_name: emp.full_name,
              avatar_url: emp.avatar_url,
              date: thisYearAnniversary,
              years,
              company_id: emp.company_id,
            });
          }

          // Probation end (assuming 3 months probation)
          const probationEnd = addDays(hireDate, 90);
          if (probationEnd >= thisMonth && probationEnd <= nextMonth && probationEnd > today) {
            calculatedMilestones.push({
              id: `prob-${emp.id}`,
              type: "probation",
              employee_name: emp.full_name,
              avatar_url: emp.avatar_url,
              date: probationEnd,
              company_id: emp.company_id,
            });
          }
        }
      });

      calculatedMilestones.sort((a, b) => a.date.getTime() - b.date.getTime());
      setMilestones(calculatedMilestones);
    } catch (error) {
      console.error("Error loading milestones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const today = new Date();
  
  // Filter by company
  const companyFilteredMilestones = milestones.filter(m => 
    selectedCompany === "all" || m.company_id === selectedCompany
  );
  
  const upcomingMilestones = companyFilteredMilestones.filter(m => m.date >= today);
  const todayMilestones = companyFilteredMilestones.filter(m => 
    format(m.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  );
  const thisMonthMilestones = companyFilteredMilestones.filter(m => isThisMonth(m.date));

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "birthday": return <Cake className="h-5 w-5 text-pink-500" />;
      case "anniversary": return <Award className="h-5 w-5 text-yellow-500" />;
      case "probation": return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Star className="h-5 w-5 text-primary" />;
    }
  };

  const getMilestoneLabel = (milestone: Milestone) => {
    switch (milestone.type) {
      case "birthday": return t("hrHub.birthday");
      case "anniversary": return t("hrHub.yearAnniversary", { years: milestone.years });
      case "probation": return t("hrHub.probationEnds");
      default: return t("hrHub.milestone");
    }
  };

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.milestones") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("hrHub.milestones")}</h1>
            <p className="text-muted-foreground">{t("hrHub.milestonesSubtitle")}</p>
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Cake className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {companyFilteredMilestones.filter(m => m.type === "birthday").length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.birthdaysThisMonth")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {companyFilteredMilestones.filter(m => m.type === "anniversary").length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.workAnniversaries")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {companyFilteredMilestones.filter(m => m.type === "probation").length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.probationsEnding")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Milestones */}
        {todayMilestones.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                {t("hrHub.todaysCelebrations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {todayMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                    <Avatar>
                      <AvatarImage src={milestone.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10">
                        {getInitials(milestone.employee_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{milestone.employee_name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getMilestoneIcon(milestone.type)}
                        <span>{getMilestoneLabel(milestone)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="upcoming">{t("hrHub.upcoming")}</TabsTrigger>
                <TabsTrigger value="birthdays">{t("hrHub.birthdays")}</TabsTrigger>
                <TabsTrigger value="anniversaries">{t("hrHub.anniversaries")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
            ) : (
              <div className="space-y-3">
                {(activeTab === "upcoming" ? upcomingMilestones :
                  activeTab === "birthdays" ? companyFilteredMilestones.filter(m => m.type === "birthday") :
                  companyFilteredMilestones.filter(m => m.type === "anniversary")
                ).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("hrHub.noMilestonesFound")}</p>
                  </div>
                ) : (
                  (activeTab === "upcoming" ? upcomingMilestones :
                    activeTab === "birthdays" ? companyFilteredMilestones.filter(m => m.type === "birthday") :
                    companyFilteredMilestones.filter(m => m.type === "anniversary")
                  ).map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={milestone.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(milestone.employee_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{milestone.employee_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getMilestoneIcon(milestone.type)}
                          <span>{getMilestoneLabel(milestone)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{format(milestone.date, "MMM d")}</p>
                        <p className="text-sm text-muted-foreground">{format(milestone.date, "EEEE")}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
