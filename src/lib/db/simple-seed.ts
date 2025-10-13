import { db } from './index';
import { clients, projects, tickets } from './schema';

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to encrypt sensitive data (mock encryption)
function mockEncrypt(data: string): string {
  return Buffer.from(data).toString('base64');
}

// Clear existing data
async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  try {
    await db.delete(tickets);
    await db.delete(projects);
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
      clientType: 'a3s' as const,
      status: 'active' as const,
      companySize: '51-200' as const,
      industry: 'Technology',
      website: 'https://techcorp.com',
      currentAccessibilityLevel: 'basic' as const,
      complianceDeadline: new Date('2024-12-31'),
      servicesNeeded: ['audit', 'remediation', 'training'],
      wcagLevel: 'AA' as const,
      priorityAreas: ['keyboard navigation', 'screen reader compatibility'],
      timeline: '3-6_months' as const,
      communicationPreference: 'email' as const,
      reportingFrequency: 'monthly' as const,
      pointOfContact: 'Sarah Johnson',
      timeZone: 'America/Los_Angeles',
      policyStatus: 'has_policy' as const,
      policyNotes: 'Existing policy needs review for WCAG 2.2 compliance',
      hasAccessibilityPolicy: true,
      accessibilityPolicyUrl: 'https://techcorp.com/accessibility',
      requiresLegalDocumentation: true,
      complianceDocuments: ['VPAT', 'Section 508'],
      existingAudits: true,
      previousAuditResults: 'Previous audit found 45 accessibility issues',
      notes: 'Priority client with urgent compliance deadline',
      billingAmount: '15000',
      billingStartDate: new Date('2024-01-01'),
      billingFrequency: 'monthly' as const
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@retailplus.com',
      company: 'RetailPlus Inc',
      phone: '+1-555-0456',
      address: '456 Commerce Ave, New York, NY 10001',
      clientType: 'p15r' as const,
      status: 'active' as const,
      companySize: '201-1000' as const,
      industry: 'Retail',
      website: 'https://retailplus.com',
      currentAccessibilityLevel: 'none' as const,
      complianceDeadline: new Date('2025-06-30'),
      servicesNeeded: ['audit', 'remediation', 'monitoring'],
      wcagLevel: 'AA' as const,
      priorityAreas: ['e-commerce', 'mobile accessibility'],
      timeline: '6-12_months' as const,
      communicationPreference: 'slack' as const,
      reportingFrequency: 'weekly' as const,
      pointOfContact: 'Michael Chen',
      timeZone: 'America/New_York',
      policyStatus: 'needs_creation' as const,
      policyNotes:
        'Large e-commerce platform needs comprehensive accessibility policy',
      hasAccessibilityPolicy: false,
      requiresLegalDocumentation: true,
      complianceDocuments: ['ADA compliance'],
      existingAudits: false,
      notes:
        'Large e-commerce platform requiring comprehensive accessibility overhaul',
      billingAmount: '25000',
      billingStartDate: new Date('2024-02-01'),
      billingFrequency: 'monthly' as const
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@healthcare.org',
      company: 'HealthCare First',
      phone: '+1-555-0789',
      address: '789 Medical Plaza, Boston, MA 02115',
      clientType: 'a3s' as const,
      status: 'pending' as const,
      companySize: '1000+' as const,
      industry: 'Healthcare',
      website: 'https://healthcarefirst.org',
      currentAccessibilityLevel: 'partial' as const,
      complianceDeadline: new Date('2024-09-30'),
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
      policyStatus: 'needs_review' as const,
      policyNotes:
        'Healthcare organization needs policy review for HIPAA and ADA compliance',
      hasAccessibilityPolicy: true,
      accessibilityPolicyUrl:
        'https://healthcarefirst.org/accessibility-policy',
      requiresLegalDocumentation: true,
      complianceDocuments: ['Section 508', 'ADA', 'HIPAA'],
      existingAudits: true,
      previousAuditResults:
        'Compliance audit identified critical accessibility barriers',
      notes: 'Healthcare organization with strict compliance requirements',
      billingAmount: '35000',
      billingStartDate: new Date('2024-03-01'),
      billingFrequency: 'quarterly' as const
    }
  ];

  const insertedClients = await db
    .insert(clients)
    .values(clientData)
    .returning();
  console.log(`✅ Seeded ${insertedClients.length} clients`);
  return insertedClients;
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
      projectType: 'a3s_program' as const,
      projectPlatform: 'website' as const,
      techStack: 'wordpress' as const,
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
    }
  ];

  const insertedProjects = await db
    .insert(projects)
    .values(projectData)
    .returning();
  console.log(`✅ Seeded ${insertedProjects.length} projects`);
  return insertedProjects;
}

// Seed tickets
async function seedTickets(projectIds: string[]) {
  console.log('🎫 Seeding tickets...');

  const ticketData = projectIds.flatMap((projectId) => {
    const tickets = [];
    const startDate = new Date('2024-01-01');

    // Generate 5 tickets per project
    for (let i = 0; i < 5; i++) {
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

// Main seed function
export async function simpleSeed() {
  try {
    console.log('🌱 Starting simple database seeding...');

    // Clear existing data
    await clearDatabase();

    // Seed data in order of dependencies
    const clients = await seedClients();
    const clientIds = clients.map((c) => c.id);

    const projects = await seedProjects(clientIds);
    const projectIds = projects.map((p) => p.id);

    const tickets = await seedTickets(projectIds);

    console.log('🎉 Simple database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${clients.length} clients`);
    console.log(`   • ${projects.length} projects`);
    console.log(`   • ${tickets.length} tickets`);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  simpleSeed()
    .then(() => {
      console.log('✅ Simple seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Simple seeding failed:', error);
      process.exit(1);
    });
}
