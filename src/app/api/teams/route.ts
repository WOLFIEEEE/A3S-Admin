import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers } from '@/lib/db/schema/teams';
import { eq, desc, like, and, or } from 'drizzle-orm';
import { z } from 'zod';

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  teamType: z.enum(['internal', 'external']),
  managerId: z.string().uuid().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamType = searchParams.get('teamType');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    const conditions = [];

    if (teamType) {
      conditions.push(eq(teams.teamType, teamType as any));
    }

    if (search) {
      conditions.push(
        or(
          like(teams.name, `%${search}%`),
          like(teams.description, `%${search}%`)
        )
      );
    }

    // Build and execute query
    const baseQuery = db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        teamType: teams.teamType,
        managerId: teams.managerId,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt
      })
      .from(teams);

    const allTeams =
      conditions.length > 0
        ? await baseQuery
            .where(and(...conditions))
            .orderBy(desc(teams.createdAt))
            .limit(limit)
            .offset(offset)
        : await baseQuery
            .orderBy(desc(teams.createdAt))
            .limit(limit)
            .offset(offset);

    // Get member counts for each team
    const teamsWithCounts = await Promise.all(
      allTeams.map(async (team) => {
        const memberCount = await db
          .select({ count: teamMembers.id })
          .from(teamMembers)
          .where(
            and(eq(teamMembers.teamId, team.id), eq(teamMembers.isActive, true))
          );

        return {
          ...team,
          memberCount: memberCount.length
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        teams: teamsWithCounts,
        total: teamsWithCounts.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    const [newTeam] = await db
      .insert(teams)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        teamType: validatedData.teamType,
        managerId: validatedData.managerId
      })
      .returning();

    return NextResponse.json({ success: true, data: newTeam }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
