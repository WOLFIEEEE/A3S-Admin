import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teamMembers, teams } from '@/lib/db/schema/teams';
import { eq, desc, like, and, or } from 'drizzle-orm';
import { z } from 'zod';

const createTeamMemberSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum([
    'ceo',
    'manager',
    'team_lead',
    'senior_developer',
    'developer',
    'junior_developer',
    'designer',
    'qa_engineer',
    'project_manager',
    'business_analyst',
    'consultant',
    'contractor'
  ]),
  title: z.string().optional(),
  department: z.string().optional(),
  reportsToId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  hourlyRate: z.number().min(0).optional(),
  salary: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const role = searchParams.get('role');
    const employmentStatus = searchParams.get('employmentStatus');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    const conditions = [];

    if (teamId) {
      conditions.push(eq(teamMembers.teamId, teamId));
    }

    if (role) {
      conditions.push(eq(teamMembers.role, role as any));
    }

    if (employmentStatus) {
      conditions.push(
        eq(teamMembers.employmentStatus, employmentStatus as any)
      );
    }

    if (search) {
      conditions.push(
        or(
          like(teamMembers.firstName, `%${search}%`),
          like(teamMembers.lastName, `%${search}%`),
          like(teamMembers.email, `%${search}%`),
          like(teamMembers.title, `%${search}%`)
        )
      );
    }

    // Build and execute query
    const baseQuery = db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        firstName: teamMembers.firstName,
        lastName: teamMembers.lastName,
        email: teamMembers.email,
        phone: teamMembers.phone,
        role: teamMembers.role,
        title: teamMembers.title,
        department: teamMembers.department,
        reportsToId: teamMembers.reportsToId,
        employmentStatus: teamMembers.employmentStatus,
        startDate: teamMembers.startDate,
        endDate: teamMembers.endDate,
        hourlyRate: teamMembers.hourlyRate,
        salary: teamMembers.salary,
        skills: teamMembers.skills,
        bio: teamMembers.bio,
        profileImageUrl: teamMembers.profileImageUrl,
        linkedinUrl: teamMembers.linkedinUrl,
        githubUrl: teamMembers.githubUrl,
        isActive: teamMembers.isActive,
        createdAt: teamMembers.createdAt,
        updatedAt: teamMembers.updatedAt,
        teamName: teams.name,
        teamType: teams.teamType
      })
      .from(teamMembers)
      .leftJoin(teams, eq(teamMembers.teamId, teams.id));

    const members =
      conditions.length > 0
        ? await baseQuery
            .where(and(...conditions))
            .orderBy(desc(teamMembers.createdAt))
            .limit(limit)
            .offset(offset)
        : await baseQuery
            .orderBy(desc(teamMembers.createdAt))
            .limit(limit)
            .offset(offset);

    // Parse skills JSON for each member
    const membersWithParsedSkills = members.map((member) => ({
      ...member,
      skills: member.skills ? JSON.parse(member.skills) : [],
      fullName: `${member.firstName} ${member.lastName}`
    }));

    return NextResponse.json({
      success: true,
      data: {
        members: membersWithParsedSkills,
        total: membersWithParsedSkills.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTeamMemberSchema.parse(body);

    // Check if email already exists
    const existingMember = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.email, validatedData.email))
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.id, validatedData.teamId))
      .limit(1);

    if (team.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // If reportsToId is provided, verify the manager exists
    if (validatedData.reportsToId) {
      const manager = await db
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(eq(teamMembers.id, validatedData.reportsToId))
        .limit(1);

      if (manager.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Manager not found' },
          { status: 404 }
        );
      }
    }

    const [newMember] = await db
      .insert(teamMembers)
      .values({
        teamId: validatedData.teamId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        role: validatedData.role,
        title: validatedData.title,
        department: validatedData.department,
        reportsToId: validatedData.reportsToId,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        hourlyRate: validatedData.hourlyRate,
        salary: validatedData.salary,
        skills: validatedData.skills
          ? JSON.stringify(validatedData.skills)
          : null,
        bio: validatedData.bio,
        profileImageUrl: validatedData.profileImageUrl,
        linkedinUrl: validatedData.linkedinUrl,
        githubUrl: validatedData.githubUrl
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newMember },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
