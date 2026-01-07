import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePageAudit } from "@/hooks/usePageAudit";
import { 
  Building2, 
  Users, 
  FileText, 
  Play, 
  FileSpreadsheet,
  Flag,
  AlertCircle,
  Calculator,
  BarChart3,
  Calendar,
  Edit,
  User,
  GitCompare,
  History,
  Settings,
  TrendingUp,
  Layers,
  Sun,
  UserMinus,
  FileStack,
  Webhook,
  Smartphone,
  Database,
  FileCheck,
  RefreshCw,
  Link,
  PieChart,
  Shield,
  CalendarClock,
  FileSearch,
  UserCog,
  FileUp,
  Building,
  Brain,
  ArrowLeft,
  LucideIcon
} from "lucide-react";
import {
  MexicanCompanySetup,
  MexicanEmployeeData,
  CFDIDashboard,
  MexicanPayrollRun,
  SUAIDSEGenerator,
  MexicanBenefitsCalculator,
  INFONAVITManager,
  FONACOTManager,
  MexicanAnnualISR,
  TaxCertificates,
  MexicanPayrollAnalytics,
  ComplianceCalendar,
  PayrollAdjustments,
  EmployeeSelfService,
  MultiPeriodComparison,
  AuditTrail,
  PACIntegration,
  PayrollSimulations,
  BatchOperations,
  VacationPTUManager,
  SeveranceCalculator,
  PayrollTemplates,
  IntegrationWebhooks,
  SATXMLValidator,
  IDSEAutomation,
  SUAAdvancedGenerator,
  EmployerSocialContributions,
  PayrollAnomalyDetection,
  MexicoEmployeeMobileESS,
  SIPAREIntegration,
  ConstanciaSituacionFiscal,
  ISRAnnualAdjustment,
  SATIMSSAPIIntegration,
  AdvancedPTUDistribution,
  MexicanPayrollAuditDashboard,
  MexicanRegulatoryCalendar
} from "@/components/payroll/mexico";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emoji?: string;
  category: string;
  requiresEmployee?: boolean;
}

