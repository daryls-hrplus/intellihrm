import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Users, Gauge, ListChecks, Grid3X3, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { useTabState } from '@/hooks/useTabState';

// Config components
import { ReadinessRatingBandsConfig } from '@/components/succession/config/ReadinessRatingBandsConfig';
import { AssessorTypesConfig } from '@/components/succession/config/AssessorTypesConfig';
import { AvailabilityReasonsConfig } from '@/components/succession/config/AvailabilityReasonsConfig';
import { NineBoxConfigPanel } from '@/components/succession/NineBoxConfigPanel';

interface Company {
  id: string;
  name: string;
}

export default function SuccessionSetupPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [tabState, setTabState] = useTabState({
    defaultState: { 
      selectedCompany: "",
      activeTab: "assessor-types",
    },
    syncToUrl: ["selectedCompany", "activeTab"],
  });
  
  const { selectedCompany, activeTab } = tabState;

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setCompanies(data || []);
      if (data?.[0] && !selectedCompany) {
        setTabState({ selectedCompany: data[0].id });
      }
    };
    fetchCompanies();
  }, []);

  const breadcrumbItems = [
    { label: t("succession.dashboard.title"), href: "/succession" },
    { label: "Succession Setup" },
  ];

  const tabs = [
    { id: "assessor-types", label: "Assessor Types", icon: Users },
    { id: "readiness-bands", label: "Readiness Bands", icon: Gauge },
    { id: "availability-reasons", label: "Availability Reasons", icon: Calendar },
    { id: "nine-box", label: "9-Box Configuration", icon: Grid3X3 },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="h-6 w-6" />
              Succession Setup
            </h1>
            <p className="text-muted-foreground">
              Configure readiness assessments, rating bands, and assessor workflows
            </p>
          </div>
          <Select 
            value={selectedCompany} 
            onValueChange={(v) => setTabState({ selectedCompany: v })}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompany ? (
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setTabState({ activeTab: v })}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="assessor-types">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assessor Types
                  </CardTitle>
                  <CardDescription>
                    Configure which assessor roles participate in readiness assessments (Manager, HR, Executive)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssessorTypesConfig companyId={selectedCompany} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="readiness-bands">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Readiness Rating Bands
                  </CardTitle>
                  <CardDescription>
                    Configure score thresholds for readiness levels (Ready Now, 1-3 Years, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReadinessRatingBandsConfig companyId={selectedCompany} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability-reasons">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Availability Reasons
                  </CardTitle>
                  <CardDescription>
                    Configure reasons why positions become available (Retirement, Promotion, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvailabilityReasonsConfig companyId={selectedCompany} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nine-box">
              <NineBoxConfigPanel companyId={selectedCompany} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Please select a company to configure succession settings
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
