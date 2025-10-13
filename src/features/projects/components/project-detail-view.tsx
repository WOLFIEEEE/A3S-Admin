'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  IconBuilding,
  IconCalendar,
  IconCurrencyDollar,
  IconEdit,
  IconTrash,
  IconPlus,
  IconFileText,
  IconUsers,
  IconClock,
  IconTrendingUp,
  IconAlertTriangle,
  IconCheck,
  IconActivity,
  IconAccessible,
  IconTarget,
  IconShield,
  IconBug,
  IconList,
  IconChartBar,
  IconFolder,
  IconMessage,
  IconDownload,
  IconUpload
} from '@tabler/icons-react';
import { Client } from '@/types/client';
import { Project } from '@/types/project';
import { Ticket } from '@/types';
import { toast } from 'sonner';
import { ProjectDocumentUpload } from '@/components/project-document-upload';
import { ProjectStagingCredentials } from '@/components/project-staging-credentials';

interface ProjectDetailViewProps {
  clientId: string;
  projectId: string;
}

interface ProjectIssue {
  id: string;
  title: string;
  description: string;
  wcagCriteria: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
  pageUrl: string;
  element: string;
  recommendation: string;
  createdAt: Date;
  updatedAt: Date;
}

const statusColors = {
  planning: 'bg-blue-100 text-blue-800 border-blue-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  completed: 'bg-purple-100 text-purple-800 border-purple-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  archived: 'bg-gray-100 text-gray-800 border-gray-300'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-300',
  medium: 'bg-blue-100 text-blue-800 border-blue-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  urgent: 'bg-red-100 text-red-800 border-red-300'
};

const severityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const issueStatusColors = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  verified: 'bg-purple-100 text-purple-800'
};

