import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { UserPlus } from "lucide-react";
import { ReferralProgramTab } from "@/components/recruitment/ReferralProgramTab";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function ReferralsPage() {
  usePageAudit('referrals', 'Recruitment');
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("recruitment.dashboard.title"), href: "/recruitment" },
            { label: t("recruitment.tabs.referrals") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <UserPlus className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("recruitment.tabs.referrals")}</h1>
              <p className="text-muted-foreground">Manage employee referral programs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
          </div>
        </div>

        <ReferralProgramTab companyId={selectedCompanyId} />
      </div>
    </AppLayout>
  );
}
