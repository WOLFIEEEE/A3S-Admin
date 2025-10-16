'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconPlus,
  IconCalendar,
  IconUsers,
  IconClock,
  IconCurrencyDollar,
  IconFileText,
  IconCheck,
  IconPlayerPlay,
  IconEdit,
  IconTrash,
  IconDownload,
  IconUpload,
  IconActivity
} from '@tabler/icons-react';
import {
  Project,
  ProjectMilestone,
  ProjectDeveloper,
  ProjectTimeEntry,
  ProjectDocument,
  ProjectActivity
} from '@/types/project';
import { Client } from '@/types/client';

interface ProjectOverviewProps {
  client: Client;
  projects: Project[];
  milestones: ProjectMilestone[];
  developers: ProjectDeveloper[];
  timeEntries: ProjectTimeEntry[];
  documents: ProjectDocument[];
  activities: ProjectActivity[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const statusColors = {
  planning: 'bg-gray-100 text-gray-800 border-gray-300',
  active: 'bg-blue-100 text-blue-800 border-blue-300',
  on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  archived: 'bg-gray-100 text-gray-600 border-gray-300'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const projectTypeLabels = {
  a3s_program: 'A3S Program',
  audit: 'Accessibility Audit',
  remediation: 'Remediation',
  monitoring: 'Ongoing Monitoring',
  training: 'Training & Education',
  consultation: 'Consultation',
  full_compliance: 'Full Compliance Package'
};

export default function ProjectOverview({
  client,
  projects,
  milestones,
  developers,
  timeEntries,
  documents,
  activities,
  onEditProject,
  onDeleteProject
}: ProjectOverviewProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    projects[0] || null
  );

  // Calculate project metrics
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  ).length;
  const totalHours = projects.reduce((sum, p) => sum + (p.actualHours || 0), 0);
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const _averageProgress =
    projects.length > 0
      ? projects.reduce((sum, p) => sum + p.progressPercentage, 0) /
        projects.length
      : 0;

  const getProjectMilestones = (projectId: string) =>
    milestones.filter((m) => m.projectId === projectId);

  const getProjectDevelopers = (projectId: string) =>
    developers.filter((d) => d.projectId === projectId && d.isActive);

  const _getProjectTimeEntries = (projectId: string) =>
    timeEntries.filter((t) => t.projectId === projectId);

  const getProjectDocuments = (projectId: string) =>
    documents.filter((d) => d.projectId === projectId);

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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Projects for {client.name}</h2>
          <p className='text-muted-foreground'>
            {client.company} - Accessibility Compliance Projects
          </p>
        </div>
      </div>

      {/* Project Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>Total Projects</p>
                <p className='text-2xl font-bold'>{projects.length}</p>
              </div>
              <IconFileText className='h-8 w-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>Active</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {activeProjects}
                </p>
              </div>
              <IconPlayerPlay className='h-8 w-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>Completed</p>
                <p className='text-2xl font-bold text-green-600'>
                  {completedProjects}
                </p>
              </div>
              <IconCheck className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>Total Hours</p>
                <p className='text-2xl font-bold'>{totalHours.toFixed(1)}</p>
              </div>
              <IconClock className='h-8 w-8 text-orange-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>Total Budget</p>
                <p className='text-2xl font-bold'>
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <IconCurrencyDollar className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Projects List */}
        <div className='space-y-4 lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>All Projects</CardTitle>
              <CardDescription>
                Click on a project to view details
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='space-y-2'>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`cursor-pointer border-l-4 p-4 transition-colors hover:bg-gray-50 ${
                      selectedProject?.id === project.id
                        ? 'border-l-blue-500 bg-blue-50'
                        : 'border-l-transparent'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className='mb-2 flex items-start justify-between'>
                      <h4 className='text-sm font-medium'>{project.name}</h4>
                      <Badge
                        className={`text-xs ${statusColors[project.status]}`}
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground mb-2 line-clamp-2 text-xs'>
                      {project.description}
                    </p>
                    <div className='text-muted-foreground flex items-center justify-between text-xs'>
                      <span>{projectTypeLabels[project.projectType]}</span>
                      <span>WCAG {project.wcagLevel}</span>
                    </div>
                    <div className='mt-2'>
                      <div className='mb-1 flex items-center justify-between text-xs'>
                        <span>Progress</span>
                        <span>{project.progressPercentage}%</span>
                      </div>
                      <Progress
                        value={project.progressPercentage}
                        className='h-1'
                      />
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className='text-muted-foreground p-8 text-center'>
                    <IconFileText className='mx-auto mb-4 h-12 w-12 opacity-50' />
                    <p className='text-sm'>No projects yet</p>
                    <p className='text-xs'>
                      Create your first project to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div className='lg:col-span-2'>
          {selectedProject ? (
            <Card>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      {selectedProject.name}
                      <Badge
                        className={`${statusColors[selectedProject.status]}`}
                      >
                        {selectedProject.status.replace('_', ' ')}
                      </Badge>
                      <Badge
                        className={`${priorityColors[selectedProject.priority]}`}
                      >
                        {selectedProject.priority}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedProject.description}
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onEditProject(selectedProject)}
                    >
                      <IconEdit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onDeleteProject(selectedProject.id)}
                    >
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue='overview' className='w-full'>
                  <TabsList className='grid w-full grid-cols-5'>
                    <TabsTrigger value='overview'>Overview</TabsTrigger>
                    <TabsTrigger value='milestones'>Milestones</TabsTrigger>
                    <TabsTrigger value='team'>Team</TabsTrigger>
                    <TabsTrigger value='documents'>Documents</TabsTrigger>
                    <TabsTrigger value='activity'>Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value='overview' className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>Project Details</h4>
                        <div className='space-y-1 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>Type:</span>
                            <span>
                              {projectTypeLabels[selectedProject.projectType]}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              WCAG Level:
                            </span>
                            <span>{selectedProject.wcagLevel}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Billing:
                            </span>
                            <span className='capitalize'>
                              {selectedProject.billingType}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Budget:
                            </span>
                            <span>
                              {formatCurrency(selectedProject.budget || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>Timeline</h4>
                        <div className='space-y-1 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Start Date:
                            </span>
                            <span>
                              {selectedProject.startDate
                                ? formatDate(selectedProject.startDate)
                                : 'Not set'}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              End Date:
                            </span>
                            <span>
                              {selectedProject.endDate
                                ? formatDate(selectedProject.endDate)
                                : 'Not set'}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Estimated Hours:
                            </span>
                            <span>{selectedProject.estimatedHours || 0}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              Actual Hours:
                            </span>
                            <span>{selectedProject.actualHours || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Progress</h4>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span>Overall Progress</span>
                          <span>{selectedProject.progressPercentage}%</span>
                        </div>
                        <Progress
                          value={selectedProject.progressPercentage}
                          className='h-2'
                        />
                        <div className='text-muted-foreground flex items-center justify-between text-xs'>
                          <span>
                            {selectedProject.milestonesCompleted} of{' '}
                            {selectedProject.totalMilestones} milestones
                            completed
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedProject.deliverables.length > 0 && (
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>
                          Key Deliverables
                        </h4>
                        <ul className='space-y-1'>
                          {selectedProject.deliverables.map(
                            (deliverable, _index) => (
                              <li
                                key={_index}
                                className='flex items-center gap-2 text-sm'
                              >
                                <IconCheck className='h-3 w-3 text-green-500' />
                                {deliverable}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='milestones' className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>Project Milestones</h4>
                      <Button size='sm' variant='outline'>
                        <IconPlus className='mr-2 h-4 w-4' />
                        Add Milestone
                      </Button>
                    </div>
                    <div className='space-y-3'>
                      {getProjectMilestones(selectedProject.id).map(
                        (milestone) => (
                          <div
                            key={milestone.id}
                            className='rounded-lg border p-4'
                          >
                            <div className='mb-2 flex items-start justify-between'>
                              <h5 className='font-medium'>{milestone.title}</h5>
                              <Badge
                                className={`text-xs ${
                                  milestone.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : milestone.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : milestone.status === 'overdue'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {milestone.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className='text-muted-foreground mb-2 text-sm'>
                              {milestone.description}
                            </p>
                            <div className='text-muted-foreground flex items-center justify-between text-xs'>
                              <span>Due: {formatDate(milestone.dueDate)}</span>
                              {milestone.completedDate && (
                                <span>
                                  Completed:{' '}
                                  {formatDate(milestone.completedDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      )}
                      {getProjectMilestones(selectedProject.id).length ===
                        0 && (
                        <div className='text-muted-foreground py-8 text-center'>
                          <IconCalendar className='mx-auto mb-4 h-12 w-12 opacity-50' />
                          <p className='text-sm'>No milestones defined</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value='team' className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>Team Members</h4>
                      <Button size='sm' variant='outline'>
                        <IconPlus className='mr-2 h-4 w-4' />
                        Assign Developer
                      </Button>
                    </div>
                    <div className='space-y-3'>
                      {getProjectDevelopers(selectedProject.id).map(
                        (developer) => (
                          <div
                            key={developer.id}
                            className='rounded-lg border p-4'
                          >
                            <div className='flex items-start justify-between'>
                              <div>
                                <h5 className='font-medium'>
                                  {developer.developerId}
                                </h5>
                                <p className='text-muted-foreground text-sm capitalize'>
                                  {developer.role.replace('_', ' ')}
                                </p>
                                {developer.responsibilities.length > 0 && (
                                  <div className='mt-2'>
                                    <p className='text-muted-foreground mb-1 text-xs'>
                                      Responsibilities:
                                    </p>
                                    <ul className='space-y-1 text-xs'>
                                      {developer.responsibilities.map(
                                        (resp, _index) => (
                                          <li
                                            key={_index}
                                            className='flex items-center gap-1'
                                          >
                                            <IconCheck className='h-3 w-3 text-green-500' />
                                            {resp}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className='text-right text-sm'>
                                {developer.hourlyRate && (
                                  <p className='text-muted-foreground'>
                                    {formatCurrency(developer.hourlyRate)}/hr
                                  </p>
                                )}
                                {developer.maxHoursPerWeek && (
                                  <p className='text-muted-foreground'>
                                    Max: {developer.maxHoursPerWeek}h/week
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                      {getProjectDevelopers(selectedProject.id).length ===
                        0 && (
                        <div className='text-muted-foreground py-8 text-center'>
                          <IconUsers className='mx-auto mb-4 h-12 w-12 opacity-50' />
                          <p className='text-sm'>No team members assigned</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value='documents' className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>Project Documents</h4>
                      <Button size='sm' variant='outline'>
                        <IconUpload className='mr-2 h-4 w-4' />
                        Upload Document
                      </Button>
                    </div>
                    <div className='space-y-3'>
                      {getProjectDocuments(selectedProject.id).map(
                        (document) => (
                          <div
                            key={document.id}
                            className='rounded-lg border p-4'
                          >
                            <div className='flex items-start justify-between'>
                              <div className='flex items-start gap-3'>
                                <IconFileText className='mt-0.5 h-5 w-5 text-blue-500' />
                                <div>
                                  <h5 className='font-medium'>
                                    {document.name}
                                  </h5>
                                  <p className='text-muted-foreground text-sm capitalize'>
                                    {document.type.replace('_', ' ')} • Version{' '}
                                    {document.version}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    Uploaded {formatDate(document.uploadedAt)}{' '}
                                    by {document.uploadedBy}
                                  </p>
                                </div>
                              </div>
                              <Button size='sm' variant='outline'>
                                <IconDownload className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                      {getProjectDocuments(selectedProject.id).length === 0 && (
                        <div className='text-muted-foreground py-8 text-center'>
                          <IconFileText className='mx-auto mb-4 h-12 w-12 opacity-50' />
                          <p className='text-sm'>No documents uploaded</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value='activity' className='space-y-4'>
                    <h4 className='font-medium'>Recent Activity</h4>
                    <div className='space-y-3'>
                      {activities
                        .filter(
                          (activity) =>
                            activity.projectId === selectedProject.id
                        )
                        .slice(0, 10)
                        .map((activity) => (
                          <div
                            key={activity.id}
                            className='flex items-start gap-3 rounded-lg border p-3'
                          >
                            <IconActivity className='mt-1 h-4 w-4 text-blue-500' />
                            <div className='flex-1'>
                              <p className='text-sm'>{activity.description}</p>
                              <div className='text-muted-foreground mt-1 flex items-center gap-2 text-xs'>
                                <span>{activity.userName}</span>
                                <span>•</span>
                                <span>{formatDate(activity.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      {activities.filter(
                        (activity) => activity.projectId === selectedProject.id
                      ).length === 0 && (
                        <div className='text-muted-foreground py-8 text-center'>
                          <IconActivity className='mx-auto mb-4 h-12 w-12 opacity-50' />
                          <p className='text-sm'>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className='p-12 text-center'>
                <IconFileText className='text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50' />
                <h3 className='mb-2 text-lg font-medium'>
                  No Project Selected
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Select a project from the list to view its details, or create
                  a new project to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
