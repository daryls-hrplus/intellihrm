import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Rocket, 
  Clock, 
  Target, 
  Brain, 
  FileText, 
  CheckCircle2,
  ArrowRight,
  GitBranch,
  Calendar,
  Lock,
  Unlock,
  BookOpen,
  ClipboardCheck,
  FolderTree,
} from "lucide-react";

export default function ReleaseCommandCenterGuidePage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-8 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Release Command Center", href: "/enablement/release-center" },
            { label: "Guide" },
          ]}
        />

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Release Command Center Guide</h1>
          </div>
          <p className="text-muted-foreground">
            Comprehensive guide to managing version lifecycle, milestones, and AI-driven release management.
          </p>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>What is the Release Command Center?</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              The Release Command Center is a unified hub for managing the entire documentation 
              release lifecycle. It replaces fragmented release management components with a 
              single, intelligent interface that provides:
            </p>
            <ul>
              <li><strong>Version Lifecycle Management:</strong> Track your release status from Pre-Release through GA and into Maintenance</li>
              <li><strong>Milestone Tracking:</strong> Define and monitor key milestones leading to your release</li>
              <li><strong>AI Readiness Assessment:</strong> Get intelligent scoring across all content types</li>
              <li><strong>Aggregated Release Notes:</strong> Automatically compile changelogs from all published manuals</li>
              <li><strong>Version Freeze Control:</strong> Lock versions during pre-release to ensure consistency</li>
            </ul>
          </CardContent>
        </Card>

        {/* Version Lifecycle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Version Lifecycle States
            </CardTitle>
            <CardDescription>
              Understanding the four stages of your release lifecycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">Pre-Release</Badge>
                <div>
                  <h4 className="font-medium">Pre-Release</h4>
                  <p className="text-sm text-muted-foreground">
                    Initial development phase. Version freeze is recommended to keep all documentation 
                    at the baseline version (v1.0.x). Only patch increments are allowed.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">Preview</Badge>
                <div>
                  <h4 className="font-medium">Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    Beta testing phase where select users have access. Documentation is feature-complete 
                    but may still receive updates.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <Badge className="bg-green-500/10 text-green-700 border-green-500/30">GA Released</Badge>
                <div>
                  <h4 className="font-medium">GA Released</h4>
                  <p className="text-sm text-muted-foreground">
                    General Availability. Documentation is officially released to all users. 
                    Minor and major version increments are now allowed.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <Badge className="bg-slate-500/10 text-slate-700 border-slate-500/30">Maintenance</Badge>
                <div>
                  <h4 className="font-medium">Maintenance</h4>
                  <p className="text-sm text-muted-foreground">
                    Post-release maintenance phase. Focus is on bug fixes, corrections, and 
                    keeping documentation up-to-date with product changes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version Freeze */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Version Freeze
            </CardTitle>
            <CardDescription>
              How version freeze controls documentation versioning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-700">Freeze Enabled</span>
                </div>
                <ul className="text-sm text-amber-600 space-y-1">
                  <li>• All updates remain at v1.0.x</li>
                  <li>• Only Initial and Patch versions available</li>
                  <li>• Major/Minor increments hidden</li>
                  <li>• Recommended during Pre-Release</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700">Freeze Disabled</span>
                </div>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Full semantic versioning enabled</li>
                  <li>• Major: Breaking changes (2.0.0)</li>
                  <li>• Minor: New features (1.1.0)</li>
                  <li>• Patch: Bug fixes (1.0.1)</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Publishing with Version Freeze</h4>
              <p className="text-sm text-muted-foreground">
                When version freeze is enabled and you're in Pre-Release, the Publish Wizard will 
                only show "Initial Release" (for first-time publishes) and "Patch Update" options. 
                This ensures all documentation stays aligned at the baseline version until GA release.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Milestone Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Milestones help track progress toward your release. Common milestones include:
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Alpha</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Beta</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">RC1</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">RC2</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-green-500/10 text-green-700 border-green-500/30">GA</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">AI Milestone Planning</h4>
              <p className="text-sm text-muted-foreground">
                The AI Release Manager can suggest milestone dates based on your target GA date. 
                Use the "Plan Milestones" action in the AI Assistant tab to automatically 
                distribute milestones across your timeline.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Readiness Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The AI Readiness Assessment evaluates all content types to provide an overall 
              release readiness score.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border text-center">
                <BookOpen className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                <div className="font-medium">Manuals</div>
                <div className="text-xs text-muted-foreground">Administrator guides</div>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <Rocket className="h-5 w-5 mx-auto mb-2 text-emerald-600" />
                <div className="font-medium">Quick Starts</div>
                <div className="text-xs text-muted-foreground">Module setup guides</div>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <ClipboardCheck className="h-5 w-5 mx-auto mb-2 text-amber-600" />
                <div className="font-medium">Checklists</div>
                <div className="text-xs text-muted-foreground">Implementation guides</div>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <FolderTree className="h-5 w-5 mx-auto mb-2 text-violet-600" />
                <div className="font-medium">Module Docs</div>
                <div className="text-xs text-muted-foreground">Feature documentation</div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Scoring Weights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>50%</strong> - Administrator Manuals (primary documentation)</li>
                <li>• <strong>30%</strong> - Quick Start Guides (implementation readiness)</li>
                <li>• <strong>20%</strong> - Checklists & Module Documentation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Release Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aggregated Release Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Release notes are automatically compiled from changelog entries added during 
              manual publishing. When you publish a manual and add changelog items, they 
              become part of the unified release notes.
            </p>
            
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Best Practice</h4>
                <p className="text-sm text-muted-foreground">
                  Always add meaningful changelog entries when publishing. These entries help 
                  users understand what's new and provide a clear audit trail of documentation 
                  changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Getting Started</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Set your target GA date</li>
                  <li>Enable version freeze (pre-release)</li>
                  <li>Add milestones for your timeline</li>
                  <li>Run AI readiness assessment</li>
                  <li>Address blockers and warnings</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Release Workflow</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Complete documentation content</li>
                  <li>Publish manuals to Help Center</li>
                  <li>Review aggregated release notes</li>
                  <li>Complete milestones as achieved</li>
                  <li>Disable version freeze at GA</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
