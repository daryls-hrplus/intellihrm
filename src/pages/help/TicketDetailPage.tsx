import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Tag,
  Paperclip,
  Send,
  Download,
  FileText,
  Image,
  File,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { format, formatDistanceToNow, addHours, isPast } from "date-fns";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  pending: "bg-orange-500/10 text-orange-600 border-orange-200",
  resolved: "bg-green-500/10 text-green-600 border-green-200",
  closed: "bg-gray-500/10 text-gray-600 border-gray-200",
};

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return Image;
  if (["pdf", "doc", "docx", "txt"].includes(ext || "")) return FileText;
  return File;
};

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: ticket, isLoading: loadingTicket } = useQuery({
    queryKey: ["ticket-detail", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          requester:profiles!tickets_requester_id_fkey(id, full_name, email, avatar_url),
          assignee:profiles!tickets_assignee_id_fkey(id, full_name, email),
          category:ticket_categories(name, code),
          priority:ticket_priorities(name, code, color, response_time_hours, resolution_time_hours)
        `)
        .eq("id", ticketId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_comments")
        .select("*, author:profiles(id, full_name, email, avatar_url)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["ticket-history", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_history")
        .select("*, changed_by_user:profiles!ticket_history_changed_by_fkey(full_name)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, uploadedAttachments }: { content: string; uploadedAttachments: any[] }) => {
      const { error } = await supabase.from("ticket_comments").insert([{
        ticket_id: ticketId,
        author_id: user?.id,
        content,
        attachments: uploadedAttachments,
        is_internal: false,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
      setCommentText("");
      setAttachments([]);
      toast.success("Reply added");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit
    if (validFiles.length !== files.length) {
      toast.error("Some files exceeded 10MB limit");
    }
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async () => {
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

  const handleSubmitComment = async () => {
    if (!commentText.trim() && attachments.length === 0) return;
    
    setIsUploading(true);
    try {
      let uploadedAttachments: any[] = [];
      if (attachments.length > 0) {
        uploadedAttachments = await uploadAttachments();
      }
      await addCommentMutation.mutateAsync({ content: commentText, uploadedAttachments });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getSlaStatus = () => {
    if (!ticket?.priority) return null;
    
    const responseDeadline = addHours(new Date(ticket.created_at), ticket.priority.response_time_hours);
    const resolutionDeadline = addHours(new Date(ticket.created_at), ticket.priority.resolution_time_hours);
    
    const responseBreached = !ticket.first_response_at && isPast(responseDeadline);
    const resolutionBreached = !["resolved", "closed"].includes(ticket.status) && isPast(resolutionDeadline);
    
    return {
      response: ticket.first_response_at ? "met" : responseBreached ? "breached" : "pending",
      resolution: ["resolved", "closed"].includes(ticket.status) ? "met" : resolutionBreached ? "breached" : "pending",
      responseDeadline,
      resolutionDeadline,
    };
  };

  if (loadingTicket) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
          <Button onClick={() => navigate("/help/tickets")}>Back to Tickets</Button>
        </div>
      </AppLayout>
    );
  }

  const sla = getSlaStatus();
  const isOwner = ticket.requester?.id === user?.id;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/help/tickets")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="font-mono">{ticket.ticket_number}</span>
              <Badge variant="outline" className={statusColors[ticket.status]}>
                {ticket.status.replace("_", " ")}
              </Badge>
              {ticket.priority && (
                <Badge variant="outline" style={{ borderColor: ticket.priority.color, color: ticket.priority.color }}>
                  {ticket.priority.name}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Request */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.requester?.full_name || ticket.requester?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Conversation */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                Conversation
                <Badge variant="secondary">{comments.length}</Badge>
              </h3>

              {/* Timeline */}
              <div className="space-y-4">
                {/* History events */}
                {history.map((event: any) => (
                  <div key={event.id} className="flex gap-3 text-sm text-muted-foreground">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{event.changed_by_user?.full_name || "System"}</span>
                      {" changed "}
                      <span className="font-medium">{event.field_name}</span>
                      {event.old_value && <span> from "{event.old_value}"</span>}
                      {event.new_value && <span> to "{event.new_value}"</span>}
                      <span className="text-xs ml-2">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Comments */}
                {comments.map((comment: any) => (
                  <Card key={comment.id} className={comment.is_internal ? "border-yellow-200 bg-yellow-50/50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.author?.full_name || comment.author?.email}
                            </span>
                            {comment.is_internal && (
                              <Badge variant="outline" className="text-xs">Internal</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          
                          {/* Attachments */}
                          {comment.attachments && Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {comment.attachments.map((att: any, idx: number) => {
                                const FileIcon = getFileIcon(att.name);
                                return (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors text-sm"
                                  >
                                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="flex-1 truncate">{att.name}</span>
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {loadingComments && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {!["closed", "resolved"].includes(ticket.status) && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Textarea
                      placeholder="Write your reply..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                    />
                    
                    {/* Attachment Preview */}
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
                          >
                            <Paperclip className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button onClick={() => removeAttachment(idx)} className="hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          multiple
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attach
                        </Button>
                      </div>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={(!commentText.trim() && attachments.length === 0) || isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={statusColors[ticket.status]}>
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <span>{ticket.priority?.name || "Not set"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{ticket.category?.name || "Not set"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assignee</span>
                  <span>{ticket.assignee?.full_name || "Unassigned"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(ticket.created_at), "PP")}</span>
                </div>
                {ticket.resolved_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolved</span>
                      <span>{format(new Date(ticket.resolved_at), "PP")}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* SLA Card */}
            {sla && ticket.priority && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">SLA Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">First Response</span>
                    <div className="flex items-center gap-1">
                      {sla.response === "met" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : sla.response === "breached" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={sla.response === "breached" ? "text-red-600" : ""}>
                        {ticket.priority.response_time_hours}h
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Resolution</span>
                    <div className="flex items-center gap-1">
                      {sla.resolution === "met" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : sla.resolution === "breached" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={sla.resolution === "breached" ? "text-red-600" : ""}>
                        {ticket.priority.resolution_time_hours}h
                      </span>
                    </div>
                  </div>
                  {sla.response === "pending" && (
                    <p className="text-xs text-muted-foreground">
                      Response due: {format(sla.responseDeadline, "PPp")}
                    </p>
                  )}
                  {sla.resolution === "pending" && (
                    <p className="text-xs text-muted-foreground">
                      Resolution due: {format(sla.resolutionDeadline, "PPp")}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {ticket.tags && ticket.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {ticket.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
