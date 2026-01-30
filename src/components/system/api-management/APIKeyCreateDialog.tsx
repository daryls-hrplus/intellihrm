import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Key, AlertTriangle } from "lucide-react";
import { useCreateAPIKey } from "@/hooks/useAPIKeys";
import { toast } from "sonner";

interface APIKeyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

const AVAILABLE_SCOPES = [
  { id: "employees:read", label: "Employees", description: "Read employee data" },
  { id: "leave:read", label: "Leave", description: "Read leave requests and balances" },
  { id: "payroll:read", label: "Payroll", description: "Read payroll records" },
  { id: "competencies:read", label: "Competencies", description: "Read skills and certifications" },
];

export function APIKeyCreateDialog({ open, onOpenChange, companyId }: APIKeyCreateDialogProps) {
  const createKey = useCreateAPIKey();
  
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["employees:read"]);
  const [rateLimit, setRateLimit] = useState("60");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScopeChange = (scopeId: string, checked: boolean) => {
    if (checked) {
      setScopes([...scopes, scopeId]);
    } else {
      setScopes(scopes.filter((s) => s !== scopeId));
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }
    if (scopes.length === 0) {
      toast.error("Please select at least one scope");
      return;
    }

    const result = await createKey.mutateAsync({
      company_id: companyId,
      name: name.trim(),
      scopes,
      rate_limit_per_minute: parseInt(rateLimit, 10) || 60,
    });

    setCreatedKey(result.rawKey);
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setScopes(["employees:read"]);
    setRateLimit("60");
    setCreatedKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Your API key has been created. Copy it now - you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This is the only time you will see this API key. Make sure to copy and store it securely.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm break-all select-all">{createdKey}</code>
            </div>

            <Button onClick={handleCopy} className="w-full" variant={copied ? "secondary" : "default"}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy API Key"}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key for external integrations. Choose the scopes carefully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Intellico Integration"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name to identify this API key
            </p>
          </div>

          <div className="space-y-3">
            <Label>Scopes</Label>
            <div className="space-y-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <div key={scope.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={scope.id}
                    checked={scopes.includes(scope.id)}
                    onCheckedChange={(checked) => handleScopeChange(scope.id, checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={scope.id} className="cursor-pointer font-medium">
                      {scope.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{scope.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
            <Input
              id="rateLimit"
              type="number"
              min="1"
              max="1000"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum requests allowed per minute (default: 60)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createKey.isPending}>
            {createKey.isPending ? "Creating..." : "Create API Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