const featureCards: FeatureCard[] = [
  // Core Operations
  { id: "company", title: "Company Setup", description: "Configure Mexican legal entity settings", icon: Building2, category: "Core Operations" },
  { id: "employees", title: "Employees", description: "Manage employee Mexican tax data", icon: Users, category: "Core Operations", requiresEmployee: true },
  { id: "payroll-run", title: "Payroll Run", description: "Execute Mexican payroll processing", icon: Play, category: "Core Operations" },
  { id: "batch", title: "Batch Operations", description: "Bulk payroll processing tasks", icon: Layers, category: "Core Operations" },
  
  // Tax & Compliance
  { id: "cfdi", title: "CFDI", description: "Digital tax invoice management", icon: FileText, category: "Tax & Compliance" },
  { id: "annual-isr", title: "Annual ISR", description: "Annual income tax calculations", icon: Calculator, category: "Tax & Compliance" },
  { id: "isr-adjustment", title: "ISR Adjustment", description: "Annual ISR adjustment processing", icon: RefreshCw, category: "Tax & Compliance" },
  { id: "certificates", title: "Certificates", description: "Tax certificates and constancias", icon: FileText, category: "Tax & Compliance", emoji: "📄" },
  { id: "constancia-fiscal", title: "Constancia Fiscal", description: "Constancia de Situación Fiscal", icon: FileCheck, category: "Tax & Compliance", requiresEmployee: true },
  { id: "sat-xml-validator", title: "XML Validator", description: "SAT XML validation tools", icon: FileSearch, category: "Tax & Compliance" },
  
  // Social Security
  { id: "sua-idse", title: "SUA/IDSE", description: "SUA file generation", icon: FileSpreadsheet, category: "Social Security" },
  { id: "sua-advanced", title: "SUA Advanced", description: "Advanced SUA generation", icon: FileUp, category: "Social Security" },
  { id: "idse-automation", title: "IDSE Automation", description: "Automated IDSE movements", icon: UserCog, category: "Social Security" },
  { id: "infonavit", title: "INFONAVIT", description: "Housing credit deductions", icon: Building2, category: "Social Security", emoji: "🏠" },
  { id: "fonacot", title: "FONACOT", description: "Consumer credit deductions", icon: FileText, category: "Social Security", emoji: "💳" },
  { id: "social-contributions", title: "Social Contributions", description: "Employer social security contributions", icon: Building, category: "Social Security" },
  { id: "sipare", title: "SIPARE", description: "SIPARE integration and submissions", icon: Database, category: "Social Security" },
  
  // Benefits & Compensation
  { id: "benefits", title: "Benefits", description: "Mexican statutory benefits calculator", icon: Calculator, category: "Benefits & Compensation", emoji: "🎁" },
  { id: "vacation-ptu", title: "Vacation/PTU", description: "Vacation and profit sharing", icon: Sun, category: "Benefits & Compensation" },
  { id: "adv-ptu", title: "Advanced PTU", description: "Advanced PTU distribution", icon: PieChart, category: "Benefits & Compensation" },
  { id: "severance", title: "Severance", description: "Termination calculations", icon: UserMinus, category: "Benefits & Compensation" },
  { id: "adjustments", title: "Adjustments", description: "Payroll adjustments and corrections", icon: Edit, category: "Benefits & Compensation" },
  
  // Analytics & Reporting
  { id: "analytics", title: "Analytics", description: "Payroll analytics and insights", icon: BarChart3, category: "Analytics & Reporting" },
  { id: "comparison", title: "Compare", description: "Multi-period comparison", icon: GitCompare, category: "Analytics & Reporting" },
  { id: "simulations", title: "Simulations", description: "Payroll scenario simulations", icon: TrendingUp, category: "Analytics & Reporting" },
  { id: "anomaly-detection", title: "AI Anomaly", description: "AI-powered anomaly detection", icon: Brain, category: "Analytics & Reporting" },
  
  // Audit & Compliance
  { id: "audit", title: "Audit Trail", description: "Payroll audit history", icon: History, category: "Audit & Compliance" },
  { id: "audit-dashboard", title: "Audit Dashboard", description: "Comprehensive audit overview", icon: Shield, category: "Audit & Compliance" },
  { id: "calendar", title: "Calendar", description: "Compliance calendar", icon: Calendar, category: "Audit & Compliance" },
  { id: "reg-calendar", title: "Regulatory Calendar", description: "Regulatory deadlines tracker", icon: CalendarClock, category: "Audit & Compliance" },
  
  // Employee Self-Service
  { id: "self-service", title: "Self-Service", description: "Employee self-service portal", icon: User, category: "Employee Self-Service", requiresEmployee: true },
  { id: "mobile-ess", title: "Mobile ESS", description: "Mobile employee self-service", icon: Smartphone, category: "Employee Self-Service", requiresEmployee: true },
  
  // Integration & Configuration
  { id: "pac", title: "PAC", description: "PAC provider integration", icon: Settings, category: "Integration & Configuration" },
  { id: "sat-imss-api", title: "SAT/IMSS API", description: "Direct API integrations", icon: Link, category: "Integration & Configuration" },
  { id: "templates", title: "Templates", description: "Payroll templates", icon: FileStack, category: "Integration & Configuration" },
  { id: "webhooks", title: "Webhooks", description: "Integration webhooks", icon: Webhook, category: "Integration & Configuration" },
];

