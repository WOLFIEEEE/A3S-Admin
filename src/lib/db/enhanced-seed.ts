import { db } from './index';
import {
  clients,
  projects,
  tickets,
  testUrls,
  accessibilityIssues,
  issueComments
} from './schema';

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

// Clear existing data
async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  try {
    // Delete in reverse order of dependencies
    await db.delete(issueComments);
    await db.delete(accessibilityIssues);
    await db.delete(testUrls);
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
      status: 'active' as const,
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
    },
    {
      name: 'David Kim',
      email: 'david.kim@startup.io',
      company: 'StartupIO',
      phone: '+1-555-0321',
      address: '321 Innovation Drive, Austin, TX 78701',
      clientType: 'p15r' as const,
      status: 'active' as const,
      companySize: '11-50' as const,
      industry: 'Software',
      website: 'https://startupio.com',
      currentAccessibilityLevel: 'none' as const,
      complianceDeadline: new Date('2025-03-31'),
      servicesNeeded: ['audit', 'consultation'],
      wcagLevel: 'A' as const,
      priorityAreas: ['web application', 'mobile app'],
      timeline: '1-3_months' as const,
      communicationPreference: 'email' as const,
      reportingFrequency: 'monthly' as const,
      pointOfContact: 'David Kim',
      timeZone: 'America/Chicago',
      policyStatus: 'needs_creation' as const,
      policyNotes:
        'Early-stage startup looking to build accessibility into their product',
      hasAccessibilityPolicy: false,
      requiresLegalDocumentation: false,
      complianceDocuments: [],
      existingAudits: false,
      notes:
        'Early-stage startup looking to build accessibility into their product from the ground up',
      billingAmount: '8000',
      billingStartDate: new Date('2024-04-01'),
      billingFrequency: 'monthly' as const
    },
    {
      name: 'Lisa Thompson',
      email: 'lisa.thompson@education.edu',
      company: 'Education Hub University',
      phone: '+1-555-0654',
      address: '654 Campus Blvd, Seattle, WA 98195',
      clientType: 'a3s' as const,
      status: 'active' as const,
      companySize: '1000+' as const,
      industry: 'Education',
      website: 'https://educationhub.edu',
      currentAccessibilityLevel: 'basic' as const,
      complianceDeadline: new Date('2024-08-31'),
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
      policyStatus: 'has_policy' as const,
      policyNotes:
        'Educational institution committed to inclusive learning environments',
      hasAccessibilityPolicy: true,
      accessibilityPolicyUrl: 'https://educationhub.edu/accessibility',
      requiresLegalDocumentation: true,
      complianceDocuments: ['Section 508', 'ADA'],
      existingAudits: true,
      previousAuditResults: 'Previous audit found significant barriers in LMS',
      notes:
        'Educational institution committed to inclusive learning environments',
      billingAmount: '20000',
      billingStartDate: new Date('2024-05-01'),
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
      status: 'active' as const,
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

// Seed test URLs
async function seedTestUrls(projectIds: string[]) {
  console.log('🔗 Seeding test URLs...');

  const urlData = projectIds.flatMap((projectId) => [
    {
      projectId,
      url: 'https://example.com/',
      pageTitle: 'Homepage',
      urlCategory: 'home' as const,
      testingMonth: 'January',
      testingYear: 2024,
      isActive: true
    },
    {
      projectId,
      url: 'https://example.com/products',
      pageTitle: 'Products Page',
      urlCategory: 'content' as const,
      testingMonth: 'January',
      testingYear: 2024,
      isActive: true
    },
    {
      projectId,
      url: 'https://example.com/contact',
      pageTitle: 'Contact Form',
      urlCategory: 'form' as const,
      testingMonth: 'January',
      testingYear: 2024,
      isActive: true
    },
    {
      projectId,
      url: 'https://example.com/checkout',
      pageTitle: 'Checkout Process',
      urlCategory: 'form' as const,
      testingMonth: 'February',
      testingYear: 2024,
      isActive: true
    },
    {
      projectId,
      url: 'https://example.com/admin',
      pageTitle: 'Admin Dashboard',
      urlCategory: 'admin' as const,
      testingMonth: 'February',
      testingYear: 2024,
      isActive: true
    }
  ]);

  const insertedUrls = await db.insert(testUrls).values(urlData).returning();
  console.log(`✅ Seeded ${insertedUrls.length} test URLs`);
  return insertedUrls;
}

// Comprehensive WCAG criteria data
const WCAG_CRITERIA = [
  '1.1.1',
  '1.2.1',
  '1.2.2',
  '1.2.3',
  '1.3.1',
  '1.3.2',
  '1.3.3',
  '1.3.4',
  '1.3.5',
  '1.4.1',
  '1.4.2',
  '1.4.3',
  '1.4.4',
  '1.4.5',
  '1.4.6',
  '1.4.7',
  '1.4.8',
  '1.4.9',
  '1.4.10',
  '1.4.11',
  '1.4.12',
  '1.4.13',
  '2.1.1',
  '2.1.2',
  '2.1.3',
  '2.1.4',
  '2.2.1',
  '2.2.2',
  '2.2.3',
  '2.2.4',
  '2.2.5',
  '2.2.6',
  '2.3.1',
  '2.3.2',
  '2.3.3',
  '2.4.1',
  '2.4.2',
  '2.4.3',
  '2.4.4',
  '2.4.5',
  '2.4.6',
  '2.4.7',
  '2.4.8',
  '2.4.9',
  '2.4.10',
  '2.4.11',
  '2.4.12',
  '2.4.13',
  '2.5.1',
  '2.5.2',
  '2.5.3',
  '2.5.4',
  '2.5.5',
  '2.5.6',
  '2.5.7',
  '2.5.8',
  '3.1.1',
  '3.1.2',
  '3.1.3',
  '3.1.4',
  '3.1.5',
  '3.1.6',
  '3.2.1',
  '3.2.2',
  '3.2.3',
  '3.2.4',
  '3.2.5',
  '3.2.6',
  '3.3.1',
  '3.3.2',
  '3.3.3',
  '3.3.4',
  '3.3.5',
  '3.3.6',
  '3.3.7',
  '3.3.8',
  '3.3.9',
  '4.1.1',
  '4.1.2',
  '4.1.3'
];

// Seed accessibility issues with comprehensive data
async function seedAccessibilityIssues(projectIds: string[], urlIds: string[]) {
  console.log('🐛 Seeding accessibility issues...');

  const issueTemplates = [
    // Critical Issues
    {
      issueTitle: 'Images missing alternative text',
      issueDescription:
        'Multiple images throughout the site are missing alt attributes, making them inaccessible to screen reader users. This prevents users from understanding the content and context of images.',
      issueType: 'screen_reader' as const,
      severity: '1_critical' as const,
      expectedResult:
        'All images should have descriptive alt text that conveys the meaning and function of the image',
      actualResult:
        'Images are missing alt attributes or have empty alt="" without being decorative',
      failedWcagCriteria: ['1.1.1'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/NVDA 2023.3',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'NVDA 2023.3',
      devStatus: 'not_started' as const,
      qaStatus: 'not_started' as const
    },
    {
      issueTitle: 'Insufficient color contrast for text',
      issueDescription:
        'Text elements have insufficient color contrast ratios, making them difficult to read for users with visual impairments or in bright lighting conditions.',
      issueType: 'color_contrast' as const,
      severity: '1_critical' as const,
      expectedResult:
        'Text should have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text',
      actualResult:
        'Multiple text elements have contrast ratios below 3:1, failing WCAG requirements',
      failedWcagCriteria: ['1.4.3', '1.4.6'],
      conformanceLevel: 'AA' as const,
      testingEnvironment: 'Windows 11/Chrome 120/Colour Contrast Analyser',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'Colour Contrast Analyser',
      devStatus: 'in_progress' as const,
      qaStatus: 'not_started' as const,
      devComments:
        'Working on updating color palette to meet contrast requirements'
    },
    {
      issueTitle: 'Form fields missing labels',
      issueDescription:
        'Form input fields lack proper labels, making it impossible for screen reader users to understand what information is required.',
      issueType: 'screen_reader' as const,
      severity: '1_critical' as const,
      expectedResult:
        'All form fields should have associated labels that clearly describe the required input',
      actualResult:
        'Multiple form fields have placeholder text only or no identifying text',
      failedWcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/NVDA 2023.3',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'NVDA 2023.3',
      devStatus: 'done' as const,
      qaStatus: 'in_progress' as const,
      devComments: 'Added proper labels to all form fields',
      qaComments: 'Testing form accessibility with screen readers'
    },
    {
      issueTitle: 'Keyboard navigation not possible',
      issueDescription:
        'Interactive elements cannot be accessed using keyboard navigation, preventing keyboard-only users from using core functionality.',
      issueType: 'keyboard_navigation' as const,
      severity: '1_critical' as const,
      expectedResult:
        'All interactive elements should be accessible via keyboard navigation with visible focus indicators',
      actualResult:
        'Dropdown menus, buttons, and links cannot be accessed or activated using keyboard',
      failedWcagCriteria: ['2.1.1', '2.4.7'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/Keyboard Only',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'Keyboard Only',
      devStatus: 'blocked' as const,
      qaStatus: 'not_started' as const,
      devComments: 'Blocked by third-party component limitations'
    },
    // High Priority Issues
    {
      issueTitle: 'Heading structure not logical',
      issueDescription:
        'Page headings skip levels and are not in logical order, making navigation difficult for screen reader users.',
      issueType: 'screen_reader' as const,
      severity: '2_high' as const,
      expectedResult:
        'Headings should follow a logical hierarchy (h1, h2, h3, etc.) without skipping levels',
      actualResult:
        'Page jumps from h1 to h3, skipping h2, and has multiple h1 elements',
      failedWcagCriteria: ['1.3.1', '2.4.6'],
      conformanceLevel: 'AA' as const,
      testingEnvironment: 'Windows 11/Chrome 120/NVDA 2023.3',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'NVDA 2023.3',
      devStatus: 'in_progress' as const,
      qaStatus: 'not_started' as const
    },
    {
      issueTitle: 'Focus indicators not visible',
      issueDescription:
        'When navigating with keyboard, focus indicators are either missing or have insufficient contrast, making it difficult to track current position.',
      issueType: 'keyboard_navigation' as const,
      severity: '2_high' as const,
      expectedResult:
        'All focusable elements should have clearly visible focus indicators with sufficient contrast',
      actualResult:
        'Focus indicators are barely visible or completely absent on many interactive elements',
      failedWcagCriteria: ['2.4.7', '1.4.11'],
      conformanceLevel: 'AA' as const,
      testingEnvironment: 'Windows 11/Chrome 120/Keyboard Only',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'Keyboard Only',
      devStatus: 'not_started' as const,
      qaStatus: 'not_started' as const
    },
    {
      issueTitle: 'Error messages not descriptive',
      issueDescription:
        'Form validation errors are generic and do not provide specific guidance on how to fix the input.',
      issueType: 'screen_reader' as const,
      severity: '2_high' as const,
      expectedResult:
        'Error messages should clearly identify the field with error and provide specific instructions for correction',
      actualResult:
        'Generic "Please fix errors" message without identifying specific fields or required formats',
      failedWcagCriteria: ['3.3.1', '3.3.3'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/NVDA 2023.3',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'NVDA 2023.3',
      devStatus: 'done' as const,
      qaStatus: 'verified' as const,
      devComments: 'Implemented specific error messages for each field',
      qaComments: 'Verified error messages are clear and helpful'
    },
    // Medium Priority Issues
    {
      issueTitle: 'Page title not descriptive',
      issueDescription:
        'Page titles are generic and do not describe the specific content or purpose of each page.',
      issueType: 'screen_reader' as const,
      severity: '3_medium' as const,
      expectedResult:
        'Each page should have a unique, descriptive title that identifies the page content and site',
      actualResult:
        'All pages have the same generic title "Welcome to Our Site"',
      failedWcagCriteria: ['2.4.2'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/NVDA 2023.3',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'NVDA 2023.3',
      devStatus: 'in_progress' as const,
      qaStatus: 'not_started' as const
    },
    {
      issueTitle: 'Link text not descriptive',
      issueDescription:
        'Links use generic text like "click here" or "read more" without providing context about the destination.',
      issueType: 'screen_reader' as const,
      severity: '3_medium' as const,
      expectedResult:
        'Link text should be descriptive and indicate the purpose or destination of the link',
      actualResult:
        'Multiple links use generic text like "click here", "more info", "read more"',
      failedWcagCriteria: ['2.4.4'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/NVDA 2023.3',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'NVDA 2023.3',
      devStatus: 'not_started' as const,
      qaStatus: 'not_started' as const
    },
    {
      issueTitle: 'Content not responsive at 200% zoom',
      issueDescription:
        'When browser zoom is increased to 200%, content becomes difficult to use with horizontal scrolling required.',
      issueType: 'browser_zoom' as const,
      severity: '3_medium' as const,
      expectedResult:
        'Content should reflow properly at 200% zoom without requiring horizontal scrolling',
      actualResult:
        'At 200% zoom, horizontal scrolling is required and some content is cut off',
      failedWcagCriteria: ['1.4.4', '1.4.10'],
      conformanceLevel: 'AA' as const,
      testingEnvironment: 'Windows 11/Chrome 120/200% Zoom',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'Browser Zoom',
      devStatus: 'not_started' as const,
      qaStatus: 'not_started' as const
    },
    // Low Priority Issues
    {
      issueTitle: 'Skip navigation link missing',
      issueDescription:
        'Page lacks a skip navigation link, making it tedious for keyboard users to navigate past repetitive content.',
      issueType: 'keyboard_navigation' as const,
      severity: '4_low' as const,
      expectedResult:
        'Page should include a skip navigation link to allow users to bypass repetitive content',
      actualResult: 'No skip navigation link is present on the page',
      failedWcagCriteria: ['2.4.1'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/Keyboard Only',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'Keyboard Only',
      devStatus: 'done' as const,
      qaStatus: 'verified' as const,
      devComments: 'Added skip navigation link to main content',
      qaComments: 'Skip link works correctly and is properly positioned'
    },
    {
      issueTitle: 'Language not specified',
      issueDescription:
        'The page language is not specified in the HTML, which may cause screen readers to use incorrect pronunciation.',
      issueType: 'screen_reader' as const,
      severity: '4_low' as const,
      expectedResult:
        'Page should specify the primary language using the lang attribute on the html element',
      actualResult: 'No lang attribute is present on the html element',
      failedWcagCriteria: ['3.1.1'],
      conformanceLevel: 'A' as const,
      testingEnvironment: 'Windows 11/Chrome 120/NVDA 2023.3',
      browser: 'Chrome 120',
      operatingSystem: 'Windows 11',
      assistiveTechnology: 'NVDA 2023.3',
      devStatus: 'done' as const,
      qaStatus: 'verified' as const,
      devComments: 'Added lang="en" to html element',
      qaComments: 'Language is properly specified'
    }
  ];

  // Generate issues for each project and URL combination
  const issueData = [];

  for (let i = 0; i < projectIds.length; i++) {
    const projectId = projectIds[i];
    const projectUrls = urlIds.slice(i * 5, (i + 1) * 5); // 5 URLs per project

    // Add 8-12 issues per project with variety
    const numIssues = 8 + Math.floor(Math.random() * 5); // 8-12 issues

    for (let j = 0; j < numIssues; j++) {
      const template = issueTemplates[j % issueTemplates.length];
      const urlId = projectUrls[j % projectUrls.length];
      const testingDate = randomDate(
        new Date('2024-01-01'),
        new Date('2024-06-01')
      );

      issueData.push({
        projectId,
        urlId,
        issueTitle: `${template.issueTitle} - Issue ${j + 1}`,
        issueDescription: template.issueDescription,
        issueType: template.issueType,
        severity: template.severity,
        testingMonth: testingDate.toLocaleString('default', { month: 'long' }),
        testingYear: testingDate.getFullYear(),
        testingEnvironment: template.testingEnvironment,
        browser: template.browser,
        operatingSystem: template.operatingSystem,
        assistiveTechnology: template.assistiveTechnology,
        expectedResult: template.expectedResult,
        actualResult: template.actualResult,
        failedWcagCriteria: template.failedWcagCriteria,
        conformanceLevel: template.conformanceLevel,
        devStatus: template.devStatus,
        qaStatus: template.qaStatus,
        devComments: template.devComments,
        qaComments: template.qaComments,
        discoveredAt: testingDate,
        devStartedAt:
          template.devStatus !== 'not_started'
            ? randomDate(testingDate, new Date())
            : null,
        devCompletedAt:
          template.devStatus === 'done'
            ? randomDate(testingDate, new Date())
            : null,
        qaStartedAt:
          template.qaStatus !== 'not_started'
            ? randomDate(testingDate, new Date())
            : null,
        qaCompletedAt:
          template.qaStatus === 'verified'
            ? randomDate(testingDate, new Date())
            : null,
        resolvedAt:
          template.qaStatus === 'verified'
            ? randomDate(testingDate, new Date())
            : null,
        isActive: true,
        isDuplicate: Math.random() < 0.1, // 10% chance of being duplicate
        importBatchId: `batch_${i + 1}_2024`,
        sourceFileName: `accessibility_audit_project_${i + 1}.xlsx`
      });
    }
  }

  const insertedIssues = await db
    .insert(accessibilityIssues)
    .values(issueData)
    .returning();
  console.log(`✅ Seeded ${insertedIssues.length} accessibility issues`);
  return insertedIssues;
}

// Seed issue comments
async function seedIssueComments(issueIds: string[]) {
  console.log('💬 Seeding issue comments...');

  const commentTemplates = [
    {
      commentText:
        'Initial assessment completed. This issue affects multiple pages and should be prioritized.',
      commentType: 'general' as const,
      authorName: 'Alex Johnson',
      authorRole: 'accessibility_expert' as const
    },
    {
      commentText:
        'Started working on this issue. Estimated completion by end of week.',
      commentType: 'dev_update' as const,
      authorName: 'Sarah Developer',
      authorRole: 'developer' as const
    },
    {
      commentText:
        'Testing completed. Issue has been resolved and meets WCAG requirements.',
      commentType: 'qa_feedback' as const,
      authorName: 'Mike Tester',
      authorRole: 'qa_tester' as const
    },
    {
      commentText:
        'Client has requested additional documentation for this fix.',
      commentType: 'general' as const,
      authorName: 'Lisa Manager',
      authorRole: 'project_manager' as const
    },
    {
      commentText:
        'Technical implementation note: Used ARIA labels to provide proper context.',
      commentType: 'technical_note' as const,
      authorName: 'Sarah Developer',
      authorRole: 'developer' as const
    }
  ];

  const commentData = issueIds.flatMap((issueId) => {
    const numComments = Math.floor(Math.random() * 4); // 0-3 comments per issue
    const comments = [];

    for (let i = 0; i < numComments; i++) {
      const template = commentTemplates[i % commentTemplates.length];
      comments.push({
        issueId,
        commentText: template.commentText,
        commentType: template.commentType,
        authorName: template.authorName,
        authorRole: template.authorRole
      });
    }

    return comments;
  });

  if (commentData.length > 0) {
    await db.insert(issueComments).values(commentData);
    console.log(`✅ Seeded ${commentData.length} issue comments`);
  }
}

// Seed tickets (keeping existing functionality)
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
        wcagCriteria: WCAG_CRITERIA.slice(0, 3), // Use first 3 criteria
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

// Main enhanced seed function
export async function enhancedSeed() {
  try {
    console.log('🌱 Starting enhanced database seeding...');

    // Clear existing data
    await clearDatabase();

    // Seed data in order of dependencies
    const clients = await seedClients();
    const clientIds = clients.map((c) => c.id);

    const projects = await seedProjects(clientIds);
    const projectIds = projects.map((p) => p.id);

    const urls = await seedTestUrls(projectIds);
    const urlIds = urls.map((u) => u.id);

    const issues = await seedAccessibilityIssues(projectIds, urlIds);
    const issueIds = issues.map((i) => i.id);

    await seedIssueComments(issueIds);

    const tickets = await seedTickets(projectIds);

    console.log('🎉 Enhanced database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${clients.length} clients`);
    console.log(`   • ${projects.length} projects`);
    console.log(`   • ${urls.length} test URLs`);
    console.log(`   • ${issues.length} accessibility issues`);
    console.log(`   • ${tickets.length} tickets`);

    // Show issue breakdown by severity
    const criticalIssues = issues.filter(
      (i) => i.severity === '1_critical'
    ).length;
    const highIssues = issues.filter((i) => i.severity === '2_high').length;
    const mediumIssues = issues.filter((i) => i.severity === '3_medium').length;
    const lowIssues = issues.filter((i) => i.severity === '4_low').length;

    console.log('\n🐛 Issue Breakdown:');
    console.log(`   • ${criticalIssues} critical issues`);
    console.log(`   • ${highIssues} high priority issues`);
    console.log(`   • ${mediumIssues} medium priority issues`);
    console.log(`   • ${lowIssues} low priority issues`);
  } catch (error) {
    console.error('❌ Enhanced database seeding failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  enhancedSeed()
    .then(() => {
      console.log('✅ Enhanced seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Enhanced seeding failed:', error);
      process.exit(1);
    });
}
