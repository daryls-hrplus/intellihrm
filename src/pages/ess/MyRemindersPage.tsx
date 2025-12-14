import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { MyRemindersList } from '@/components/reminders/MyRemindersList';
import { Bell } from 'lucide-react';

export default function MyRemindersPage() {
  const breadcrumbItems = [
    { label: 'Employee Self-Service', href: '/ess' },
    { label: 'My Reminders' },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            My Reminders
          </h1>
          <p className="text-muted-foreground">View your upcoming reminders and important dates</p>
        </div>

        <MyRemindersList />
      </div>
    </AppLayout>
  );
}
