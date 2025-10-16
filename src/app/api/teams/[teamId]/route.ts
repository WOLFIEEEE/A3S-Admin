import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, teamMembers } from '@/lib/db/schema/teams';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').optional(),
  description: z.string().optional(),
  teamType: z.enum(['internal', 'external']).optional(),
  managerId: z.string().uuid().optional(),
  isActive: z.boolean().optional()
});

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;

    // Get team details
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get team members
    const members = await db
      .select({
        id: teamMembers.id,
        firstName: teamMembers.firstName,
        lastName: teamMembers.lastName,
        email: teamMembers.email,
        role: teamMembers.role,
        title: teamMembers.title,
        department: teamMembers.department,
        employmentStatus: teamMembers.employmentStatus,
        isActive: teamMembers.isActive,
        profileImageUrl: teamMembers.profileImageUrl
      })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));

    const teamWithMembers = {
      ...team[0],
      members
    };

    return NextResponse.json({
      success: true,
      data: teamWithMembers
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const validatedData = updateTeamSchema.parse(body);

    const [updatedTeam] = await db
      .update(teams)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(teams.id, teamId))
      .returning();

    if (!updatedTeam) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTeam
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;

    // Check if team has active members
    const activeMembers = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(
        and(eq(teamMembers.teamId, teamId), eq(teamMembers.isActive, true))
      );

    if (activeMembers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete team with active members' },
        { status: 400 }
      );
    }

    const [deletedTeam] = await db
      .delete(teams)
      .where(eq(teams.id, teamId))
      .returning();

    if (!deletedTeam) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
