import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Qualification {
  id: string;
  record_type: string;
  status: string;
  verification_status: string;
  expiry_date?: string;
}

interface QualificationAnalyticsProps {
  qualifications: Qualification[];
  companyId?: string;
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function QualificationAnalytics({ qualifications }: QualificationAnalyticsProps) {
  // Calculate record type distribution
  const recordTypeData = [
    { name: "Academic", value: qualifications.filter((q) => q.record_type === "academic").length },
    { name: "Certification", value: qualifications.filter((q) => q.record_type === "certification").length },
    { name: "License", value: qualifications.filter((q) => q.record_type === "license").length },
    { name: "Membership", value: qualifications.filter((q) => q.record_type === "membership").length },
    { name: "Participation", value: qualifications.filter((q) => q.record_type === "participation").length },
  ].filter((d) => d.value > 0);

  // Calculate verification status distribution
  const verificationData = [
    { name: "Verified", value: qualifications.filter((q) => q.verification_status === "verified").length, fill: "#22c55e" },
    { name: "Pending", value: qualifications.filter((q) => q.verification_status === "pending").length, fill: "#f59e0b" },
    { name: "Rejected", value: qualifications.filter((q) => q.verification_status === "rejected").length, fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Calculate expiry timeline (for certifications/licenses)
  const now = new Date();
  const expiryData = [
    { 
      name: "Expired", 
      value: qualifications.filter((q) => q.expiry_date && new Date(q.expiry_date) < now).length,
      fill: "#ef4444"
    },
    { 
      name: "Expiring (30d)", 
      value: qualifications.filter((q) => {
        if (!q.expiry_date) return false;
        const expiry = new Date(q.expiry_date);
        return expiry >= now && expiry <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }).length,
      fill: "#f59e0b"
    },
    { 
      name: "Expiring (90d)", 
      value: qualifications.filter((q) => {
        if (!q.expiry_date) return false;
        const expiry = new Date(q.expiry_date);
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return expiry > thirtyDays && expiry <= new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      }).length,
      fill: "#3b82f6"
    },
    { 
      name: "Valid", 
      value: qualifications.filter((q) => {
        if (!q.expiry_date) return false;
        return new Date(q.expiry_date) > new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      }).length,
      fill: "#22c55e"
    },
    { 
      name: "No Expiry", 
      value: qualifications.filter((q) => !q.expiry_date).length,
      fill: "#6b7280"
    },
  ].filter((d) => d.value > 0);

  // Status breakdown
  const statusData = [
    { name: "Completed", value: qualifications.filter((q) => q.status === "completed").length },
    { name: "Active", value: qualifications.filter((q) => q.status === "active").length },
    { name: "Ongoing", value: qualifications.filter((q) => q.status === "ongoing").length },
    { name: "In Progress", value: qualifications.filter((q) => q.status === "in_progress").length },
    { name: "Expired", value: qualifications.filter((q) => q.status === "expired").length },
    { name: "Other", value: qualifications.filter((q) => !["completed", "active", "ongoing", "in_progress", "expired"].includes(q.status)).length },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Qualification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Qualification Types</CardTitle>
          <CardDescription>Distribution by record type</CardDescription>
        </CardHeader>
        <CardContent>
          {recordTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={recordTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {recordTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Current verification breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {verificationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={verificationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Count">
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiry Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Certification Expiry Timeline</CardTitle>
          <CardDescription>Expiry status for time-bound qualifications</CardDescription>
        </CardHeader>
        <CardContent>
          {expiryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expiryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" name="Count">
                  {expiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Qualification completion status</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
