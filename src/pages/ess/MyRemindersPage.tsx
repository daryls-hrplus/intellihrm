import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { MyRemindersList } from '@/components/reminders/MyRemindersList';
import { Bell } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function MyRemindersPage() {
  const { t } = useLanguage();
  
  const breadcrumbItems = [
    { label: t('navigation.ess'), href: '/ess' },
    { label: t('ess.myReminders.breadcrumb') },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            {t('ess.myReminders.title')}
          </h1>
          <p className="text-muted-foreground">{t('ess.myReminders.subtitle')}</p>
        </div>

        <MyRemindersList />
      </div>
    </AppLayout>
  );
}
