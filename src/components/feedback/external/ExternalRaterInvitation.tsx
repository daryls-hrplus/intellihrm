import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Mail, Building2, Users, ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ExternalRaterInvitationProps {
  cycleId: string;
  subjectEmployeeId: string;
  subjectEmployeeName: string;
  companyId: string;
  raterCategories: Array<{ id: string; name: string; is_external?: boolean }>;
  onInviteSent?: () => void;
}

const RELATIONSHIP_TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'partner', label: 'Partner' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'other', label: 'Other' },
];

export function ExternalRaterInvitation({
  cycleId,
  subjectEmployeeId,
  subjectEmployeeName,
  companyId,
  raterCategories,
  onInviteSent
}: ExternalRaterInvitationProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackUrl, setFeedbackUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    external_email: '',
    external_name: '',
    external_organization: '',
    external_relationship: '',
    rater_category_id: ''
  });

  const externalCategories = raterCategories.filter(c => c.is_external);

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('feedback-external-invite', {
        body: {
          action: 'send_invite',
          cycle_id: cycleId,
          subject_employee_id: subjectEmployeeId,
          company_id: companyId,
          ...formData
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setFeedbackUrl(data.feedback_url);
      toast.success(`Invitation sent to ${formData.external_name}`);
      queryClient.invalidateQueries({ queryKey: ['feedback-requests'] });
      onInviteSent?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send invitation');
    }
  });

  const handleSubmit = () => {
    if (!formData.external_email || !formData.external_name || !formData.rater_category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.external_email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    inviteMutation.mutate();
  };

  const handleCopyUrl = () => {
    if (feedbackUrl) {
      navigator.clipboard.writeText(feedbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFeedbackUrl(null);
    setFormData({
      external_email: '',
      external_name: '',
      external_organization: '',
      external_relationship: '',
      rater_category_id: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite External Rater
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Invite External Rater
          </DialogTitle>
          <CardDescription>
            Invite a customer, vendor, or partner to provide feedback for {subjectEmployeeName}
          </CardDescription>
        </DialogHeader>

        {feedbackUrl ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <Check className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="font-medium">Invitation Created!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share the link below with {formData.external_name}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Feedback Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={feedbackUrl} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link expires in 30 days
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Close</Button>
              <Button onClick={() => {
                setFeedbackUrl(null);
                setFormData({
                  external_email: '',
                  external_name: '',
                  external_organization: '',
                  external_relationship: '',
                  rater_category_id: ''
                });
              }}>
                Invite Another
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="John Smith"
                  value={formData.external_name}
                  onChange={(e) => setFormData(p => ({ ...p, external_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={formData.external_email}
                  onChange={(e) => setFormData(p => ({ ...p, external_email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization
              </Label>
              <Input
                placeholder="Acme Corp"
                value={formData.external_organization}
                onChange={(e) => setFormData(p => ({ ...p, external_organization: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relationship *</Label>
                <Select
                  value={formData.external_relationship}
                  onValueChange={(v) => setFormData(p => ({ ...p, external_relationship: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Category *
                </Label>
                <Select
                  value={formData.rater_category_id}
                  onValueChange={(v) => setFormData(p => ({ ...p, rater_category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {externalCategories.length > 0 ? (
                      externalCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      raterCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleSubmit}
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
