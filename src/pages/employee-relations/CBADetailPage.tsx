import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, MessageSquare, FileEdit, AlertTriangle, Loader2 } from 'lucide-react';
import { CBAOverviewTab } from '@/components/employee-relations/cba/CBAOverviewTab';
import { CBAArticlesTab } from '@/components/employee-relations/cba/CBAArticlesTab';
import { CBARulesTab } from '@/components/employee-relations/cba/CBARulesTab';
import { CBANegotiationsTab } from '@/components/employee-relations/cba/CBANegotiationsTab';
import { CBAAmendmentsTab } from '@/components/employee-relations/cba/CBAAmendmentsTab';
import { CBAViolationsTab } from '@/components/employee-relations/cba/CBAViolationsTab';

export default function CBADetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['collective_agreement', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collective_agreements')
        .select('*, unions(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const breadcrumbItems = [
    { label: t('common.home'), href: '/' },
    { label: t('employeeRelationsModule.title'), href: '/employee-relations' },
    { label: t('employeeRelationsModule.unions.title'), href: '/employee-relations/unions' },
    { label: agreement?.title || 'Agreement' },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!agreement) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <p className="text-muted-foreground">Agreement not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{agreement.title}</h1>
              <p className="text-muted-foreground">
                {agreement.unions?.name} • {agreement.agreement_number || 'No number'}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Scale className="h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="negotiations" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Negotiations
            </TabsTrigger>
            <TabsTrigger value="amendments" className="gap-2">
              <FileEdit className="h-4 w-4" />
              Amendments
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <CBAOverviewTab agreement={agreement} companyId={agreement.company_id} />
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            <CBAArticlesTab agreementId={agreement.id} />
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <CBARulesTab agreementId={agreement.id} />
          </TabsContent>

          <TabsContent value="negotiations" className="mt-6">
            <CBANegotiationsTab agreementId={agreement.id} companyId={agreement.company_id} />
          </TabsContent>

          <TabsContent value="amendments" className="mt-6">
            <CBAAmendmentsTab agreementId={agreement.id} />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <CBAViolationsTab agreementId={agreement.id} companyId={agreement.company_id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
