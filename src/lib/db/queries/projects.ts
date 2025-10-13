import { eq, desc, asc, and, count, or, like, sql } from 'drizzle-orm';
import { db } from '../index';
import {
  projects,
  projectMilestones,
  projectDevelopers,
  projectTimeEntries,
  projectDocuments,
  projectActivities,
  projectStagingCredentials,
  type Project,
  type NewProject
} from '../schema/projects';
import { clients } from '../schema/clients';
import { accessibilityIssues, testUrls } from '../schema/accessibility';

// Project queries with enhanced data
export async function getAllProjects(options?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const { page = 1, limit = 50, status, search } = options || {};

  // Apply filters
  const conditions = [];

  if (status) {
    conditions.push(eq(projects.status, status as any));
  }

  if (search) {
    conditions.push(
      or(
        like(projects.name, `%${search}%`),
        like(projects.description, `%${search}%`)
      )
    );
  }

  // Get projects with client information and issue counts
  const query = db
    .select({
      project: projects,
      client: {
        id: clients.id,
        name: clients.name,
        company: clients.company,
        email: clients.email
      },
      issueCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${accessibilityIssues} 
        WHERE ${accessibilityIssues.projectId} = ${projects.id}
      ), 0)`.as('issue_count'),
      criticalIssueCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${accessibilityIssues} 
        WHERE ${accessibilityIssues.projectId} = ${projects.id} 
        AND ${accessibilityIssues.severity} = '1_critical'
      ), 0)`.as('critical_issue_count')
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id));

  const finalQuery =
    conditions.length > 0
      ? query.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        )
      : query;

  // Get total count for pagination
  const countQuery = db
    .select({ count: count() })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id));

  const finalCountQuery =
    conditions.length > 0
      ? countQuery.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        )
      : countQuery;

  const [{ count: total }] = await finalCountQuery;

  // Apply pagination and ordering
  const offset = (page - 1) * limit;
  const projectsResult = await finalQuery
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    projects: projectsResult.map((row) => ({
      ...row.project,
      client: row.client,
      issueCount: row.issueCount,
      criticalIssueCount: row.criticalIssueCount
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getProjectById(id: string) {
  const result = await db
    .select({
      project: projects,
      client: {
        id: clients.id,
        name: clients.name,
        company: clients.company,
        email: clients.email
      },
      issueCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${accessibilityIssues} 
        WHERE ${accessibilityIssues.projectId} = ${projects.id}
      ), 0)`.as('issue_count'),
      criticalIssueCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${accessibilityIssues} 
        WHERE ${accessibilityIssues.projectId} = ${projects.id} 
        AND ${accessibilityIssues.severity} = '1_critical'
      ), 0)`.as('critical_issue_count')
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    ...row.project,
    client: row.client,
    issueCount: row.issueCount,
    criticalIssueCount: row.criticalIssueCount
  };
}

export async function getProjectsByClient(clientId: string) {
  const result = await db
    .select({
      project: projects,
      client: {
        id: clients.id,
        name: clients.name,
        company: clients.company,
        email: clients.email
      },
      issueCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${accessibilityIssues} 
        WHERE ${accessibilityIssues.projectId} = ${projects.id}
      ), 0)`.as('issue_count'),
      criticalIssueCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${accessibilityIssues} 
        WHERE ${accessibilityIssues.projectId} = ${projects.id} 
        AND ${accessibilityIssues.severity} = '1_critical'
      ), 0)`.as('critical_issue_count')
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.createdAt));

  return result.map((row) => ({
    ...row.project,
    client: row.client,
    issueCount: row.issueCount,
    criticalIssueCount: row.criticalIssueCount
  }));
}

export async function createProject(project: NewProject) {
  const result = await db.insert(projects).values(project).returning();
  return result[0];
}

export async function updateProject(id: string, updates: Partial<NewProject>) {
  const result = await db
    .update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteProject(id: string) {
  const result = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning();
  return result[0] || null;
}

export async function getProjectsByStatus(status: Project['status']) {
  return await db
    .select()
    .from(projects)
    .where(eq(projects.status, status))
    .orderBy(desc(projects.createdAt));
}

// Project milestones queries
export async function getProjectMilestones(projectId: string) {
  return await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId))
    .orderBy(asc(projectMilestones.order), asc(projectMilestones.dueDate));
}

export async function createProjectMilestone(
  milestone: typeof projectMilestones.$inferInsert
) {
  const result = await db
    .insert(projectMilestones)
    .values(milestone)
    .returning();
  return result[0];
}

export async function updateProjectMilestone(
  id: string,
  updates: Partial<typeof projectMilestones.$inferInsert>
) {
  const result = await db
    .update(projectMilestones)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projectMilestones.id, id))
    .returning();
  return result[0];
}

export async function deleteProjectMilestone(id: string) {
  await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
}

// Project developers queries
export async function getProjectDevelopers(projectId: string) {
  return await db
    .select()
    .from(projectDevelopers)
    .where(eq(projectDevelopers.projectId, projectId))
    .orderBy(desc(projectDevelopers.assignedAt));
}

export async function createProjectDeveloper(
  developer: typeof projectDevelopers.$inferInsert
) {
  const result = await db
    .insert(projectDevelopers)
    .values(developer)
    .returning();
  return result[0];
}

export async function updateProjectDeveloper(
  id: string,
  updates: Partial<typeof projectDevelopers.$inferInsert>
) {
  const result = await db
    .update(projectDevelopers)
    .set(updates)
    .where(eq(projectDevelopers.id, id))
    .returning();
  return result[0];
}

export async function deleteProjectDeveloper(id: string) {
  await db.delete(projectDevelopers).where(eq(projectDevelopers.id, id));
}

