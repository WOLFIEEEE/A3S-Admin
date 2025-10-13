import { db } from './index';
import {
  clients,
  clientFiles,
  clientCredentials,
  projects,
  projectMilestones,
  projectDevelopers,
  projectTimeEntries,
  projectDocuments,
  projectActivities,
  projectStagingCredentials,
  tickets,
  ticketComments,
  ticketAttachments
} from './schema';
import { eq } from 'drizzle-orm';

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to generate random IDs (for external references)
function randomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Helper function to encrypt sensitive data (mock encryption)
function mockEncrypt(data: string): string {
  return Buffer.from(data).toString('base64');
}

// Clear existing data
async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  try {
    // Delete in reverse order of dependencies
    await db.delete(ticketAttachments);
    await db.delete(ticketComments);
    await db.delete(tickets);
    await db.delete(projectStagingCredentials);
    await db.delete(projectActivities);
    await db.delete(projectDocuments);
    await db.delete(projectTimeEntries);
    await db.delete(projectDevelopers);
    await db.delete(projectMilestones);
    await db.delete(projects);
    await db.delete(clientCredentials);
    await db.delete(clientFiles);
    await db.delete(clients);

    console.log('✅ Database cleared');
  } catch (error) {
    console.log(
      '⚠️  Some tables may not exist yet, continuing with seeding...'
    );
  }
}

