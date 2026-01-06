import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Shield, DollarSign, FileCheck } from 'lucide-react';
import {
  AISystemSettings,
  AIGuardrails,
  AIBudgetManagement,
  ISO42001Compliance
} from './sections/ai-governance';

export function AdminManualAIGovernanceSection() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <CardTitle>Part 6: AI Governance & Compliance</CardTitle>
              <CardDescription>
                AI system settings, guardrails, budget management, and ISO 42001 compliance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Super Admin</Badge>
            <Badge variant="outline">Security Admin</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 6.1 AI System Settings */}
      <Card id="admin-sec-6-1" data-manual-anchor="admin-sec-6-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">6.1 AI System Settings</CardTitle>
          </div>
          <CardDescription>
            AI enablement, allowed models, and token limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AISystemSettings />
        </CardContent>
      </Card>

      <Separator />

      {/* 6.2 AI Guardrails Configuration */}
      <Card id="admin-sec-6-2" data-manual-anchor="admin-sec-6-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">6.2 AI Guardrails Configuration</CardTitle>
          </div>
          <CardDescription>
            Role security, policy compliance, PII protection, and escalation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIGuardrails />
        </CardContent>
      </Card>

      <Separator />

      {/* 6.3 AI Budget Management */}
      <Card id="admin-sec-6-3" data-manual-anchor="admin-sec-6-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">6.3 AI Budget Management</CardTitle>
          </div>
          <CardDescription>
            Budget tiers, user assignments, and usage tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIBudgetManagement />
        </CardContent>
      </Card>

      <Separator />

      {/* 6.4 ISO 42001 Compliance */}
      <Card id="admin-sec-6-4" data-manual-anchor="admin-sec-6-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">6.4 ISO 42001 Compliance</CardTitle>
          </div>
          <CardDescription>
            AI risk assessment, bias detection, model governance, and audit documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ISO42001Compliance />
        </CardContent>
      </Card>
    </div>
  );
}
