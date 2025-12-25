import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CustomFieldsManager } from '@/components/admin/custom-fields/CustomFieldsManager';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCustomFieldsPage() {
  const { t } = useTranslation();
  
  const { data: profile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      return data;
    },
  });

  const breadcrumbItems = [
    { label: t('navigation.admin'), href: '/admin' },
    { label: 'Custom Fields' },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Custom Fields</h1>
            <p className="text-muted-foreground">
              Define and manage custom fields for forms throughout the application
            </p>
          </div>
        </div>

        <CustomFieldsManager companyId={profile?.company_id} />
      </div>
    </AppLayout>
  );
}