// Seed clients
async function seedClients() {
  console.log('👥 Seeding clients...');

  const clientData = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      company: 'TechCorp Solutions',
      phone: '+1-555-0123',
      address: '123 Tech Street, San Francisco, CA 94105',
      billingAmount: '15000.00',
      billingStartDate: new Date('2024-01-01'),
      billingFrequency: 'monthly' as const,
      status: 'active' as const,
      companySize: '51-200' as const,
      industry: 'Technology',
      website: 'https://techcorp.com',
      currentAccessibilityLevel: 'basic' as const,
      complianceDeadline: new Date('2024-12-31'),
      pricingTier: 'professional' as const,
      paymentMethod: 'credit_card' as const,
      servicesNeeded: ['audit', 'remediation', 'training'],
      wcagLevel: 'AA' as const,
      priorityAreas: ['keyboard navigation', 'screen reader compatibility'],
      timeline: '3-6_months' as const,
      communicationPreference: 'email' as const,
      reportingFrequency: 'monthly' as const,
      pointOfContact: 'Sarah Johnson',
      timeZone: 'America/Los_Angeles',
      hasAccessibilityPolicy: true,
      accessibilityPolicyUrl: 'https://techcorp.com/accessibility',
      requiresLegalDocumentation: true,
      complianceDocuments: ['VPAT', 'Section 508'],
      existingAudits: true,
      previousAuditResults: 'Previous audit found 45 accessibility issues',
      notes: 'Priority client with urgent compliance deadline'
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@retailplus.com',
      company: 'RetailPlus Inc',
      phone: '+1-555-0456',
      address: '456 Commerce Ave, New York, NY 10001',
      billingAmount: '25000.00',
      billingStartDate: new Date('2024-02-01'),
      billingFrequency: 'quarterly' as const,
      status: 'active' as const,
      companySize: '201-1000' as const,
      industry: 'Retail',
      website: 'https://retailplus.com',
      currentAccessibilityLevel: 'none' as const,
      complianceDeadline: new Date('2025-06-30'),
      pricingTier: 'enterprise' as const,
      paymentMethod: 'ach' as const,
      servicesNeeded: ['audit', 'remediation', 'monitoring'],
      wcagLevel: 'AA' as const,
      priorityAreas: ['e-commerce', 'mobile accessibility'],
      timeline: '6-12_months' as const,
      communicationPreference: 'slack' as const,
      reportingFrequency: 'weekly' as const,
      pointOfContact: 'Michael Chen',
      timeZone: 'America/New_York',
      hasAccessibilityPolicy: false,
      requiresLegalDocumentation: true,
      complianceDocuments: ['ADA compliance'],
      existingAudits: false,
      notes:
        'Large e-commerce platform requiring comprehensive accessibility overhaul'
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@healthcare.org',
      company: 'HealthCare First',
      phone: '+1-555-0789',
      address: '789 Medical Plaza, Boston, MA 02115',
      billingAmount: '35000.00',
      billingStartDate: new Date('2024-03-01'),
      billingFrequency: 'yearly' as const,
      status: 'pending' as const,
      companySize: '1000+' as const,
      industry: 'Healthcare',
      website: 'https://healthcarefirst.org',
      currentAccessibilityLevel: 'partial' as const,
      complianceDeadline: new Date('2024-09-30'),
      pricingTier: 'enterprise' as const,
      paymentMethod: 'wire' as const,
      servicesNeeded: ['audit', 'remediation', 'training', 'consultation'],
      wcagLevel: 'AAA' as const,
      priorityAreas: [
        'patient portals',
        'medical forms',
        'emergency information'
      ],
      timeline: 'immediate' as const,
      communicationPreference: 'phone' as const,
      reportingFrequency: 'bi-weekly' as const,
      pointOfContact: 'Emily Rodriguez',
      timeZone: 'America/New_York',
      hasAccessibilityPolicy: true,
      accessibilityPolicyUrl:
        'https://healthcarefirst.org/accessibility-policy',
      requiresLegalDocumentation: true,
      complianceDocuments: ['Section 508', 'ADA', 'HIPAA'],
      existingAudits: true,
      previousAuditResults:
        'Compliance audit identified critical accessibility barriers',
      notes: 'Healthcare organization with strict compliance requirements'
    },
    {
      name: 'David Kim',
      email: 'david.kim@startup.io',
      company: 'StartupIO',
      phone: '+1-555-0321',
      address: '321 Innovation Drive, Austin, TX 78701',
      billingAmount: '8000.00',
      billingStartDate: new Date('2024-04-01'),
      billingFrequency: 'monthly' as const,
      status: 'active' as const,
      companySize: '11-50' as const,
      industry: 'Software',
      website: 'https://startupio.com',
      currentAccessibilityLevel: 'none' as const,
      complianceDeadline: new Date('2025-03-31'),
      pricingTier: 'basic' as const,
      paymentMethod: 'credit_card' as const,
      servicesNeeded: ['audit', 'consultation'],
      wcagLevel: 'A' as const,
      priorityAreas: ['web application', 'mobile app'],
      timeline: '1-3_months' as const,
      communicationPreference: 'email' as const,
      reportingFrequency: 'monthly' as const,
      pointOfContact: 'David Kim',
      timeZone: 'America/Chicago',
      hasAccessibilityPolicy: false,
      requiresLegalDocumentation: false,
      complianceDocuments: [],
      existingAudits: false,
      notes:
        'Early-stage startup looking to build accessibility into their product from the ground up'
    },
    {
      name: 'Lisa Thompson',
      email: 'lisa.thompson@education.edu',
      company: 'Education Hub University',
      phone: '+1-555-0654',
      address: '654 Campus Blvd, Seattle, WA 98195',
      billingAmount: '20000.00',
      billingStartDate: new Date('2024-05-01'),
      billingFrequency: 'quarterly' as const,
      status: 'active' as const,
      companySize: '1000+' as const,
      industry: 'Education',
      website: 'https://educationhub.edu',
      currentAccessibilityLevel: 'basic' as const,
      complianceDeadline: new Date('2024-08-31'),
      pricingTier: 'professional' as const,
      paymentMethod: 'check' as const,
      servicesNeeded: ['audit', 'remediation', 'training'],
      wcagLevel: 'AA' as const,
      priorityAreas: [
        'learning management system',
        'course materials',
        'student portals'
      ],
      timeline: '3-6_months' as const,
      communicationPreference: 'teams' as const,
      reportingFrequency: 'monthly' as const,
      pointOfContact: 'Lisa Thompson',
      timeZone: 'America/Los_Angeles',
      hasAccessibilityPolicy: true,
      accessibilityPolicyUrl: 'https://educationhub.edu/accessibility',
      requiresLegalDocumentation: true,
      complianceDocuments: ['Section 508', 'ADA'],
      existingAudits: true,
      previousAuditResults: 'Previous audit found significant barriers in LMS',
      notes:
        'Educational institution committed to inclusive learning environments'
    }
  ];

  const insertedClients = await db
    .insert(clients)
    .values(clientData)
    .returning();
  console.log(`✅ Seeded ${insertedClients.length} clients`);
  return insertedClients;
}

