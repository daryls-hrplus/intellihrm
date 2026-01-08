import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Book, 
  FileText, 
  FolderOpen, 
  Search, 
  Star, 
  Eye,
  Tag,
  CheckCircle2,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  Clock
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  SuccessCallout 
} from '@/components/enablement/manual/components';

export function KnowledgeBaseSetup() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>Knowledge Base Setup</CardTitle>
                <Badge variant="outline" className="text-xs">Section 5.4</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~12 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Self-service knowledge base for employee information access
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The Knowledge Base provides a searchable library of HR articles, policies, procedures, 
            and FAQs. Employees can find answers independently, reducing repetitive Help Desk 
            tickets and empowering self-service.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300">Categorized</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Organized by topic for intuitive browsing and navigation
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Searchable</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full-text search across titles, content, and tags
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Featured</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Highlight important articles on the homepage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5.4.1: Categories */}
      <div id="hh-sec-5-4-1" data-manual-anchor="hh-sec-5-4-1" className="space-y-6 scroll-mt-36">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="text-xs">5.4.1</Badge>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Categories
          </h3>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Category Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Categories organize knowledge base articles into logical groupings. 
              A well-structured category hierarchy helps employees find information quickly.
            </p>

            {/* Creating Categories */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Creating a Category
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Field</th>
                      <th className="text-left py-2 px-3 font-medium">Required</th>
                      <th className="text-left py-2 px-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-medium">Name</td>
                      <td className="py-2 px-3"><Badge>Required</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">Display name (e.g., "Leave & Time Off")</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Slug</td>
                      <td className="py-2 px-3"><Badge variant="secondary">Auto</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">URL-friendly identifier (auto-generated from name)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Description</td>
                      <td className="py-2 px-3"><Badge variant="outline">Optional</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">Brief explanation of category contents</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Icon</td>
                      <td className="py-2 px-3"><Badge variant="outline">Optional</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">Visual identifier from icon library</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Display Order</td>
                      <td className="py-2 px-3"><Badge variant="outline">Optional</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">Sort position in category list (lower = higher)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Active</td>
                      <td className="py-2 px-3"><Badge variant="secondary">Default: Yes</Badge></td>
                      <td className="py-2 px-3 text-muted-foreground">Toggle visibility to employees</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommended Categories */}
            <div className="space-y-4">
              <h4 className="font-semibold">Recommended Category Structure</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'Getting Started', icon: '🚀' },
                  { name: 'Leave & Time Off', icon: '🏖️' },
                  { name: 'Benefits', icon: '💊' },
                  { name: 'Payroll', icon: '💰' },
                  { name: 'Policies', icon: '📋' },
                  { name: 'Training', icon: '📚' },
                  { name: 'IT & Systems', icon: '💻' },
                  { name: 'Compliance', icon: '✅' },
                  { name: 'FAQs', icon: '❓' }
                ].map(cat => (
                  <div key={cat.name} className="p-3 rounded-lg border bg-card flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activate/Deactivate */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Activating/Deactivating Categories
              </h4>
              <p className="text-sm text-muted-foreground">
                Inactive categories are hidden from employees but retained in the system. 
                Use this to temporarily hide categories during content updates or for 
                seasonal content.
              </p>
              <WarningCallout title="Articles in Inactive Categories">
                When a category is deactivated, all articles within it become hidden 
                from employees, even if the articles are marked as published.
              </WarningCallout>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5.4.2: Articles */}
      <div id="hh-sec-5-4-2" data-manual-anchor="hh-sec-5-4-2" className="space-y-6 scroll-mt-36">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="text-xs">5.4.2</Badge>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Articles
          </h3>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Article Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Creating Articles */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Creating an Article
              </h4>
              <div className="p-4 rounded-lg border bg-muted/30">
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Navigate to Knowledge Base Admin → Articles tab</li>
                  <li>Click "New Article" button</li>
                  <li>Enter article title (auto-generates slug)</li>
                  <li>Select category from dropdown</li>
                  <li>Write excerpt (short preview text)</li>
                  <li>Compose content using Markdown or rich text editor</li>
                  <li>Add relevant tags (comma-separated)</li>
                  <li>Set publishing options (Draft/Published, Featured)</li>
                  <li>Save article</li>
                </ol>
              </div>
            </div>

            {/* Article Fields */}
            <div className="space-y-4">
              <h4 className="font-semibold">Article Fields Reference</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Field</th>
                      <th className="text-left py-2 px-3 font-medium">Description</th>
                      <th className="text-left py-2 px-3 font-medium">Best Practice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-medium">Title</td>
                      <td className="py-2 px-3 text-muted-foreground">Article headline</td>
                      <td className="py-2 px-3 text-muted-foreground">Clear, descriptive, under 60 chars</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Slug</td>
                      <td className="py-2 px-3 text-muted-foreground">URL path segment</td>
                      <td className="py-2 px-3 text-muted-foreground">Auto-generated, edit for SEO</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Category</td>
                      <td className="py-2 px-3 text-muted-foreground">Primary classification</td>
                      <td className="py-2 px-3 text-muted-foreground">One category per article</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Excerpt</td>
                      <td className="py-2 px-3 text-muted-foreground">Preview text in listings</td>
                      <td className="py-2 px-3 text-muted-foreground">150-200 chars, summarize value</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Content</td>
                      <td className="py-2 px-3 text-muted-foreground">Full article body</td>
                      <td className="py-2 px-3 text-muted-foreground">Use headings, lists, links</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Tags</td>
                      <td className="py-2 px-3 text-muted-foreground">Secondary keywords</td>
                      <td className="py-2 px-3 text-muted-foreground">3-5 relevant terms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Publishing Controls */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Publishing Controls
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <h5 className="font-medium">Draft</h5>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Work in progress. Only visible to administrators. 
                    Use for content review before publishing.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <h5 className="font-medium text-green-700 dark:text-green-300">Published</h5>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Live and visible to all employees. Appears in search 
                    results and category listings.
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Flag */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4" />
                Featured Articles
              </h4>
              <p className="text-sm text-muted-foreground">
                Mark articles as "Featured" to display them prominently on the Knowledge 
                Base homepage. Use for high-value content like onboarding guides or 
                frequently referenced policies.
              </p>
              <TipCallout title="Feature Rotation">
                Rotate featured articles periodically to keep the homepage fresh 
                and draw attention to different content areas.
              </TipCallout>
            </div>

            {/* View Tracking */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Count Tracking
              </h4>
              <p className="text-sm text-muted-foreground">
                Each article tracks view counts automatically. Use this data to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                <li>Identify popular content for prominent placement</li>
                <li>Find underperforming articles needing improvement</li>
                <li>Understand employee information needs</li>
                <li>Prioritize content updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Governance */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-amber-500" />
            Content Governance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Maintain knowledge base quality with regular review cycles and clear ownership.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Review Cycles</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Policy articles: Annually</li>
                <li>• Procedure guides: Semi-annually</li>
                <li>• FAQs: Quarterly</li>
                <li>• Benefits info: At renewal</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Content Ownership</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Assign SME per category</li>
                <li>• Track last review date</li>
                <li>• Set review reminders</li>
                <li>• Document change history</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Archive vs Delete</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Archive: Outdated but historical</li>
                <li>• Delete: Incorrect or replaced</li>
                <li>• Redirect: URL changed</li>
                <li>• Merge: Consolidate duplicates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Optimization */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Search Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">Writing for Search</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use natural language employees would search</li>
                <li>• Include common synonyms and abbreviations</li>
                <li>• Put key terms in titles and excerpts</li>
                <li>• Answer questions directly in content</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Tagging Strategy</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use consistent tag vocabulary</li>
                <li>• Include topic, audience, and action tags</li>
                <li>• Example: "leave", "manager", "approve"</li>
                <li>• Review popular searches to inform tags</li>
              </ul>
            </div>
          </div>
          
          <SuccessCallout title="Reduce Help Desk Tickets">
            A well-maintained Knowledge Base can reduce repetitive Help Desk tickets 
            by 40-60%. Link to relevant articles in Help Desk responses to train 
            employees on self-service.
          </SuccessCallout>
        </CardContent>
      </Card>
    </div>
  );
}
