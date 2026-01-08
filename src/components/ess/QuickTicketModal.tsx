import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, CheckCircle2, Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface QuickTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TicketCategory {
  id: string;
  name: string;
  code: string;
  default_assignee_id: string | null;
  default_priority_id: string | null;
}

interface TicketPriority {
  id: string;
  name: string;
  code: string;
  color: string;
}

export function QuickTicketModal({ open, onOpenChange }: QuickTicketModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (open) {
      fetchOptions();
      setIsSuccess(false);
    }
  }, [open]);

  const fetchOptions = async () => {
    const [categoriesRes, prioritiesRes] = await Promise.all([
      supabase
        .from("ticket_categories")
        .select("id, name, code, default_assignee_id, default_priority_id")
        .eq("is_active", true)
        .eq("visible_to_employees", true)  // Only show employee-visible categories
        .order("display_order"),
      supabase
        .from("ticket_priorities")
        .select("id, name, code, color")
        .eq("is_active", true)
        .order("display_order"),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (prioritiesRes.data) {
      setPriorities(prioritiesRes.data);
      const medium = prioritiesRes.data.find((p) => p.code === "medium");
      if (medium) setPriorityId(medium.id);
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    const category = categories.find((c) => c.id === newCategoryId);
    if (category?.default_priority_id) {
      setPriorityId(category.default_priority_id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024); // 10MB limit
    if (validFiles.length !== files.length) {
      toast.error("Some files exceeded 10MB limit");
    }
    setAttachments((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (ticketId: string) => {
    const uploadedFiles = [];
    for (const file of attachments) {
      const filePath = `${user?.id}/${ticketId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("ticket-attachments")
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("ticket-attachments")
        .getPublicUrl(filePath);

      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        path: filePath,
      });
    }
    return uploadedFiles;
  };

  const resetForm = () => {
    setSubject("");
    setDescription("");
    setCategoryId("");
    setAttachments([]);
    const medium = priorities.find((p) => p.code === "medium");
    setPriorityId(medium?.id || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in subject and description");
      return;
    }

    setIsLoading(true);
    try {
      // Get auto-assignee based on category
      let autoAssigneeId: string | null = null;
      if (categoryId) {
        const category = categories.find((c) => c.id === categoryId);
        autoAssigneeId = category?.default_assignee_id || null;
      }

      const { data, error } = await supabase
        .from("tickets")
        .insert({
          subject: subject.trim(),
          description: description.trim(),
          category_id: categoryId || null,
          priority_id: priorityId || null,
          requester_id: user?.id,
          assignee_id: autoAssigneeId,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Upload attachments if any
      if (attachments.length > 0) {
        const uploadedAttachments = await uploadAttachments(data.id);
        await supabase
          .from("tickets")
          .update({ attachments: uploadedAttachments } as any)
          .eq("id", data.id);
      }

      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });

      // Auto-close after showing success
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
        setIsSuccess(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Ticket Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                Our HR team will respond shortly.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Support Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue or question and our HR team will assist you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief summary of your request"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityId} onValueChange={setPriorityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        {priority.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about your request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Add Files
              </Button>
              <span className="text-xs text-muted-foreground">Max 10MB per file</span>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm"
                  >
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
