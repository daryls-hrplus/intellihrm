import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NineBoxConfigPanel } from '@/components/succession/NineBoxConfigPanel';
import { supabase } from '@/integrations/supabase/client';
import { Settings2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTabState } from '@/hooks/useTabState';

interface Company {
  id: string;
  name: string;
}

export default function NineBoxConfigPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [tabState, setTabState] = useTabState({
    defaultState: { selectedCompany: "" },
    syncToUrl: ["selectedCompany"],
  });
  
  const { selectedCompany } = tabState;

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
    { label: "9-Box Configuration" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="h-6 w-6" />
              9-Box Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure rating sources and signal mappings for 9-box assessments
            </p>
          </div>
          <Select value={selectedCompany} onValueChange={(v) => setTabState({ selectedCompany: v })}>
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

        {selectedCompany && <NineBoxConfigPanel companyId={selectedCompany} />}
      </div>
    </AppLayout>
  );
}
