import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Settings, 
  Key, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Database,
  Monitor
} from 'lucide-react';

const quickReferenceCards = [
  {
    title: 'User Management Quick Actions',
    icon: Users,
    color: 'text-blue-600',
    items: [
      { action: 'Create User', path: 'Admin → Users → Add User', shortcut: 'Ctrl+Shift+U' },
      { action: 'Assign Role', path: 'User Profile → Roles Tab → Add Role', shortcut: null },
      { action: 'Reset Password', path: 'User Profile → Security → Reset', shortcut: null },
      { action: 'Bulk Import', path: 'Admin → Users → Import CSV', shortcut: null },
      { action: 'Deactivate User', path: 'User Profile → Status → Deactivate', shortcut: null },
    ]
  },
  {
    title: 'Security Controls',
    icon: Shield,
    color: 'text-green-600',
    items: [
      { action: 'Enable MFA', path: 'Security → MFA Settings → Enable', shortcut: null },
      { action: 'View Audit Log', path: 'Security → Audit Logs', shortcut: 'Ctrl+Shift+A' },
      { action: 'IP Whitelist', path: 'Security → Access Controls → IP Rules', shortcut: null },
      { action: 'Session Timeout', path: 'Security → Session Policy', shortcut: null },
      { action: 'Password Policy', path: 'Security → Password Rules', shortcut: null },
    ]
  },
  {
    title: 'Role & Permission Setup',
    icon: Key,
    color: 'text-purple-600',
    items: [
      { action: 'Create Role', path: 'Admin → Roles → New Role', shortcut: null },
      { action: 'Clone Role', path: 'Role Details → Actions → Clone', shortcut: null },
      { action: 'Assign Permissions', path: 'Role → Permissions Tab', shortcut: null },
      { action: 'Role Hierarchy', path: 'Admin → Roles → Hierarchy View', shortcut: null },
      { action: 'Permission Audit', path: 'Role → Audit → View Changes', shortcut: null },
    ]
  },
  {
    title: 'System Configuration',
    icon: Settings,
    color: 'text-orange-600',
    items: [
      { action: 'Company Settings', path: 'Admin → Company → General', shortcut: null },
      { action: 'Email Templates', path: 'Admin → Templates → Email', shortcut: null },
      { action: 'Workflow Rules', path: 'Admin → Workflows → Manage', shortcut: null },
      { action: 'Branding', path: 'Admin → Appearance → Branding', shortcut: null },
      { action: 'Integrations', path: 'Admin → Integrations', shortcut: null },
    ]
  },
  {
    title: 'Emergency Procedures',
    icon: AlertTriangle,
    color: 'text-red-600',
    items: [
      { action: 'Lock All Sessions', path: 'Security → Emergency → Lock All', shortcut: 'Ctrl+Shift+L' },
      { action: 'Disable User Immediately', path: 'User → Actions → Emergency Disable', shortcut: null },
      { action: 'Export Audit Trail', path: 'Security → Audit → Export All', shortcut: null },
      { action: 'Contact Support', path: 'Help → Emergency Support', shortcut: null },
      { action: 'Incident Report', path: 'Security → Incidents → New', shortcut: null },
    ]
  },
  {
    title: 'Compliance Checks',
    icon: CheckCircle,
    color: 'text-teal-600',
    items: [
      { action: 'Run Security Scan', path: 'Security → Compliance → Scan', shortcut: null },
      { action: 'Generate Report', path: 'Reports → Compliance → Generate', shortcut: null },
      { action: 'Review Access', path: 'Security → Access Review', shortcut: null },
      { action: 'Data Retention', path: 'Admin → Data → Retention Policy', shortcut: null },
      { action: 'DSAR Request', path: 'Privacy → DSAR → New Request', shortcut: null },
    ]
  },
];

const commonTasks = [
  { task: 'Onboard new employee', steps: ['Create user account', 'Assign base role', 'Set department', 'Send welcome email', 'Assign training'] },
  { task: 'Offboard employee', steps: ['Initiate offboarding', 'Revoke access', 'Transfer ownership', 'Archive data', 'Generate exit report'] },
  { task: 'Quarterly access review', steps: ['Generate access report', 'Review with managers', 'Identify exceptions', 'Remediate access', 'Document findings'] },
  { task: 'Security incident response', steps: ['Contain threat', 'Preserve evidence', 'Investigate', 'Remediate', 'Report & document'] },
];

export const AdminManualQuickReference: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Quick Reference Cards</h2>
        <p className="text-muted-foreground">
          Fast access guides for common administrative tasks. Print or bookmark for quick reference.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickReferenceCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="border-l-4" style={{ borderLeftColor: card.color.replace('text-', '') }}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconComponent className={`h-5 w-5 ${card.color}`} />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {card.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-start text-sm">
                      <div>
                        <span className="font-medium">{item.action}</span>
                        <p className="text-xs text-muted-foreground">{item.path}</p>
                      </div>
                      {item.shortcut && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.shortcut}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Common Task Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Common Task Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commonTasks.map((task, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-foreground">{task.task}</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {task.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-sm text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Status Indicators Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Active / Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Pending / Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">Inactive / Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-sm">Disabled / N/A</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Locked / Read-only</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm">MFA Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Synced</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Requires Attention</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