// Seed client files
async function seedClientFiles(clientIds: string[]) {
  console.log('📁 Seeding client files...');

  try {
    const fileData = clientIds.flatMap((clientId) => [
      {
        clientId,
        filename: `contract_${clientId.substring(0, 8)}.pdf`,
        originalName: 'Service Agreement.pdf',
        category: 'contract',
        filePath: `/uploads/clients/${clientId}/contract.pdf`,
        fileSize: '245760',
        mimeType: 'application/pdf',
        isEncrypted: false,
        uploadedBy: 'admin@a3s.com',
        uploadedAt: new Date(),
        accessLevel: 'restricted' as const,
        metadata: JSON.stringify({ version: '1.0', signed: true })
      },
      {
        clientId,
        filename: `credentials_${clientId.substring(0, 8)}.json`,
        originalName: 'API Credentials.json',
        category: 'credential',
        filePath: `/uploads/clients/${clientId}/credentials.json`,
        fileSize: '1024',
        mimeType: 'application/json',
        isEncrypted: true,
        uploadedBy: 'admin@a3s.com',
        uploadedAt: new Date(),
        accessLevel: 'confidential' as const,
        metadata: JSON.stringify({ encrypted: true, keyId: 'key_001' })
      }
    ]);

    await db.insert(clientFiles).values(fileData);
    console.log(`✅ Seeded ${fileData.length} client files`);
  } catch (error) {
    console.log('⚠️  Skipping client files seeding (table may not exist)');
  }
}

// Seed client credentials
async function seedClientCredentials(clientIds: string[]) {
  console.log('🔐 Seeding client credentials...');

  const credentialData = clientIds.flatMap((clientId) => [
    {
      clientId,
      name: 'Production API Access',
      username: 'api_user',
      password: mockEncrypt('secure_password_123'),
      apiKey: mockEncrypt('sk-prod-1234567890abcdef'),
      notes: mockEncrypt('Production environment API credentials'),
      type: 'api'
    },
    {
      clientId,
      name: 'Staging Environment',
      username: 'staging_user',
      password: mockEncrypt('staging_pass_456'),
      notes: mockEncrypt('Staging environment access for testing'),
      type: 'ftp'
    }
  ]);

  await db.insert(clientCredentials).values(credentialData);
  console.log(`✅ Seeded ${credentialData.length} client credentials`);
}

