import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teamMembers, teams } from '@/lib/db/schema/teams';
import { eq, and } from 'drizzle-orm';
import { OrganizationChartNode } from '@/types/team';

export async function GET() {
  try {
    // Get all active team members with their team information
    const allMembers = await db
      .select({
        id: teamMembers.id,
        firstName: teamMembers.firstName,
        lastName: teamMembers.lastName,
        email: teamMembers.email,
        role: teamMembers.role,
        title: teamMembers.title,
        reportsToId: teamMembers.reportsToId,
        profileImageUrl: teamMembers.profileImageUrl,
        teamName: teams.name,
        teamType: teams.teamType
      })
      .from(teamMembers)
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(and(eq(teamMembers.isActive, true), eq(teams.isActive, true)));

    // Find the CEO (top of the hierarchy)
    const ceo = allMembers.find((member) => member.role === 'ceo');

    if (!ceo) {
      // If no CEO exists, create a default one (Jason McKee)
      const defaultCEO: OrganizationChartNode = {
        id: 'default-ceo',
        firstName: 'Jason',
        lastName: 'McKee',
        fullName: 'Jason McKee',
        title: 'Chief Executive Officer',
        role: 'ceo',
        email: 'jason.mckee@company.com',
        teamName: 'Executive',
        teamType: 'internal',
        children: buildOrganizationTree(allMembers, null),
        level: 0
      };

      return NextResponse.json({
        success: true,
        data: defaultCEO
      });
    }

    // Build the organization tree starting from the CEO
    const organizationTree = buildOrganizationTree(allMembers, ceo.id);

    const ceoNode: OrganizationChartNode = {
      id: ceo.id,
      firstName: ceo.firstName,
      lastName: ceo.lastName,
      fullName: `${ceo.firstName} ${ceo.lastName}`,
      title: ceo.title || 'Chief Executive Officer',
      role: ceo.role,
      email: ceo.email,
      teamName: ceo.teamName || 'Executive',
      teamType: ceo.teamType || 'internal',
      profileImageUrl: ceo.profileImageUrl || undefined,
      children: organizationTree,
      level: 0
    };

    return NextResponse.json({
      success: true,
      data: ceoNode
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization chart' },
      { status: 500 }
    );
  }
}

function buildOrganizationTree(
  allMembers: any[],
  parentId: string | null
): OrganizationChartNode[] {
  const children = allMembers.filter(
    (member) => member.reportsToId === parentId
  );

  return children.map((member) => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: `${member.firstName} ${member.lastName}`,
    title: member.title || getRoleTitle(member.role),
    role: member.role,
    email: member.email,
    teamName: member.teamName || 'Unassigned',
    teamType: member.teamType || 'internal',
    profileImageUrl: member.profileImageUrl || undefined,
    children: buildOrganizationTree(allMembers, member.id),
    level: 1 // This could be calculated based on depth, but for now setting to 1
  }));
}

function getRoleTitle(role: string): string {
  const roleTitles: Record<string, string> = {
    ceo: 'Chief Executive Officer',
    manager: 'Manager',
    team_lead: 'Team Lead',
    project_manager: 'Project Manager',
    senior_developer: 'Senior Developer',
    developer: 'Developer',
    junior_developer: 'Junior Developer',
    designer: 'Designer',
    qa_engineer: 'QA Engineer',
    business_analyst: 'Business Analyst',
    consultant: 'Consultant',
    contractor: 'Contractor'
  };

  return (
    roleTitles[role] ||
    role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
}
