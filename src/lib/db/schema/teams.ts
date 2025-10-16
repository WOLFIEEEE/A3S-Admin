import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';

// Team type enum
export const teamTypeEnum = pgEnum('team_type', ['internal', 'external']);

// Employee role enum
export const employeeRoleEnum = pgEnum('employee_role', [
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
]);

// Employment status enum
export const employmentStatusEnum = pgEnum('employment_status', [
  'active',
  'inactive',
  'on_leave',
  'terminated'
]);

// Teams table
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  teamType: teamTypeEnum('team_type').notNull(),
  managerId: uuid('manager_id'), // References team_members.id
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Team members table
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  role: employeeRoleEnum('role').notNull(),
  title: varchar('title', { length: 255 }), // Job title like "Senior React Developer"
  department: varchar('department', { length: 100 }),
  reportsToId: uuid('reports_to_id'), // References team_members.id for hierarchy
  employmentStatus: employmentStatusEnum('employment_status')
    .default('active')
    .notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  hourlyRate: integer('hourly_rate'), // In cents for external contractors
  salary: integer('salary'), // Annual salary in cents for internal employees
  skills: text('skills'), // JSON array of skills
  bio: text('bio'),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  githubUrl: varchar('github_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Project team assignments table
export const projectTeamAssignments = pgTable('project_team_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  teamMemberId: uuid('team_member_id')
    .notNull()
    .references(() => teamMembers.id, { onDelete: 'cascade' }),
  role: varchar('project_role', { length: 100 }), // Role in this specific project
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  unassignedAt: timestamp('unassigned_at'),
  isActive: boolean('is_active').default(true).notNull()
});

// Relations
export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(teamMembers),
  manager: one(teamMembers, {
    fields: [teams.managerId],
    references: [teamMembers.id]
  }),
  projectAssignments: many(projectTeamAssignments)
}));

export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id]
  }),
  reportsTo: one(teamMembers, {
    fields: [teamMembers.reportsToId],
    references: [teamMembers.id],
    relationName: 'manager_subordinate'
  }),
  subordinates: many(teamMembers, {
    relationName: 'manager_subordinate'
  }),
  managedTeams: many(teams, {
    relationName: 'team_manager'
  }),
  projectAssignments: many(projectTeamAssignments)
}));

export const projectTeamAssignmentsRelations = relations(
  projectTeamAssignments,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTeamAssignments.projectId],
      references: [projects.id]
    }),
    teamMember: one(teamMembers, {
      fields: [projectTeamAssignments.teamMemberId],
      references: [teamMembers.id]
    })
  })
);

// Types
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ProjectTeamAssignment = typeof projectTeamAssignments.$inferSelect;
export type NewProjectTeamAssignment =
  typeof projectTeamAssignments.$inferInsert;

// Extended types with relations
export interface TeamWithMembers extends Team {
  members: TeamMember[];
  manager?: TeamMember;
}

export interface TeamMemberWithRelations extends TeamMember {
  team: Team;
  reportsTo?: TeamMember;
  subordinates: TeamMember[];
  projectAssignments: ProjectTeamAssignment[];
}

export interface OrganizationNode {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  role: string;
  email: string;
  teamName: string;
  teamType: 'internal' | 'external';
  profileImageUrl?: string;
  children: OrganizationNode[];
}
