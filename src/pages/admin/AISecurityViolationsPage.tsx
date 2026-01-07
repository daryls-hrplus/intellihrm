import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Shield,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";

interface Violation {
  id: string;
  user_id: string;
  company_id: string | null;
  violation_type: string;
  severity: string;
  user_query: string;
  attempted_resource: string | null;
  user_role: string | null;
  blocked_reason: string | null;
  ai_response: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  is_false_positive: boolean;
  user_email?: string;
  user_name?: string;
  company_name?: string;
}

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
};

const violationTypeLabels: Record<string, string> = {
  unauthorized_data_access: "Unauthorized Data Access",
  role_escalation: "Role Escalation Attempt",
  pii_query: "PII Query Attempt",
  restricted_module: "Restricted Module Access",
  budget_exceeded: "Budget Limit Exceeded",
  disabled_user: "Disabled User Attempt",
};

export default function AISecurityViolationsPage() {
  usePageAudit('ai_security', 'Admin');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [reviewedFilter, setReviewedFilter] = useState<string>("all");
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ai_security_violations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user details
      const userIds = [...new Set((data || []).map((v) => v.user_id))];
      const companyIds = [...new Set((data || []).map((v) => v.company_id).filter(Boolean))];

      const [profilesRes, companiesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").in("id", userIds),
        companyIds.length > 0
          ? supabase.from("companies").select("id, name").in("id", companyIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries(
        (profilesRes.data || []).map((p) => [
          p.id,
          { name: p.full_name || "", email: p.email },
        ])
      );
      const companyMap = Object.fromEntries(
        (companiesRes.data || []).map((c) => [c.id, c.name])
      );

      const violationsWithDetails = (data || []).map((v) => ({
        ...v,
        user_name: profileMap[v.user_id]?.name || "Unknown",
        user_email: profileMap[v.user_id]?.email || "",
        company_name: v.company_id ? companyMap[v.company_id] : null,
      }));

      setViolations(violationsWithDetails);
    } catch (error) {
      console.error("Error fetching violations:", error);
      toast({
        title: "Error",
        description: "Failed to load security violations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (isFalsePositive: boolean) => {
    if (!selectedViolation) return;
    setIsReviewing(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("ai_security_violations")
        .update({
          reviewed_at: new Date().toISOString(),
          reviewed_by: userData.user?.id,
          review_notes: reviewNotes,
          is_false_positive: isFalsePositive,
        })
        .eq("id", selectedViolation.id);

      if (error) throw error;

      toast({
        title: "Review Saved",
        description: `Violation marked as ${isFalsePositive ? "false positive" : "confirmed"}.`,
      });

      setSelectedViolation(null);
      setReviewNotes("");
      fetchViolations();
    } catch (error) {
      console.error("Error reviewing violation:", error);
      toast({
        title: "Error",
        description: "Failed to save review.",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      searchQuery === "" ||
      v.user_query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.user_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === "all" || v.severity === severityFilter;
    const matchesType = typeFilter === "all" || v.violation_type === typeFilter;
    const matchesReviewed =
      reviewedFilter === "all" ||
      (reviewedFilter === "reviewed" && v.reviewed_at) ||
      (reviewedFilter === "pending" && !v.reviewed_at);

    return matchesSearch && matchesSeverity && matchesType && matchesReviewed;
  });

  const stats = {
    total: violations.length,
    pending: violations.filter((v) => !v.reviewed_at).length,
    critical: violations.filter((v) => v.severity === "critical").length,
    thisWeek: violations.filter((v) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(v.created_at) > weekAgo;
    }).length,
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "AI Security Violations" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Security Violations</h1>
            <p className="text-muted-foreground">
              Monitor and review attempted unauthorized AI access
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Violations</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.critical}</p>
                <p className="text-sm text-muted-foreground">Critical Severity</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by query or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-foreground"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-foreground"
          >
            <option value="all">All Types</option>
            <option value="unauthorized_data_access">Unauthorized Data Access</option>
            <option value="role_escalation">Role Escalation</option>
            <option value="pii_query">PII Query</option>
            <option value="restricted_module">Restricted Module</option>
          </select>
          <select
            value={reviewedFilter}
            onChange={(e) => setReviewedFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        {/* Violations List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredViolations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-foreground">No Violations Found</p>
            <p className="text-muted-foreground">No security violations match your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredViolations.map((violation) => (
              <div
                key={violation.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedViolation(violation)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          severityColors[violation.severity] || severityColors.medium
                        }`}
                      >
                        {violation.severity.toUpperCase()}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {violationTypeLabels[violation.violation_type] || violation.violation_type}
                      </span>
                      {violation.reviewed_at ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Reviewed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                      {violation.is_false_positive && (
                        <span className="text-xs text-muted-foreground">(False Positive)</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-foreground line-clamp-2">
                      "{violation.user_query}"
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {violation.user_name || violation.user_email}
                      </span>
                      {violation.company_name && (
                        <span>{violation.company_name}</span>
                      )}
                      <span>{format(new Date(violation.created_at), "MMM d, yyyy h:mm a")}</span>
                    </div>
                  </div>
                  <button className="rounded-lg p-2 hover:bg-muted">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedViolation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-semibold text-foreground">Violation Details</h2>
                <button
                  onClick={() => {
                    setSelectedViolation(null);
                    setReviewNotes("");
                  }}
                  className="rounded-lg p-2 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-medium ${
                      severityColors[selectedViolation.severity]
                    }`}
                  >
                    {selectedViolation.severity.toUpperCase()}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    {violationTypeLabels[selectedViolation.violation_type] || selectedViolation.violation_type}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">User</label>
                    <p className="text-sm text-foreground">{selectedViolation.user_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedViolation.user_email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Role</label>
                    <p className="text-sm text-foreground">{selectedViolation.user_role || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Company</label>
                    <p className="text-sm text-foreground">{selectedViolation.company_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Timestamp</label>
                    <p className="text-sm text-foreground">
                      {format(new Date(selectedViolation.created_at), "PPpp")}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">User Query</label>
                  <div className="mt-1 rounded-lg bg-muted p-3">
                    <p className="text-sm text-foreground">{selectedViolation.user_query}</p>
                  </div>
                </div>

                {selectedViolation.attempted_resource && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Attempted Resource
                    </label>
                    <p className="text-sm text-foreground">{selectedViolation.attempted_resource}</p>
                  </div>
                )}

                {selectedViolation.blocked_reason && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Block Reason</label>
                    <p className="text-sm text-foreground">{selectedViolation.blocked_reason}</p>
                  </div>
                )}

                {selectedViolation.ai_response && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">AI Response</label>
                    <div className="mt-1 rounded-lg bg-muted p-3">
                      <p className="text-sm text-foreground">{selectedViolation.ai_response}</p>
                    </div>
                  </div>
                )}

                {selectedViolation.reviewed_at ? (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <p className="text-sm font-medium text-green-600">
                      Reviewed on {format(new Date(selectedViolation.reviewed_at), "PPpp")}
                    </p>
                    {selectedViolation.is_false_positive && (
                      <p className="text-sm text-muted-foreground">Marked as false positive</p>
                    )}
                    {selectedViolation.review_notes && (
                      <p className="mt-2 text-sm text-foreground">{selectedViolation.review_notes}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-border pt-4">
                    <label className="text-sm font-medium text-foreground">Review Notes</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about this violation..."
                      rows={3}
                      className="w-full rounded-lg border border-input bg-background p-3 text-foreground"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleReview(true)}
                        disabled={isReviewing}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                      >
                        {isReviewing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Mark as False Positive
                      </button>
                      <button
                        onClick={() => handleReview(false)}
                        disabled={isReviewing}
                        className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                      >
                        {isReviewing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirm Violation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
