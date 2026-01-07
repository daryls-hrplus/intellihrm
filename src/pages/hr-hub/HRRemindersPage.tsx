import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReminderRulesManager, ReminderRulesManagerRef } from '@/components/reminders/ReminderRulesManager';
import { EmployeeRemindersList } from '@/components/reminders/EmployeeRemindersList';
import { AIRecommendationsPanel } from '@/components/reminders/AIRecommendationsPanel';
import { ReminderWelcomeBanner } from '@/components/reminders/ReminderWelcomeBanner';
import { ReminderAIDashboard } from '@/components/reminders/ReminderAIDashboard';
import { ReminderEmailTemplates } from '@/components/reminders/ReminderEmailTemplates';
import { NotificationLogPanel } from '@/components/reminders/NotificationLogPanel';
import { useReminders } from '@/hooks/useReminders';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Settings, List, Loader2, FileText, Send, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeliveryTrackingDashboard } from '@/components/reminders/DeliveryTrackingDashboard';
import { toast } from 'sonner';

export default function HRRemindersPage() {
  const { t } = useLanguage();
  const { createRule, fetchEventTypes } = useReminders();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');
  const [highlightRuleId, setHighlightRuleId] = useState<string | null>(null);
  const rulesManagerRef = useRef<ReminderRulesManagerRef | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setCompanies(data || []);
      
      // Auto-select first company if available
      if (data && data.length > 0 && selectedCompanyId === 'all') {
        setSelectedCompanyId(data[0].id);
      }
      
      setLoading(false);
    };
    fetchCompanies();
  }, []);

  const handleApplyRecommendation = async (recommendation: any): Promise<string | void> => {
    try {
      // Fetch event types to get the ID
      const eventTypes = await fetchEventTypes();
      const eventType = eventTypes.find((et: any) => et.id === recommendation.eventTypeId);
      
      if (!eventType) {
        throw new Error('Event type not found');
      }

      // Create the rule with AI-suggested values
      const newRule = await createRule({
        company_id: selectedCompanyId,
        name: `${eventType.name} Reminder`,
        description: `Auto-generated rule for ${eventType.name.toLowerCase()} reminders`,
        event_type_id: recommendation.eventTypeId,
        days_before: recommendation.suggestedIntervals[0],
        reminder_intervals: recommendation.suggestedIntervals,
        send_to_employee: recommendation.suggestedRecipients.employee,
        send_to_manager: recommendation.suggestedRecipients.manager,
        send_to_hr: recommendation.suggestedRecipients.hr,
        notification_method: 'both',
        message_template: recommendation.suggestedTemplate,
        priority: recommendation.suggestedPriority,
        is_active: true,
      });

      // Trigger reload of the rules manager
      rulesManagerRef.current?.reload();
      
      // Return the new rule ID for highlighting
      return newRule?.id;
    } catch (error) {
      console.error('Error applying recommendation:', error);
      throw error;
    }
  };

  const handleRuleCreated = useCallback((ruleId: string, ruleName: string) => {
    // Set highlight and scroll to the new rule
    setHighlightRuleId(ruleId);
    
    // Give the rules manager time to reload, then scroll
    setTimeout(() => {
      rulesManagerRef.current?.scrollToRule(ruleId);
    }, 500);
  }, []);

  const handleUseTemplate = (template: any) => {
    toast.success(`Template "${template.name}" selected. Switch to the Rules tab to create a rule using this template.`);
    setActiveTab('rules');
  };

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
              Communications & Reminders
            </h1>
            <p className="text-muted-foreground">Manage notifications, reminders, and templates</p>
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

        {/* Welcome Banner */}
        <ReminderWelcomeBanner 
          onGetStarted={() => setActiveTab('templates')}
          onViewAI={() => setActiveTab('rules')}
        />

        {/* AI Dashboard - Always Visible */}
        <ReminderAIDashboard 
          companyId={selectedCompanyId}
          onNavigateToRules={() => setActiveTab('rules')}
          onNavigateToReminders={() => setActiveTab('reminders')}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TooltipProvider>
            <TabsList>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Email content templates for reminder messages</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="rules" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Automation Rules
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Rules that trigger reminders based on events</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="reminders" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Reminder Queue
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Pending and completed scheduled reminders</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="delivery" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Email Delivery
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Track email/SMS delivery status for scheduled reminders</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    In-App Alerts
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Real-time alerts in the employee notification bell</TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <CardTitle>In-App Notifications</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Real-time alerts that appear in the employee notification bell icon (ESS approvals, workflow updates, system alerts)
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <NotificationLogPanel companyId={selectedCompanyId === 'all' ? undefined : selectedCompanyId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize email notification templates for all reminder categories
                </p>
              </CardHeader>
              <CardContent>
                {selectedCompanyId === 'all' ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a company to manage email templates</p>
                  </div>
                ) : (
                  <ReminderEmailTemplates 
                    companyId={selectedCompanyId} 
                    onUseTemplate={handleUseTemplate}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            {/* AI Recommendations Panel */}
            {selectedCompanyId && selectedCompanyId !== 'all' && (
              <AIRecommendationsPanel 
                companyId={selectedCompanyId}
                onApplyRecommendation={handleApplyRecommendation}
                onRuleCreated={handleRuleCreated}
              />
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Automation Rules</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic rules to send reminders for important events
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedCompanyId === 'all' ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a company to manage reminder rules</p>
                  </div>
                ) : (
                  <ReminderRulesManager 
                    companyId={selectedCompanyId}
                    ref={rulesManagerRef}
                    highlightRuleId={highlightRuleId}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reminder Queue</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and manage all pending and sent reminders across the organization
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

          <TabsContent value="delivery" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Send className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <CardTitle>Email & SMS Delivery</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track email and SMS delivery status for scheduled reminders. Retry failed deliveries.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DeliveryTrackingDashboard companyId={selectedCompanyId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
