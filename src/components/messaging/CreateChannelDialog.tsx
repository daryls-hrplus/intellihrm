import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface CreateChannelDialogProps {
  isOpen: boolean;
  type: "direct" | "group" | "channel";
  companyId: string | null;
  onClose: () => void;
  onCreateDirect: (userId: string) => Promise<void>;
  onCreateGroup: (name: string, memberIds: string[], description?: string) => Promise<void>;
  onCreateChannel: (name: string, description?: string) => Promise<void>;
}

export const CreateChannelDialog = ({
  isOpen,
  type,
  companyId,
  onClose,
  onCreateDirect,
  onCreateGroup,
  onCreateChannel,
}: CreateChannelDialogProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && companyId) {
      fetchUsers();
    }
  }, [isOpen, companyId]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setSearchQuery("");
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("company_id", companyId)
        .neq("id", user?.id)
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  const toggleUser = (userId: string) => {
    if (type === "direct") {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (type === "direct") {
        if (selectedUsers.length !== 1) return;
        await onCreateDirect(selectedUsers[0]);
      } else if (type === "group") {
        if (!name.trim() || selectedUsers.length === 0) return;
        await onCreateGroup(name.trim(), selectedUsers, description.trim() || undefined);
      } else {
        if (!name.trim()) return;
        await onCreateChannel(name.trim(), description.trim() || undefined);
      }

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "direct":
        return "New Direct Message";
      case "group":
        return "Create Group";
      case "channel":
        return "Create Channel";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "direct":
        return "Start a conversation with someone";
      case "group":
        return "Create a private group with selected members";
      case "channel":
        return "Create a public channel anyone can join";
    }
  };

  const canSubmit = () => {
    if (type === "direct") return selectedUsers.length === 1;
    if (type === "group") return name.trim() && selectedUsers.length > 0;
    return name.trim();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type !== "direct" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">
                  {type === "channel" ? "Channel" : "Group"} Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    type === "channel" ? "e.g., announcements" : "e.g., Project Team"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this conversation about?"
                  rows={2}
                />
              </div>
            </>
          )}

          {type !== "channel" && (
            <div className="space-y-2">
              <Label>
                {type === "direct" ? "Select a person" : "Add members"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people..."
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[200px] border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredUsers.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => toggleUser(profile.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {type === "group" && (
                          <Checkbox
                            checked={selectedUsers.includes(profile.id)}
                            onCheckedChange={() => toggleUser(profile.id)}
                          />
                        )}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {profile.full_name?.charAt(0) ||
                              profile.email?.charAt(0) ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm truncate">
                            {profile.full_name || profile.email}
                          </p>
                          {profile.full_name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {profile.email}
                            </p>
                          )}
                        </div>
                        {type === "direct" && selectedUsers.includes(profile.id) && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {type === "group" && selectedUsers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.length} member{selectedUsers.length !== 1 && "s"} selected
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit() || submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {type === "direct" ? "Start Chat" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
