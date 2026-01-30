import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Key, MoreHorizontal, Plus, Copy, Eye, Trash2, Ban } from "lucide-react";
import { useAPIKeys, useRevokeAPIKey, useDeleteAPIKey, type APIKey } from "@/hooks/useAPIKeys";
import { APIKeyCreateDialog } from "./APIKeyCreateDialog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface APIKeyListProps {
  companyId: string;
}

export function APIKeyList({ companyId }: APIKeyListProps) {
  const { data: apiKeys, isLoading } = useAPIKeys(companyId);
  const revokeKey = useRevokeAPIKey();
  const deleteKey = useDeleteAPIKey();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  const handleCopyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    toast.success("Key prefix copied to clipboard");
  };

  const handleRevoke = async () => {
    if (selectedKey) {
      await revokeKey.mutateAsync(selectedKey.id);
      setRevokeDialogOpen(false);
      setSelectedKey(null);
    }
  };

  const handleDelete = async () => {
    if (selectedKey) {
      await deleteKey.mutateAsync(selectedKey.id);
      setDeleteDialogOpen(false);
      setSelectedKey(null);
    }
  };

  const getScopeColor = (scope: string) => {
    if (scope.includes("payroll")) return "destructive";
    if (scope.includes("leave")) return "secondary";
    if (scope.includes("employees")) return "default";
    return "outline";
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for external integrations
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading API keys...</div>
          ) : !apiKeys?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys created yet. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {key.key_prefix}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyPrefix(key.key_prefix)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 2).map((scope) => (
                          <Badge key={scope} variant={getScopeColor(scope)} className="text-xs">
                            {scope.replace(":read", "")}
                          </Badge>
                        ))}
                        {key.scopes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.scopes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.is_active ? (
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {key.last_used_at
                        ? formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Usage
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {key.is_active && (
                            <DropdownMenuItem
                              className="text-amber-600"
                              onClick={() => {
                                setSelectedKey(key);
                                setRevokeDialogOpen(true);
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Revoke Key
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedKey(key);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Key
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <APIKeyCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        companyId={companyId}
      />

      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke "{selectedKey?.name}"? This will immediately
              invalidate the key and any applications using it will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{selectedKey?.name}"? This action
              cannot be undone and all usage logs will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
