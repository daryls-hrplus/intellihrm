import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings5 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Fields</h1>
          <p className="text-muted-foreground">
            Define and manage custom fields that can be added to forms throughout the application
          </p>
        </div>

        <CustomFieldsManager companyId={profile?.company_id} />
      </div>
    </AdminLayout>
  );
}