// Seed projects
async function seedProjects(clientIds: string[]) {
  console.log('🚀 Seeding projects...');

  const projectData = [
    {
      clientId: clientIds[0], // TechCorp Solutions
      name: 'TechCorp Website Accessibility Audit',
      description:
        "Comprehensive accessibility audit and remediation for TechCorp's main website to achieve WCAG 2.2 AA compliance. Focus on keyboard navigation, screen reader compatibility, and color contrast improvements.",
      sheetId: '1BxiMVs0Xy5Zg8Xy5Zg8Xy5Zg8Xy5Zg8Xy5Zg8',
      status: 'active' as const,
      priority: 'high' as const,
      wcagLevel: 'AA' as const,
      projectType: 'audit' as const,
      complianceRequirements: [
        'WCAG 2.2 AA',
        'Section 508',
        'Keyboard navigation',
        'Screen reader compatibility'
      ],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      estimatedHours: '120.00',
      budget: '15000.00',
      billingType: 'fixed' as const,
      deliverables: [
        'Accessibility audit report',
        'Remediation plan',
        'VPAT document',
        'Training materials'
      ],
      acceptanceCriteria: [
        'WCAG 2.2 AA compliance',
        'VPAT completion',
        'Client training completed'
      ],
      tags: ['website', 'audit', 'wcag-aa'],
      notes: 'Priority project with tight deadline',
      createdBy: 'admin@a3s.com',
      lastModifiedBy: 'admin@a3s.com'
    },
    {
      clientId: clientIds[1], // RetailPlus Inc
      name: 'RetailPlus E-commerce Platform Remediation',
      description:
        "Complete accessibility remediation of RetailPlus's e-commerce platform including product pages, checkout process, and mobile experience. Focus on WCAG 2.2 AA compliance.",
      status: 'planning' as const,
      priority: 'urgent' as const,
      wcagLevel: 'AA' as const,
      projectType: 'remediation' as const,
      complianceRequirements: [
        'WCAG 2.2 AA',
        'ADA compliance',
        'E-commerce accessibility',
        'Mobile accessibility'
      ],
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-31'),
      estimatedHours: '300.00',
      budget: '25000.00',
      billingType: 'hourly' as const,
      hourlyRate: '125.00',
      deliverables: [
        'Remediated e-commerce platform',
        'Accessibility testing report',
        'Mobile accessibility improvements'
      ],
      acceptanceCriteria: [
        'All product pages accessible',
        'Checkout process compliant',
        'Mobile app accessible'
      ],
      tags: ['e-commerce', 'remediation', 'mobile'],
      notes: 'Large-scale remediation project',
      createdBy: 'admin@a3s.com',
      lastModifiedBy: 'admin@a3s.com'
    },
    {
      clientId: clientIds[2], // HealthCare First
      name: 'HealthCare First Patient Portal Accessibility',
      description:
        "Comprehensive accessibility audit and remediation of HealthCare First's patient portal system. Critical for ADA compliance and patient access to medical information.",
      status: 'active' as const,
      priority: 'urgent' as const,
      wcagLevel: 'AAA' as const,
      projectType: 'full_compliance' as const,
      complianceRequirements: [
        'WCAG 2.2 AAA',
        'Section 508',
        'ADA',
        'HIPAA compliance'
      ],
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      estimatedHours: '200.00',
      budget: '35000.00',
      billingType: 'milestone' as const,
      deliverables: [
        'Patient portal audit',
        'Remediation implementation',
        'Compliance certification',
        'Staff training'
      ],
      acceptanceCriteria: [
        'AAA compliance achieved',
        'HIPAA compliance maintained',
        'Staff trained'
      ],
      tags: ['healthcare', 'patient-portal', 'aaa-compliance'],
      notes: 'Critical healthcare accessibility project',
      createdBy: 'admin@a3s.com',
      lastModifiedBy: 'admin@a3s.com'
    },
    {
      clientId: clientIds[3], // StartupIO
      name: 'StartupIO Web Application Accessibility Consultation',
      description:
        "Accessibility consultation and initial audit for StartupIO's web application. Focus on building accessibility into the product from the ground up.",
      status: 'planning' as const,
      priority: 'medium' as const,
      wcagLevel: 'A' as const,
      projectType: 'consultation' as const,
      complianceRequirements: ['WCAG 2.2 A', 'Basic accessibility'],
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-07-31'),
      estimatedHours: '40.00',
      budget: '8000.00',
      billingType: 'fixed' as const,
      deliverables: [
        'Accessibility consultation report',
        'Development guidelines',
        'Initial audit'
      ],
      acceptanceCriteria: [
        'Consultation completed',
        'Guidelines provided',
        'Initial audit done'
      ],
      tags: ['consultation', 'startup', 'guidelines'],
      notes: 'Early-stage accessibility integration',
      createdBy: 'admin@a3s.com',
      lastModifiedBy: 'admin@a3s.com'
    },
    {
      clientId: clientIds[4], // Education Hub University
      name: 'Education Hub LMS Accessibility Training',
      description:
        'Comprehensive accessibility training program for Education Hub University staff and faculty. Focus on creating accessible course materials and using the LMS effectively.',
      status: 'active' as const,
      priority: 'high' as const,
      wcagLevel: 'AA' as const,
      projectType: 'training' as const,
      complianceRequirements: [
        'WCAG 2.2 AA',
        'Section 508',
        'Educational accessibility'
      ],
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-08-31'),
      estimatedHours: '80.00',
      budget: '20000.00',
      billingType: 'fixed' as const,
      deliverables: [
        'Training program',
        'Accessible course templates',
        'Faculty certification'
      ],
      acceptanceCriteria: [
        'Staff trained',
        'Templates created',
        'Certification completed'
      ],
      tags: ['training', 'education', 'lms'],
      notes: 'Educational institution training program',
      createdBy: 'admin@a3s.com',
      lastModifiedBy: 'admin@a3s.com'
    }
  ];

  const insertedProjects = await db
    .insert(projects)
    .values(projectData)
    .returning();
  console.log(`✅ Seeded ${insertedProjects.length} projects`);
  return insertedProjects;
}

