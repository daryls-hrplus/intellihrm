import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { ArrowLeft, Settings, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EnablementSettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink to="/enablement">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
              <Settings className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Enablement Settings</h1>
              <p className="text-muted-foreground">Configure enablement module preferences</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Generation</CardTitle>
              <CardDescription>Configure AI-powered content generation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-generate drafts</Label>
                  <p className="text-sm text-muted-foreground">Automatically create draft content for new features</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include screenshots</Label>
                  <p className="text-sm text-muted-foreground">Add screenshot placeholders in generated docs</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Default template</Label>
                <Select defaultValue="training">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Training Guide</SelectItem>
                    <SelectItem value="tutorial">Feature Tutorial</SelectItem>
                    <SelectItem value="sop">Standard Operating Procedure</SelectItem>
                    <SelectItem value="kb">Knowledge Base Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>Configure content workflow and approval settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require review</Label>
                  <p className="text-sm text-muted-foreground">All content must be reviewed before publishing</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email updates on content status changes</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Default priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>Configure external tool integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>UserGuiding API Key</Label>
                <Input type="password" placeholder="Enter API key..." />
              </div>
              <div className="space-y-2">
                <Label>Trupeer Workspace ID</Label>
                <Input placeholder="Enter workspace ID..." />
              </div>
              <div className="space-y-2">
                <Label>Articulate Rise URL</Label>
                <Input placeholder="https://rise.articulate.com/..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SCORM Settings</CardTitle>
              <CardDescription>Configure SCORM package generation defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default SCORM Version</Label>
                <Select defaultValue="1.2">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.2">SCORM 1.2</SelectItem>
                    <SelectItem value="2004">SCORM 2004</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include quiz</Label>
                  <p className="text-sm text-muted-foreground">Add assessment quiz to packages</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Passing score (%)</Label>
                <Input type="number" defaultValue="80" min="0" max="100" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
