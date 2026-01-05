import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionWorkflowSettings } from "@/hooks/useTransactionWorkflowSettings";
import { useLanguage } from "@/hooks/useLanguage";
import { CheckCircle2, XCircle, ToggleLeft, ToggleRight } from "lucide-react";

interface Props {
  companyId: string;
}

export function TransactionWorkflowSettingsGrid({ companyId }: Props) {
  const { t } = useLanguage();
  const {
    settings,
    transactionTypes,
    workflowTemplates,
    loading,
    upsertSetting,
  } = useTransactionWorkflowSettings(companyId);

  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Partial<typeof settings[0]>>
  >({});

  const getSettingForType = (typeId: string) => {
    return settings.find((s) => s.transaction_type_id === typeId);
  };

  const handleToggleWorkflow = async (typeId: string, enabled: boolean) => {
    await upsertSetting(typeId, { workflow_enabled: enabled });
  };

  const handleTemplateChange = async (typeId: string, templateId: string) => {
    await upsertSetting(typeId, {
      workflow_template_id: templateId === "none" ? null : templateId,
    });
  };

  const handleAutoStartChange = async (typeId: string, autoStart: boolean) => {
    await upsertSetting(typeId, { auto_start_workflow: autoStart });
  };

  const handleRequiresApprovalChange = async (
    typeId: string,
    requiresApproval: boolean
  ) => {
    await upsertSetting(typeId, {
      requires_approval_before_effective: requiresApproval,
    });
  };

  const handleBulkEnable = async (enabled: boolean) => {
    for (const type of transactionTypes) {
      await upsertSetting(type.id, { workflow_enabled: enabled });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const enabledCount = transactionTypes.filter((type) => {
    const setting = getSettingForType(type.id);
    return setting?.workflow_enabled;
  }).length;

  return (
    <div className="space-y-6">
      {/* Summary and Bulk Actions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {t("hrHub.transactionWorkflowSettings.summary") || "Configuration Summary"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkEnable(true)}
              >
                <ToggleRight className="h-4 w-4 mr-1" />
                {t("hrHub.transactionWorkflowSettings.enableAll") || "Enable All"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkEnable(false)}
              >
                <ToggleLeft className="h-4 w-4 mr-1" />
                {t("hrHub.transactionWorkflowSettings.disableAll") || "Disable All"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm">
                <strong>{enabledCount}</strong>{" "}
                {t("hrHub.transactionWorkflowSettings.workflowEnabled") ||
                  "with workflow enabled"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                <strong>{transactionTypes.length - enabledCount}</strong>{" "}
                {t("hrHub.transactionWorkflowSettings.workflowDisabled") ||
                  "without workflow"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Type Grid */}
      <div className="grid gap-4">
        {transactionTypes.map((type) => {
          const setting = getSettingForType(type.id);
          const isEnabled = setting?.workflow_enabled ?? false;

          return (
            <Card
              key={type.id}
              className={isEnabled ? "border-primary/30" : ""}
            >
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Transaction Type Info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{type.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {type.code}
                        </Badge>
                      </div>
                      {isEnabled && (
                        <span className="text-xs text-green-600">
                          {t("hrHub.transactionWorkflowSettings.workflowRequired") ||
                            "Workflow required"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-6">
                    {/* Workflow Enabled Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`workflow-${type.id}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleWorkflow(type.id, checked)
                        }
                      />
                      <Label
                        htmlFor={`workflow-${type.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {t("hrHub.transactionWorkflowSettings.enableWorkflow") ||
                          "Workflow Enabled"}
                      </Label>
                    </div>

                    {/* Template Selection */}
                    {isEnabled && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm whitespace-nowrap">
                            {t("hrHub.transactionWorkflowSettings.template") ||
                              "Template"}
                            :
                          </Label>
                          <Select
                            value={setting?.workflow_template_id || "none"}
                            onValueChange={(v) =>
                              handleTemplateChange(type.id, v)
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue
                                placeholder={
                                  t(
                                    "hrHub.transactionWorkflowSettings.selectTemplate"
                                  ) || "Select template"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                {t("common.none") || "None"}
                              </SelectItem>
                              {workflowTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Auto-start Toggle */}
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`auto-start-${type.id}`}
                            checked={setting?.auto_start_workflow ?? false}
                            onCheckedChange={(checked) =>
                              handleAutoStartChange(type.id, checked)
                            }
                          />
                          <Label
                            htmlFor={`auto-start-${type.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {t("hrHub.transactionWorkflowSettings.autoStart") ||
                              "Auto-start"}
                          </Label>
                        </div>

                        {/* Requires Approval Toggle */}
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`requires-approval-${type.id}`}
                            checked={
                              setting?.requires_approval_before_effective ?? false
                            }
                            onCheckedChange={(checked) =>
                              handleRequiresApprovalChange(type.id, checked)
                            }
                          />
                          <Label
                            htmlFor={`requires-approval-${type.id}`}
                            className="text-sm cursor-pointer whitespace-nowrap"
                          >
                            {t(
                              "hrHub.transactionWorkflowSettings.requiresApproval"
                            ) || "Block until approved"}
                          </Label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {transactionTypes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {t("hrHub.transactionWorkflowSettings.noTransactionTypes") ||
                  "No transaction types found. Please configure transaction types in Lookup Values."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
