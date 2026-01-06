import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'security' | 'access' | 'system' | 'compliance' | 'general';
  relatedTerms?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  // Security Terms
  { term: 'MFA (Multi-Factor Authentication)', definition: 'A security mechanism requiring users to provide two or more verification factors to gain access. Combines something you know (password), something you have (phone), or something you are (biometrics).', category: 'security', relatedTerms: ['TOTP', 'SSO', 'Authentication'] },
  { term: 'TOTP (Time-based One-Time Password)', definition: 'An algorithm that generates a temporary passcode using the current time as a source of uniqueness. Used in authenticator apps for MFA.', category: 'security', relatedTerms: ['MFA', 'Authenticator App'] },
  { term: 'SSO (Single Sign-On)', definition: 'An authentication scheme that allows users to log in with a single ID to multiple, related software systems. Reduces password fatigue and improves security.', category: 'security', relatedTerms: ['SAML', 'OAuth', 'MFA'] },
  { term: 'SAML (Security Assertion Markup Language)', definition: 'An open standard for exchanging authentication and authorization data between parties, particularly between an identity provider and a service provider.', category: 'security', relatedTerms: ['SSO', 'OAuth', 'Identity Provider'] },
  { term: 'OAuth 2.0', definition: 'An authorization framework that enables applications to obtain limited access to user accounts on an HTTP service.', category: 'security', relatedTerms: ['SSO', 'SAML', 'Access Token'] },
  { term: 'Encryption at Rest', definition: 'The encryption of data that is stored on a disk or other storage medium, protecting it from unauthorized access when not in use.', category: 'security', relatedTerms: ['Encryption in Transit', 'AES'] },
  { term: 'Encryption in Transit', definition: 'The encryption of data while it is being transmitted between systems, typically using TLS/SSL protocols.', category: 'security', relatedTerms: ['Encryption at Rest', 'TLS', 'HTTPS'] },
  { term: 'Session Timeout', definition: 'The automatic termination of a user session after a period of inactivity, reducing the risk of unauthorized access.', category: 'security', relatedTerms: ['Session Management', 'Idle Timeout'] },
  
  // Access Control Terms
  { term: 'RBAC (Role-Based Access Control)', definition: 'An approach to restricting system access based on the roles of individual users within an organization. Users are assigned roles, and roles are assigned permissions.', category: 'access', relatedTerms: ['ABAC', 'Permission', 'Role'] },
  { term: 'ABAC (Attribute-Based Access Control)', definition: 'An access control paradigm that grants access based on attributes of users, resources, and environment conditions rather than roles alone.', category: 'access', relatedTerms: ['RBAC', 'Policy', 'Attribute'] },
  { term: 'Permission', definition: 'A specific right granted to a user or role to perform a particular action on a resource, such as read, write, create, or delete.', category: 'access', relatedTerms: ['Role', 'RBAC', 'Access Control'] },
  { term: 'Role', definition: 'A named collection of permissions that can be assigned to users. Roles represent job functions and simplify permission management.', category: 'access', relatedTerms: ['Permission', 'RBAC', 'User'] },
  { term: 'Principle of Least Privilege', definition: 'A security concept requiring that users be given only the minimum levels of access needed to perform their job functions.', category: 'access', relatedTerms: ['RBAC', 'Permission', 'Zero Trust'] },
  { term: 'Segregation of Duties (SoD)', definition: 'A control mechanism that divides critical tasks among multiple people to prevent fraud and errors. No single person should control all aspects of a critical process.', category: 'access', relatedTerms: ['Compliance', 'Internal Control'] },
  { term: 'Access Review', definition: 'A periodic audit of user access rights to ensure they are appropriate and aligned with current job responsibilities.', category: 'access', relatedTerms: ['Recertification', 'Compliance'] },
  
  // System Configuration Terms
  { term: 'Tenant', definition: 'A single organization or company instance within a multi-tenant system. Each tenant has isolated data and configuration.', category: 'system', relatedTerms: ['Multi-tenancy', 'Company'] },
  { term: 'Multi-tenancy', definition: 'A software architecture where a single instance serves multiple organizations (tenants) while keeping their data isolated.', category: 'system', relatedTerms: ['Tenant', 'Data Isolation'] },
  { term: 'Workflow', definition: 'An automated sequence of tasks or approvals triggered by specific events. Used for processes like leave approval or onboarding.', category: 'system', relatedTerms: ['Approval Chain', 'Automation'] },
  { term: 'API Key', definition: 'A unique identifier used to authenticate requests to an API. Should be kept secret and rotated regularly.', category: 'system', relatedTerms: ['Integration', 'OAuth'] },
  { term: 'Webhook', definition: 'An HTTP callback that sends real-time data to other applications when specific events occur.', category: 'system', relatedTerms: ['Integration', 'API', 'Event'] },
  { term: 'Rate Limiting', definition: 'A technique to control the number of requests a user or system can make in a given time period, protecting against abuse.', category: 'system', relatedTerms: ['API', 'Security', 'Throttling'] },
  
  // Compliance Terms
  { term: 'GDPR (General Data Protection Regulation)', definition: 'European Union regulation on data protection and privacy. Requires organizations to protect personal data and respect individual rights.', category: 'compliance', relatedTerms: ['DSAR', 'Data Protection', 'Privacy'] },
  { term: 'DSAR (Data Subject Access Request)', definition: 'A request from an individual to access the personal data an organization holds about them, as provided for under GDPR.', category: 'compliance', relatedTerms: ['GDPR', 'Privacy', 'Right to Access'] },
  { term: 'Right to Erasure', definition: 'Also known as the "right to be forgotten," it allows individuals to request deletion of their personal data under certain circumstances.', category: 'compliance', relatedTerms: ['GDPR', 'DSAR', 'Data Retention'] },
  { term: 'Audit Trail', definition: 'A chronological record of system activities that provides documentary evidence of the sequence of activities affecting operations.', category: 'compliance', relatedTerms: ['Audit Log', 'Compliance', 'Accountability'] },
  { term: 'Data Retention Policy', definition: 'Rules defining how long different types of data should be kept before being archived or deleted.', category: 'compliance', relatedTerms: ['GDPR', 'Archival', 'Compliance'] },
  { term: 'SOC 2', definition: 'A compliance framework for service organizations covering security, availability, processing integrity, confidentiality, and privacy.', category: 'compliance', relatedTerms: ['Compliance', 'Security', 'Audit'] },
  { term: 'ISO 27001', definition: 'An international standard for information security management systems (ISMS), providing requirements for establishing, implementing, and improving security.', category: 'compliance', relatedTerms: ['Security', 'Compliance', 'Certification'] },
  
  // General Terms
  { term: 'Onboarding', definition: 'The process of integrating a new employee into an organization, including account creation, training, and resource provisioning.', category: 'general', relatedTerms: ['Offboarding', 'Provisioning'] },
  { term: 'Offboarding', definition: 'The process of managing an employee\'s departure, including revoking access, transferring responsibilities, and archiving data.', category: 'general', relatedTerms: ['Onboarding', 'Deprovisioning'] },
  { term: 'Provisioning', definition: 'The process of creating and configuring user accounts and granting access to resources.', category: 'general', relatedTerms: ['Onboarding', 'Automation'] },
  { term: 'Deprovisioning', definition: 'The process of removing user access and disabling accounts when no longer needed.', category: 'general', relatedTerms: ['Offboarding', 'Access Revocation'] },
  { term: 'Identity Provider (IdP)', definition: 'A system that creates, maintains, and manages identity information and provides authentication services.', category: 'general', relatedTerms: ['SSO', 'SAML', 'Authentication'] },
  { term: 'Service Provider (SP)', definition: 'An application that relies on an identity provider for user authentication in an SSO environment.', category: 'general', relatedTerms: ['SSO', 'Identity Provider'] },
];

