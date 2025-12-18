import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Code,
  Database,
  FileText,
  Globe,
  Info,
  Layers,
  Package,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface ChangeRecord {
  entityType: string;
  entityName: string;
  changeType: string;
  changedAt: string;
  details: string;
  category: "ui" | "backend" | "database" | "edge_function";
}

interface ChangeReportData {
  success: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    ui: number;
    backend: number;
    database: number;
    edge_function: number;
    total: number;
  };
  changesByDate: Record<string, ChangeRecord[]>;
  changes: ChangeRecord[];
}

interface ChangeReportRendererProps {
  data: ChangeReportData;
}

const CATEGORY_CONFIG = {
  ui: {
    icon: Globe,
    label: "UI Changes",
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    description: "Features and modules changes",
  },
  backend: {
    icon: Server,
    label: "Backend",
    color: "bg-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    description: "Workflows, roles, and configuration",
  },
  database: {
    icon: Database,
    label: "Database",
    color: "bg-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    description: "Migrations and RLS policies",
  },
  edge_function: {
    icon: Code,
    label: "Edge Functions",
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    description: "Serverless function changes",
  },
};

const ENTITY_ICONS: Record<string, React.ElementType> = {
  Feature: Layers,
  Module: Package,
  "Database Migration": Database,
  "Workflow Template": Sparkles,
  "RLS Policy": Shield,
  Role: Shield,
  "Lookup Value": FileText,
};

export function ChangeReportRenderer({ data }: ChangeReportRendererProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  if (!data || !data.success) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load change report data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredChanges = activeCategory === "all" 
    ? data.changes 
    : data.changes.filter(c => c.category === activeCategory);

  const dateGroups = Object.entries(data.changesByDate).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
  );

  const hasNoChanges = data.changes.length === 0;

  return (
    <div className="space-y-6">
      {/* Context Info Banner */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">What does this report track?</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>UI:</strong> Application features and modules (from database registry)</li>
                <li><strong>Backend:</strong> Workflow templates, roles, and lookup values</li>
                <li><strong>Database:</strong> Migrations and RLS policy changes (from audit logs)</li>
                <li><strong>Edge Functions:</strong> Serverless function deployments</li>
              </ul>
              <p className="text-muted-foreground pt-2">
                <strong>Note:</strong> This tracks database record changes, not source code commits. 
                If you see no results, it means no database records were modified in the selected date range.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Range */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {format(parseISO(data.dateRange.start), "MMM d, yyyy")} — {format(parseISO(data.dateRange.end), "MMM d, yyyy")}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const count = data.summary[key as keyof typeof data.summary] || 0;
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? "all" : key)}
              className={`p-4 rounded-lg border transition-all ${
                activeCategory === key 
                  ? "ring-2 ring-primary border-primary" 
                  : "hover:border-primary/50"
              } ${config.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded ${config.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-sm">{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </button>
          );
        })}
        
        <button
          onClick={() => setActiveCategory("all")}
          className={`p-4 rounded-lg border transition-all ${
            activeCategory === "all" 
              ? "ring-2 ring-primary border-primary" 
              : "hover:border-primary/50"
          } bg-muted/50`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded bg-primary">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold">{data.summary.total}</p>
        </button>
      </div>

      {/* No Changes Message */}
      {hasNoChanges && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Changes Detected</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No database record changes were found in the selected date range. 
                This could mean no features, modules, workflows, or configurations were modified during this period.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg text-left text-sm">
                <p className="font-medium mb-2">Common reasons for no results:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>No application features or modules were added/updated</li>
                  <li>No workflow templates or roles were modified</li>
                  <li>No database migrations were run</li>
                  <li>The date range is too narrow (try expanding it)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline View */}
      {!hasNoChanges && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Timeline</CardTitle>
            <CardDescription>
              {filteredChanges.length} changes {activeCategory !== "all" ? `in ${CATEGORY_CONFIG[activeCategory as keyof typeof CATEGORY_CONFIG]?.label}` : "across all categories"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <Accordion type="multiple" className="space-y-2">
                {dateGroups.map(([date, changes]) => {
                  const filteredDateChanges = activeCategory === "all" 
                    ? changes 
                    : changes.filter(c => c.category === activeCategory);
                  
                  if (filteredDateChanges.length === 0) return null;

                  return (
                    <AccordionItem key={date} value={date} className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                          </span>
                          <Badge variant="secondary">{filteredDateChanges.length} changes</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-2">
                          {filteredDateChanges.map((change, idx) => {
                            const categoryConfig = CATEGORY_CONFIG[change.category];
                            const EntityIcon = ENTITY_ICONS[change.entityType] || FileText;
                            
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${categoryConfig?.bgColor || "bg-muted"}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-1.5 rounded ${categoryConfig?.color || "bg-muted"}`}>
                                    <EntityIcon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">{change.entityName}</span>
                                      <Badge 
                                        variant={change.changeType === "Created" ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        {change.changeType}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {change.entityType}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {change.details}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {format(parseISO(change.changedAt), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
