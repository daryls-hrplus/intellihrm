import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndAgencySetup() {
  return (
    <section className="space-y-6" id="sec-3-2" data-manual-anchor="sec-3-2">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.2 Agency Setup</h2>
        <p className="text-muted-foreground">
          Configure external training providers with complete contact information,
          specializations, and preferred vendor status.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and configure training agency profiles</li>
            <li>Set up agency contact information and categories</li>
            <li>Designate preferred vendors for specific training types</li>
            <li>Manage agency active/inactive status</li>
          </ul>
        </CardContent>
      </Card>

      {/* Field Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle>Field Reference: training_agencies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Validation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Agency display name</TableCell>
                <TableCell>2-200 characters</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">code</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Unique identifier code</TableCell>
                <TableCell>Uppercase, 2-20 chars</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Agency overview and services</TableCell>
                <TableCell>Max 2000 chars</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">website_url</TableCell>
                <TableCell>URL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Agency website</TableCell>
                <TableCell>Valid URL format</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contact_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Primary contact person</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contact_email</TableCell>
                <TableCell>Email</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Contact email address</TableCell>
                <TableCell>Valid email format</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">contact_phone</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Contact phone number</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">address</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Physical address</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">specializations</TableCell>
                <TableCell>Text[]</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Areas of expertise</TableCell>
                <TableCell>Array of strings</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_preferred</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Preferred vendor flag</TableCell>
                <TableCell>Default: false</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Agency availability</TableCell>
                <TableCell>Default: true</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Company association</TableCell>
                <TableCell>Valid company ID</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Step-by-Step: Creating an Agency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="font-medium">Navigate to Training → Agencies</p>
                <p className="text-sm text-muted-foreground">Access the agency management section from the L&D module sidebar.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="font-medium">Click "Add Agency" button</p>
                <p className="text-sm text-muted-foreground">Opens the agency creation form.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <p className="font-medium">Enter agency code and name</p>
                <p className="text-sm text-muted-foreground">Code should be a short uppercase identifier (e.g., SKILLSOFT, PMI, CISCO).</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <p className="font-medium">Add contact information</p>
                <p className="text-sm text-muted-foreground">Include primary contact name, email, phone, and address.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">5</span>
              <div>
                <p className="font-medium">Select specializations</p>
                <p className="text-sm text-muted-foreground">Choose areas of expertise: Technical, Leadership, Compliance, Safety, etc.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">6</span>
              <div>
                <p className="font-medium">Set preferred vendor status (optional)</p>
                <p className="text-sm text-muted-foreground">Mark as preferred to highlight in training request workflows.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">7</span>
              <div>
                <p className="font-medium">Save agency</p>
                <p className="text-sm text-muted-foreground">Agency is now available for course linking.</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Configuration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Example 1: Technical Certification Provider
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Code:</span> CISCO</div>
              <div><span className="text-muted-foreground">Name:</span> Cisco Learning Partners</div>
              <div><span className="text-muted-foreground">Specializations:</span> Networking, Security, Cloud</div>
              <div><span className="text-muted-foreground">Preferred:</span> Yes</div>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Example 2: Leadership Development Firm
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Code:</span> FRANKLINC</div>
              <div><span className="text-muted-foreground">Name:</span> FranklinCovey</div>
              <div><span className="text-muted-foreground">Specializations:</span> Leadership, Productivity, Culture</div>
              <div><span className="text-muted-foreground">Preferred:</span> Yes</div>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Example 3: Safety Training Provider
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Code:</span> NSC</div>
              <div><span className="text-muted-foreground">Name:</span> National Safety Council</div>
              <div><span className="text-muted-foreground">Specializations:</span> Workplace Safety, First Aid, OSHA</div>
              <div><span className="text-muted-foreground">Preferred:</span> No</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Business Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Agency codes must be unique within each company</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Inactive agencies are hidden from course linking and training requests</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Preferred agencies appear first in selection dropdowns</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Deleting an agency requires removing or reassigning all linked courses first</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Historical training records retain agency references even if agency becomes inactive</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Tip */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>Best Practice</AlertTitle>
        <AlertDescription>
          Establish a vendor evaluation process before marking agencies as "preferred." 
          Consider factors like course quality, completion rates, learner feedback, 
          and cost-effectiveness when designating preferred status.
        </AlertDescription>
      </Alert>
    </section>
  );
}
