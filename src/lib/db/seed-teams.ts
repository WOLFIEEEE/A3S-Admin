import { db } from './index';
import { teams, teamMembers } from './schema/teams';
import { eq } from 'drizzle-orm';

export async function seedTeams() {
  try {
    // Create Internal Team
    const [internalTeam] = await db
      .insert(teams)
      .values({
        name: 'A3S Internal Team',
        description: 'Core internal team members of A3S',
        teamType: 'internal',
        isActive: true
      })
      .returning();
    // Create External Team
    const [externalTeam] = await db
      .insert(teams)
      .values({
        name: 'External Contractors',
        description: 'External contractors and consultants',
        teamType: 'external',
        isActive: true
      })
      .returning();
    // Create CEO - Jason McKee
    const [ceo] = await db
      .insert(teamMembers)
      .values({
        teamId: internalTeam.id,
        firstName: 'Jason',
        lastName: 'McKee',
        email: 'jason.mckee@a3s.com',
        phone: '+1 (555) 123-4567',
        role: 'ceo',
        title: 'Chief Executive Officer',
        department: 'Executive',
        employmentStatus: 'active',
        startDate: new Date('2020-01-01'),
        salary: 25000000, // $250,000 in cents
        skills: JSON.stringify([
          'Leadership',
          'Strategy',
          'Business Development',
          'Accessibility Consulting'
        ]),
        bio: 'Visionary leader with over 15 years of experience in accessibility consulting and digital inclusion.',
        isActive: true
      })
      .returning();
    // Update internal team to have Jason as manager
    await db
      .update(teams)
      .set({ managerId: ceo.id })
      .where(eq(teams.id, internalTeam.id));

    // Create some managers and team leads
    const [techManager] = await db
      .insert(teamMembers)
      .values({
        teamId: internalTeam.id,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@a3s.com',
        phone: '+1 (555) 234-5678',
        role: 'manager',
        title: 'Technology Manager',
        department: 'Technology',
        reportsToId: ceo.id,
        employmentStatus: 'active',
        startDate: new Date('2021-03-15'),
        salary: 12000000, // $120,000 in cents
        skills: JSON.stringify([
          'Team Management',
          'Web Development',
          'WCAG',
          'Project Management'
        ]),
        bio: 'Experienced technology manager specializing in accessible web development.',
        isActive: true
      })
      .returning();

    const [qaManager] = await db
      .insert(teamMembers)
      .values({
        teamId: internalTeam.id,
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@a3s.com',
        phone: '+1 (555) 345-6789',
        role: 'manager',
        title: 'Quality Assurance Manager',
        department: 'Quality Assurance',
        reportsToId: ceo.id,
        employmentStatus: 'active',
        startDate: new Date('2021-06-01'),
        salary: 11000000, // $110,000 in cents
        skills: JSON.stringify([
          'Quality Assurance',
          'Accessibility Testing',
          'JAWS',
          'NVDA',
          'VoiceOver'
        ]),
        bio: 'QA expert with deep knowledge of assistive technologies and accessibility testing.',
        isActive: true
      })
      .returning();

    // Create team leads
    const [devTeamLead] = await db
      .insert(teamMembers)
      .values({
        teamId: internalTeam.id,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@a3s.com',
        phone: '+1 (555) 456-7890',
        role: 'team_lead',
        title: 'Senior Development Team Lead',
        department: 'Technology',
        reportsToId: techManager.id,
        employmentStatus: 'active',
        startDate: new Date('2022-01-10'),
        salary: 10500000, // $105,000 in cents
        skills: JSON.stringify([
          'React',
          'TypeScript',
          'Node.js',
          'ARIA',
          'Accessibility'
        ]),
        bio: 'Full-stack developer with expertise in building accessible web applications.',
        isActive: true
      })
      .returning();

    // Create developers
    const developers = [
      {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@a3s.com',
        role: 'senior_developer' as const,
        title: 'Senior Frontend Developer',
        reportsToId: devTeamLead.id,
        salary: 9500000, // $95,000
        skills: ['React', 'Vue.js', 'CSS', 'WCAG', 'Screen Readers']
      },
      {
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'lisa.thompson@a3s.com',
        role: 'developer' as const,
        title: 'Full Stack Developer',
        reportsToId: devTeamLead.id,
        salary: 8500000, // $85,000
        skills: ['JavaScript', 'Python', 'PostgreSQL', 'Accessibility APIs']
      },
      {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@a3s.com',
        role: 'junior_developer' as const,
        title: 'Junior Frontend Developer',
        reportsToId: devTeamLead.id,
        salary: 6500000, // $65,000
        skills: ['HTML', 'CSS', 'JavaScript', 'Learning ARIA']
      }
    ];

    for (const dev of developers) {
      const [newDev] = await db
        .insert(teamMembers)
        .values({
          teamId: internalTeam.id,
          firstName: dev.firstName,
          lastName: dev.lastName,
          email: dev.email,
          role: dev.role,
          title: dev.title,
          department: 'Technology',
          reportsToId: dev.reportsToId,
          employmentStatus: 'active',
          startDate: new Date('2022-06-01'),
          salary: dev.salary,
          skills: JSON.stringify(dev.skills),
          isActive: true
        })
        .returning();
    }

    // Create QA team
    const qaMembers = [
      {
        firstName: 'Anna',
        lastName: 'Martinez',
        email: 'anna.martinez@a3s.com',
        role: 'qa_engineer' as const,
        title: 'Senior QA Engineer',
        reportsToId: qaManager.id,
        salary: 8000000, // $80,000
        skills: [
          'Manual Testing',
          'Automated Testing',
          'JAWS',
          'NVDA',
          'Accessibility Auditing'
        ]
      },
      {
        firstName: 'Robert',
        lastName: 'Davis',
        email: 'robert.davis@a3s.com',
        role: 'qa_engineer' as const,
        title: 'QA Engineer',
        reportsToId: qaManager.id,
        salary: 7000000, // $70,000
        skills: [
          'Testing',
          'Bug Reporting',
          'Screen Reader Testing',
          'Color Contrast'
        ]
      }
    ];

    for (const qa of qaMembers) {
      const [newQA] = await db
        .insert(teamMembers)
        .values({
          teamId: internalTeam.id,
          firstName: qa.firstName,
          lastName: qa.lastName,
          email: qa.email,
          role: qa.role,
          title: qa.title,
          department: 'Quality Assurance',
          reportsToId: qa.reportsToId,
          employmentStatus: 'active',
          startDate: new Date('2022-04-01'),
          salary: qa.salary,
          skills: JSON.stringify(qa.skills),
          isActive: true
        })
        .returning();
    }

    // Create external contractors
    const contractors = [
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@contractor.com',
        role: 'consultant' as const,
        title: 'Accessibility Consultant',
        hourlyRate: 15000, // $150/hour in cents
        skills: [
          'WCAG Auditing',
          'Legal Compliance',
          'Training',
          'Documentation'
        ]
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@freelancer.com',
        role: 'contractor' as const,
        title: 'Frontend Contractor',
        hourlyRate: 12000, // $120/hour in cents
        skills: ['React', 'Angular', 'Accessibility Implementation', 'CSS']
      }
    ];

    for (const contractor of contractors) {
      const [newContractor] = await db
        .insert(teamMembers)
        .values({
          teamId: externalTeam.id,
          firstName: contractor.firstName,
          lastName: contractor.lastName,
          email: contractor.email,
          role: contractor.role,
          title: contractor.title,
          department: 'External',
          employmentStatus: 'active',
          startDate: new Date('2023-01-01'),
          hourlyRate: contractor.hourlyRate,
          skills: JSON.stringify(contractor.skills),
          isActive: true
        })
        .returning();
    }
  } catch (error) {
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedTeams()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}
