import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { getTodayString } from "@/utils/dateUtils";
import { BoardMembersDialog } from "@/components/workforce/BoardMembersDialog";

interface CompanyBoardsTabProps {
  companyId: string;
}

interface CompanyBoard {
  id: string;
  company_id: string;
  board_type: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  member_count?: number;
}

interface BoardMember {
  id: string;
  board_id: string;
  employee_id: string | null;
  external_member_name: string | null;
  external_member_email: string | null;
  board_role: string;
  appointment_type: string | null;
  is_independent: boolean;
  has_voting_rights: boolean;
  appointment_date: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
  is_renewable: boolean;
  is_active: boolean;
  notes: string | null;
  profiles?: { full_name: string; email: string } | null;
}

const boardTypeOptions = [
  { value: "board_of_directors", label: "Board of Directors" },
  { value: "advisory_board", label: "Advisory Board" },
  { value: "audit_committee", label: "Audit Committee" },
  { value: "compensation_committee", label: "Compensation Committee" },
  { value: "executive_committee", label: "Executive Committee" },
  { value: "nominating_committee", label: "Nominating Committee" },
  { value: "risk_committee", label: "Risk Committee" },
];

const emptyForm = {
  board_type: "board_of_directors",
  name: "",
  description: "",
  start_date: getTodayString(),
  end_date: "",
  is_active: true,
};

