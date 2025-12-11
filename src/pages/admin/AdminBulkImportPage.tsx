import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download,
  AlertTriangle,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";

interface ParsedUser {
  email: string;
  full_name?: string;
  role?: string;
  company_id?: string;
  isValid: boolean;
  error?: string;
}

interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
}

export default function AdminBulkImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [defaultPassword, setDefaultPassword] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row");
      return;
    }

    // Parse header
    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
    const emailIndex = header.indexOf("email");
    const nameIndex = header.findIndex(h => h === "full_name" || h === "name" || h === "fullname");
    const roleIndex = header.indexOf("role");
    const companyIndex = header.findIndex(h => h === "company_id" || h === "company");

    if (emailIndex === -1) {
      toast.error("CSV must have an 'email' column");
      return;
    }

    const users: ParsedUser[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles basic cases)
      const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
      
      const email = values[emailIndex]?.toLowerCase().trim();
      const full_name = nameIndex !== -1 ? values[nameIndex]?.trim() : undefined;
      const role = roleIndex !== -1 ? values[roleIndex]?.toLowerCase().trim() : undefined;
      const company_id = companyIndex !== -1 ? values[companyIndex]?.trim() : undefined;

      // Validate
      let isValid = true;
      let error: string | undefined;

      if (!email || !email.includes("@")) {
        isValid = false;
        error = "Invalid email address";
      } else if (role && !["admin", "hr_manager", "employee"].includes(role)) {
        isValid = false;
        error = "Invalid role (must be admin, hr_manager, or employee)";
      }

      users.push({ email, full_name, role, company_id, isValid, error });
    }

    setParsedUsers(users);
    
    const validCount = users.filter(u => u.isValid).length;
    toast.success(`Parsed ${users.length} users (${validCount} valid)`);
  };

  const handleImport = async () => {
    if (!defaultPassword || defaultPassword.length < 6) {
      toast.error("Default password must be at least 6 characters");
      return;
    }

    const validUsers = parsedUsers.filter(u => u.isValid);
    if (validUsers.length === 0) {
      toast.error("No valid users to import");
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("bulk-import-users", {
        body: {
          users: validUsers.map(u => ({
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            company_id: u.company_id,
          })),
          defaultPassword,
        },
      });

      if (error) throw error;

      setImportResults(data.results);
      toast.success(`Import complete: ${data.summary.successful} successful, ${data.summary.failed} failed`);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import users");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "email,full_name,role,company_id\njohn.doe@example.com,John Doe,employee,\njane.smith@example.com,Jane Smith,hr_manager,";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "user-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setParsedUsers([]);
    setImportResults(null);
    setFileName(null);
    setDefaultPassword("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validCount = parsedUsers.filter(u => u.isValid).length;
  const invalidCount = parsedUsers.filter(u => !u.isValid).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Bulk Import Users" },
          ]}
        />

        <div className="flex items-center gap-3">
          <NavLink
            to="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </NavLink>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Bulk Import Users
            </h1>
            <p className="text-muted-foreground">
              Import multiple users from a CSV file
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Upload a CSV file with user data. Required column: email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  {fileName ? (
                    <p className="text-sm font-medium">{fileName}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Click to upload CSV</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or drag and drop
                      </p>
                    </>
                  )}
                </label>
              </div>

              {parsedUsers.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">{parsedUsers.length} total</Badge>
                  <Badge className="bg-success text-success-foreground">{validCount} valid</Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive">{invalidCount} invalid</Badge>
                  )}
                </div>
              )}

              {parsedUsers.length > 0 && !importResults && (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <Label htmlFor="password">Default Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={defaultPassword}
                      onChange={(e) => setDefaultPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      All imported users will receive this password
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleImport}
                      disabled={isImporting || validCount === 0 || !defaultPassword}
                      className="flex-1"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import {validCount} Users
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetImport}>
                      Reset
                    </Button>
                  </div>
                </div>
              )}

              {importResults && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Import Complete</AlertTitle>
                  <AlertDescription>
                    {importResults.filter(r => r.success).length} users imported successfully.
                    <Button variant="link" className="p-0 h-auto ml-2" onClick={resetImport}>
                      Start new import
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* CSV Format Info */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format</CardTitle>
              <CardDescription>
                Expected columns and format for the import file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4 font-mono text-sm">
                  <p className="text-muted-foreground mb-2"># Header row:</p>
                  <p>email,full_name,role,company_id</p>
                  <p className="text-muted-foreground mt-3 mb-2"># Data rows:</p>
                  <p>john@example.com,John Doe,employee,</p>
                  <p>jane@example.com,Jane Smith,hr_manager,</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Columns:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><Badge variant="outline" className="mr-2">email</Badge> Required - User's email address</li>
                    <li><Badge variant="outline" className="mr-2">full_name</Badge> Optional - User's display name</li>
                    <li><Badge variant="outline" className="mr-2">role</Badge> Optional - admin, hr_manager, or employee</li>
                    <li><Badge variant="outline" className="mr-2">company_id</Badge> Optional - Company UUID</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview/Results Table */}
        {(parsedUsers.length > 0 || importResults) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {importResults ? "Import Results" : "Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResults ? (
                      importResults.map((result, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{result.email}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            {result.success ? (
                              <Badge className="bg-success text-success-foreground">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Imported
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                {result.error}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      parsedUsers.map((user, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.full_name || "-"}</TableCell>
                          <TableCell>
                            {user.role ? (
                              <Badge variant="outline" className="capitalize">
                                {user.role.replace("_", " ")}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">employee</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isValid ? (
                              <Badge className="bg-success/20 text-success border-success/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Valid
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {user.error}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
