import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  MousePointer,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Search,
  Info,
  Zap,
  MessageSquare,
  CheckSquare,
  Target,
  Bell,
} from "lucide-react";
import { useEnablementDAPGuides } from "@/hooks/useEnablementData";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";
import type { EnablementDAPGuide } from "@/types/enablement";

const GUIDE_TYPES = [
  { value: "walkthrough", label: "Walkthrough", icon: Zap },
  { value: "tooltip", label: "Tooltip", icon: MessageSquare },
  { value: "checklist", label: "Checklist", icon: CheckSquare },
  { value: "hotspot", label: "Hotspot", icon: Target },
  { value: "announcement", label: "Announcement", icon: Bell },
];

export function DAPGuidesManager() {
  const { t } = useTranslation();
  const { guides, isLoading, addGuide, deleteGuide } = useEnablementDAPGuides();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    feature_code: "",
    module_code: "",
    userguiding_guide_id: "",
    guide_type: "walkthrough" as EnablementDAPGuide["guide_type"],
    guide_name: "",
    trigger_url: "",
  });

  // Get all features for dropdown
  const featureOptions = FEATURE_REGISTRY.flatMap((module) =>
    module.groups.flatMap((group) =>
      group.features.map((feature) => ({
        value: `${module.code}:${feature.code}`,
        label: `${module.name} - ${feature.name}`,
        module_code: module.code,
        feature_code: feature.code,
      }))
    )
  );

  const handleFeatureSelect = (value: string) => {
    const [module_code, feature_code] = value.split(":");
    setFormData({ ...formData, module_code, feature_code });
  };

  const handleAdd = async () => {
    if (!formData.feature_code || !formData.userguiding_guide_id) return;

    await addGuide(formData);

    setFormData({
      feature_code: "",
      module_code: "",
      userguiding_guide_id: "",
      guide_type: "walkthrough",
      guide_name: "",
      trigger_url: "",
    });
    setIsAddOpen(false);
  };

  const filteredGuides = guides.filter(
    (guide) =>
      guide.guide_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.feature_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.userguiding_guide_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGuideTypeIcon = (type: string | null) => {
    const guideType = GUIDE_TYPES.find((t) => t.value === type);
    return guideType?.icon || MousePointer;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              UserGuiding DAP Integration
            </CardTitle>
            <CardDescription>
              Link UserGuiding guides and walkthroughs to features
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Link Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Link UserGuiding Guide</DialogTitle>
                <DialogDescription>
                  Connect a UserGuiding guide to an Intelli HRM feature
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Get the Guide ID from your UserGuiding dashboard under Content → Guides
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="feature">Feature *</Label>
                  <Select
                    value={
                      formData.module_code && formData.feature_code
                        ? `${formData.module_code}:${formData.feature_code}`
                        : ""
                    }
                    onValueChange={handleFeatureSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feature" />
                    </SelectTrigger>
                    <SelectContent>
                      {featureOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guide_id">Guide ID *</Label>
                    <Input
                      id="guide_id"
                      placeholder="e.g., 12345"
                      value={formData.userguiding_guide_id}
                      onChange={(e) =>
                        setFormData({ ...formData, userguiding_guide_id: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Guide Type</Label>
                    <Select
                      value={formData.guide_type || "walkthrough"}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          guide_type: v as EnablementDAPGuide["guide_type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GUIDE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Guide Name</Label>
                  <Input
                    id="name"
                    placeholder="Display name for this guide"
                    value={formData.guide_name}
                    onChange={(e) =>
                      setFormData({ ...formData, guide_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger_url">Trigger URL (Optional)</Label>
                  <Input
                    id="trigger_url"
                    placeholder="/workforce/employees"
                    value={formData.trigger_url}
                    onChange={(e) =>
                      setFormData({ ...formData, trigger_url: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!formData.feature_code || !formData.userguiding_guide_id}
                >
                  Link Guide
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guide</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Guide ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No DAP guides linked yet. Link your first UserGuiding guide to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredGuides.map((guide) => {
                const TypeIcon = getGuideTypeIcon(guide.guide_type);
                return (
                  <TableRow key={guide.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {guide.guide_name || `Guide ${guide.userguiding_guide_id}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{guide.feature_code.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{guide.module_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {guide.guide_type || "walkthrough"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {guide.userguiding_guide_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={guide.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {guide.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Zap className="h-4 w-4 mr-2" />
                            Trigger Guide
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in UserGuiding
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteGuide(guide.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Unlink
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
