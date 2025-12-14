import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeRemindersList } from '@/components/reminders/EmployeeRemindersList';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Loader2, Users } from 'lucide-react';

export default function MssRemindersPage() {
  const { user } = useAuth();
  const [directReportsCount, setDirectReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      // Get user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
      }

      // Get direct reports count
      const { data: reports } = await supabase.rpc('get_manager_direct_reports', { 
        p_manager_id: user.id 
      });
      setDirectReportsCount(reports?.length || 0);
      setLoading(false);
    };
    loadData();
  }, [user?.id]);

  const breadcrumbItems = [
    { label: 'Manager Self-Service', href: '/mss' },
    { label: 'Team Reminders' },
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
              Team Reminders
            </h1>
            <p className="text-muted-foreground">Manage reminders for your direct reports</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{directReportsCount} direct reports</span>
          </div>
        </div>

        {directReportsCount === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No direct reports found</p>
              <p className="text-sm text-muted-foreground">You need direct reports assigned to manage their reminders</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Direct Reports Reminders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and manage reminders for your team members. Employees can view these reminders but cannot modify or dismiss them unless you allow it.
              </p>
            </CardHeader>
            <CardContent>
              <EmployeeRemindersList 
                companyId={companyId}
                creatorRole="manager"
                directReportsOnly={true}
                managerId={user?.id}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
