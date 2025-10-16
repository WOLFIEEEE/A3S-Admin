export type TeamType = 'internal' | 'external';

export type EmployeeRole =
  | 'ceo'
  | 'manager'
  | 'team_lead'
  | 'senior_developer'
  | 'developer'
  | 'junior_developer'
  | 'designer'
  | 'qa_engineer'
  | 'project_manager'
  | 'business_analyst'
  | 'consultant'
  | 'contractor';

export type EmploymentStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'terminated';

export interface CreateTeamInput {
  name: string;
  description?: string;
  teamType: TeamType;
  managerId?: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
  teamType?: TeamType;
  managerId?: string;
  isActive?: boolean;
}

export interface CreateTeamMemberInput {
  teamId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  title?: string;
  department?: string;
  reportsToId?: string;
  startDate?: Date;
  hourlyRate?: number; // In cents
  salary?: number; // In cents
  skills?: string[];
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface UpdateTeamMemberInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: EmployeeRole;
  title?: string;
  department?: string;
  reportsToId?: string;
  employmentStatus?: EmploymentStatus;
  startDate?: Date;
  endDate?: Date;
  hourlyRate?: number;
  salary?: number;
  skills?: string[];
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  isActive?: boolean;
}

export interface TeamMemberWithDetails {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  title?: string;
  department?: string;
  reportsToId?: string;
  employmentStatus: EmploymentStatus;
  startDate?: Date;
  endDate?: Date;
  hourlyRate?: number;
  salary?: number;
  skills: string[];
  bio?: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  team: {
    id: string;
    name: string;
    teamType: TeamType;
  };
  reportsTo?: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    role: EmployeeRole;
  };
  subordinates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    role: EmployeeRole;
  }>;
}

export interface TeamWithDetails {
  id: string;
  name: string;
  description?: string;
  teamType: TeamType;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  members: TeamMemberWithDetails[];
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    role: EmployeeRole;
  };
}

export interface OrganizationChartNode {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  role: EmployeeRole;
  email: string;
  teamName: string;
  teamType: TeamType;
  profileImageUrl?: string;
  children: OrganizationChartNode[];
  level: number;
}

export interface ProjectAssignmentInput {
  projectId: string;
  teamMemberId: string;
  role?: string;
}

export interface TeamStats {
  totalMembers: number;
  internalMembers: number;
  externalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalTeams: number;
  internalTeams: number;
  externalTeams: number;
}

export interface TeamFilters {
  teamType?: TeamType;
  employmentStatus?: EmploymentStatus;
  role?: EmployeeRole;
  department?: string;
  search?: string;
}

// Role hierarchy and permissions
export const ROLE_HIERARCHY: Record<EmployeeRole, number> = {
  ceo: 10,
  manager: 8,
  team_lead: 7,
  project_manager: 6,
  senior_developer: 5,
  developer: 4,
  junior_developer: 3,
  designer: 4,
  qa_engineer: 4,
  business_analyst: 5,
  consultant: 4,
  contractor: 2
};

export const ROLE_LABELS: Record<EmployeeRole, string> = {
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

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
  terminated: 'Terminated'
};

export const TEAM_TYPE_LABELS: Record<TeamType, string> = {
  internal: 'Internal Team',
  external: 'External Team'
};
