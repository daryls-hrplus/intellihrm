import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Monitor, 
  BookOpen, 
  Code, 
  Keyboard, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  FileText,
  ArrowRight,
  Copy,
  Check,
  HelpCircle,
  Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function WorkspaceNavigationStandardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const codeSnippets = {
    useTabState: `// Pattern for migrating to persistent tab-scoped state
const [tabState, setTabState] = useTabState({
  defaultState: { searchTerm: "", filter: "active" },
  syncToUrl: ["filter"], // Enables bookmarkable filtered views
});`,
    navigateToRecord: `// Opening a record in a new tab (with duplicate prevention)
const { navigateToRecord } = useWorkspaceNavigation();

navigateToRecord({
  route: \`/workforce/employees/\${employeeId}\`,
  title: employee.fullName,
  contextType: "employee",
  contextId: employeeId,
});`,
    navigateToList: `// Returning to a list view (focuses existing tab)
const { navigateToList } = useWorkspaceNavigation();

navigateToList({
  route: "/workforce/employees",
  title: "Employees",
});`,
  };

  const keyboardShortcuts = [
    { keys: "Ctrl + Tab", description: "Switch to next tab" },
    { keys: "Ctrl + Shift + Tab", description: "Switch to previous tab" },
    { keys: "Ctrl + W", description: "Close current tab (with unsaved changes warning)" },
    { keys: "Ctrl + 1-9", description: "Jump to specific tab by position" },
  ];

  const tabStates = [
    { state: "Created", description: "Tab instantiated, component mounting" },
    { state: "Active", description: "Currently visible, receiving user input" },
    { state: "Inactive", description: "In background, state preserved in memory" },
    { state: "Closing", description: "User initiated close, pending confirmation if dirty" },
    { state: "Closed", description: "Removed from workspace, state cleared" },
  ];

  const persistedState = [
    "Search terms and filters",
    "Expanded/collapsed sections",
    "Page numbers and scroll positions",
    "Sort configurations",
    "Selected view modes",
  ];

  const nonPersistedState = [
    "Open dialogs and modals",
    "Temporary form data (before save)",
    "Hover states and tooltips",
    "Clipboard contents",
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Platform Standards", href: "/enablement/standards" },
            { label: "Workspace Navigation" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Monitor className="h-8 w-8 text-primary" />
              Workspace Tab Navigation
            </h1>
            <p className="text-muted-foreground mt-1">
              Enterprise multi-tab navigation system for HRplus modules
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">v2.7.0</Badge>
            <Badge className="bg-green-500/10 text-green-600">Published</Badge>
          </div>
        </div>

        {/* Quick Overview */}
        <Alert className="bg-primary/5 border-primary/20">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Enterprise-Grade Navigation</AlertTitle>
          <AlertDescription>
            This system enables users to work with multiple records simultaneously—comparing employees, 
            reviewing appraisals side-by-side—without losing context. Based on Workday and SAP SuccessFactors patterns.
          </AlertDescription>
        </Alert>

        {/* Main Content Tabs */}
        <Tabs defaultValue="user-guide" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="user-guide" className="gap-2">
              <BookOpen className="h-4 w-4" />
              User Guide
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <Code className="h-4 w-4" />
              Developer Guide
            </TabsTrigger>
            <TabsTrigger value="specification" className="gap-2">
              <FileText className="h-4 w-4" />
              Specification
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* User Guide Tab */}
          <TabsContent value="user-guide" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Core Behavior */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Core Navigation Behavior</CardTitle>
                  <CardDescription>How workspace tabs work for end users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Open records in new tabs</p>
                        <p className="text-sm text-muted-foreground">
                          Clicking any record (employee, appraisal, etc.) opens it in a new tab
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Preserved state</p>
                        <p className="text-sm text-muted-foreground">
                          Filters, search terms, and scroll positions persist when switching tabs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Unsaved changes protection</p>
                        <p className="text-sm text-muted-foreground">
                          A dot indicator and close confirmation protect unsaved work
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Keyboard Shortcuts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Keyboard Shortcuts
                  </CardTitle>
                  <CardDescription>Power user navigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                        <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* State Persistence */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Gets Saved?</CardTitle>
                <CardDescription>
                  Understanding what persists across tab switches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-green-600 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4" />
                      Persisted State
                    </h4>
                    <ul className="space-y-2">
                      {persistedState.map((item, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-600 flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4" />
                      Not Persisted
                    </h4>
                    <ul className="space-y-2">
                      {nonPersistedState.map((item, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Recovery */}
            <Alert>
              <Layers className="h-4 w-4" />
              <AlertTitle>Session Recovery</AlertTitle>
              <AlertDescription>
                If your session times out or the browser refreshes, your open tabs will be restored automatically. 
                However, unsaved form data may be lost—save your work frequently.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Developer Guide Tab */}
          <TabsContent value="developer" className="space-y-6">
            <Alert className="bg-blue-500/5 border-blue-500/20">
              <Code className="h-4 w-4 text-blue-500" />
              <AlertTitle>Migration Guide</AlertTitle>
              <AlertDescription>
                Follow these patterns when migrating existing pages to the workspace tab system.
              </AlertDescription>
            </Alert>

            {/* Code Snippets */}
            <div className="space-y-4">
              {Object.entries(codeSnippets).map(([key, code]) => (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-mono">{key}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code, key)}
                        className="gap-2"
                      >
                        {copiedSnippet === key ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{code}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Key Hooks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Hooks & Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-mono text-sm text-primary">useWorkspaceNavigation()</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Primary navigation hook. Provides <code>navigateToRecord</code> and <code>navigateToList</code> methods.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-mono text-sm text-primary">useTabState(options)</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Persists component state within the tab context. Survives tab switching.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-mono text-sm text-primary">useTabUrlSync(keys)</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Syncs specified state keys with URL parameters for deep-linking.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-mono text-sm text-primary">TabContext</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      React context managing tab lifecycle, state persistence, and sessionStorage sync.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Implementation Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <p className="text-muted-foreground">src/contexts/TabContext.tsx</p>
                  <p className="text-muted-foreground">src/hooks/useTabState.ts</p>
                  <p className="text-muted-foreground">src/hooks/useWorkspaceNavigation.ts</p>
                  <p className="text-muted-foreground">src/components/layout/WorkspaceTabBar.tsx</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specification Tab */}
          <TabsContent value="specification" className="space-y-6">
            {/* Tab States */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tab Lifecycle States</CardTitle>
                <CardDescription>
                  The five states a tab can exist in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tabStates.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Badge variant="outline" className="font-mono w-24 justify-center">
                        {item.state}
                      </Badge>
                      <span className="text-sm">{item.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Design Decisions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Design Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                  <p className="font-medium">Dashboard is permanent</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The Dashboard tab cannot be closed. It serves as the home base for navigation.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-500/5 rounded-r-lg">
                  <p className="font-medium">Duplicate prevention</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Opening the same record twice focuses the existing tab rather than creating a duplicate.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-500/5 rounded-r-lg">
                  <p className="font-medium">Role-switch validation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When a user's role or company context changes, unauthorized tabs are automatically closed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Related Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-between" asChild>
                  <a href="/docs/architecture/ADR-001-WORKSPACE-TAB-NAVIGATION.md" target="_blank">
                    ADR-001: Workspace Tab Navigation
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-between" asChild>
                  <a href="/docs/patterns/TAB-LIFECYCLE-SPECIFICATION.md" target="_blank">
                    Tab Lifecycle Specification
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-between" asChild>
                  <a href="/docs/guides/TAB-STATE-MIGRATION-GUIDE.md" target="_blank">
                    Migration Guide (Developer)
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            {[
              {
                q: "Why can't I close the Dashboard tab?",
                a: "The Dashboard serves as your navigation home base. Keeping it always open ensures you can quickly return to the main menu and prevents accidental loss of your primary workspace.",
              },
              {
                q: "What happens if I change my role or company context?",
                a: "Tabs that reference data you no longer have access to will be automatically closed with a notification. This ensures security compliance.",
              },
              {
                q: "Can I reorder tabs?",
                a: "Tab reordering is not currently supported. Tabs appear in the order they were opened.",
              },
              {
                q: "Will having many tabs affect performance?",
                a: "Inactive tabs are stored in memory but their components are unmounted. Performance impact is minimal, but we recommend keeping under 15 tabs open for optimal experience.",
              },
              {
                q: "How do I compare two records side-by-side?",
                a: "Open both records in separate tabs, then use your browser's split-screen feature or work in a larger monitor to switch quickly between tabs.",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
