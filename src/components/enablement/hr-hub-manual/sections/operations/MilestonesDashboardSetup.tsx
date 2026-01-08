import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Clock, 
  Cake,
  CalendarCheck,
  UserCheck,
  Bell,
  Building2,
  Gift,
  Heart,
  Shield,
  Settings,
  Calendar
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout 
} from '@/components/enablement/manual/components';

export function MilestonesDashboardSetup() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>Milestones Dashboard</CardTitle>
                <Badge variant="outline" className="text-xs">Section 6.5</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~8 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Track and celebrate employee lifecycle milestones automatically
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The Milestones Dashboard automatically identifies and displays upcoming employee 
            milestones including birthdays, work anniversaries, and probation endings. 
            This enables HR and managers to recognize achievements and maintain engagement.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Cake className="h-4 w-4 text-pink-500" />
                <span className="font-medium text-pink-700 dark:text-pink-300">Birthdays</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Employee birthdays from profile data
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Anniversaries</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Work anniversaries from hire date
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Probation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Probation period completions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Views */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Dashboard Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Upcoming Milestones</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Shows milestones for the next 30 days, sorted by date. Provides advance 
                  notice to prepare celebrations, recognition, or HR actions.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Employee name and avatar</li>
                  <li>Milestone type (birthday, anniversary, probation)</li>
                  <li>Days until milestone</li>
                  <li>Years of service (for anniversaries)</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="today" className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Today's Milestones</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Highlights milestones occurring today for immediate action or 
                  same-day recognition.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Birthday wishes to send today</li>
                  <li>Anniversary celebrations today</li>
                  <li>Probation reviews due today</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="month" className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">This Month's Milestones</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Monthly view for planning team celebrations, budget allocation, 
                  and bulk recognition activities.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>All milestones in current month</li>
                  <li>Monthly birthday list for group celebrations</li>
                  <li>Significant anniversaries (5, 10, 15+ years)</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Milestone Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Milestone Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Birthdays */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-pink-500/10">
                  <Cake className="h-5 w-5 text-pink-500" />
                </div>
                <h5 className="font-medium">Birthdays</h5>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li><strong>Source:</strong> date_of_birth field</li>
                <li><strong>Calculation:</strong> Annual recurrence</li>
                <li><strong>Display:</strong> Employee name, photo, date</li>
                <li><strong>Action:</strong> Send wishes, plan celebration</li>
              </ul>
            </div>

            {/* Work Anniversaries */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CalendarCheck className="h-5 w-5 text-blue-500" />
                </div>
                <h5 className="font-medium">Work Anniversaries</h5>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li><strong>Source:</strong> hire_date field</li>
                <li><strong>Calculation:</strong> Years since hire</li>
                <li><strong>Display:</strong> Name, years of service</li>
                <li><strong>Action:</strong> Recognition, awards</li>
              </ul>
            </div>

            {/* Probation Endings */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <h5 className="font-medium">Probation Endings</h5>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li><strong>Source:</strong> hire_date + probation_period</li>
                <li><strong>Calculation:</strong> One-time event</li>
                <li><strong>Display:</strong> Name, probation end date</li>
                <li><strong>Action:</strong> Confirm, extend, or offboard</li>
              </ul>
            </div>
          </div>

          <InfoCallout title="Data Requirements">
            Milestones are automatically calculated from employee profile data. 
            Ensure date_of_birth and hire_date are populated for milestones to appear.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Milestone Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each milestone is displayed as a card with employee information:
          </p>
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-semibold">JD</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">Software Engineer</p>
              </div>
              <Badge className="bg-blue-500">5 Year Anniversary</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                January 15, 2026
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Acme Corp
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Card Information</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Employee avatar/initials</li>
                <li>Full name and job title</li>
                <li>Milestone type badge</li>
                <li>Milestone date</li>
                <li>Years of service (anniversaries)</li>
                <li>Company/department</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Significant Milestones</h5>
              <p className="text-sm text-muted-foreground mb-2">
                Special emphasis for major milestones:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>5 years of service</li>
                <li>10 years of service</li>
                <li>15+ years (long service)</li>
                <li>25 years (silver jubilee)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Company Filtering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In multi-entity environments, filter milestones by company to focus on 
            specific teams or locations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Use Cases</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>View milestones for your assigned entity</li>
                <li>Plan location-specific celebrations</li>
                <li>Budget allocation by company</li>
                <li>Manager view of direct reports</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Filter Options</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All Companies (global view)</li>
                <li>Specific company selection</li>
                <li>Department within company</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Celebration Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Recognition Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use milestones to drive recognition and engagement initiatives:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Communication Integration</h5>
              <p className="text-sm text-muted-foreground">
                Link milestones to the Company Communications feature (Chapter 5.3) 
                to send birthday announcements or anniversary recognition posts.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Notification Triggers</h5>
              <p className="text-sm text-muted-foreground">
                Configure automated notifications (Chapter 5.2) to remind managers 
                of upcoming team milestones.
              </p>
            </div>
          </div>

          <TipCallout title="Monthly Celebration Planning">
            Use the "This Month" view at the start of each month to plan group 
            birthday celebrations, order gifts for significant anniversaries, 
            and schedule probation review meetings.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Milestone visibility respects employee privacy preferences:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Employee Settings</h5>
              <p className="text-sm text-muted-foreground">
                Employees can opt out of birthday announcements or milestone 
                visibility in their profile privacy settings.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Admin Configuration</h5>
              <p className="text-sm text-muted-foreground">
                Organization-level settings control default visibility and 
                which milestone types are tracked.
              </p>
            </div>
          </div>

          <WarningCallout title="GDPR Compliance">
            Birthday visibility may be subject to data protection regulations. 
            Ensure employees have consented to milestone sharing in their 
            profile preferences. See Organization Settings for company-wide defaults.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuration Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Milestone tracking is configured in Organization Settings:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Setting</th>
                  <th className="text-left py-2 px-3 font-medium">Options</th>
                  <th className="text-left py-2 px-3 font-medium">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Track Birthdays</td>
                  <td className="py-2 px-3 text-muted-foreground">On/Off</td>
                  <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Track Anniversaries</td>
                  <td className="py-2 px-3 text-muted-foreground">On/Off</td>
                  <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Track Probation</td>
                  <td className="py-2 px-3 text-muted-foreground">On/Off</td>
                  <td className="py-2 px-3"><Badge className="bg-green-500">On</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Advance Notice</td>
                  <td className="py-2 px-3 text-muted-foreground">7, 14, 30 days</td>
                  <td className="py-2 px-3"><Badge variant="outline">30 days</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Default Visibility</td>
                  <td className="py-2 px-3 text-muted-foreground">All, Managers Only, HR Only</td>
                  <td className="py-2 px-3"><Badge variant="outline">Managers Only</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <InfoCallout title="Cross-Reference">
            Milestone notification rules are configured in Chapter 5.2 
            "Notifications & Reminders". Probation tracking integrates with 
            the Workforce module's employment lifecycle features.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  );
}
