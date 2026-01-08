import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  GraduationCap,
  Flag,
  Bell,
  Eye
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout 
} from '@/components/enablement/manual/components';

export function HRCalendarSetup() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>HR Calendar</CardTitle>
                <Badge variant="outline" className="text-xs">Section 6.4</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~10 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Company-wide HR event management and scheduling
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The HR Calendar provides a centralized view of company events, training sessions, 
            holidays, deadlines, and meetings. Events can be filtered by company and type, 
            with color-coded visual indicators for quick recognition.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Meetings</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Team meetings and 1:1s
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700 dark:text-red-300">Deadlines</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Important due dates
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Training</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Learning sessions
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Holidays</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Company holidays
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Event Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Events are color-coded by type for easy visual recognition on the calendar:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Color</th>
                  <th className="text-left py-2 px-3 font-medium">Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Meeting</td>
                  <td className="py-2 px-3">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Team meetings, 1:1s, interviews, town halls
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Deadline</td>
                  <td className="py-2 px-3">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Review deadlines, report submissions, compliance due dates
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Training</td>
                  <td className="py-2 px-3">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Training sessions, workshops, certifications
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Holiday</td>
                  <td className="py-2 px-3">
                    <div className="w-4 h-4 rounded bg-amber-500"></div>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Public holidays, company closures, observances
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Other</td>
                  <td className="py-2 px-3">
                    <div className="w-4 h-4 rounded bg-gray-500"></div>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    General events, social activities, announcements
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Calendar Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3">Monthly Grid View</h5>
              <p className="text-sm text-muted-foreground mb-2">
                The primary view displays a monthly calendar grid with:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Color-coded dots indicating events</li>
                <li>Click any date to view/create events</li>
                <li>Current date highlighted</li>
                <li>Navigate months with arrows</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3">Navigation Controls</h5>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">Previous</span>
                </div>
                <span className="font-medium">January 2026</span>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="text-sm">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Use arrow buttons to navigate between months
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creating Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Creating Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create new events by clicking on a date or using the "Add Event" button:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                  <th className="text-left py-2 px-3 font-medium">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Title</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Event name displayed on calendar
                  </td>
                  <td className="py-2 px-3"><Badge variant="default">Yes</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Description</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Additional details, agenda, or notes
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Date</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Event date (pre-filled if clicking calendar)
                  </td>
                  <td className="py-2 px-3"><Badge variant="default">Yes</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Time</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Start time (optional for timed events)
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Event Type</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Meeting, Deadline, Training, Holiday, Other
                  </td>
                  <td className="py-2 px-3"><Badge variant="default">Yes</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Location</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Physical location or virtual meeting link
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">All Day</td>
                  <td className="py-2 px-3 text-muted-foreground">
                    Toggle for full-day events (no specific time)
                  </td>
                  <td className="py-2 px-3"><Badge variant="outline">No</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <TipCallout title="Bulk Holiday Import">
            For annual holiday calendars, use the Data Import tool (Chapter 2.3) to 
            bulk import company holidays instead of creating them individually.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Company Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Multi-Company Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In multi-entity environments, use the company filter to view events 
            specific to each organization:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Company-Specific Events</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Filter calendar by company</li>
                <li>Events tagged to specific entities</li>
                <li>Location-specific holidays</li>
                <li>Entity-level training sessions</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Organization-Wide Events</h5>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>View "All Companies" for global events</li>
                <li>Corporate announcements</li>
                <li>Cross-entity deadlines</li>
                <li>Company-wide observances</li>
              </ul>
            </div>
          </div>

          <InfoCallout title="Regional Holidays">
            Different locations may have different public holidays. Create 
            location-specific holiday events and filter by company to show 
            relevant holidays for each entity.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Event Details & Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click on any event to view full details in a dialog:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Event Information</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Title and description</li>
                <li>• Date and time</li>
                <li>• Event type badge</li>
                <li>• Created by / owner</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Location Details</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Physical address</li>
                <li>• Room/building info</li>
                <li>• Virtual meeting link</li>
                <li>• Map integration</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Actions</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Edit event details</li>
                <li>• Delete event</li>
                <li>• Share/export</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The HR Calendar integrates with other HR Hub features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Notifications</h5>
              <p className="text-sm text-muted-foreground">
                Events can trigger notification reminders configured in Chapter 5.2 
                (Notifications & Reminders).
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Milestones</h5>
              <p className="text-sm text-muted-foreground">
                Employee milestones (birthdays, anniversaries) appear on the 
                calendar when enabled.
              </p>
            </div>
          </div>

          <WarningCallout title="Calendar Sync">
            External calendar sync (Google Calendar, Outlook) is configured in 
            Organization Settings. Ensure sync is enabled if users need events 
            to appear in their personal calendars.
          </WarningCallout>
        </CardContent>
      </Card>
    </div>
  );
}