// Seed project milestones
async function seedProjectMilestones(projectIds: string[]) {
  console.log('🎯 Seeding project milestones...');

  const milestoneData = projectIds.flatMap((projectId, index) => {
    const baseDate = new Date('2024-01-01');
    const projectStart = new Date(
      baseDate.getTime() + index * 30 * 24 * 60 * 60 * 1000
    ); // 30 days apart

    return [
      {
        projectId,
        title: 'Project Kickoff',
        description: 'Initial project setup and requirements gathering',
        dueDate: new Date(projectStart.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'completed' as const,
        completedDate: new Date(
          projectStart.getTime() + 5 * 24 * 60 * 60 * 1000
        ), // 5 days
        assignedTo: 'project-lead@a3s.com',
        deliverables: ['Project charter', 'Requirements document'],
        acceptanceCriteria: ['Stakeholder sign-off', 'Requirements documented'],
        order: 1,
        wcagCriteria: ['1.1.1', '1.3.1']
      },
      {
        projectId,
        title: 'Initial Audit',
        description: 'Comprehensive accessibility audit of current system',
        dueDate: new Date(projectStart.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days
        status: 'in_progress' as const,
        assignedTo: 'auditor@a3s.com',
        deliverables: ['Audit report', 'Issue prioritization'],
        acceptanceCriteria: ['All pages audited', 'Issues categorized'],
        order: 2,
        wcagCriteria: ['2.1.1', '2.4.1', '3.1.1']
      },
      {
        projectId,
        title: 'Remediation Planning',
        description: 'Detailed remediation plan development',
        dueDate: new Date(projectStart.getTime() + 35 * 24 * 60 * 60 * 1000), // 35 days
        status: 'pending' as const,
        assignedTo: 'planner@a3s.com',
        deliverables: ['Remediation plan', 'Timeline'],
        acceptanceCriteria: ['Plan approved', 'Timeline agreed'],
        order: 3,
        wcagCriteria: ['4.1.1', '4.1.2']
      },
      {
        projectId,
        title: 'Implementation',
        description: 'Implementation of accessibility improvements',
        dueDate: new Date(projectStart.getTime() + 70 * 24 * 60 * 60 * 1000), // 70 days
        status: 'pending' as const,
        assignedTo: 'developer@a3s.com',
        deliverables: ['Implemented fixes', 'Testing results'],
        acceptanceCriteria: ['All critical issues fixed', 'Testing passed'],
        order: 4,
        wcagCriteria: ['1.4.3', '1.4.6', '2.4.7']
      },
      {
        projectId,
        title: 'Final Testing & Certification',
        description: 'Final accessibility testing and compliance certification',
        dueDate: new Date(projectStart.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
        status: 'pending' as const,
        assignedTo: 'tester@a3s.com',
        deliverables: ['Final test report', 'VPAT', 'Certification'],
        acceptanceCriteria: ['WCAG compliance achieved', 'VPAT completed'],
        order: 5,
        wcagCriteria: ['All WCAG 2.2 criteria']
      }
    ];
  });

  await db.insert(projectMilestones).values(milestoneData);
  console.log(`✅ Seeded ${milestoneData.length} project milestones`);
}

// Seed project developers
async function seedProjectDevelopers(projectIds: string[]) {
  console.log('👨‍💻 Seeding project developers...');

  const developerData = projectIds.flatMap((projectId) => [
    {
      projectId,
      developerId: 'dev-001',
      role: 'project_lead' as const,
      responsibilities: [
        'Project management',
        'Client communication',
        'Quality assurance'
      ],
      assignedBy: 'admin@a3s.com',
      hourlyRate: '150.00',
      maxHoursPerWeek: 40
    },
    {
      projectId,
      developerId: 'dev-002',
      role: 'senior_developer' as const,
      responsibilities: [
        'Code implementation',
        'Technical architecture',
        'Code review'
      ],
      assignedBy: 'admin@a3s.com',
      hourlyRate: '125.00',
      maxHoursPerWeek: 40
    },
    {
      projectId,
      developerId: 'dev-003',
      role: 'accessibility_specialist' as const,
      responsibilities: [
        'Accessibility testing',
        'WCAG compliance',
        'Screen reader testing'
      ],
      assignedBy: 'admin@a3s.com',
      hourlyRate: '100.00',
      maxHoursPerWeek: 30
    }
  ]);

  await db.insert(projectDevelopers).values(developerData);
  console.log(`✅ Seeded ${developerData.length} project developers`);
}

// Seed project time entries
async function seedProjectTimeEntries(projectIds: string[]) {
  console.log('⏰ Seeding project time entries...');

  const timeEntryData = projectIds.flatMap((projectId) => {
    const entries = [];
    const startDate = new Date('2024-01-01');

    // Generate 20 time entries per project
    for (let i = 0; i < 20; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const hours = Math.random() * 8 + 1; // 1-9 hours
      const categories = [
        'development',
        'testing',
        'review',
        'meeting',
        'documentation',
        'research'
      ];
      const category = categories[
        Math.floor(Math.random() * categories.length)
      ] as any;

      entries.push({
        projectId,
        developerId: `dev-00${(i % 3) + 1}`,
        date,
        hours: hours.toFixed(2),
        description: `Work on ${category} tasks for project milestone`,
        category,
        billable: Math.random() > 0.1, // 90% billable
        approved: Math.random() > 0.3, // 70% approved
        approvedBy: Math.random() > 0.3 ? 'manager@a3s.com' : null,
        approvedAt: Math.random() > 0.3 ? date : null
      });
    }

    return entries;
  });

  await db.insert(projectTimeEntries).values(timeEntryData);
  console.log(`✅ Seeded ${timeEntryData.length} project time entries`);
}

// Seed project documents
async function seedProjectDocuments(projectIds: string[]) {
  console.log('📄 Seeding project documents...');

  const documentData = projectIds.flatMap((projectId) => [
    {
      projectId,
      name: 'Project Charter',
      type: 'other' as const,
      filePath: `/uploads/projects/${projectId}/charter.pdf`,
      uploadedBy: 'admin@a3s.com',
      version: '1.0',
      isLatest: true,
      tags: ['charter', 'planning'],
      fileSize: '512000',
      mimeType: 'application/pdf'
    },
    {
      projectId,
      name: 'Initial Audit Report',
      type: 'audit_report' as const,
      filePath: `/uploads/projects/${projectId}/audit-report.pdf`,
      uploadedBy: 'auditor@a3s.com',
      version: '1.0',
      isLatest: true,
      tags: ['audit', 'report'],
      fileSize: '1024000',
      mimeType: 'application/pdf'
    },
    {
      projectId,
      name: 'Remediation Plan',
      type: 'remediation_plan' as const,
      filePath: `/uploads/projects/${projectId}/remediation-plan.docx`,
      uploadedBy: 'planner@a3s.com',
      version: '1.0',
      isLatest: true,
      tags: ['plan', 'remediation'],
      fileSize: '256000',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  ]);

  await db.insert(projectDocuments).values(documentData);
  console.log(`✅ Seeded ${documentData.length} project documents`);
}

// Seed project activities
async function seedProjectActivities(projectIds: string[]) {
  console.log('📊 Seeding project activities...');

  const activityData = projectIds.flatMap((projectId) => {
    const activities = [];
    const startDate = new Date('2024-01-01');

    // Generate 15 activities per project
    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const actions = [
        'created',
        'updated',
        'milestone_completed',
        'developer_assigned',
        'status_changed',
        'document_uploaded',
        'time_logged'
      ];
      const action = actions[Math.floor(Math.random() * actions.length)] as any;

      activities.push({
        projectId,
        userId: `user-00${(i % 3) + 1}`,
        userName: `User ${(i % 3) + 1}`,
        action,
        description: `Project ${action} - ${action.replace('_', ' ')} action performed`,
        metadata: JSON.stringify({
          timestamp: date.toISOString(),
          actionId: `act-${i}`
        }),
        timestamp: date
      });
    }

    return activities;
  });

  await db.insert(projectActivities).values(activityData);
  console.log(`✅ Seeded ${activityData.length} project activities`);
}

// Seed project staging credentials
async function seedProjectStagingCredentials(projectIds: string[]) {
  console.log('🔑 Seeding project staging credentials...');

  const credentialData = projectIds.flatMap((projectId) => [
    {
      projectId,
      type: 'staging' as const,
      environment: 'staging',
      url: `https://staging-${projectId.substring(0, 8)}.example.com`,
      username: 'staging_user',
      password: mockEncrypt('staging_password_123'),
      apiKey: mockEncrypt('sk-staging-1234567890abcdef'),
      notes: 'Staging environment credentials for testing',
      isActive: true,
      createdBy: 'admin@a3s.com'
    },
    {
      projectId,
      type: 'development' as const,
      environment: 'development',
      url: `https://dev-${projectId.substring(0, 8)}.example.com`,
      username: 'dev_user',
      password: mockEncrypt('dev_password_456'),
      notes: 'Development environment credentials',
      isActive: true,
      createdBy: 'admin@a3s.com'
    }
  ]);

  await db.insert(projectStagingCredentials).values(credentialData);
  console.log(`✅ Seeded ${credentialData.length} project staging credentials`);
}

// Seed tickets
async function seedTickets(projectIds: string[]) {
  console.log('🎫 Seeding tickets...');

  const ticketData = projectIds.flatMap((projectId) => {
    const tickets = [];
    const startDate = new Date('2024-01-01');

    // Generate 10 tickets per project
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const statuses = ['open', 'in_progress', 'resolved', 'closed'];
      const priorities = ['low', 'medium', 'high', 'critical'];
      const types = ['bug', 'feature', 'task', 'accessibility', 'improvement'];

      const status = statuses[
        Math.floor(Math.random() * statuses.length)
      ] as any;
      const priority = priorities[
        Math.floor(Math.random() * priorities.length)
      ] as any;
      const type = types[Math.floor(Math.random() * types.length)] as any;

      tickets.push({
        projectId,
        title: `Ticket ${i + 1}: ${type.charAt(0).toUpperCase() + type.slice(1)} Issue`,
        description: `Detailed description of the ${type} issue that needs to be addressed. This is a sample ticket for testing purposes.`,
        status,
        priority,
        type,
        assigneeId: `dev-00${(i % 3) + 1}`,
        reporterId: 'admin@a3s.com',
        estimatedHours: Math.floor(Math.random() * 20) + 1,
        actualHours:
          status === 'closed' ? Math.floor(Math.random() * 20) + 1 : 0,
        wcagCriteria: ['1.1.1', '1.3.1', '2.1.1'],
        tags: [type, priority, 'sample'],
        dueDate: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
        resolvedAt: status === 'resolved' || status === 'closed' ? date : null,
        closedAt: status === 'closed' ? date : null
      });
    }

    return tickets;
  });

  const insertedTickets = await db
    .insert(tickets)
    .values(ticketData)
    .returning();
  console.log(`✅ Seeded ${insertedTickets.length} tickets`);
  return insertedTickets;
}

// Seed ticket comments
async function seedTicketComments(ticketIds: string[]) {
  console.log('💬 Seeding ticket comments...');

  const commentData = ticketIds.flatMap((ticketId) => {
    const comments = [];
    const startDate = new Date('2024-01-01');

    // Generate 3 comments per ticket
    for (let i = 0; i < 3; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);

      comments.push({
        ticketId,
        userId: `user-00${(i % 3) + 1}`,
        userName: `User ${(i % 3) + 1}`,
        comment: `This is comment ${i + 1} on the ticket. Providing additional information or updates.`,
        isInternal: Math.random() > 0.5
      });
    }

    return comments;
  });

  await db.insert(ticketComments).values(commentData);
  console.log(`✅ Seeded ${commentData.length} ticket comments`);
}

// Seed ticket attachments
async function seedTicketAttachments(ticketIds: string[]) {
  console.log('📎 Seeding ticket attachments...');

  const attachmentData = ticketIds.flatMap((ticketId) => [
    {
      ticketId,
      filename: `attachment_${ticketId.substring(0, 8)}.pdf`,
      originalName: 'Screenshot.pdf',
      filePath: `/uploads/tickets/${ticketId}/screenshot.pdf`,
      fileSize: '128000',
      mimeType: 'application/pdf',
      uploadedBy: 'user@a3s.com'
    }
  ]);

  await db.insert(ticketAttachments).values(attachmentData);
  console.log(`✅ Seeded ${attachmentData.length} ticket attachments`);
}

// Main seed function
export async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await clearDatabase();

    // Seed data in order of dependencies
    const clients = await seedClients();
    const clientIds = clients.map((c) => c.id);

    await seedClientFiles(clientIds);
    await seedClientCredentials(clientIds);

    const projects = await seedProjects(clientIds);
    const projectIds = projects.map((p) => p.id);

    await seedProjectMilestones(projectIds);
    await seedProjectDevelopers(projectIds);
    await seedProjectTimeEntries(projectIds);
    await seedProjectDocuments(projectIds);
    await seedProjectActivities(projectIds);
    await seedProjectStagingCredentials(projectIds);

    const tickets = await seedTickets(projectIds);
    const ticketIds = tickets.map((t) => t.id);

    await seedTicketComments(ticketIds);
    await seedTicketAttachments(ticketIds);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${clients.length} clients`);
    console.log(`   • ${projects.length} projects`);
    console.log(`   • ${tickets.length} tickets`);
    console.log(`   • ${clientIds.length * 2} client files`);
    console.log(`   • ${clientIds.length * 2} client credentials`);
    console.log(`   • ${projectIds.length * 5} project milestones`);
    console.log(`   • ${projectIds.length * 3} project developers`);
    console.log(`   • ${projectIds.length * 20} project time entries`);
    console.log(`   • ${projectIds.length * 3} project documents`);
    console.log(`   • ${projectIds.length * 15} project activities`);
    console.log(`   • ${projectIds.length * 2} project staging credentials`);
    console.log(`   • ${ticketIds.length * 3} ticket comments`);
    console.log(`   • ${ticketIds.length} ticket attachments`);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
