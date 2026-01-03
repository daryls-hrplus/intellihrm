import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { InvestigationApprovalQueue } from "@/components/feedback/cycles/InvestigationApprovalQueue";
import { supabase } from "@/integrations/supabase/client";

export default function InvestigationRequestsPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Administration", href: "/admin" },
            { label: "Investigation Requests" },
          ]}
        />
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Investigation Requests</h1>
          <p className="text-muted-foreground">
            Review and approve access to individual 360 feedback responses for formal investigations
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading...
          </div>
        ) : profile?.company_id ? (
          <InvestigationApprovalQueue companyId={profile.company_id} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Unable to load company information
          </div>
        )}
      </div>
    </AppLayout>
  );
}
