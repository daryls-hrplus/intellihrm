import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

import {
  SecurityAuthentication,
  SecurityMFA,
  SecurityPasswordPolicies,
  SecuritySessionManagement,
  SecurityDataAccessControls,
  SecurityAuditLogging,
  SecurityMonitoringDashboard
} from './sections/security';

const SECURITY_SECTIONS = [
  {
    id: 'admin-sec-4-1',
    sectionNumber: '4.1',
    title: 'Authentication Settings',
    description: 'SSO configuration with SAML 2.0 and OAuth 2.0',
    readTimeMin: 15,
    Component: SecurityAuthentication,
  },
  {
    id: 'admin-sec-4-2',
    sectionNumber: '4.2',
    title: 'Multi-Factor Authentication (MFA)',
    description: 'MFA policy configuration and enforcement rules',
    readTimeMin: 12,
    Component: SecurityMFA,
  },
  {
    id: 'admin-sec-4-3',
    sectionNumber: '4.3',
    title: 'Password Policies',
    description: 'Complexity, history, expiry, and lockout configuration',
    readTimeMin: 10,
    Component: SecurityPasswordPolicies,
  },
  {
    id: 'admin-sec-4-4',
    sectionNumber: '4.4',
    title: 'Session Management',
    description: 'Session timeout, concurrent session policies, and forced logout',
    readTimeMin: 8,
    Component: SecuritySessionManagement,
  },
  {
    id: 'admin-sec-4-5',
    sectionNumber: '4.5',
    title: 'Data Access Controls',
    description: 'PII viewing permissions, masking rules, and export restrictions',
    readTimeMin: 15,
    Component: SecurityDataAccessControls,
  },
  {
    id: 'admin-sec-4-6',
    sectionNumber: '4.6',
    title: 'Audit Logging Configuration',
    description: 'Event categories, retention policies, and alert thresholds',
    readTimeMin: 12,
    Component: SecurityAuditLogging,
  },
  {
    id: 'admin-sec-4-7',
    sectionNumber: '4.7',
    title: 'Security Monitoring Dashboard',
    description: 'Real-time metrics, failed login tracking, and compliance indicators',
    readTimeMin: 10,
    Component: SecurityMonitoringDashboard,
  },
] as const;

export function AdminManualSecuritySection() {
  return (
    <div className="space-y-8">
      <Card id="admin-part-4" data-manual-anchor="admin-part-4" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 4: Security Configuration</CardTitle>
          <CardDescription>
            Authentication, MFA, password policies, and security monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure enterprise security controls including SSO authentication, multi-factor authentication,
            password policies, session management, data access controls, and comprehensive audit logging.
          </p>
        </CardContent>
      </Card>

      {SECURITY_SECTIONS.map((section) => (
        <Card
          key={section.id}
          id={section.id}
          data-manual-anchor={section.id}
          className="scroll-mt-32"
        >
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline">Section {section.sectionNumber}</Badge>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{section.readTimeMin} min read</span>
            </div>
            <CardTitle className="text-2xl">{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <section.Component />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
