import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuditLog } from "@/hooks/useAuditLog";
import { usePiiVisibility } from "@/hooks/usePiiVisibility";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeAddressesTab } from "@/components/employee/EmployeeAddressesTab";
import { EmployeeBankAccountsTab } from "@/components/employee/EmployeeBankAccountsTab";
import { EmployeeBeneficiariesTab } from "@/components/employee/EmployeeBeneficiariesTab";
import { EmployeeDocumentsTab } from "@/components/employee/EmployeeDocumentsTab";
import { EmployeeDependentsTab } from "@/components/employee/EmployeeDependentsTab";
import { EmployeeWorkPermitsTab } from "@/components/employee/EmployeeWorkPermitsTab";
import { EmployeeLicensesTab } from "@/components/employee/EmployeeLicensesTab";
import { EmployeeBackgroundChecksTab } from "@/components/employee/EmployeeBackgroundChecksTab";
import { EmployeeReferencesTab } from "@/components/employee/EmployeeReferencesTab";
import { EmployeeCertificatesTab } from "@/components/employee/EmployeeCertificatesTab";
import { EmployeeMembershipsTab } from "@/components/employee/EmployeeMembershipsTab";
import { EmployeeInterestsTab } from "@/components/employee/EmployeeInterestsTab";
import { EmployeeMedicalProfileTab } from "@/components/employee/EmployeeMedicalProfileTab";
import { EmployeeContactsTab } from "@/components/employee/EmployeeContactsTab";
import { EmployeeEmergencyContactsTab } from "@/components/employee/EmployeeEmergencyContactsTab";
import { EmployeePayGroupTab } from "@/components/employee/EmployeePayGroupTab";

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
  CreditCard,
  Users,
  Home,
  Baby,
  FileCheck,
  Award,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Heart,
  Stethoscope,
  Phone,
  AlertTriangle,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EmployeeProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  timezone: string | null;
  preferred_language: string | null;
  created_at: string;
  positions: {
    id: string;
    title: string;
    department_name: string;
    company_name: string;
    start_date: string;
    is_primary: boolean;
    is_active: boolean;
  }[];
}

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { logView } = useAuditLog();
  const { canViewPii, maskPii } = usePiiVisibility();

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
        .select('id, full_name, email, avatar_url, timezone, preferred_language, created_at')
        .eq('id', employeeId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch positions
      const { data: positions, error: positionsError } = await supabase
        .from('employee_positions')
        .select(`
          id,
          start_date,
          is_primary,
          is_active,
          positions:position_id (
            title,
            departments:department_id (
              name,
              companies:company_id (
                name
              )
            )
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
      }));

      setEmployee({
        id: profile.id,
        full_name: profile.full_name || profile.email,
        email: profile.email,
        avatar_url: profile.avatar_url,
        timezone: profile.timezone,
        preferred_language: profile.preferred_language,
        created_at: profile.created_at,
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
          <h2 className="mt-4 text-xl font-semibold text-foreground">Employee not found</h2>
          <p className="mt-2 text-muted-foreground">The employee you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/workforce/employees')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
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
          { label: "Workforce", href: "/workforce" },
          { label: "Employees", href: "/workforce/employees" },
          { label: employee.full_name }
        ]} />

        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/workforce/employees')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Button>

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
              </div>
              <Badge variant={activePosition ? "default" : "secondary"} className="shrink-0">
                {activePosition ? "Active" : "Unassigned"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="addresses"><Home className="h-4 w-4 mr-1" />Addresses</TabsTrigger>
            <TabsTrigger value="background"><ShieldCheck className="h-4 w-4 mr-1" />Background</TabsTrigger>
            <TabsTrigger value="bank"><CreditCard className="h-4 w-4 mr-1" />Bank</TabsTrigger>
            <TabsTrigger value="beneficiaries"><Users className="h-4 w-4 mr-1" />Beneficiaries</TabsTrigger>
            <TabsTrigger value="certificates"><GraduationCap className="h-4 w-4 mr-1" />Certificates</TabsTrigger>
            <TabsTrigger value="contacts"><Phone className="h-4 w-4 mr-1" />Contacts</TabsTrigger>
            <TabsTrigger value="dependents"><Baby className="h-4 w-4 mr-1" />Dependents</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" />Documents</TabsTrigger>
            <TabsTrigger value="emergency"><AlertTriangle className="h-4 w-4 mr-1" />Emergency</TabsTrigger>
            <TabsTrigger value="interests"><Sparkles className="h-4 w-4 mr-1" />Interests</TabsTrigger>
            <TabsTrigger value="licenses"><Award className="h-4 w-4 mr-1" />Licenses</TabsTrigger>
            <TabsTrigger value="medical"><Stethoscope className="h-4 w-4 mr-1" />Medical</TabsTrigger>
            <TabsTrigger value="memberships"><Heart className="h-4 w-4 mr-1" />Memberships</TabsTrigger>
            <TabsTrigger value="overview"><User className="h-4 w-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="paygroup"><DollarSign className="h-4 w-4 mr-1" />Pay Group</TabsTrigger>
            <TabsTrigger value="references"><UserCheck className="h-4 w-4 mr-1" />References</TabsTrigger>
            <TabsTrigger value="work_permits"><FileCheck className="h-4 w-4 mr-1" />Work Permits</TabsTrigger>
          </TabsList>

          <TabsContent value="addresses" className="mt-6">
            <EmployeeAddressesTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="background" className="mt-6">
            <EmployeeBackgroundChecksTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="bank" className="mt-6">
            <EmployeeBankAccountsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="beneficiaries" className="mt-6">
            <EmployeeBeneficiariesTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <EmployeeCertificatesTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <EmployeeContactsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="dependents" className="mt-6">
            <EmployeeDependentsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <EmployeeDocumentsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="emergency" className="mt-6">
            <EmployeeEmergencyContactsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="interests" className="mt-6">
            <EmployeeInterestsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="licenses" className="mt-6">
            <EmployeeLicensesTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="medical" className="mt-6">
            <EmployeeMedicalProfileTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="memberships" className="mt-6">
            <EmployeeMembershipsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Position History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Position History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.positions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No positions assigned</p>
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
                            <div className="flex gap-2">
                              {position.is_primary && (
                                <Badge variant="outline" className="text-xs">Primary</Badge>
                              )}
                              <Badge variant={position.is_active ? "default" : "secondary"} className="text-xs">
                                {position.is_active ? "Active" : "Ended"}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Started {format(new Date(position.start_date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employee Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Timezone</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.timezone || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Preferred Language</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.preferred_language || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Joined</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(employee.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="paygroup" className="mt-6">
            <EmployeePayGroupTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="references" className="mt-6">
            <EmployeeReferencesTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="work_permits" className="mt-6">
            <EmployeeWorkPermitsTab employeeId={employee.id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
