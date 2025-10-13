import { eq, desc, like, or, and, count, sql } from 'drizzle-orm';
import { db } from '../index';
import {
  clients,
  clientFiles,
  clientCredentials,
  type Client,
  type NewClient
} from '../schema/clients';
import { projects } from '../schema/projects';

// Client queries
export async function getAllClients(options?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const { page = 1, limit = 10, status, search } = options || {};

  // Apply filters
  const conditions = [];

  if (status) {
    conditions.push(eq(clients.status, status as any));
  }

  if (search) {
    conditions.push(
      or(
        like(clients.name, `%${search}%`),
        like(clients.email, `%${search}%`),
        like(clients.company, `%${search}%`)
      )
    );
  }

  // Get clients with project counts
  const query = db
    .select({
      client: clients,
      projectCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${projects} 
        WHERE ${projects.clientId} = ${clients.id}
      ), 0)`.as('project_count'),
      activeProjectCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${projects} 
        WHERE ${projects.clientId} = ${clients.id} 
        AND ${projects.status} IN ('active', 'planning')
      ), 0)`.as('active_project_count')
    })
    .from(clients);

  const finalQuery =
    conditions.length > 0
      ? query.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        )
      : query;

  // Get total count for pagination
  const countQuery = db.select({ count: count() }).from(clients);
  const finalCountQuery =
    conditions.length > 0
      ? countQuery.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        )
      : countQuery;

  const [{ count: total }] = await finalCountQuery;

  // Apply pagination and ordering
  const offset = (page - 1) * limit;
  const clientsResult = await finalQuery
    .orderBy(desc(clients.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    clients: clientsResult.map((row) => ({
      ...row.client,
      projectCount: row.projectCount,
      activeProjectCount: row.activeProjectCount
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getClientById(id: string) {
  const result = await db
    .select({
      client: clients,
      projectCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${projects} 
        WHERE ${projects.clientId} = ${clients.id}
      ), 0)`.as('project_count'),
      activeProjectCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${projects} 
        WHERE ${projects.clientId} = ${clients.id} 
        AND ${projects.status} IN ('active', 'planning')
      ), 0)`.as('active_project_count')
    })
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    ...row.client,
    projectCount: row.projectCount,
    activeProjectCount: row.activeProjectCount
  };
}

export async function getClientByEmail(email: string) {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.email, email))
    .limit(1);
  return result[0] || null;
}

export async function createClient(client: NewClient) {
  const result = await db.insert(clients).values(client).returning();
  return result[0];
}

export async function updateClient(id: string, updates: Partial<NewClient>) {
  const result = await db
    .update(clients)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(clients.id, id))
    .returning();
  return result[0];
}

export async function deleteClient(id: string) {
  const result = await db.delete(clients).where(eq(clients.id, id)).returning();
  return result[0] || null;
}

export async function searchClients(query: string) {
  return await db
    .select()
    .from(clients)
    .where(
      or(
        like(clients.name, `%${query}%`),
        like(clients.email, `%${query}%`),
        like(clients.company, `%${query}%`)
      )
    )
    .orderBy(desc(clients.createdAt));
}

export async function getClientsByStatus(status: Client['status']) {
  return await db
    .select()
    .from(clients)
    .where(eq(clients.status, status))
    .orderBy(desc(clients.createdAt));
}

// Client files queries
export async function getClientFiles(clientId: string) {
  return await db
    .select()
    .from(clientFiles)
    .where(eq(clientFiles.clientId, clientId))
    .orderBy(desc(clientFiles.uploadedAt));
}

export async function createClientFile(file: typeof clientFiles.$inferInsert) {
  const result = await db.insert(clientFiles).values(file).returning();
  return result[0];
}

export async function deleteClientFile(id: string) {
  await db.delete(clientFiles).where(eq(clientFiles.id, id));
}

// Client credentials queries
export async function getClientCredentials(clientId: string) {
  return await db
    .select()
    .from(clientCredentials)
    .where(eq(clientCredentials.clientId, clientId))
    .orderBy(desc(clientCredentials.createdAt));
}

export async function createClientCredential(
  credential: typeof clientCredentials.$inferInsert
) {
  const result = await db
    .insert(clientCredentials)
    .values(credential)
    .returning();
  return result[0];
}

export async function updateClientCredential(
  id: string,
  updates: Partial<typeof clientCredentials.$inferInsert>
) {
  const result = await db
    .update(clientCredentials)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(clientCredentials.id, id))
    .returning();
  return result[0];
}

export async function deleteClientCredential(id: string) {
  await db.delete(clientCredentials).where(eq(clientCredentials.id, id));
}
