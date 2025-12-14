import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReminderRulesManager } from '@/components/reminders/ReminderRulesManager';
import { EmployeeRemindersList } from '@/components/reminders/EmployeeRemindersList';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Settings, List, Loader2 } from 'lucide-react';

export default function HRRemindersPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setCompanies(data || []);
      setLoading(false);
    };
    fetchCompanies();
  }, []);

  const breadcrumbItems = [
    { label: t('hrHub.title'), href: '/hr-hub' },
    { label: t('hrHub.reminders') },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              {t('hrHub.reminders')}
            </h1>
            <p className="text-muted-foreground">{t('hrHub.remindersDesc')}</p>
          </div>
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t('common.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')} {t('admin.stats.companies')}</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="reminders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              {t('hrHub.reminders')}
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('common.rules') || 'Rules'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle>{t('hrHub.reminders')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('hrHub.remindersDesc')}
                </p>
              </CardHeader>
              <CardContent>
                <EmployeeRemindersList 
                  companyId={selectedCompanyId} 
                  creatorRole="hr"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>{t('common.rules') || 'Reminder Rules'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('hrHub.remindersDesc')}
                </p>
              </CardHeader>
              <CardContent>
                {selectedCompanyId === 'all' ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('common.select')} {t('common.company')}
                  </div>
                ) : (
                  <ReminderRulesManager companyId={selectedCompanyId} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
