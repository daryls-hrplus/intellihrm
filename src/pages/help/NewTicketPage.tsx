import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Ticket, Send, Loader2, Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface TicketCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  default_assignee_id: string | null;
  default_priority_id: string | null;
}

interface TicketPriority {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface Agent {
  id: string;
  full_name: string | null;
  email: string;
  open_tickets: number;
}

export default function NewTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSource = searchParams.get('from');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const [categoriesRes, prioritiesRes, profilesRes, ticketCountsRes] = await Promise.all([
      supabase.from("ticket_categories").select("id, name, code, description, default_assignee_id, default_priority_id").eq("is_active", true),
      supabase.from("ticket_priorities").select("*").eq("is_active", true).order("display_order"),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("tickets").select("assignee_id").in("status", ["open", "in_progress", "pending"]),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (prioritiesRes.data) {
      setPriorities(prioritiesRes.data);
      const medium = prioritiesRes.data.find((p) => p.code === "medium");
      if (medium) setPriorityId(medium.id);
    }

    // Calculate agent workload
    if (profilesRes.data) {
      const workloadMap = new Map<string, number>();
      ticketCountsRes.data?.forEach((t) => {
        if (t.assignee_id) {
          workloadMap.set(t.assignee_id, (workloadMap.get(t.assignee_id) || 0) + 1);
        }
      });
      setAgents(profilesRes.data.map((p) => ({
        ...p,
        open_tickets: workloadMap.get(p.id) || 0,
      })));
    }
  };

  // Auto-assign based on category default or load balancing
  const getAutoAssignee = (selectedCategoryId: string): string | null => {
    if (!selectedCategoryId) return null;

    const category = categories.find((c) => c.id === selectedCategoryId);
    
    // If category has default assignee, use it
    if (category?.default_assignee_id) {
      return category.default_assignee_id;
    }

    // Otherwise, use load balancing - assign to agent with fewest tickets
    if (agents.length > 0) {
      const sortedAgents = [...agents].sort((a, b) => a.open_tickets - b.open_tickets);
      return sortedAgents[0]?.id || null;
    }

    return null;
  };

  // Auto-set priority when category changes
  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    const category = categories.find((c) => c.id === newCategoryId);
    if (category?.default_priority_id) {
      setPriorityId(category.default_priority_id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit
    if (validFiles.length !== files.length) {
      toast.error("Some files exceeded 10MB limit");
    }
    setAttachments(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const autoAssigneeId = getAutoAssignee(categoryId);

      // Create ticket first
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

      toast.success(
        autoAssigneeId 
          ? "Ticket created and auto-assigned" 
          : "Ticket created successfully"
      );
      navigate(`/help/tickets/${data.id}`);
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumbs
          items={fromSource === 'mss' ? [
            { label: "Manager Self-Service", href: "/mss" },
            { label: "Submit Ticket" },
          ] : fromSource === 'ess' ? [
            { label: "Employee Self-Service", href: "/ess" },
            { label: "Submit Ticket" },
          ] : [
            { label: "Help Center", href: "/help" },
            { label: "Tickets", href: "/help/tickets" },
            { label: "New Ticket" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Ticket className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Submit a Ticket</h1>
            <p className="text-muted-foreground">
              Describe your issue and we'll get back to you
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
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
                      {priorities.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            {p.name}
                          </div>
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
                  placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or relevant context."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach Files
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Max 10MB per file
                  </p>
                  
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/help/tickets")}
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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
