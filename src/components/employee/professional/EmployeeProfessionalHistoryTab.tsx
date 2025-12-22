import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Building2, Calendar } from "lucide-react";
import { getTodayString } from "@/utils/dateUtils";

interface EmployeeProfessionalHistoryTabProps {
  employeeId: string;
}

interface WorkHistoryFormData {
  company_name: string;
  job_title: string;
  department: string;
  industry: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  employment_type: string;
  reason_for_leaving: string;
  responsibilities: string;
  achievements: string;
  verified: boolean;
  verification_notes: string;
  notes: string;
}

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "temporary", label: "Temporary" },
];

export function EmployeeProfessionalHistoryTab({ employeeId }: EmployeeProfessionalHistoryTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkHistoryFormData>({
    company_name: "",
    job_title: "",
    department: "",
    industry: "",
    start_date: "",
    end_date: "",
    is_current: false,
    employment_type: "full_time",
    reason_for_leaving: "",
    responsibilities: "",
    achievements: "",
    verified: false,
    verification_notes: "",
    notes: "",
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      company_name: "",
      job_title: "",
      department: "",
      industry: "",
      start_date: "",
      end_date: "",
      is_current: false,
      employment_type: "full_time",
      reason_for_leaving: "",
      responsibilities: "",
      achievements: "",
      verified: false,
      verification_notes: "",
      notes: "",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional History
          </CardTitle>
          <CardDescription>
            Prior employment history and work experience
          </CardDescription>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Employment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            No work history on file. Add prior employment records and experience.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature requires database table setup. Please run the database migration.
          </p>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employment" : "Add Prior Employment"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Company Name *</Label>
              <Input 
                value={formData.company_name} 
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Job Title *</Label>
              <Input 
                value={formData.job_title} 
                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input 
                  value={formData.department} 
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Industry</Label>
                <Input 
                  value={formData.industry} 
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Employment Type</Label>
              <Select value={formData.employment_type} onValueChange={(v) => setFormData(prev => ({ ...prev, employment_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input 
                  type="date" 
                  value={formData.start_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={formData.end_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  disabled={formData.is_current}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_current" 
                checked={formData.is_current}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_current: checked === true,
                  end_date: checked === true ? "" : prev.end_date
                }))}
              />
              <Label htmlFor="is_current">Currently employed here</Label>
            </div>
            {!formData.is_current && (
              <div className="grid gap-2">
                <Label>Reason for Leaving</Label>
                <Input 
                  value={formData.reason_for_leaving} 
                  onChange={(e) => setFormData(prev => ({ ...prev, reason_for_leaving: e.target.value }))} 
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Key Responsibilities</Label>
              <Textarea 
                value={formData.responsibilities} 
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))} 
                rows={3}
                placeholder="Describe main duties and responsibilities..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Key Achievements</Label>
              <Textarea 
                value={formData.achievements} 
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))} 
                rows={2}
                placeholder="Notable accomplishments..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="verified" 
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verified: checked === true }))}
              />
              <Label htmlFor="verified">Employment Verified</Label>
            </div>
            {formData.verified && (
              <div className="grid gap-2">
                <Label>Verification Notes</Label>
                <Input 
                  value={formData.verification_notes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, verification_notes: e.target.value }))} 
                  placeholder="Who verified and when..."
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Additional Notes</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled>Save (Database Required)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