const categoryColors: Record<string, string> = {
  security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  access: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  system: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  compliance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const categoryLabels: Record<string, string> = {
  security: 'Security',
  access: 'Access Control',
  system: 'System',
  compliance: 'Compliance',
  general: 'General',
};

export const AdminManualGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTerms = glossaryTerms
    .filter(item => {
      const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.term.localeCompare(b.term));

  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Glossary</h2>
        <p className="text-muted-foreground">
          Comprehensive reference of terms used throughout the Admin & Security module.
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alphabetical Index */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(groupedTerms).sort().map(letter => (
          <a
            key={letter}
            href={`#glossary-${letter}`}
            className="w-8 h-8 flex items-center justify-center rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Terms List */}
      <div className="space-y-6">
        {Object.entries(groupedTerms).sort().map(([letter, terms]) => (
          <div key={letter} id={`glossary-${letter}`}>
            <h3 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {letter}
            </h3>
            <div className="space-y-3">
              {terms.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{item.term}</h4>
                      <Badge className={categoryColors[item.category]}>
                        {categoryLabels[item.category]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{item.definition}</p>
                    {item.relatedTerms && item.relatedTerms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">Related:</span>
                        {item.relatedTerms.map((related, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {related}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No terms found matching your search criteria.
        </div>
      )}
    </div>
  );
};
