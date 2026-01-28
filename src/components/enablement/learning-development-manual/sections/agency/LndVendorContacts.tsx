import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Contact, Database, Phone, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorContacts() {
  return (
    <section className="space-y-6" id="sec-3-15" data-manual-anchor="sec-3-15">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Contact className="h-6 w-6 text-emerald-600" />
          3.15 Vendor Contacts Management
        </h2>
        <p className="text-muted-foreground">
          Manage multiple contacts per vendor with role-based classification.
          Enables appropriate escalation paths and communication for different needs.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure multiple contacts per vendor</li>
            <li>Assign contact types and roles</li>
            <li>Designate primary contacts</li>
            <li>Set up escalation paths</li>
            <li>Manage contact communication preferences</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_vendor_contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Primary key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>FK to training_vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contact_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>primary | billing | technical | escalation | sales</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Full name of contact</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">title</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Job title</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">email</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Email address</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">phone</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Phone number</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_primary</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Primary contact for their type</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">notes</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Additional notes (availability, preferences)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Type Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Typical Title</TableHead>
                <TableHead>Use Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">primary</Badge></TableCell>
                <TableCell>Main point of contact</TableCell>
                <TableCell>Account Manager</TableCell>
                <TableCell>Day-to-day communication, scheduling, general inquiries</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">billing</Badge></TableCell>
                <TableCell>Financial matters</TableCell>
                <TableCell>Accounts Receivable</TableCell>
                <TableCell>Invoices, payment issues, contract pricing</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-100 text-purple-800">technical</Badge></TableCell>
                <TableCell>Technical support</TableCell>
                <TableCell>Technical Lead</TableCell>
                <TableCell>SCORM issues, platform access, content delivery</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-red-100 text-red-800">escalation</Badge></TableCell>
                <TableCell>Issue escalation</TableCell>
                <TableCell>Director/VP</TableCell>
                <TableCell>Unresolved issues, performance problems, contract disputes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-100 text-orange-800">sales</Badge></TableCell>
                <TableCell>New business</TableCell>
                <TableCell>Sales Representative</TableCell>
                <TableCell>New courses, volume discounts, contract renewals</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Contact Card Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
VENDOR: Cisco Learning Partner (Strategic Tier)
═══════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ PRIMARY CONTACT                                    ★ Main   │
│ ─────────────────────────────────────────────────────────── │
│ Name:  Sarah Chen                                           │
│ Title: Senior Account Manager                               │
│ Email: sarah.chen@ciscolearning.com                         │
│ Phone: +1 (555) 234-5678                                    │
│ Notes: Available Mon-Fri 9am-5pm EST                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BILLING CONTACT                                             │
│ ─────────────────────────────────────────────────────────── │
│ Name:  Finance Team                                         │
│ Email: ar@ciscolearning.com                                 │
│ Phone: +1 (555) 234-5600                                    │
│ Notes: Invoice inquiries - reference PO number              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ESCALATION CONTACT                                          │
│ ─────────────────────────────────────────────────────────── │
│ Name:  Michael Torres                                       │
│ Title: Regional Director                                    │
│ Email: m.torres@ciscolearning.com                           │
│ Phone: +1 (555) 234-5001                                    │
│ Notes: Use only after 48hr unresolved with primary          │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escalation Path Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
ISSUE ESCALATION WORKFLOW
═════════════════════════

Issue Reported
     │
     ▼
┌─────────────────────┐
│ Contact: PRIMARY    │
│ SLA: 24 hours       │
└──────────┬──────────┘
           │
     No resolution?
           │
           ▼
┌─────────────────────┐
│ Contact: TECHNICAL  │ (if technical issue)
│ SLA: 24 hours       │
└──────────┬──────────┘
           │
     No resolution?
           │
           ▼
┌─────────────────────┐
│ Contact: ESCALATION │
│ SLA: 48 hours       │
│ CC: Internal L&D Mgr│
└──────────┬──────────┘
           │
     No resolution?
           │
           ▼
┌─────────────────────┐
│ Vendor Performance  │
│ Review Triggered    │
│ (Incident Type)     │
└─────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step: Add Vendor Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">1</Badge>
              <div>
                <p className="font-medium">Open Vendor Profile</p>
                <p className="text-sm text-muted-foreground">Training → Vendors → Select vendor → Contacts tab</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">2</Badge>
              <div>
                <p className="font-medium">Click Add Contact</p>
                <p className="text-sm text-muted-foreground">Opens new contact form</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">3</Badge>
              <div>
                <p className="font-medium">Select Contact Type</p>
                <p className="text-sm text-muted-foreground">Choose: primary, billing, technical, escalation, or sales</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">4</Badge>
              <div>
                <p className="font-medium">Enter Contact Details</p>
                <p className="text-sm text-muted-foreground">Name, title, email, phone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">5</Badge>
              <div>
                <p className="font-medium">Set Primary Flag (if applicable)</p>
                <p className="text-sm text-muted-foreground">Toggle "Is Primary" for main contact of this type</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">6</Badge>
              <div>
                <p className="font-medium">Add Notes</p>
                <p className="text-sm text-muted-foreground">Availability, preferred contact method, special instructions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Primary Contact Requirement</AlertTitle>
        <AlertDescription>
          Each vendor must have at least one primary contact designated. The system 
          uses this contact for automated notifications (session confirmations, 
          review requests, contract renewals). If no primary contact exists, 
          vendor-related automations will fail with an error.
        </AlertDescription>
      </Alert>
    </section>
  );
}
