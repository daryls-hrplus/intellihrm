import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuditLog } from "@/hooks/useAuditLog";
import { usePiiVisibility } from "@/hooks/usePiiVisibility";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EmployeeBenefitsTab } from "@/components/employee/EmployeeBenefitsTab";
import { EmployeeDocumentsTab } from "@/components/employee/EmployeeDocumentsTab";

import { EmployeeBackgroundChecksTab } from "@/components/employee/EmployeeBackgroundChecksTab";

import { EmployeeQualificationsTab } from "@/components/employee/EmployeeQualificationsTab";

import { EmployeeInterestsTab } from "@/components/employee/EmployeeInterestsTab";
import { EmployeeLanguagesTab } from "@/components/employee/EmployeeLanguagesTab";
import { EmployeeMedicalProfileTab } from "@/components/employee/EmployeeMedicalProfileTab";
import { EmployeeContactInformationCard } from "@/components/employee/contact-information";
import { EmployeeBranchLocationsTab } from "@/components/employee/EmployeeBranchLocationsTab";
import { EmployeeCompetenciesTab } from "@/components/employee/EmployeeCompetenciesTab";
import { EmployeePayInfoTab } from "@/components/employee/EmployeePayInfoTab";
import { EmployeeEditDialog } from "@/components/employee/EmployeeEditDialog";
import {
  EmployeeComplianceLegalTab,
  EmployeeCredentialsMembershipsTab,
  EmployeeReferencesVerificationsTab,
  EmployeeAgreementsSignaturesTab,
  EmployeeProfessionalHistoryTab,
} from "@/components/employee/professional";
import { EmployeeImmigrationTab } from "@/components/employee/immigration";
import { EmployeeGovernmentIds } from "@/components/employee/EmployeeGovernmentIds";
import { EvidencePortfolioSection } from "@/components/capabilities/EvidencePortfolioSection";
import { MexicanEmployeeData } from "@/components/payroll/mexico";