export default function ProjectDetailView({
  clientId,
  projectId
}: ProjectDetailViewProps) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setIsLoading(true);

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${clientId}`);
        if (clientResponse.ok) {
          const clientResult = await clientResponse.json();
          if (clientResult.success) {
            setClient(clientResult.data);
          }
        }

        // Fetch project data
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (projectResponse.ok) {
          const projectResult = await projectResponse.json();
          if (projectResult.success) {
            setProject(projectResult.data);
          }
        }

        // Fetch tickets for this project
        const ticketsResponse = await fetch(
          `/api/tickets?projectId=${projectId}`
        );
        if (ticketsResponse.ok) {
          const ticketsResult = await ticketsResponse.json();
          if (ticketsResult.success) {
            setTickets(ticketsResult.data.tickets || []);
          }
        }

        // For now, use empty array for issues until Node.js service is implemented
        setIssues([]);
      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [clientId, projectId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-muted-foreground'>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project || !client) {
    return (
      <div className='py-12 text-center'>
        <IconFolder className='text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50' />
        <h3 className='mb-2 text-lg font-medium'>Project Not Found</h3>
        <p className='text-muted-foreground mb-4'>
          The requested project could not be found.
        </p>
        <Button onClick={() => router.push('/dashboard/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                <IconAccessible className='h-8 w-8 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <div className='mb-2 flex items-center gap-3'>
                  <CardTitle className='text-2xl'>{project.name}</CardTitle>
                  <Badge className={statusColors[project.status]}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={priorityColors[project.priority]}
                  >
                    {project.priority}
                  </Badge>
                </div>
                <CardDescription className='text-lg'>
                  {client.company}
                </CardDescription>
                <div className='text-muted-foreground mt-3 flex items-center gap-6 text-sm'>
                  <div className='flex items-center gap-2'>
                    <IconBuilding className='h-4 w-4' />
                    <span>Client: {client.name}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IconAccessible className='h-4 w-4' />
                    <span>WCAG {project.wcagLevel}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IconCalendar className='h-4 w-4' />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline'>
                <IconEdit className='mr-2 h-4 w-4' />
                Edit Project
              </Button>
              <Button variant='outline'>
                <IconPlus className='mr-2 h-4 w-4' />
                New Ticket
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Project Progress Overview */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='mb-2 flex items-center gap-2'>
              <IconTrendingUp className='h-4 w-4 text-blue-500' />
              <span className='text-sm font-medium'>Progress</span>
            </div>
            <div className='mb-2 text-2xl font-bold'>
              {project.progressPercentage}%
            </div>
            <Progress value={project.progressPercentage} className='h-2' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='mb-2 flex items-center gap-2'>
              <IconTarget className='h-4 w-4 text-green-500' />
              <span className='text-sm font-medium'>Milestones</span>
            </div>
            <div className='text-2xl font-bold'>
              {project.milestonesCompleted}/{project.totalMilestones}
            </div>
            <p className='text-muted-foreground text-xs'>Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='mb-2 flex items-center gap-2'>
              <IconClock className='h-4 w-4 text-orange-500' />
              <span className='text-sm font-medium'>Hours</span>
            </div>
            <div className='text-2xl font-bold'>
              {project.actualHours || 0}
              {project.estimatedHours && (
                <span className='text-muted-foreground text-sm'>
                  /{project.estimatedHours}
                </span>
              )}
            </div>
            <p className='text-muted-foreground text-xs'>Logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='mb-2 flex items-center gap-2'>
              <IconBug className='h-4 w-4 text-red-500' />
              <span className='text-sm font-medium'>Issues</span>
            </div>
            <div className='text-2xl font-bold'>{issues.length}</div>
            <p className='text-muted-foreground text-xs'>
              {issues.filter((i) => i.status === 'open').length} Open
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details Tabs */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='issues'>Issues</TabsTrigger>
          <TabsTrigger value='tickets'>Tickets</TabsTrigger>
          <TabsTrigger value='team'>Team</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
          <TabsTrigger value='credentials'>Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconFolder className='h-5 w-5' />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Project Type:</span>
                    <span className='font-medium capitalize'>
                      {project.projectType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>WCAG Level:</span>
                    <span className='font-medium'>
                      WCAG 2.2 Level {project.wcagLevel}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Billing Type:</span>
                    <span className='font-medium capitalize'>
                      {project.billingType}
                    </span>
                  </div>
                  {project.startDate && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Start Date:</span>
                      <span className='font-medium'>
                        {formatDate(project.startDate)}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>End Date:</span>
                      <span className='font-medium'>
                        {formatDate(project.endDate)}
                      </span>
                    </div>
                  )}
                  {project.budget && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Budget:</span>
                      <span className='font-medium'>
                        {formatCurrency(project.budget)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconShield className='h-5 w-5' />
                  Compliance Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {project.complianceRequirements &&
                project.complianceRequirements.length > 0 ? (
                  <div className='flex flex-wrap gap-2'>
                    {project.complianceRequirements.map(
                      (requirement, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs'
                        >
                          {requirement}
                        </Badge>
                      )
                    )}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No specific requirements defined
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconList className='h-5 w-5' />
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {project.deliverables && project.deliverables.length > 0 ? (
                  <ul className='space-y-2'>
                    {project.deliverables.map((deliverable, index) => (
                      <li
                        key={index}
                        className='flex items-start gap-2 text-sm'
                      >
                        <IconCheck className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No deliverables defined
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Acceptance Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconTarget className='h-5 w-5' />
                  Acceptance Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {project.acceptanceCriteria &&
                project.acceptanceCriteria.length > 0 ? (
                  <ul className='space-y-2'>
                    {project.acceptanceCriteria.map((criteria, index) => (
                      <li
                        key={index}
                        className='flex items-start gap-2 text-sm'
                      >
                        <IconCheck className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500' />
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No acceptance criteria defined
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm'>
                  {project.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Project Tags */}
          {project.tags && project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant='secondary' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='issues' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <IconBug className='h-5 w-5' />
                  Accessibility Issues
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <Button variant='outline' size='sm'>
                    <IconDownload className='mr-2 h-4 w-4' />
                    Export Issues
                  </Button>
                  <Button variant='outline' size='sm'>
                    <IconUpload className='mr-2 h-4 w-4' />
                    Sync from Sheet
                  </Button>
                </div>
              </div>
              <CardDescription>
                Issues fetched from Google Sheets via Node.js service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <div className='text-muted-foreground py-12 text-center'>
                  <IconBug className='mx-auto mb-4 h-16 w-16 opacity-50' />
                  <h3 className='mb-2 text-lg font-medium'>No Issues Found</h3>
                  <p className='text-sm'>
                    No accessibility issues have been identified for this
                    project yet. Issues will be automatically synced from the
                    Google Sheets audit results.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {issues.map((issue) => (
                    <div key={issue.id} className='rounded-lg border p-4'>
                      <div className='mb-3 flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='mb-2 flex items-center gap-2'>
                            <h4 className='font-medium'>{issue.title}</h4>
                            <Badge className={severityColors[issue.severity]}>
                              {issue.severity}
                            </Badge>
                            <Badge className={issueStatusColors[issue.status]}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className='text-muted-foreground mb-2 text-sm'>
                            {issue.description}
                          </p>
                          <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                            <span>Page: {issue.pageUrl}</span>
                            <span>Element: {issue.element}</span>
                          </div>
                        </div>
                      </div>
                      {issue.wcagCriteria.length > 0 && (
                        <div className='mb-2 flex flex-wrap gap-1'>
                          {issue.wcagCriteria.map((criteria, index) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'
                            >
                              {criteria}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className='text-sm'>
                        <span className='font-medium'>Recommendation: </span>
                        <span className='text-muted-foreground'>
                          {issue.recommendation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='tickets' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <IconList className='h-5 w-5' />
                  Project Tickets
                </CardTitle>
                <Button>
                  <IconPlus className='mr-2 h-4 w-4' />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className='text-muted-foreground py-12 text-center'>
                  <IconList className='mx-auto mb-4 h-16 w-16 opacity-50' />
                  <h3 className='mb-2 text-lg font-medium'>No Tickets</h3>
                  <p className='text-sm'>
                    No tickets have been created for this project yet.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='mb-2 flex items-center gap-2'>
                            <h4 className='font-medium'>{ticket.title}</h4>
                            <Badge variant='outline'>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant='outline'>{ticket.priority}</Badge>
                          </div>
                          <p className='text-muted-foreground mb-2 text-sm'>
                            {ticket.description}
                          </p>
                          <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                            <span>Type: {ticket.type}</span>
                            {ticket.estimatedHours && (
                              <span>Est: {ticket.estimatedHours}h</span>
                            )}
                            <span>Created: {formatDate(ticket.createdAt)}</span>
                          </div>
                        </div>
                        <Button variant='outline' size='sm'>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='team' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <IconUsers className='h-5 w-5' />
                  Project Team
                </CardTitle>
                <Button variant='outline'>
                  <IconPlus className='mr-2 h-4 w-4' />
                  Assign Developer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground py-12 text-center'>
                <IconUsers className='mx-auto mb-4 h-16 w-16 opacity-50' />
                <h3 className='mb-2 text-lg font-medium'>No Team Members</h3>
                <p className='text-sm'>
                  No developers have been assigned to this project yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='documents' className='space-y-6'>
          <ProjectDocumentUpload
            projectId={projectId}
            documents={[]} // TODO: Fetch actual documents
            onDocumentUploaded={() => {
              // TODO: Refresh documents
            }}
          />
        </TabsContent>

        <TabsContent value='credentials' className='space-y-6'>
          <ProjectStagingCredentials
            projectId={projectId}
            credentials={[]} // TODO: Fetch actual credentials
            onCredentialsUpdated={() => {
              // TODO: Refresh credentials
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
