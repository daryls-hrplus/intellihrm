import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Users } from 'lucide-react';
import {
  LetterTemplatesSetup,
  PolicyDocumentsSetup,
  FormsLibrarySetup,
  CompanyDocumentsSetup
} from './sections/documents';

export function HRHubManualDocumentsSection() {
  return (
    <div className="space-y-8" data-manual-anchor="hh-part-4">
      {/* Chapter Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50/50 to-background dark:from-purple-950/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-purple-600 border-purple-300">Chapter 4</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  45 min read
                </Badge>
              </div>
              <CardTitle className="text-2xl">Documents & Templates</CardTitle>
              <p className="text-muted-foreground mt-1">
                Letter templates, policy documents, forms library, and company document management
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              HR Administrator
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              HR Operations
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              Compliance Officer
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This chapter covers document management capabilities including letter templates with 
            variable substitution, AI-powered policy document processing, digital forms, and 
            centralized company document repositories. These features leverage the workflows 
            configured in Chapter 3.
          </p>
        </CardContent>
      </Card>

      {/* Section 4.1: Company Documents */}
      <CompanyDocumentsSetup />

      {/* Section 4.2: Policy Documents */}
      <PolicyDocumentsSetup />

      {/* Section 4.3: Letter Templates */}
      <LetterTemplatesSetup />

      {/* Section 4.4: Forms Library */}
      <FormsLibrarySetup />
    </div>
  );
}
