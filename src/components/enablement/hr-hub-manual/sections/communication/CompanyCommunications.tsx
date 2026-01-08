import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, 
  Image, 
  FileText, 
  Building2, 
  Pin, 
  Eye, 
  EyeOff,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  Star,
  Users,
  Globe,
  Clock
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout 
} from '@/components/enablement/manual/components';

export function CompanyCommunications() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>Company Communications</CardTitle>
                <Badge variant="outline" className="text-xs">Section 5.3</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~12 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Intranet administration for announcements, galleries, and blog posts
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The Company Communications module provides centralized tools for internal 
            communications. Create company-wide or targeted announcements, manage photo 
            galleries for company events, and publish blog posts for employee engagement.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-700 dark:text-orange-300">Announcements</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Targeted messaging with department filtering and priority pinning
              </p>
            </div>
            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Image className="h-4 w-4 text-pink-500" />
                <span className="font-medium text-pink-700 dark:text-pink-300">Photo Gallery</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Event photos and company moments organized by albums
              </p>
            </div>
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Blog Posts</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Long-form content with SEO-friendly slugs and tagging
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intranet Tabs */}
      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Photo Gallery
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Posts
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Announcement Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Creating Announcements */}
              <div className="space-y-4">
                <h4 className="font-semibold">Creating an Announcement</h4>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Navigate to Intranet Admin → Announcements tab</li>
                    <li>Click "New Announcement" button</li>
                    <li>Enter the announcement title</li>
                    <li>Select announcement type (General, Urgent, Event, Policy)</li>
                    <li>Write content using the rich text editor</li>
                    <li>Configure targeting (see Department Targeting below)</li>
                    <li>Set publish status (Draft or Published)</li>
                    <li>Optionally pin the announcement for prominence</li>
                    <li>Save to create</li>
                  </ol>
                </div>
              </div>

              {/* Announcement Types */}
              <div className="space-y-4">
                <h4 className="font-semibold">Announcement Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border bg-card text-center">
                    <Badge variant="outline" className="mb-2">General</Badge>
                    <p className="text-xs text-muted-foreground">Standard updates and news</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card text-center">
                    <Badge className="bg-red-500 mb-2">Urgent</Badge>
                    <p className="text-xs text-muted-foreground">Critical time-sensitive info</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card text-center">
                    <Badge className="bg-blue-500 mb-2">Event</Badge>
                    <p className="text-xs text-muted-foreground">Company events and activities</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card text-center">
                    <Badge className="bg-purple-500 mb-2">Policy</Badge>
                    <p className="text-xs text-muted-foreground">Policy updates and changes</p>
                  </div>
                </div>
              </div>

              {/* Department Targeting */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Department Targeting
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <h5 className="font-medium text-blue-700 dark:text-blue-300">Company-Wide</h5>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Leave department selection empty to broadcast to all employees 
                      across the organization.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <h5 className="font-medium text-green-700 dark:text-green-300">Targeted</h5>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select one or more departments. Only employees in those 
                      departments will see the announcement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pinning */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinning Announcements
                </h4>
                <p className="text-sm text-muted-foreground">
                  Pinned announcements appear at the top of the announcements list regardless 
                  of publish date. Use pinning for ongoing important messages like open enrollment 
                  periods or policy reminders.
                </p>
                <TipCallout title="Pin Sparingly">
                  Limit pinned announcements to 2-3 at a time. Too many pinned items 
                  reduce their effectiveness and create announcement fatigue.
                </TipCallout>
              </div>

              {/* Publishing Workflow */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Publishing Workflow
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg border">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Draft</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">Published</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Drafts are only visible to administrators. Toggle to Published to make 
                  the announcement visible to target employees immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Photo Gallery Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                The Photo Gallery showcases company events, team activities, and memorable moments. 
                Organize photos into albums for easy browsing.
              </p>

              {/* Adding Gallery Items */}
              <div className="space-y-4">
                <h4 className="font-semibold">Adding Gallery Items</h4>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Navigate to Intranet Admin → Gallery tab</li>
                    <li>Click "Add Photo" or "Create Album"</li>
                    <li>Upload image file (JPG, PNG, WebP supported)</li>
                    <li>Enter title and optional description</li>
                    <li>Assign to an album (optional)</li>
                    <li>Set publish status</li>
                    <li>Save to add to gallery</li>
                  </ol>
                </div>
              </div>

              {/* Album Organization */}
              <div className="space-y-4">
                <h4 className="font-semibold">Album Organization</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2">Event Albums</h5>
                    <p className="text-sm text-muted-foreground">
                      Group photos by event: "2024 Holiday Party", "Team Building Q3"
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2">Department Albums</h5>
                    <p className="text-sm text-muted-foreground">
                      Organize by team: "Sales Achievements", "Engineering Milestones"
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2">Themed Albums</h5>
                    <p className="text-sm text-muted-foreground">
                      Cross-cutting themes: "Employee Spotlights", "Office Life"
                    </p>
                  </div>
                </div>
              </div>

              <InfoCallout title="Image Optimization">
                Uploaded images are automatically optimized for web display. Large files 
                are compressed while maintaining visual quality to ensure fast page loading.
              </InfoCallout>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Blog Post Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                The company blog provides a platform for longer-form content including 
                leadership messages, culture articles, industry insights, and employee stories.
              </p>

              {/* Creating Blog Posts */}
              <div className="space-y-4">
                <h4 className="font-semibold">Creating a Blog Post</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Field</th>
                        <th className="text-left py-2 px-3 font-medium">Description</th>
                        <th className="text-left py-2 px-3 font-medium">Tips</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 px-3 font-medium">Title</td>
                        <td className="py-2 px-3 text-muted-foreground">Main headline of the post</td>
                        <td className="py-2 px-3 text-muted-foreground">Keep under 60 characters</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Slug</td>
                        <td className="py-2 px-3 text-muted-foreground">URL-friendly identifier (auto-generated)</td>
                        <td className="py-2 px-3 text-muted-foreground">Edit for SEO optimization</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Excerpt</td>
                        <td className="py-2 px-3 text-muted-foreground">Short preview shown in listings</td>
                        <td className="py-2 px-3 text-muted-foreground">150-200 characters ideal</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Featured Image</td>
                        <td className="py-2 px-3 text-muted-foreground">Hero image for the post</td>
                        <td className="py-2 px-3 text-muted-foreground">16:9 aspect ratio recommended</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Content</td>
                        <td className="py-2 px-3 text-muted-foreground">Full article body</td>
                        <td className="py-2 px-3 text-muted-foreground">Use headings for structure</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Tags</td>
                        <td className="py-2 px-3 text-muted-foreground">Categorization labels</td>
                        <td className="py-2 px-3 text-muted-foreground">3-5 relevant tags</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tags Management */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags Management
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Tags help employees discover related content. Establish a consistent 
                  tagging strategy for better content organization.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Leadership', 'Culture', 'Benefits', 'Training', 'Recognition', 'Events', 'Industry News'].map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Publishing */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Publishing Workflow
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      Draft Status
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Work in progress. Only visible to administrators. Use for 
                      content review before publishing.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                    <h5 className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Eye className="h-4 w-4" />
                      Published Status
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Live and visible to all employees. Published date is recorded 
                      for chronological ordering.
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured Posts */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Featured Posts
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mark posts as "Featured" to highlight them on the blog homepage. 
                  Featured posts appear in a prominent carousel or hero section.
                </p>
              </div>

              {/* View Tracking */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Count Tracking
                </h4>
                <p className="text-sm text-muted-foreground">
                  Each post tracks view counts automatically. Use this data to understand 
                  which content resonates with employees and inform future content strategy.
                </p>
              </div>

              <TipCallout title="Content Calendar">
                Plan blog content in advance with a content calendar. Aim for consistent 
                publishing frequency (e.g., weekly or bi-weekly) to maintain employee engagement.
              </TipCallout>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Targeting Strategy */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Communication Targeting Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Effective internal communication requires matching the right message to the 
            right audience through the right channel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Announcements</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Time-sensitive updates</li>
                <li>• Policy changes</li>
                <li>• Event notifications</li>
                <li>• Department-specific news</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Blog Posts</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Leadership messages</li>
                <li>• Culture stories</li>
                <li>• In-depth features</li>
                <li>• Evergreen content</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Photo Gallery</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Event documentation</li>
                <li>• Team celebrations</li>
                <li>• Office moments</li>
                <li>• Recognition photos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
