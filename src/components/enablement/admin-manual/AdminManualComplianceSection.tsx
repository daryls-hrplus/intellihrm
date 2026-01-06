import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Scale, FileSearch, UserCheck, BarChart3 } from 'lucide-react';
import {
  RegulatoryFramework,
  AuditTrailManagement,
  AccessCertification,
  ComplianceReporting
} from './sections/compliance';

export function AdminManualComplianceSection() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Scale className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <CardTitle>Part 7: Compliance & Audit</CardTitle>
              <CardDescription>
                Regulatory framework, audit trail management, access certification, and reporting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Super Admin</Badge>
            <Badge variant="outline">Security Admin</Badge>
            <Badge variant="outline">HR Admin</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 7.1 Regulatory Framework */}
      <Card id="admin-sec-7-1" data-manual-anchor="admin-sec-7-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">7.1 Regulatory Framework</CardTitle>
          </div>
          <CardDescription>
            GDPR, Caribbean data protection, Africa data residency, industry requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegulatoryFramework />
        </CardContent>
      </Card>

      <Separator />

      {/* 7.2 Audit Trail Management */}
      <Card id="admin-sec-7-2" data-manual-anchor="admin-sec-7-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">7.2 Audit Trail Management</CardTitle>
          </div>
          <CardDescription>
            Event types, retention, investigation procedures, and legal holds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditTrailManagement />
        </CardContent>
      </Card>

      <Separator />

      {/* 7.3 Access Certification */}
      <Card id="admin-sec-7-3" data-manual-anchor="admin-sec-7-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">7.3 Access Certification</CardTitle>
          </div>
          <CardDescription>
            Periodic access reviews, manager certification, and remediation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessCertification />
        </CardContent>
      </Card>

      <Separator />

      {/* 7.4 Compliance Reporting */}
      <Card id="admin-sec-7-4" data-manual-anchor="admin-sec-7-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">7.4 Compliance Reporting</CardTitle>
          </div>
          <CardDescription>
            SOC 2, ISO 27001 alignment, audit readiness dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComplianceReporting />
        </CardContent>
      </Card>
    </div>
  );
}
