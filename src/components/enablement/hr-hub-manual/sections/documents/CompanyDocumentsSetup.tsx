import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, Upload, Building2, Globe, Lock, Download, 
  Filter, FileText, CheckCircle, Tag
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';

const documentCategories = [
  { category: 'Policies', description: 'HR policies, company rules, and governance documents' },
  { category: 'Procedures', description: 'Standard operating procedures and process guides' },
  { category: 'Forms', description: 'Downloadable forms and templates for employee use' },
  { category: 'Handbooks', description: 'Employee handbooks and comprehensive guides' },
  { category: 'Guidelines', description: 'Best practices and advisory documents' },
  { category: 'Templates', description: 'Reusable document templates' },
  { category: 'Training Materials', description: 'Learning resources and training content' },
  { category: 'Other', description: 'Miscellaneous organizational documents' },
];

const supportedFiles = [
  { type: 'Documents', formats: 'PDF, DOC, DOCX, TXT' },
  { type: 'Spreadsheets', formats: 'XLS, XLSX, CSV' },
  { type: 'Presentations', formats: 'PPT, PPTX' },
  { type: 'Images', formats: 'PNG, JPG, JPEG' },
];

const documentFields = [
  { name: 'title', required: true, type: 'string', description: 'Document display name (auto-fills from filename)' },
  { name: 'company', required: true, type: 'select', description: 'Company that owns this document' },
  { name: 'category', required: true, type: 'select', description: 'Classification for filtering and organization' },
  { name: 'file', required: true, type: 'file', description: 'Upload file or provide external URL', validation: 'Max 10MB' },
  { name: 'description', required: false, type: 'textarea', description: 'Brief summary of document content' },
  { name: 'version', required: false, type: 'string', description: 'Document version number', defaultValue: '1.0' },
  { name: 'is_public', required: false, type: 'boolean', description: 'Access level for the document', defaultValue: 'true' },
];

const addDocumentSteps = [
  {
    title: 'Navigate to Company Documents',
    description: 'Access HR Hub → Company Documents from the main navigation.',
    expectedResult: 'Company documents page loads with document list'
  },
  {
    title: 'Click Add Document',
    description: 'Click the "Add Document" button in the top right corner.',
    expectedResult: 'Add document dialog opens'
  },
  {
    title: 'Select Company',
    description: 'Choose the company this document belongs to. This is required for proper scoping.',
    expectedResult: 'Company selected'
  },
  {
    title: 'Choose Category',
    description: 'Select the appropriate category to help employees find the document.',
    substeps: [
      'Policies for governance documents',
      'Procedures for process guides',
      'Handbooks for comprehensive employee guides',
      'Training Materials for learning content'
    ],
    expectedResult: 'Category selected'
  },
  {
    title: 'Upload Document File',
    description: 'Either upload a file from your computer or provide an external URL.',
    substeps: [
      'Click "Choose File" to upload from local storage',
      'Maximum file size: 10MB',
      'Alternatively, enter an external URL for hosted documents',
      'Title auto-fills from filename'
    ],
    expectedResult: 'File uploaded or URL provided'
  },
  {
    title: 'Complete Metadata',
    description: 'Add optional details for organization and tracking.',
    substeps: [
      'Title: Adjust the auto-filled title if needed',
      'Description: Add a brief summary for discoverability',
      'Version: Track document revisions (e.g., 1.0, 2.1)',
      'Access Level: Toggle between Public and Restricted'
    ],
    expectedResult: 'Metadata completed'
  },
  {
    title: 'Save Document',
    description: 'Click Save to add the document to the library. It becomes immediately available based on access settings.',
    expectedResult: 'Success notification; document appears in list'
  }
];

export function CompanyDocumentsSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-4-4">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 4.4</Badge>
            <Badge variant="secondary">10 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Company Documents</h2>
          <p className="text-muted-foreground mt-1">
            Central repository for organizational documents with access control and version management
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            Company Documents provides a centralized library for storing, organizing, and distributing 
            organizational documents. Unlike Policy Documents (which power AI rule extraction), 
            Company Documents serves as a straightforward document repository for employee reference.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Building2 className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Company-Scoped</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Documents organized by company for multi-entity environments
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Tag className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Category Organization</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  8 predefined categories for easy document discovery
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Lock className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Access Control</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Public or restricted visibility per document
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-500" />
            Document Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Documents are organized into categories for easy filtering and discovery:
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Typical Content</th>
                </tr>
              </thead>
              <tbody>
                {documentCategories.map((cat, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 font-medium">{cat.category}</td>
                    <td className="p-3 text-muted-foreground">{cat.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Supported File Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Supported File Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedFiles.map((f, idx) => (
              <div key={idx} className="p-3 rounded-lg border">
                <h4 className="font-medium">{f.type}</h4>
                <p className="text-sm text-muted-foreground font-mono mt-1">{f.formats}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Maximum file size:</strong> 10MB per document
          </p>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each document can be configured with an access level:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-700 dark:text-green-400">Public</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Visible to all authenticated employees within the company. Use for general 
                reference materials, handbooks, and widely applicable policies.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-amber-700 dark:text-amber-400">Restricted</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Limited visibility based on role or department. Use for sensitive documents, 
                management guidelines, or confidential procedures.
              </p>
            </div>
          </div>

          <InfoCallout title="Company Scoping">
            Documents are always scoped to a specific company. Employees only see documents 
            belonging to their company. For organization-wide documents, upload to each 
            company or use the Policy Documents feature with global scope.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Adding Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-500" />
            Adding a Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={addDocumentSteps} />
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={documentFields} />
        </CardContent>
      </Card>

      {/* Filtering & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-500" />
            Filtering & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The document list supports filtering to help users find documents quickly:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Available Filters</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span><strong>Company:</strong> Filter by specific company</span>
                </li>
                <li className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span><strong>Category:</strong> Filter by document category</span>
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Document Actions</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span><strong>Download:</strong> Access the document file</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span><strong>Delete:</strong> Remove document (soft delete)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Organization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use consistent naming conventions across documents</li>
                <li>• Select the most specific category for each document</li>
                <li>• Add descriptions to improve discoverability</li>
                <li>• Keep document titles concise but descriptive</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Version Control</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Update version number when revising documents</li>
                <li>• Include date in description when updating</li>
                <li>• Consider keeping major versions as separate documents</li>
                <li>• Archive outdated documents rather than deleting</li>
              </ul>
            </div>
          </div>

          <TipCallout title="External URLs">
            Instead of uploading files, you can link to externally hosted documents using URLs. 
            This is useful for documents maintained in other systems or shared drives. Ensure 
            the URL is accessible to all intended viewers.
          </TipCallout>

          <WarningCallout title="Document vs Policy">
            Use <strong>Company Documents</strong> for general reference materials. Use 
            <strong>Policy Documents</strong> (Section 4.2) for policies that should feed 
            into AI-powered guidance and rule enforcement during transactions.
          </WarningCallout>
        </CardContent>
      </Card>
    </div>
  );
}
