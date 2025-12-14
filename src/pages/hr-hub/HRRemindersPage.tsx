import { useState, useEffect } from 'react';
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
    { label: 'HR Hub', href: '/hr-hub' },
    { label: 'Reminders' },
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
              HR Reminders
            </h1>
            <p className="text-muted-foreground">Manage employee reminders and notification rules</p>
          </div>
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
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
              Reminders
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle>Employee Reminders</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create and manage reminders for employees
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
                <CardTitle>Reminder Rules</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure automatic reminder rules for important dates
                </p>
              </CardHeader>
              <CardContent>
                {selectedCompanyId === 'all' ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select a company to manage reminder rules
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
