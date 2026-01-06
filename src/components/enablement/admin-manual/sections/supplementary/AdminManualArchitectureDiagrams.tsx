import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const securityArchitectureDiagram = `
flowchart TB
    subgraph Client["Client Layer"]
        Browser[Web Browser]
        Mobile[Mobile App]
    end
    
    subgraph Auth["Authentication Layer"]
        Login[Login Service]
        MFA[MFA Validator]
        SSO[SSO Provider]
        Session[Session Manager]
    end
    
    subgraph Access["Access Control Layer"]
        RBAC[Role-Based Access]
        ABAC[Attribute-Based Access]
        Policy[Policy Engine]
    end
    
    subgraph Data["Data Layer"]
        Encrypt[Encryption Service]
        Audit[Audit Logger]
        DB[(Database)]
    end
    
    Browser --> Login
    Mobile --> Login
    Login --> MFA
    Login --> SSO
    MFA --> Session
    SSO --> Session
    Session --> RBAC
    RBAC --> ABAC
    ABAC --> Policy
    Policy --> Encrypt
    Encrypt --> DB
    Policy --> Audit
`;

const permissionInheritanceDiagram = `
flowchart TD
    subgraph System["System Level"]
        SysAdmin[System Administrator]
    end
    
    subgraph Company["Company Level"]
        CompAdmin[Company Admin]
        HRAdmin[HR Administrator]
        SecAdmin[Security Admin]
    end
    
    subgraph Department["Department Level"]
        DeptMgr[Department Manager]
        TeamLead[Team Leader]
    end
    
    subgraph Individual["Individual Level"]
        Employee[Employee]
        Contractor[Contractor]
    end
    
    SysAdmin -->|inherits all| CompAdmin
    CompAdmin -->|inherits HR| HRAdmin
    CompAdmin -->|inherits Security| SecAdmin
    HRAdmin -->|inherits dept| DeptMgr
    SecAdmin -->|inherits dept| DeptMgr
    DeptMgr -->|inherits team| TeamLead
    TeamLead -->|inherits base| Employee
    TeamLead -->|limited access| Contractor
`;

const authenticationFlowDiagram = `
sequenceDiagram
    participant U as User
    participant C as Client App
    participant A as Auth Service
    participant M as MFA Service
    participant S as Session Service
    participant D as Database
    
    U->>C: Enter credentials
    C->>A: Submit login request
    A->>D: Validate credentials
    D-->>A: Credentials valid
    A->>M: Request MFA challenge
    M-->>U: Send MFA code
    U->>C: Enter MFA code
    C->>M: Verify MFA code
    M-->>A: MFA verified
    A->>S: Create session
    S->>D: Store session
    S-->>C: Return session token
    C-->>U: Login successful
`;

const dataFlowDiagram = `
flowchart LR
    subgraph Input["Data Input"]
        UI[User Interface]
        API[API Requests]
        Import[Bulk Import]
    end
    
    subgraph Validation["Validation Layer"]
        Schema[Schema Validation]
        Business[Business Rules]
        Security[Security Checks]
    end
    
    subgraph Processing["Processing Layer"]
        Transform[Data Transform]
        Encrypt[Encryption]
        Audit[Audit Logging]
    end
    
    subgraph Storage["Storage Layer"]
        Primary[(Primary DB)]
        Backup[(Backup DB)]
        Archive[(Archive)]
    end
    
    UI --> Schema
    API --> Schema
    Import --> Schema
    Schema --> Business
    Business --> Security
    Security --> Transform
    Transform --> Encrypt
    Encrypt --> Primary
    Primary --> Backup
    Primary --> Archive
    Transform --> Audit
`;

const auditTrailDiagram = `
flowchart TB
    subgraph Events["Auditable Events"]
        Login[Login/Logout]
        DataChange[Data Changes]
        ConfigChange[Config Changes]
        AccessAttempt[Access Attempts]
    end
    
    subgraph Capture["Event Capture"]
        Interceptor[Event Interceptor]
        Enricher[Context Enricher]
    end
    
    subgraph Storage["Audit Storage"]
        ImmutableLog[(Immutable Log)]
        Index[Search Index]
    end
    
    subgraph Analysis["Analysis & Reporting"]
        RealTime[Real-time Alerts]
        Reports[Compliance Reports]
        SIEM[SIEM Integration]
    end
    
    Login --> Interceptor
    DataChange --> Interceptor
    ConfigChange --> Interceptor
    AccessAttempt --> Interceptor
    Interceptor --> Enricher
    Enricher --> ImmutableLog
    ImmutableLog --> Index
    Index --> RealTime
    Index --> Reports
    Index --> SIEM
`;

export const AdminManualArchitectureDiagrams: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Architecture Diagrams</h2>
        <p className="text-muted-foreground">
          Visual representations of the system architecture, security boundaries, and data flows.
        </p>
      </div>

      <WorkflowDiagram
        title="Security Architecture Overview"
        description="High-level view of the security layers protecting your HR data, from client applications through authentication, access control, and encrypted storage."
        diagram={securityArchitectureDiagram}
      />

      <WorkflowDiagram
        title="Permission Inheritance Hierarchy"
        description="How roles and permissions cascade through the organizational hierarchy. Higher-level roles inherit permissions from lower levels, with specific overrides at each tier."
        diagram={permissionInheritanceDiagram}
      />

      <WorkflowDiagram
        title="Authentication Flow"
        description="Step-by-step sequence of the user authentication process, including credential validation, multi-factor authentication, and session creation."
        diagram={authenticationFlowDiagram}
      />

      <WorkflowDiagram
        title="Data Flow Architecture"
        description="How data moves through the system from input through validation, processing, and secure storage with backup and archival."
        diagram={dataFlowDiagram}
      />

      <WorkflowDiagram
        title="Audit Trail System"
        description="Comprehensive audit logging architecture showing how events are captured, stored immutably, indexed for search, and integrated with monitoring systems."
        diagram={auditTrailDiagram}
      />

      <Card>
        <CardHeader>
          <CardTitle>Diagram Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 border-2 border-primary rounded flex items-center justify-center text-xs">[ ]</div>
              <span>Process/Service</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 border-2 border-primary rounded-full flex items-center justify-center text-xs">( )</div>
              <span>Database/Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-primary" />
              <span>Data Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center text-xs">---</div>
              <span>Subgraph/Layer</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
