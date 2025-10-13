// Export all schemas and types
export * from './clients';
export * from './projects';
export * from './tickets';
export * from './accessibility';

// Re-export commonly used types
export type {
  Client,
  NewClient,
  ClientFile,
  NewClientFile,
  ClientCredential,
  NewClientCredential
} from './clients';

export type {
  Project,
  NewProject,
  ProjectMilestone,
  NewProjectMilestone,
  ProjectDeveloper,
  NewProjectDeveloper,
  ProjectTimeEntry,
  NewProjectTimeEntry,
  ProjectDocument,
  NewProjectDocument,
  ProjectActivity,
  NewProjectActivity
} from './projects';

export type {
  Ticket,
  NewTicket,
  TicketComment,
  NewTicketComment,
  TicketAttachment,
  NewTicketAttachment
} from './tickets';

export type {
  TestUrl,
  NewTestUrl,
  AccessibilityIssue,
  NewAccessibilityIssue,
  IssueComment,
  NewIssueComment
} from './accessibility';

// Export all relations
export {
  clientsRelations,
  clientFilesRelations,
  clientCredentialsRelations
} from './clients';

export {
  projectsRelations,
  projectMilestonesRelations,
  projectDevelopersRelations,
  projectTimeEntriesRelations,
  projectDocumentsRelations,
  projectActivitiesRelations,
  projectStagingCredentialsRelations
} from './projects';

export {
  ticketsRelations,
  ticketCommentsRelations,
  ticketAttachmentsRelations
} from './tickets';

export {
  testUrlsRelations,
  accessibilityIssuesRelations,
  issueCommentsRelations
} from './accessibility';