import {
  ArrowLeft,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  Globe,
  Loader2,
  User,
  FileText,
  Wallet,
  Contact,
  Award,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Heart,
  Stethoscope,
  Phone,
  AlertTriangle,
  Sparkles,
  Pencil,
  FileSignature,
  Plane,
  IdCard,
  ClipboardCheck,
  Banknote,
  Hash,
  Fingerprint,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface EmployeeProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  timezone: string | null;
  preferred_language: string | null;
  date_format: string | null;
  time_format: string | null;
  created_at: string;
  first_hire_date: string | null;
  last_hire_date: string | null;
  start_date: string | null;
  continuous_service_date: string | null;
  seniority_date: string | null;
  adjusted_service_date: string | null;
  employment_status: string | null;
  // New employee identifier fields
  employee_id: string | null;
  badge_number: string | null;
  global_id: string | null;
  cedula_number: string | null;
  time_clock_id: string | null;
  // Name component fields
  first_name: string | null;
  middle_name: string | null;
  first_last_name: string | null;
  second_last_name: string | null;
  // Personal information fields
  gender: string | null;
  date_of_birth: string | null;
  marital_status: string | null;
  nationality: string | null;
  // Termination/Separation fields
  last_working_date: string | null;
  separation_date: string | null;
  termination_reason: string | null;
  positions: {
    id: string;
    title: string;
    department_name: string;
    company_name: string;
    start_date: string;
    is_primary: boolean;
    is_active: boolean;
    assignment_type: string | null;
    pay_group_name: string | null;
  }[];
}

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [companyCountryCode, setCompanyCountryCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { logView } = useAuditLog();
  const { canViewPii, maskPii } = usePiiVisibility();
  
  // Get initial tab from URL query parameter
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "overview") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
  }, [id]);

  const fetchEmployee = async (employeeId: string) => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, timezone, preferred_language, date_format, time_format, created_at, first_hire_date, last_hire_date, start_date, continuous_service_date, seniority_date, adjusted_service_date, employment_status, employee_id, badge_number, global_id, cedula_number, time_clock_id, first_name, middle_name, first_last_name, second_last_name, gender, date_of_birth, marital_status, nationality, last_working_date, separation_date, termination_reason')
        .eq('id', employeeId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch positions with company country
      const { data: positions, error: positionsError } = await supabase
        .from('employee_positions')
        .select(`
          id,
          start_date,
          is_primary,
          is_active,
          assignment_type,
          positions:position_id (
            title,
            departments:department_id (
              name,
              companies:company_id (
                name,
                country
              )
            )
          ),
          pay_groups:pay_group_id (
            name
          )
        `)
        .eq('employee_id', employeeId);

      if (positionsError) throw positionsError;

      const employeePositions = (positions || []).map((ep: any) => ({
        id: ep.id,
        title: ep.positions?.title || 'Unknown Position',
        department_name: ep.positions?.departments?.name || 'Unknown Department',
        company_name: ep.positions?.departments?.companies?.name || 'Unknown Company',
        start_date: ep.start_date,
        is_primary: ep.is_primary,
        is_active: ep.is_active,
        assignment_type: ep.assignment_type,
        pay_group_name: ep.pay_groups?.name || null,
      }));

      // Get company country code from primary position
      const primaryPosition = (positions || []).find((ep: any) => ep.is_primary && ep.is_active);
      const countryCode = primaryPosition?.positions?.departments?.companies?.country;
      setCompanyCountryCode(countryCode || undefined);

      setEmployee({
        id: profile.id,
        full_name: profile.full_name || profile.email,
        email: profile.email,
        avatar_url: profile.avatar_url,
        timezone: profile.timezone,
        preferred_language: profile.preferred_language,
        date_format: profile.date_format,
        time_format: profile.time_format,
        created_at: profile.created_at,
        first_hire_date: profile.first_hire_date,
        last_hire_date: profile.last_hire_date,
        start_date: profile.start_date,
        continuous_service_date: profile.continuous_service_date,
        seniority_date: profile.seniority_date,
        adjusted_service_date: profile.adjusted_service_date,
        employment_status: profile.employment_status,
        // New employee identifier fields
        employee_id: profile.employee_id,
        badge_number: profile.badge_number,
        global_id: profile.global_id,
        cedula_number: profile.cedula_number,
        time_clock_id: profile.time_clock_id,
        // Name component fields
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        first_last_name: profile.first_last_name,
        second_last_name: profile.second_last_name,
        // Personal information fields
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        marital_status: profile.marital_status,
        nationality: profile.nationality,
        // Termination/Separation fields
        last_working_date: profile.last_working_date,
        separation_date: profile.separation_date,
        termination_reason: profile.termination_reason,
        positions: employeePositions,
      });

      logView('employee_profile', profile.id, profile.full_name);
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditSuccess = () => {
    if (id) {
      fetchEmployee(id);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <User className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">{t("workforce.profile.employeeNotFound")}</h2>
          <p className="mt-2 text-muted-foreground">{t("workforce.profile.employeeNotFoundDescription")}</p>
          <Button onClick={() => navigate('/workforce/employees')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("workforce.profile.backToEmployees")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const activePosition = employee.positions.find(p => p.is_active && p.is_primary) 
    || employee.positions.find(p => p.is_active);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("workforce.title"), href: "/workforce" },
          { label: t("workforce.employees"), href: "/workforce/employees" },
          { label: employee.full_name }
        ]} />

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee.avatar_url || undefined} alt={employee.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {getInitials(employee.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-foreground">{employee.full_name}</h1>
                {activePosition && (
                  <p className="mt-1 text-lg text-muted-foreground">{activePosition.title}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className={cn(!canViewPii && "font-mono text-xs")}>
                      {maskPii(employee.email, "email")}
                    </span>
                  </div>
                  {activePosition && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{activePosition.department_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{activePosition.company_name}</span>
                      </div>
                    </>
                  )}
                </div>
                {/* Employment Dates */}
                {(employee.first_hire_date || employee.last_hire_date || employee.start_date || employee.continuous_service_date || employee.seniority_date || employee.adjusted_service_date || employee.last_working_date || employee.separation_date) && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start border-t pt-3">
                    {employee.start_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {formatDateForDisplay(employee.start_date)}</span>
                      </div>
                    )}
                    {employee.first_hire_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>First Hire: {formatDateForDisplay(employee.first_hire_date)}</span>
                      </div>
                    )}
                    {employee.last_hire_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Last Hire: {formatDateForDisplay(employee.last_hire_date)}</span>
                      </div>
                    )}
                    {employee.continuous_service_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Continuous Service: {formatDateForDisplay(employee.continuous_service_date)}</span>
                      </div>
                    )}
                    {employee.seniority_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Seniority: {formatDateForDisplay(employee.seniority_date)}</span>
                      </div>
                    )}
                    {employee.adjusted_service_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Adjusted Service: {formatDateForDisplay(employee.adjusted_service_date)}</span>
                      </div>
                    )}
                    {employee.last_working_date && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Last Working Date: {formatDateForDisplay(employee.last_working_date)}</span>
                      </div>
                    )}
                    {employee.separation_date && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Separation: {formatDateForDisplay(employee.separation_date)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={activePosition ? "default" : "secondary"} className="shrink-0">
                  {activePosition ? t("common.active") : t("workforce.unassigned")}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview"><User className="h-4 w-4 mr-1" />{t("workforce.profile.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="benefits"><Heart className="h-4 w-4 mr-1" />Benefits</TabsTrigger>
            <TabsTrigger value="branches"><Building2 className="h-4 w-4 mr-1" />{t("workforce.profile.tabs.branches")}</TabsTrigger>
            <TabsTrigger value="competencies"><Award className="h-4 w-4 mr-1" />{t("workforce.profile.tabs.competencies")}</TabsTrigger>
            <TabsTrigger value="contact-info"><Contact className="h-4 w-4 mr-1" />Contact Info</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" />{t("workforce.profile.tabs.documents")}</TabsTrigger>
            <TabsTrigger value="evidence"><ClipboardCheck className="h-4 w-4 mr-1" />Evidence Portfolio</TabsTrigger>
            <TabsTrigger value="government-ids"><IdCard className="h-4 w-4 mr-1" />Government IDs</TabsTrigger>
            <TabsTrigger value="immigration"><Plane className="h-4 w-4 mr-1" />Immigration</TabsTrigger>
            <TabsTrigger value="interests"><Sparkles className="h-4 w-4 mr-1" />{t("workforce.profile.tabs.interests")}</TabsTrigger>
            <TabsTrigger value="languages"><Globe className="h-4 w-4 mr-1" />Languages</TabsTrigger>
            <TabsTrigger value="medical"><Stethoscope className="h-4 w-4 mr-1" />{t("workforce.profile.tabs.medical")}</TabsTrigger>
            <TabsTrigger value="pay_info"><Wallet className="h-4 w-4 mr-1" />Pay Information</TabsTrigger>
            <TabsTrigger value="professional_info"><FileSignature className="h-4 w-4 mr-1" />Professional Info</TabsTrigger>
            <TabsTrigger value="qualifications"><GraduationCap className="h-4 w-4 mr-1" />Qualifications</TabsTrigger>
            {companyCountryCode === 'MX' && (
              <TabsTrigger value="mexico_payroll"><Banknote className="h-4 w-4 mr-1" />Mexico Payroll Data</TabsTrigger>
            )}
          </TabsList>



          <TabsContent value="benefits" className="mt-6">
            <EmployeeBenefitsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="qualifications" className="mt-6">
            <EmployeeQualificationsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="branches" className="mt-6">
            <EmployeeBranchLocationsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="competencies" className="mt-6">
            <EmployeeCompetenciesTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="contact-info" className="mt-6">
            <EmployeeContactInformationCard employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <EmployeeDocumentsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            <EvidencePortfolioSection 
              employeeId={employee.id}
              canEdit={true}
              canValidate={true}
            />
          </TabsContent>

          <TabsContent value="government-ids" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <EmployeeGovernmentIds 
                  employeeId={employee.id} 
                  companyCountryCode={companyCountryCode} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interests" className="mt-6">
            <EmployeeInterestsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="languages" className="mt-6">
            <EmployeeLanguagesTab employeeId={employee.id} viewType="hr" />
          </TabsContent>


          <TabsContent value="medical" className="mt-6">
            <EmployeeMedicalProfileTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="pay_info" className="mt-6">
            <EmployeePayInfoTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Position History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {t("workforce.profile.positionHistory")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.positions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("workforce.profile.noPositions")}</p>
                  ) : (
                    <div className="space-y-4">
                      {employee.positions.map((position) => (
                        <div 
                          key={position.id} 
                          className={cn(
                            "rounded-lg border p-4",
                            position.is_active ? "border-primary/20 bg-primary/5" : "border-border"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{position.title}</h4>
                              <p className="text-sm text-muted-foreground">{position.department_name}</p>
                              <p className="text-sm text-muted-foreground">{position.company_name}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              {position.is_primary && (
                                <Badge variant="outline" className="text-xs">{t("workforce.profile.primary")}</Badge>
                              )}
                              {position.assignment_type && (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs capitalize",
                                    position.assignment_type === 'permanent' && "border-green-500/50 text-green-600",
                                    position.assignment_type === 'acting' && "border-amber-500/50 text-amber-600",
                                    position.assignment_type === 'temporary' && "border-blue-500/50 text-blue-600"
                                  )}
                                >
                                  {position.assignment_type}
                                </Badge>
                              )}
                              <Badge variant={position.is_active ? "default" : "secondary"} className="text-xs">
                                {position.is_active ? t("common.active") : t("workforce.profile.ended")}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{t("workforce.profile.started")} {formatDateForDisplay(position.start_date)}</span>
                            </div>
                            {position.pay_group_name && (
                              <div className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" />
                                <span>{position.pay_group_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employee Identifiers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IdCard className="h-5 w-5" />
                    Employee Identifiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Employee ID</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {employee.id.slice(0, 6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Badge Number</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.badge_number || 'Not Set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Global ID</p>
                        <p className="text-sm text-muted-foreground font-mono text-xs">
                          {employee.global_id || 'Not Set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Cédula Number</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.cedula_number || 'Not Set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Time Clock ID</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.time_clock_id || 'Not Set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Name Components */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Name Components
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">First Name</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.first_name || 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Middle Name</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.middle_name || 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">First Last Name (Paternal)</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.first_last_name || 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Second Last Name (Maternal)</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.second_last_name || 'Not Set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Gender</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.gender 
                          ? employee.gender.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.date_of_birth 
                          ? formatDateForDisplay(employee.date_of_birth)
                          : 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Marital Status</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.marital_status 
                          ? employee.marital_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Nationality</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.nationality || 'Not Set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t("common.details")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t("workforce.profile.timezone")}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.timezone || t("workforce.profile.notSet")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t("workforce.profile.preferredLanguage")}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.preferred_language || t("workforce.profile.notSet")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Employee Record Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(employee.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Employment Status</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.employment_status 
                          ? employee.employment_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : 'Not Set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>




          <TabsContent value="immigration" className="mt-6">
            <EmployeeImmigrationTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="professional_info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="compliance_legal" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="compliance_legal">Compliance & Legal</TabsTrigger>
                    <TabsTrigger value="credentials_memberships">Credentials & Memberships</TabsTrigger>
                    <TabsTrigger value="references_verifications">References & Verifications</TabsTrigger>
                    <TabsTrigger value="agreements_signatures">Agreements & Signatures</TabsTrigger>
                    <TabsTrigger value="professional_history">Professional History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="compliance_legal">
                    <EmployeeComplianceLegalTab employeeId={employee.id} />
                  </TabsContent>

                  <TabsContent value="credentials_memberships">
                    <EmployeeCredentialsMembershipsTab employeeId={employee.id} />
                  </TabsContent>

                  <TabsContent value="references_verifications">
                    <EmployeeReferencesVerificationsTab employeeId={employee.id} />
                  </TabsContent>

                  <TabsContent value="agreements_signatures">
                    <EmployeeAgreementsSignaturesTab employeeId={employee.id} />
                  </TabsContent>

                  <TabsContent value="professional_history">
                    <EmployeeProfessionalHistoryTab employeeId={employee.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {companyCountryCode === 'MX' && (
            <TabsContent value="mexico_payroll" className="mt-6">
              <MexicanEmployeeData employeeId={employee.id} />
            </TabsContent>
          )}
        </Tabs>

        {/* Edit Employee Dialog */}
        <EmployeeEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          employee={employee}
          onSuccess={handleEditSuccess}
        />
      </div>
    </AppLayout>
  );
}
