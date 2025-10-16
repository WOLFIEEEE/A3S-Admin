import { db } from '@/lib/db';
import {
  accessibilityIssues,
  testUrls,
  issueComments,
  projects
} from '@/lib/db/schema';
import { eq, desc, asc, and, or, like, inArray, count } from 'drizzle-orm';
// import sql
import type {
  AccessibilityIssue,
  IssueComment,
  TestUrl
} from '@/lib/db/schema';

export interface IssueWithRelations extends AccessibilityIssue {
  project?: {
    id: string;
    name: string;
    clientId: string;
  };
  testUrl?: TestUrl;
  comments?: IssueComment[];
  duplicateOf?: AccessibilityIssue;
  duplicates?: AccessibilityIssue[];
}

export interface IssuesFilters {
  projectId?: string;
  issueType?: string[];
  severity?: string[];
  devStatus?: string[];
  qaStatus?: string[];
  conformanceLevel?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'severity' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getIssues(filters: IssuesFilters = {}) {
  const {
    projectId,
    issueType,
    severity,
    devStatus,
    qaStatus,
    conformanceLevel,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50
  } = filters;

  // Build conditions array
  const conditions = [];

  if (projectId) {
    conditions.push(eq(accessibilityIssues.projectId, projectId));
  }

  if (issueType && issueType.length > 0) {
    conditions.push(inArray(accessibilityIssues.issueType, issueType as any));
  }

  if (severity && severity.length > 0) {
    conditions.push(inArray(accessibilityIssues.severity, severity as any));
  }

  if (devStatus && devStatus.length > 0) {
    conditions.push(inArray(accessibilityIssues.devStatus, devStatus as any));
  }

  if (qaStatus && qaStatus.length > 0) {
    conditions.push(inArray(accessibilityIssues.qaStatus, qaStatus as any));
  }

  if (conformanceLevel && conformanceLevel.length > 0) {
    conditions.push(
      inArray(accessibilityIssues.conformanceLevel, conformanceLevel as any)
    );
  }

  if (search) {
    conditions.push(
      or(
        like(accessibilityIssues.issueTitle, `%${search}%`),
        like(accessibilityIssues.issueDescription, `%${search}%`)
      )
    );
  }

  // Build the query with all conditions at once
  const query = db
    .select({
      issue: accessibilityIssues,
      project: {
        id: projects.id,
        name: projects.name,
        clientId: projects.clientId
      },
      testUrl: testUrls
    })
    .from(accessibilityIssues)
    .leftJoin(projects, eq(accessibilityIssues.projectId, projects.id))
    .leftJoin(testUrls, eq(accessibilityIssues.urlId, testUrls.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      sortBy === 'title'
        ? sortOrder === 'asc'
          ? asc(accessibilityIssues.issueTitle)
          : desc(accessibilityIssues.issueTitle)
        : sortOrder === 'asc'
          ? asc(accessibilityIssues.createdAt)
          : desc(accessibilityIssues.createdAt)
    )
    .limit(limit)
    .offset((page - 1) * limit);

  const results = await query;

  // Get total count for pagination
  const countQuery = db
    .select({ count: count() })
    .from(accessibilityIssues)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const [{ count: total }] = await countQuery;

  return {
    issues: results.map((row) => ({
      ...row.issue,
      project: row.project,
      testUrl: row.testUrl
    })) as IssueWithRelations[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getIssueById(
  issueId: string
): Promise<IssueWithRelations | null> {
  const results = await db
    .select({
      issue: accessibilityIssues,
      project: {
        id: projects.id,
        name: projects.name,
        clientId: projects.clientId
      },
      testUrl: testUrls
    })
    .from(accessibilityIssues)
    .leftJoin(projects, eq(accessibilityIssues.projectId, projects.id))
    .leftJoin(testUrls, eq(accessibilityIssues.urlId, testUrls.id))
    .where(eq(accessibilityIssues.id, issueId))
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const result = results[0];

  // Get comments for this issue
  const comments = await db
    .select()
    .from(issueComments)
    .where(eq(issueComments.issueId, issueId))
    .orderBy(desc(issueComments.createdAt));

  // Get duplicate issues
  const duplicates = await db
    .select()
    .from(accessibilityIssues)
    .where(eq(accessibilityIssues.duplicateOfId, issueId));

  // Get the issue this is a duplicate of (if any)
  let duplicateOf = null;
  if (result.issue.duplicateOfId) {
    const duplicateOfResults = await db
      .select()
      .from(accessibilityIssues)
      .where(eq(accessibilityIssues.id, result.issue.duplicateOfId))
      .limit(1);

    if (duplicateOfResults.length > 0) {
      duplicateOf = duplicateOfResults[0];
    }
  }

  return {
    ...result.issue,
    project: result.project || undefined,
    testUrl: result.testUrl || undefined,
    comments,
    duplicates,
    duplicateOf: duplicateOf || undefined
  };
}

export async function updateIssueStatus(
  issueId: string,
  updates: {
    devStatus?: string;
    qaStatus?: string;
    devNotes?: string;
    qaNotes?: string;
  }
) {
  const updateData: any = {
    ...updates,
    updatedAt: new Date()
  };

  const [updatedIssue] = await db
    .update(accessibilityIssues)
    .set(updateData)
    .where(eq(accessibilityIssues.id, issueId))
    .returning();

  return updatedIssue;
}

export async function addIssueComment(
  issueId: string,
  comment: {
    commentText: string;
    commentType:
      | 'general'
      | 'dev_update'
      | 'qa_feedback'
      | 'technical_note'
      | 'resolution';
    authorName?: string;
    authorRole?:
      | 'developer'
      | 'qa_tester'
      | 'accessibility_expert'
      | 'project_manager'
      | 'client';
  }
) {
  const [newComment] = await db
    .insert(issueComments)
    .values({
      issueId,
      commentText: comment.commentText,
      commentType: comment.commentType,
      authorName: comment.authorName,
      authorRole: comment.authorRole
    })
    .returning();

  return newComment;
}

export async function getIssueStats() {
  const stats = await db
    .select({
      total: count(),
      issueType: accessibilityIssues.issueType,
      severity: accessibilityIssues.severity,
      devStatus: accessibilityIssues.devStatus,
      qaStatus: accessibilityIssues.qaStatus
    })
    .from(accessibilityIssues)
    .groupBy(
      accessibilityIssues.issueType,
      accessibilityIssues.severity,
      accessibilityIssues.devStatus,
      accessibilityIssues.qaStatus
    );

  return stats;
}

export async function searchIssues(searchTerm: string, limit = 10) {
  const results = await db
    .select({
      issue: accessibilityIssues,
      project: {
        id: projects.id,
        name: projects.name
      }
    })
    .from(accessibilityIssues)
    .leftJoin(projects, eq(accessibilityIssues.projectId, projects.id))
    .where(
      or(
        like(accessibilityIssues.issueTitle, `%${searchTerm}%`),
        like(accessibilityIssues.issueDescription, `%${searchTerm}%`)
      )
    )
    .limit(limit)
    .orderBy(desc(accessibilityIssues.updatedAt));

  return results.map((row) => ({
    ...row.issue,
    project: row.project
  }));
}
