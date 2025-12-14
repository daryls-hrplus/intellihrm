import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { Plus, ShieldCheck, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";

interface ComplianceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  deadline: string;
  status: "compliant" | "pending" | "overdue" | "in_progress";
  responsible: string;
  priority: string;
  progress: number;
}

const categories = [
  "Labor Law",
  "Safety Regulations",
  "Tax Compliance",
  "Data Protection",
  "Immigration",
  "Benefits",
  "Training",
  "Licensing",
];

// Mock data
const mockItems: ComplianceItem[] = [
  { id: "1", title: "Annual EEO-1 Report", category: "Labor Law", description: "Submit annual Equal Employment Opportunity report", deadline: "2025-03-31", status: "pending", responsible: "HR Manager", priority: "high", progress: 45 },
  { id: "2", title: "OSHA Safety Training", category: "Safety Regulations", description: "Complete mandatory safety training for all employees", deadline: "2025-01-15", status: "in_progress", responsible: "Safety Officer", priority: "urgent", progress: 75 },
  { id: "3", title: "Tax Form W-2 Distribution", category: "Tax Compliance", description: "Distribute W-2 forms to all employees", deadline: "2025-01-31", status: "pending", responsible: "Payroll", priority: "high", progress: 20 },
  { id: "4", title: "GDPR Data Audit", category: "Data Protection", description: "Complete annual data protection audit", deadline: "2024-12-31", status: "overdue", responsible: "IT Security", priority: "urgent", progress: 60 },
  { id: "5", title: "Professional License Renewals", category: "Licensing", description: "Renew professional licenses for certified employees", deadline: "2025-02-28", status: "pending", responsible: "HR Admin", priority: "medium", progress: 10 },
  { id: "6", title: "Benefits Enrollment Compliance", category: "Benefits", description: "Complete ACA reporting requirements", deadline: "2025-03-02", status: "compliant", responsible: "Benefits Admin", priority: "high", progress: 100 },
];

export default function ComplianceTrackerPage() {
  const [items, setItems] = useState<ComplianceItem[]>(mockItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    deadline: "",
    responsible: "",
    priority: "medium",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "in_progress": return "bg-blue-500";
      case "overdue": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "overdue": return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    return `${days} days remaining`;
  };

  const filteredItems = items.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "overdue") return item.status === "overdue";
    if (activeTab === "upcoming") return item.status === "pending" || item.status === "in_progress";
    if (activeTab === "compliant") return item.status === "compliant";
    return true;
  });

  const stats = {
    total: items.length,
    compliant: items.filter(i => i.status === "compliant").length,
    pending: items.filter(i => i.status === "pending" || i.status === "in_progress").length,
    overdue: items.filter(i => i.status === "overdue").length,
  };

  const overallCompliance = Math.round((stats.compliant / stats.total) * 100);

  const breadcrumbItems = [
    { label: "HR Hub", href: "/hr-hub" },
    { label: "Compliance Tracker" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Tracker</h1>
            <p className="text-muted-foreground">Monitor compliance deadlines and requirements</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>

        {/* Overall Compliance */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Overall Compliance Rate</h3>
                  <p className="text-sm text-muted-foreground">Based on {stats.total} tracked requirements</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{overallCompliance}%</p>
              </div>
            </div>
            <Progress value={overallCompliance} className="h-3" />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.compliant}</p>
                  <p className="text-sm text-muted-foreground">Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
                <TabsTrigger value="upcoming">In Progress ({stats.pending})</TabsTrigger>
                <TabsTrigger value="compliant">Compliant ({stats.compliant})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No compliance items found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge className={`${getStatusColor(item.status)} text-white`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              {item.status.replace("_", " ")}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Responsible: {item.responsible}</span>
                          <span>•</span>
                          <span className={item.status === "overdue" ? "text-red-500 font-medium" : ""}>
                            {getDaysRemaining(item.deadline)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm text-muted-foreground mb-1">Progress</p>
                        <p className="text-2xl font-bold">{item.progress}%</p>
                        <Progress value={item.progress} className="h-2 mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Compliance Requirement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Requirement title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deadline *</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Responsible</Label>
                  <Input
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Person/Team responsible"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the compliance requirement"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setDialogOpen(false)}>Add Requirement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
