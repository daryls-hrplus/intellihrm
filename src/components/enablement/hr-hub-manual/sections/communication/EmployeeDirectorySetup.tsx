import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Building2, 
  MapPin,
  Phone,
  Mail,
  UserCircle,
  Filter,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Clock,
  Network,
  Image as ImageIcon
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  SuccessCallout 
} from '@/components/enablement/manual/components';

export function EmployeeDirectorySetup() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>Employee Directory</CardTitle>
                <Badge variant="outline" className="text-xs">Section 5.1</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~10 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Find and connect with colleagues across the organization
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The Employee Directory provides a comprehensive, searchable database of all employees. 
            Enable staff to quickly find colleagues, view contact information, understand reporting 
            relationships, and connect across departments—reducing dependency on HR for contact lookups.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Smart Search</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Find by name, title, department, or location
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Rich Profiles</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Photo, contact info, and organizational context
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">Org Integration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                View reporting lines and team structure
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Privacy Controls</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Configurable visibility for sensitive data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directory Search & Filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search & Filtering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            The directory provides powerful search and filtering capabilities to help employees 
            quickly find the right person, regardless of organization size.
          </p>

          {/* Search Capabilities */}
          <div className="space-y-4">
            <h4 className="font-semibold">Search Fields</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { field: 'Name', desc: 'First, last, or preferred name' },
                { field: 'Job Title', desc: 'Position or role' },
                { field: 'Department', desc: 'Team or division' },
                { field: 'Location', desc: 'Office or work site' },
                { field: 'Email', desc: 'Work email address' },
                { field: 'Phone', desc: 'Extension or mobile' },
                { field: 'Manager', desc: 'Reporting manager' },
                { field: 'Employee ID', desc: 'Staff number' }
              ].map(item => (
                <div key={item.field} className="p-3 rounded-lg border bg-card">
                  <p className="font-medium text-sm">{item.field}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Options */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Options
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Filter</th>
                    <th className="text-left py-2 px-3 font-medium">Options</th>
                    <th className="text-left py-2 px-3 font-medium">Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3 font-medium">Department</td>
                    <td className="py-2 px-3 text-muted-foreground">All active departments</td>
                    <td className="py-2 px-3 text-muted-foreground">Find colleagues within a team</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Location</td>
                    <td className="py-2 px-3 text-muted-foreground">All office locations</td>
                    <td className="py-2 px-3 text-muted-foreground">Find people at specific sites</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Employment Type</td>
                    <td className="py-2 px-3 text-muted-foreground">Full-time, Part-time, Contract</td>
                    <td className="py-2 px-3 text-muted-foreground">Narrow by engagement type</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Status</td>
                    <td className="py-2 px-3 text-muted-foreground">Active, On Leave</td>
                    <td className="py-2 px-3 text-muted-foreground">Check availability</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <TipCallout title="Combining Filters">
            Combine multiple filters for precise results. For example, filter by 
            "Engineering" department AND "New York" location to find all engineers 
            at the NYC office.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Employee Profile Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Employee Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Each employee's profile displays key information for identification and contact. 
            Administrators configure which fields are visible to different user groups.
          </p>

          {/* Profile Fields */}
          <div className="space-y-4">
            <h4 className="font-semibold">Standard Profile Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-primary" />
                  Identity
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Employee photo</li>
                  <li>• Full name & preferred name</li>
                  <li>• Job title / Position</li>
                  <li>• Employee ID / Staff number</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Organization
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Department / Team</li>
                  <li>• Division / Business unit</li>
                  <li>• Reporting manager</li>
                  <li>• Direct reports count</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-500" />
                  Contact
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Work email address</li>
                  <li>• Work phone / Extension</li>
                  <li>• Mobile number (if shared)</li>
                  <li>• Desk location / Floor</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  Location
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Office / Work site</li>
                  <li>• Building / Floor</li>
                  <li>• Time zone</li>
                  <li>• Remote/Hybrid status</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Actions</h4>
            <p className="text-sm text-muted-foreground">
              From any employee profile, users can quickly initiate contact:
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Send Email</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-sm">Call</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card">
                <Network className="h-4 w-4 text-purple-500" />
                <span className="text-sm">View in Org Chart</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Visibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Control what information is visible in the directory. Protect sensitive data 
            while enabling productive collaboration.
          </p>

          {/* Field Visibility */}
          <div className="space-y-4">
            <h4 className="font-semibold">Field Visibility by Role</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Field</th>
                    <th className="text-left py-2 px-3 font-medium">All Employees</th>
                    <th className="text-left py-2 px-3 font-medium">Managers</th>
                    <th className="text-left py-2 px-3 font-medium">HR Only</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3 font-medium">Name & Photo</td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Work Email</td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Mobile Number</td>
                    <td className="py-2 px-3"><EyeOff className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Personal Email</td>
                    <td className="py-2 px-3"><EyeOff className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="py-2 px-3"><EyeOff className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Home Address</td>
                    <td className="py-2 px-3"><EyeOff className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="py-2 px-3"><EyeOff className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Salary Info</td>
                    <td className="py-2 px-3"><EyeOff className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="py-2 px-3"><EyeOff className="h-4 w-4 text-muted-foreground" /></td>
                    <td className="py-2 px-3"><Eye className="h-4 w-4 text-green-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <WarningCallout title="Privacy Compliance">
            Ensure directory visibility settings comply with local data protection regulations 
            (GDPR, PDPA, etc.). Some jurisdictions require employee consent before sharing 
            personal contact information.
          </WarningCallout>

          {/* Employee Self-Service */}
          <div className="space-y-4">
            <h4 className="font-semibold">Employee Self-Service Options</h4>
            <p className="text-sm text-muted-foreground">
              Employees may have the ability to control visibility of certain personal fields:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
              <li>Hide personal mobile number from directory</li>
              <li>Control preferred name display</li>
              <li>Opt out of birthday/anniversary displays</li>
              <li>Set out-of-office status</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Admin Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Administrator Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            HR administrators configure directory settings to match organizational needs.
          </p>

          {/* Photo Requirements */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photo Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Dimensions</h5>
                <p className="text-sm text-muted-foreground">
                  Recommended: 400×400px minimum, square aspect ratio for consistent display
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Format</h5>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, or WebP formats accepted. Max file size: 5MB
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium mb-2">Default Image</h5>
                <p className="text-sm text-muted-foreground">
                  System provides placeholder for employees without photos
                </p>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Display Settings</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Setting</th>
                    <th className="text-left py-2 px-3 font-medium">Options</th>
                    <th className="text-left py-2 px-3 font-medium">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-3 font-medium">Default Sort</td>
                    <td className="py-2 px-3 text-muted-foreground">Name, Department, Location</td>
                    <td className="py-2 px-3 text-muted-foreground">Last Name (A-Z)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Cards Per Page</td>
                    <td className="py-2 px-3 text-muted-foreground">12, 24, 48</td>
                    <td className="py-2 px-3 text-muted-foreground">24 for balanced performance</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Show Inactive</td>
                    <td className="py-2 px-3 text-muted-foreground">Show, Hide, HR Only</td>
                    <td className="py-2 px-3 text-muted-foreground">Hide from general users</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Show On Leave</td>
                    <td className="py-2 px-3 text-muted-foreground">Show status, Hide status</td>
                    <td className="py-2 px-3 text-muted-foreground">Show status indicator</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <SuccessCallout title="Integration with Org Chart">
            The directory automatically syncs with the organizational structure. Changes to 
            reporting lines, departments, or locations update in real-time across both modules.
          </SuccessCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700 dark:text-green-300">Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Ensure all employees have up-to-date photos</li>
                <li>✓ Keep job titles consistent and meaningful</li>
                <li>✓ Regularly audit reporting relationships</li>
                <li>✓ Enable search across multiple fields</li>
                <li>✓ Train employees on privacy settings</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700 dark:text-red-300">Avoid</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✗ Exposing sensitive personal information</li>
                <li>✗ Including terminated employees in active listings</li>
                <li>✗ Inconsistent department naming conventions</li>
                <li>✗ Allowing outdated contact information</li>
                <li>✗ Ignoring data protection requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