export default function MexicoPayrollPage() {
  usePageAudit('mexico_payroll', 'Payroll');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchEmployees(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, code')
      .order('name');
    if (data) {
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const fetchEmployees = async (companyId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('company_id', companyId)
      .order('full_name');
    if (data) {
      setEmployees(data);
      if (data.length > 0) {
        setSelectedEmployeeId(data[0].id);
      } else {
        setSelectedEmployeeId("");
      }
    }
  };

  const handleFeatureClick = (featureId: string, requiresEmployee?: boolean) => {
    if (requiresEmployee && !selectedEmployeeId) {
      return;
    }
    setActiveFeature(featureId);
  };

  const renderFeatureContent = () => {
    if (!activeFeature) return null;

    const feature = featureCards.find(f => f.id === activeFeature);
    if (!feature) return null;

    switch (activeFeature) {
      case "company": return <MexicanCompanySetup companyId={selectedCompanyId} />;
      case "employees": return selectedEmployeeId ? <MexicanEmployeeData employeeId={selectedEmployeeId} /> : null;
      case "payroll-run": return <MexicanPayrollRun companyId={selectedCompanyId} />;
      case "cfdi": return <CFDIDashboard companyId={selectedCompanyId} />;
      case "sua-idse": return <SUAIDSEGenerator />;
      case "benefits": return <MexicanBenefitsCalculator companyId={selectedCompanyId} />;
      case "infonavit": return <INFONAVITManager companyId={selectedCompanyId} />;
      case "fonacot": return <FONACOTManager companyId={selectedCompanyId} />;
      case "annual-isr": return <MexicanAnnualISR companyId={selectedCompanyId} />;
      case "certificates": return <TaxCertificates companyId={selectedCompanyId} />;
      case "analytics": return <MexicanPayrollAnalytics companyId={selectedCompanyId} />;
      case "calendar": return <ComplianceCalendar companyId={selectedCompanyId} />;
      case "adjustments": return <PayrollAdjustments companyId={selectedCompanyId} />;
      case "self-service": return selectedEmployeeId ? <EmployeeSelfService employeeId={selectedEmployeeId} /> : null;
      case "comparison": return <MultiPeriodComparison companyId={selectedCompanyId} />;
      case "audit": return <AuditTrail companyId={selectedCompanyId} />;
      case "pac": return <PACIntegration companyId={selectedCompanyId} />;
      case "simulations": return <PayrollSimulations companyId={selectedCompanyId} />;
      case "batch": return <BatchOperations companyId={selectedCompanyId} />;
      case "vacation-ptu": return <VacationPTUManager companyId={selectedCompanyId} />;
      case "severance": return <SeveranceCalculator companyId={selectedCompanyId} />;
      case "templates": return <PayrollTemplates companyId={selectedCompanyId} />;
      case "webhooks": return <IntegrationWebhooks companyId={selectedCompanyId} />;
      case "sat-xml-validator": return <SATXMLValidator companyId={selectedCompanyId} />;
      case "idse-automation": return <IDSEAutomation companyId={selectedCompanyId} />;
      case "sua-advanced": return <SUAAdvancedGenerator companyId={selectedCompanyId} />;
      case "social-contributions": return <EmployerSocialContributions companyId={selectedCompanyId} />;
      case "anomaly-detection": return <PayrollAnomalyDetection companyId={selectedCompanyId} />;
      case "mobile-ess": return selectedEmployeeId ? <MexicoEmployeeMobileESS employeeId={selectedEmployeeId} /> : null;
      case "sipare": return <SIPAREIntegration companyId={selectedCompanyId} />;
      case "constancia-fiscal": return selectedEmployeeId ? <ConstanciaSituacionFiscal employeeId={selectedEmployeeId} /> : null;
      case "isr-adjustment": return <ISRAnnualAdjustment companyId={selectedCompanyId} />;
      case "sat-imss-api": return <SATIMSSAPIIntegration companyId={selectedCompanyId} />;
      case "adv-ptu": return <AdvancedPTUDistribution companyId={selectedCompanyId} />;
      case "audit-dashboard": return <MexicanPayrollAuditDashboard companyId={selectedCompanyId} />;
      case "reg-calendar": return <MexicanRegulatoryCalendar companyId={selectedCompanyId} />;
      default: return null;
    }
  };

  const categories = [...new Set(featureCards.map(f => f.category))];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Mexico" },
            ...(activeFeature ? [{ label: featureCards.find(f => f.id === activeFeature)?.title || "" }] : [])
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeFeature && (
              <Button variant="ghost" size="icon" onClick={() => setActiveFeature(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Flag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {activeFeature ? featureCards.find(f => f.id === activeFeature)?.title : "Mexico Payroll"}
              </h1>
              <p className="text-muted-foreground">
                {activeFeature 
                  ? featureCards.find(f => f.id === activeFeature)?.description
                  : "Complete Mexican payroll management with CFDI, IMSS, and SAT compliance"
                }
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <span className="text-lg">🇲🇽</span>
            MX
          </Badge>
        </div>

        {/* Company and Employee Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Context</CardTitle>
            <CardDescription>Choose the company and employee for Mexico payroll operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employee (for employee-specific features)</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name || emp.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedCompanyId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a company to access Mexico payroll features.
            </AlertDescription>
          </Alert>
        ) : activeFeature ? (
          // Feature Detail View
          <div className="space-y-4">
            {renderFeatureContent()}
          </div>
        ) : (
          // Feature Cards Grid
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground">{category}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {featureCards
                    .filter(f => f.category === category)
                    .map(feature => {
                      const isDisabled = feature.requiresEmployee && !selectedEmployeeId;
                      const Icon = feature.icon;
                      
                      return (
                        <Card 
                          key={feature.id}
                          className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleFeatureClick(feature.id, feature.requiresEmployee)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                {feature.emoji ? (
                                  <span className="text-lg">{feature.emoji}</span>
                                ) : (
                                  <Icon className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <CardTitle className="text-base">{feature.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-sm">
                              {feature.description}
                            </CardDescription>
                            {isDisabled && (
                              <p className="text-xs text-destructive mt-2">
                                Select an employee first
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