export function CompanyBoardsTab({ companyId }: CompanyBoardsTabProps) {
  const [boards, setBoards] = useState<CompanyBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<CompanyBoard | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const { logAction } = useAuditLog();

  // Board Members state
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);
  const [boardMembers, setBoardMembers] = useState<Record<string, BoardMember[]>>({});
  const [membersLoading, setMembersLoading] = useState<string | null>(null);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);
  const [memberBoardId, setMemberBoardId] = useState<string | null>(null);

  useEffect(() => {
    fetchBoards();
  }, [companyId]);

  const fetchBoards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("company_boards")
      .select("*")
      .eq("company_id", companyId)
      .order("name");

    if (error) {
      toast.error("Failed to fetch boards");
      console.error(error);
    } else {
      // Fetch member counts
      const boardsWithCounts = await Promise.all(
        (data || []).map(async (board) => {
          const { count } = await supabase
            .from("company_board_members")
            .select("id", { count: "exact", head: true })
            .eq("board_id", board.id)
            .eq("is_active", true);
          return { ...board, member_count: count || 0 };
        })
      );
      setBoards(boardsWithCounts);
    }
    setLoading(false);
  };

  const fetchBoardMembers = async (boardId: string) => {
    setMembersLoading(boardId);
    const { data, error } = await supabase
      .from("company_board_members")
      .select("*, profiles(full_name, email)")
      .eq("board_id", boardId)
      .order("board_role");

    if (error) {
      toast.error("Failed to fetch board members");
      console.error(error);
    } else {
      setBoardMembers((prev) => ({ ...prev, [boardId]: data || [] }));
    }
    setMembersLoading(null);
  };

  const toggleBoardExpand = (boardId: string) => {
    if (expandedBoard === boardId) {
      setExpandedBoard(null);
    } else {
      setExpandedBoard(boardId);
      if (!boardMembers[boardId]) {
        fetchBoardMembers(boardId);
      }
    }
  };

  const handleCreate = () => {
    setSelectedBoard(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (board: CompanyBoard) => {
    setSelectedBoard(board);
    setFormData({
      board_type: board.board_type,
      name: board.name,
      description: board.description || "",
      start_date: board.start_date,
      end_date: board.end_date || "",
      is_active: board.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (board: CompanyBoard) => {
    setSelectedBoard(board);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Please fill in the board name");
      return;
    }

    const payload = {
      company_id: companyId,
      board_type: formData.board_type,
      name: formData.name,
      description: formData.description || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
    };

    if (selectedBoard) {
      const { error } = await supabase
        .from("company_boards")
        .update(payload)
        .eq("id", selectedBoard.id);

      if (error) {
        toast.error("Failed to update board");
        console.error(error);
      } else {
        toast.success("Board updated successfully");
        logAction({ action: "UPDATE", entityType: "company_boards", entityId: selectedBoard.id, entityName: formData.name });
        fetchBoards();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("company_boards").insert(payload);

      if (error) {
        toast.error("Failed to create board");
        console.error(error);
      } else {
        toast.success("Board created successfully");
        logAction({ action: "CREATE", entityType: "company_boards", entityName: formData.name });
        fetchBoards();
        setIsDialogOpen(false);
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedBoard) return;

    const { error } = await supabase
      .from("company_boards")
      .delete()
      .eq("id", selectedBoard.id);

    if (error) {
      toast.error("Failed to delete board");
      console.error(error);
    } else {
      toast.success("Board deleted successfully");
      logAction({ action: "DELETE", entityType: "company_boards", entityId: selectedBoard.id, entityName: selectedBoard.name });
      fetchBoards();
      setIsDeleteDialogOpen(false);
    }
  };

  // Member handlers
  const handleAddMember = (boardId: string) => {
    setMemberBoardId(boardId);
    setSelectedMember(null);
    setIsMemberDialogOpen(true);
  };

  const handleEditMember = (member: BoardMember) => {
    setMemberBoardId(member.board_id);
    setSelectedMember(member);
    setIsMemberDialogOpen(true);
  };

  const handleMemberSaved = () => {
    if (memberBoardId) {
      fetchBoardMembers(memberBoardId);
      fetchBoards();
    }
    setIsMemberDialogOpen(false);
  };

  const handleDeleteMember = async (member: BoardMember) => {
    const { error } = await supabase
      .from("company_board_members")
      .delete()
      .eq("id", member.id);

    if (error) {
      toast.error("Failed to delete member");
      console.error(error);
    } else {
      toast.success("Member removed successfully");
      fetchBoardMembers(member.board_id);
      fetchBoards();
    }
  };

  const getBoardTypeLabel = (value: string) => {
    return boardTypeOptions.find((o) => o.value === value)?.label || value;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      chairperson: "Chairperson",
      vice_chairperson: "Vice Chairperson",
      director: "Director",
      secretary: "Secretary",
      member: "Member",
      observer: "Observer",
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Company Boards</h3>
          <p className="text-sm text-muted-foreground">
            Manage board of directors, advisory boards, and sub-committees
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Board
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Board Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No boards found. Click "Add Board" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                boards.map((board) => (
                  <>
                    <TableRow key={board.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={() => toggleBoardExpand(board.id)}>
                        {expandedBoard === board.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium" onClick={() => toggleBoardExpand(board.id)}>
                        {board.name}
                      </TableCell>
                      <TableCell onClick={() => toggleBoardExpand(board.id)}>
                        {getBoardTypeLabel(board.board_type)}
                      </TableCell>
                      <TableCell onClick={() => toggleBoardExpand(board.id)}>
                        <Badge variant="secondary">{board.member_count || 0}</Badge>
                      </TableCell>
                      <TableCell onClick={() => toggleBoardExpand(board.id)}>
                        {board.start_date}
                      </TableCell>
                      <TableCell onClick={() => toggleBoardExpand(board.id)}>
                        <Badge variant={board.is_active ? "default" : "secondary"}>
                          {board.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(board)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(board)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Members Row */}
                    {expandedBoard === board.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Board Members</h4>
                              <Button size="sm" onClick={() => handleAddMember(board.id)}>
                                <Plus className="mr-2 h-3 w-3" />
                                Add Member
                              </Button>
                            </div>

                            {membersLoading === board.id ? (
                              <p className="text-sm text-muted-foreground">Loading members...</p>
                            ) : (boardMembers[board.id] || []).length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No members added yet.
                              </p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Independent</TableHead>
                                    <TableHead>Voting Rights</TableHead>
                                    <TableHead>Term End</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(boardMembers[board.id] || []).map((member) => (
                                    <TableRow key={member.id}>
                                      <TableCell className="font-medium">
                                        {member.profiles?.full_name || member.external_member_name}
                                        {!member.employee_id && (
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            External
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell>{getRoleLabel(member.board_role)}</TableCell>
                                      <TableCell className="capitalize">
                                        {member.appointment_type?.replace("_", " ") || "-"}
                                      </TableCell>
                                      <TableCell>
                                        {member.is_independent ? (
                                          <Badge variant="default">Yes</Badge>
                                        ) : (
                                          <Badge variant="secondary">No</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {member.has_voting_rights ? "Yes" : "No"}
                                      </TableCell>
                                      <TableCell>{member.term_end_date || "-"}</TableCell>
                                      <TableCell>
                                        <Badge variant={member.is_active ? "default" : "secondary"}>
                                          {member.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleEditMember(member)}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteMember(member)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Board Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedBoard ? "Edit Board" : "Create Board"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Board Type *</Label>
              <Select
                value={formData.board_type}
                onValueChange={(v) => setFormData({ ...formData, board_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {boardTypeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Board Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Board of Directors"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {selectedBoard ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBoard?.name}"? This will also remove all
              associated board members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Board Member Dialog */}
      <BoardMembersDialog
        open={isMemberDialogOpen}
        onOpenChange={setIsMemberDialogOpen}
        boardId={memberBoardId}
        member={selectedMember}
        onSaved={handleMemberSaved}
      />
    </div>
  );
}