// Project time entries queries
export async function getProjectTimeEntries(
  projectId: string,
  options?: {
    developerId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) {
  const {
    developerId,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = options || {};

  const conditions = [eq(projectTimeEntries.projectId, projectId)];

  if (developerId) {
    conditions.push(eq(projectTimeEntries.developerId, developerId));
  }

  if (startDate) {
    conditions.push(sql`${projectTimeEntries.date} >= ${startDate}`);
  }

  if (endDate) {
    conditions.push(sql`${projectTimeEntries.date} <= ${endDate}`);
  }

  const offset = (page - 1) * limit;

  return await db
    .select()
    .from(projectTimeEntries)
    .where(and(...conditions))
    .orderBy(desc(projectTimeEntries.date))
    .limit(limit)
    .offset(offset);
}

export async function createProjectTimeEntry(
  timeEntry: typeof projectTimeEntries.$inferInsert
) {
  const result = await db
    .insert(projectTimeEntries)
    .values(timeEntry)
    .returning();
  return result[0];
}

export async function updateProjectTimeEntry(
  id: string,
  updates: Partial<typeof projectTimeEntries.$inferInsert>
) {
  const result = await db
    .update(projectTimeEntries)
    .set(updates)
    .where(eq(projectTimeEntries.id, id))
    .returning();
  return result[0];
}

export async function deleteProjectTimeEntry(id: string) {
  await db.delete(projectTimeEntries).where(eq(projectTimeEntries.id, id));
}

// Project documents queries
export async function getProjectDocuments(projectId: string) {
  return await db
    .select()
    .from(projectDocuments)
    .where(eq(projectDocuments.projectId, projectId))
    .orderBy(desc(projectDocuments.uploadedAt));
}

export async function createProjectDocument(
  document: typeof projectDocuments.$inferInsert
) {
  const result = await db.insert(projectDocuments).values(document).returning();
  return result[0];
}

export async function updateProjectDocument(
  id: string,
  updates: Partial<typeof projectDocuments.$inferInsert>
) {
  const result = await db
    .update(projectDocuments)
    .set(updates)
    .where(eq(projectDocuments.id, id))
    .returning();
  return result[0];
}

export async function deleteProjectDocument(id: string) {
  await db.delete(projectDocuments).where(eq(projectDocuments.id, id));
}

// Project activities queries
export async function getProjectActivities(
  projectId: string,
  options?: {
    page?: number;
    limit?: number;
  }
) {
  const { page = 1, limit = 50 } = options || {};
  const offset = (page - 1) * limit;

  return await db
    .select()
    .from(projectActivities)
    .where(eq(projectActivities.projectId, projectId))
    .orderBy(desc(projectActivities.timestamp))
    .limit(limit)
    .offset(offset);
}

export async function createProjectActivity(
  activity: typeof projectActivities.$inferInsert
) {
  const result = await db
    .insert(projectActivities)
    .values(activity)
    .returning();
  return result[0];
}

// Project staging credentials queries
export async function getProjectStagingCredentials(projectId: string) {
  return await db
    .select()
    .from(projectStagingCredentials)
    .where(eq(projectStagingCredentials.projectId, projectId))
    .orderBy(desc(projectStagingCredentials.createdAt));
}

export async function createProjectStagingCredential(
  credential: typeof projectStagingCredentials.$inferInsert
) {
  const result = await db
    .insert(projectStagingCredentials)
    .values(credential)
    .returning();
  return result[0];
}

export async function updateProjectStagingCredential(
  id: string,
  updates: Partial<typeof projectStagingCredentials.$inferInsert>
) {
  const result = await db
    .update(projectStagingCredentials)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projectStagingCredentials.id, id))
    .returning();
  return result[0];
}

export async function deleteProjectStagingCredential(id: string) {
  await db
    .delete(projectStagingCredentials)
    .where(eq(projectStagingCredentials.id, id));
}

// Alias functions for API compatibility
export const getStagingCredentialsById = async (id: string) => {
  const result = await db
    .select()
    .from(projectStagingCredentials)
    .where(eq(projectStagingCredentials.id, id))
    .limit(1);
  return result[0] || null;
};

export const createStagingCredentials = createProjectStagingCredential;
export const updateStagingCredentials = updateProjectStagingCredential;
export const deleteStagingCredentials = deleteProjectStagingCredential;

// Project accessibility data queries
export async function getProjectAccessibilityIssues(
  projectId: string,
  options?: {
    severity?: string;
    issueType?: string;
    devStatus?: string;
    qaStatus?: string;
    page?: number;
    limit?: number;
  }
) {
  const {
    severity,
    issueType,
    devStatus,
    qaStatus,
    page = 1,
    limit = 50
  } = options || {};

  const conditions = [eq(accessibilityIssues.projectId, projectId)];

  if (severity) {
    conditions.push(eq(accessibilityIssues.severity, severity as any));
  }

  if (issueType) {
    conditions.push(eq(accessibilityIssues.issueType, issueType as any));
  }

  if (devStatus) {
    conditions.push(eq(accessibilityIssues.devStatus, devStatus as any));
  }

  if (qaStatus) {
    conditions.push(eq(accessibilityIssues.qaStatus, qaStatus as any));
  }

  const offset = (page - 1) * limit;

  return await db
    .select({
      issue: accessibilityIssues,
      testUrl: testUrls
    })
    .from(accessibilityIssues)
    .leftJoin(testUrls, eq(accessibilityIssues.urlId, testUrls.id))
    .where(and(...conditions))
    .orderBy(desc(accessibilityIssues.updatedAt))
    .limit(limit)
    .offset(offset);
}

export async function getProjectTestUrls(projectId: string) {
  return await db
    .select()
    .from(testUrls)
    .where(eq(testUrls.projectId, projectId))
    .orderBy(asc(testUrls.url));
}
