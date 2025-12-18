import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { ArrowLeft, Package, FileText, Play, Download, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SCORMGeneratorPage() {
  const [packageName, setPackageName] = useState("");
  const [scormVersion, setScormVersion] = useState("1.2");

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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Package className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">SCORM-Lite Generator</h1>
              <p className="text-muted-foreground">Create lightweight SCORM packages for LMS deployment</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create Package</TabsTrigger>
            <TabsTrigger value="packages">My Packages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Package Details
                  </CardTitle>
                  <CardDescription>Configure your SCORM package settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageName">Package Name</Label>
                    <Input
                      id="packageName"
                      placeholder="e.g., Leave Request Training"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scormVersion">SCORM Version</Label>
                    <Select value={scormVersion} onValueChange={setScormVersion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.2">SCORM 1.2</SelectItem>
                        <SelectItem value="2004">SCORM 2004</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the training content..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Content Slides
                  </CardTitle>
                  <CardDescription>Add slides to your SCORM package</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Drop content here or click to upload</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Add Slide
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports: Images, HTML content, embedded videos
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Questions (Optional)</CardTitle>
                <CardDescription>Add assessment questions to track learner progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                  <Button variant="outline">
                    Add Quiz Question
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Preview</Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Generate SCORM Package
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>Generated Packages</CardTitle>
                <CardDescription>Your previously created SCORM packages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No packages generated yet. Create your first package above.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Default Settings
                </CardTitle>
                <CardDescription>Configure default settings for new packages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default SCORM Version</Label>
                  <Select defaultValue="1.2">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.2">SCORM 1.2</SelectItem>
                      <SelectItem value="2004">SCORM 2004</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Completion Criteria</Label>
                  <Select defaultValue="viewed">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewed">All Slides Viewed</SelectItem>
                      <SelectItem value="quiz">Quiz Passed</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
