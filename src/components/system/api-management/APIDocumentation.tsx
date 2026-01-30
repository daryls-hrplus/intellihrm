import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Book, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "https://hmdewkkytchwrenqagkw.supabase.co/functions/v1/external-api";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  title: string;
  description: string;
  scope: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/auth/token",
    title: "Generate Access Token",
    description: "Exchange your API key for a short-lived JWT access token (15 minutes)",
    scope: "None (uses API key)",
    params: [
      { name: "api_key", type: "string", required: true, description: "Your API key (igk_...)" },
    ],
    response: `{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900,
  "scopes": ["employees:read", "leave:read"]
}`,
  },
  {
    method: "GET",
    path: "/employees",
    title: "List Employees",
    description: "Retrieve a paginated list of employees with optional filtering",
    scope: "employees:read",
    params: [
      { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
      { name: "limit", type: "integer", required: false, description: "Items per page, max 100 (default: 50)" },
      { name: "status", type: "string", required: false, description: "Filter by status: active, inactive, all" },
      { name: "department_id", type: "uuid", required: false, description: "Filter by department" },
      { name: "updated_since", type: "ISO date", required: false, description: "Only records updated after this date" },
    ],
    response: `{
  "data": [
    {
      "id": "uuid",
      "employee_id": "EMP001",
      "full_name": "John Doe",
      "email": "john@company.com",
      "department_id": "uuid",
      "department_name": "Engineering",
      "employment_status": "active",
      "start_date": "2023-01-15",
      "updated_at": "2024-01-10T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}`,
  },
  {
    method: "GET",
    path: "/employees/:id",
    title: "Get Employee Details",
    description: "Retrieve full details for a specific employee",
    scope: "employees:read",
    response: `{
  "id": "uuid",
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "first_name": "John",
  "first_last_name": "Doe",
  "email": "john@company.com",
  "department": { "id": "uuid", "name": "Engineering" },
  "position": { "id": "uuid", "title": "Senior Developer" },
  "employment_status": "active",
  "start_date": "2023-01-15",
  "manager_id": "uuid",
  "created_at": "2023-01-10T08:00:00Z",
  "updated_at": "2024-01-10T10:30:00Z"
}`,
  },
  {
    method: "GET",
    path: "/leave/requests",
    title: "List Leave Requests",
    description: "Retrieve leave requests with optional filtering",
    scope: "leave:read",
    params: [
      { name: "employee_id", type: "uuid", required: false, description: "Filter by employee" },
      { name: "status", type: "string", required: false, description: "Filter: pending, approved, rejected, cancelled" },
      { name: "start_date", type: "date", required: false, description: "Requests starting from this date" },
      { name: "end_date", type: "date", required: false, description: "Requests ending before this date" },
      { name: "page", type: "integer", required: false, description: "Page number" },
      { name: "limit", type: "integer", required: false, description: "Items per page" },
    ],
    response: `{
  "data": [
    {
      "id": "uuid",
      "request_number": "LR-2024-001",
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "leave_type": { "id": "uuid", "code": "ANN", "name": "Annual Leave" },
      "start_date": "2024-02-01",
      "end_date": "2024-02-05",
      "duration": 5,
      "status": "approved",
      "submitted_at": "2024-01-15T09:00:00Z"
    }
  ],
  "pagination": { ... }
}`,
  },
  {
    method: "GET",
    path: "/leave/balances",
    title: "Get Leave Balances",
    description: "Retrieve employee leave balances",
    scope: "leave:read",
    params: [
      { name: "employee_id", type: "uuid", required: false, description: "Filter by employee" },
      { name: "year", type: "integer", required: false, description: "Leave year (default: current year)" },
    ],
    response: `{
  "data": [
    {
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "leave_type": { "id": "uuid", "code": "ANN", "name": "Annual Leave" },
      "year": 2024,
      "opening_balance": 15,
      "accrued": 1.25,
      "used": 5,
      "carried_forward": 3,
      "current_balance": 14.25
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/payroll/records",
    title: "Get Payroll Records",
    description: "Retrieve payroll records with period filtering",
    scope: "payroll:read",
    params: [
      { name: "employee_id", type: "uuid", required: false, description: "Filter by employee" },
      { name: "period_start", type: "date", required: false, description: "Period starting from" },
      { name: "period_end", type: "date", required: false, description: "Period ending before" },
      { name: "status", type: "string", required: false, description: "Filter: draft, calculated, approved, paid" },
      { name: "page", type: "integer", required: false, description: "Page number" },
      { name: "limit", type: "integer", required: false, description: "Items per page" },
    ],
    response: `{
  "data": [
    {
      "id": "uuid",
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "payroll_run": {
        "id": "uuid",
        "run_number": "PR-2024-01",
        "status": "paid",
        "pay_date": "2024-01-31"
      },
      "pay_period": { "start": "2024-01-01", "end": "2024-01-31" },
      "gross_pay": 5000.00,
      "total_deductions": 1200.00,
      "net_pay": 3800.00,
      "currency": "USD",
      "hours": { "regular": 160, "overtime": 8 }
    }
  ],
  "pagination": { ... }
}`,
  },
  {
    method: "GET",
    path: "/competencies",
    title: "Get Competencies & Certificates",
    description: "Retrieve employee skills, competencies, and certifications",
    scope: "competencies:read",
    params: [
      { name: "employee_id", type: "uuid", required: false, description: "Filter by employee" },
      { name: "type", type: "string", required: false, description: "Filter: skill, competency, certificate" },
    ],
    response: `{
  "data": [
    {
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "competencies": [
        {
          "id": "uuid",
          "name": "Leadership",
          "category": "behavioral",
          "assessed_level": 4,
          "required_level": 3,
          "assessed_date": "2024-01-15"
        }
      ],
      "certificates": [
        {
          "id": "uuid",
          "name": "PMP Certification",
          "issuing_organization": "PMI",
          "issue_date": "2023-06-01",
          "expiry_date": "2026-06-01",
          "status": "active"
        }
      ]
    }
  ]
}`,
  },
];

export function APIDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getMethodColor = (method: string) => {
    return method === "GET" ? "bg-blue-600" : "bg-green-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          API Documentation
        </CardTitle>
        <CardDescription>
          Complete reference for all available API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="errors">Error Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Endpoint List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Available Endpoints</h4>
                {ENDPOINTS.map((endpoint) => (
                  <Button
                    key={endpoint.path}
                    variant={selectedEndpoint.path === endpoint.path ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 h-auto py-2"
                    onClick={() => setSelectedEndpoint(endpoint)}
                  >
                    <Badge className={`${getMethodColor(endpoint.method)} text-xs`}>
                      {endpoint.method}
                    </Badge>
                    <span className="text-xs font-mono truncate">{endpoint.path}</span>
                  </Button>
                ))}
              </div>

              {/* Endpoint Details */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getMethodColor(selectedEndpoint.method)}>
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="text-sm">{selectedEndpoint.path}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(`${API_BASE_URL}${selectedEndpoint.path}`)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium">{selectedEndpoint.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedEndpoint.description}</p>
                </div>

                <div>
                  <Badge variant="outline">Scope: {selectedEndpoint.scope}</Badge>
                </div>

                {selectedEndpoint.params && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Parameters</h5>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Required</th>
                            <th className="text-left p-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEndpoint.params.map((param) => (
                            <tr key={param.name} className="border-t">
                              <td className="p-2 font-mono text-xs">{param.name}</td>
                              <td className="p-2 text-muted-foreground">{param.type}</td>
                              <td className="p-2">
                                <Badge variant={param.required ? "default" : "outline"} className="text-xs">
                                  {param.required ? "Yes" : "No"}
                                </Badge>
                              </td>
                              <td className="p-2 text-muted-foreground">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">Response</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedEndpoint.response)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-[300px] w-full rounded-lg border bg-muted/50">
                    <pre className="p-4 text-xs">
                      <code>{selectedEndpoint.response}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Authentication Flow</h4>
              <ol>
                <li>Create an API key from the API Keys tab</li>
                <li>Exchange your API key for an access token using <code>POST /auth/token</code></li>
                <li>Include the token in the <code>Authorization</code> header for all subsequent requests</li>
              </ol>

              <h4>Example Request</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`# Step 1: Get access token
curl -X POST ${API_BASE_URL}/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"api_key": "igk_your_api_key_here"}'

# Step 2: Use token for API requests
curl ${API_BASE_URL}/employees \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
              </pre>

              <h4>Token Expiry</h4>
              <p>
                Access tokens expire after <strong>15 minutes</strong>. When your token expires,
                request a new one using your API key.
              </p>

              <h4>Rate Limiting</h4>
              <p>
                API requests are rate limited per API key. Check the following response headers:
              </p>
              <ul>
                <li><code>X-RateLimit-Limit</code>: Maximum requests per minute</li>
                <li><code>X-RateLimit-Remaining</code>: Requests remaining in current window</li>
                <li><code>X-RateLimit-Reset</code>: Seconds until rate limit resets</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Code</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-mono">INVALID_API_KEY</td>
                    <td className="p-3"><Badge variant="destructive">401</Badge></td>
                    <td className="p-3 text-muted-foreground">API key not found, inactive, or expired</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-mono">INVALID_TOKEN</td>
                    <td className="p-3"><Badge variant="destructive">401</Badge></td>
                    <td className="p-3 text-muted-foreground">Access token is invalid or expired</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-mono">INSUFFICIENT_SCOPE</td>
                    <td className="p-3"><Badge variant="secondary">403</Badge></td>
                    <td className="p-3 text-muted-foreground">API key lacks required scope for this endpoint</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-mono">RATE_LIMIT_EXCEEDED</td>
                    <td className="p-3"><Badge variant="secondary">429</Badge></td>
                    <td className="p-3 text-muted-foreground">Too many requests, wait for rate limit reset</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-mono">RESOURCE_NOT_FOUND</td>
                    <td className="p-3"><Badge variant="outline">404</Badge></td>
                    <td className="p-3 text-muted-foreground">Requested resource does not exist</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-mono">VALIDATION_ERROR</td>
                    <td className="p-3"><Badge variant="outline">400</Badge></td>
                    <td className="p-3 text-muted-foreground">Invalid request parameters</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-mono">INTERNAL_ERROR</td>
                    <td className="p-3"><Badge variant="destructive">500</Badge></td>
                    <td className="p-3 text-muted-foreground">Server error, contact support if persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Error Response Format</h5>
              <pre className="text-xs">
{`{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The access token has expired",
    "status": 401
  }
}`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
