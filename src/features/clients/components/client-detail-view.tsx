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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCurrencyDollar,
  IconCalendar,
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
  IconKey,
  IconShield
} from '@tabler/icons-react';
import { Client } from '@/types/client';
import {
  Project,
  ProjectMilestone,
  ProjectDeveloper,
  ProjectTimeEntry,
  ProjectDocument,
  ProjectActivity
} from '@/types/project';
import ProjectOverview from '@/features/projects/components/project-overview';
import NewProjectDialog from '@/features/projects/components/new-project-dialog';
import { toast } from 'sonner';

interface ClientDetailViewProps {
  clientId: string;
}

// Note: Mock data removed - now using real API calls

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  suspended: 'bg-red-100 text-red-800 border-red-300'
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended'
};

export default function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [developers, setDevelopers] = useState<ProjectDeveloper[]>([]);
  const [timeEntries, setTimeEntries] = useState<ProjectTimeEntry[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditProject, setShowEditProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setIsLoading(true);

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${clientId}`);
        if (!clientResponse.ok) {
          throw new Error('Failed to fetch client data');
        }
        const clientResult = await clientResponse.json();

        if (clientResult.success) {
          setClient(clientResult.data);
        } else {
          throw new Error(clientResult.error || 'Failed to load client');
        }

        // Fetch projects for this client
        const projectsResponse = await fetch(
          `/api/projects?clientId=${clientId}`
        );
        if (projectsResponse.ok) {
          const projectsResult = await projectsResponse.json();
          if (projectsResult.success) {
            setProjects(projectsResult.data || []);
          }
        }

        // For now, use empty arrays for other data until we implement those APIs
        setMilestones([]);
        setDevelopers([]);
        setTimeEntries([]);
        setDocuments([]);
        setActivities([]);
      } catch (error) {
        console.error('Error loading client data:', error);
        toast.error('Failed to load client data');
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadClientData();
  }, [clientId]);

  const handleEditProject = (project: Project) => {
    setShowEditProject(project);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // In a real app, make API call to delete project
      console.log('Deleting project:', projectId);
      toast.success('Project deleted successfully!');
      // Refresh projects list
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));

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
          <p className='text-muted-foreground'>Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className='py-12 text-center'>
        <IconBuilding className='text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50' />
        <h3 className='mb-2 text-lg font-medium'>Client Not Found</h3>
        <p className='text-muted-foreground mb-4'>
          The requested client could not be found.
        </p>
        <Button onClick={() => router.push('/dashboard/clients')}>
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Client Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                <IconBuilding className='h-8 w-8 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <div className='mb-2 flex items-center gap-3'>
                  <CardTitle className='text-2xl'>{client.name}</CardTitle>
                  <Badge className={statusColors[client.status]}>
                    {statusLabels[client.status]}
                  </Badge>
                </div>
                <CardDescription className='text-lg'>
                  {client.company}
                </CardDescription>
                <div className='text-muted-foreground mt-3 flex items-center gap-6 text-sm'>
                  <div className='flex items-center gap-2'>
                    <IconMail className='h-4 w-4' />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className='flex items-center gap-2'>
                      <IconPhone className='h-4 w-4' />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <IconCalendar className='h-4 w-4' />
                    <span>Client since {formatDate(client.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() =>
                  router.push(`/dashboard/clients/${client.id}/edit`)
                }
              >
                <IconEdit className='mr-2 h-4 w-4' />
                Edit Client
              </Button>
              <NewProjectDialog
                clients={[client]}
                selectedClientId={client.id}
                onProjectCreated={(project) => {
                  setProjects((prev) => [project, ...prev]);
                  toast.success('Project created successfully!');
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Client Details Tabs */}
      <Tabs defaultValue='projects' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='projects'>Projects</TabsTrigger>
          <TabsTrigger value='details'>Client Details</TabsTrigger>
          <TabsTrigger value='billing'>Billing & Payments</TabsTrigger>
          <TabsTrigger value='documents'>Documents & Files</TabsTrigger>
        </TabsList>

        <TabsContent value='projects' className='space-y-6'>
          <ProjectOverview
            client={client}
            projects={projects}
            milestones={milestones}
            developers={developers}
            timeEntries={timeEntries}
            documents={documents}
            activities={activities}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        </TabsContent>

        <TabsContent value='details' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconUsers className='h-5 w-5' />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Primary Contact:
                    </span>
                    <span className='font-medium'>{client.name}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Email:</span>
                    <span className='font-medium'>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Phone:</span>
                      <span className='font-medium'>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Address:</span>
                      <span className='text-right font-medium'>
                        {client.address}
                      </span>
                    </div>
                  )}
                  {client.website && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Website:</span>
                      <a
                        href={client.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-medium text-blue-600 hover:underline'
                      >
                        {client.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconBuilding className='h-5 w-5' />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Company:</span>
                    <span className='font-medium'>{client.company}</span>
                  </div>
                  {client.companySize && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Company Size:
                      </span>
                      <span className='font-medium'>
                        {client.companySize} employees
                      </span>
                    </div>
                  )}
                  {client.industry && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Industry:</span>
                      <span className='font-medium'>{client.industry}</span>
                    </div>
                  )}
                  {client.currentAccessibilityLevel && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Current Level:
                      </span>
                      <span className='font-medium capitalize'>
                        {client.currentAccessibilityLevel}
                      </span>
                    </div>
                  )}
                  {client.complianceDeadline && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Compliance Deadline:
                      </span>
                      <span className='font-medium'>
                        {formatDate(client.complianceDeadline)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconShield className='h-5 w-5' />
                  Accessibility Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 text-sm'>
                  {client.wcagLevel && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>WCAG Level:</span>
                      <span className='font-medium'>
                        WCAG 2.2 Level {client.wcagLevel}
                      </span>
                    </div>
                  )}
                  {client.servicesNeeded &&
                    client.servicesNeeded.length > 0 && (
                      <div>
                        <span className='text-muted-foreground'>
                          Services Needed:
                        </span>
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {client.servicesNeeded.map((service, index) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {client.priorityAreas && client.priorityAreas.length > 0 && (
                    <div>
                      <span className='text-muted-foreground'>
                        Priority Areas:
                      </span>
                      <div className='mt-1 flex flex-wrap gap-1'>
                        {client.priorityAreas.map((area, index) => (
                          <Badge
                            key={index}
                            variant='outline'
                            className='text-xs'
                          >
                            {area.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {client.timeline && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Timeline:</span>
                      <span className='font-medium'>
                        {client.timeline.replace('_', '-')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconMail className='h-5 w-5' />
                  Communication Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 text-sm'>
                  {client.communicationPreference && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Preferred Method:
                      </span>
                      <span className='font-medium capitalize'>
                        {client.communicationPreference}
                      </span>
                    </div>
                  )}
                  {client.reportingFrequency && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Reporting Frequency:
                      </span>
                      <span className='font-medium capitalize'>
                        {client.reportingFrequency}
                      </span>
                    </div>
                  )}
                  {client.pointOfContact && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Point of Contact:
                      </span>
                      <span className='font-medium'>
                        {client.pointOfContact}
                      </span>
                    </div>
                  )}
                  {client.timeZone && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Time Zone:</span>
                      <span className='font-medium'>{client.timeZone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm'>{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='billing' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconCurrencyDollar className='h-5 w-5' />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Billing Amount:
                    </span>
                    <span className='font-medium'>$0.00</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Frequency:</span>
                    <span className='font-medium'>Monthly</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Start Date:</span>
                    <span className='font-medium'>Not set</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Pricing Tier:</span>
                    <span className='font-medium'>Basic</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Payment Method:
                    </span>
                    <span className='font-medium'>Credit Card</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Budget Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconTrendingUp className='h-5 w-5' />
                  Project Budget Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Total Project Budget:
                    </span>
                    <span className='font-medium'>
                      {formatCurrency(
                        projects.reduce((sum, p) => sum + (p.budget || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Hours Logged:</span>
                    <span className='font-medium'>
                      {projects.reduce(
                        (sum, p) => sum + (p.actualHours || 0),
                        0
                      )}{' '}
                      hours
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Active Projects:
                    </span>
                    <span className='font-medium'>
                      {projects.filter((p) => p.status === 'active').length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Completed Projects:
                    </span>
                    <span className='font-medium'>
                      {projects.filter((p) => p.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='documents' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <IconFileText className='h-5 w-5' />
                  Client Documents & Files
                </CardTitle>
                <Button variant='outline'>
                  <IconPlus className='mr-2 h-4 w-4' />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Accessibility Policy */}
                {client.hasAccessibilityPolicy &&
                  client.accessibilityPolicyUrl && (
                    <div className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-3'>
                          <IconShield className='mt-0.5 h-5 w-5 text-green-500' />
                          <div>
                            <h5 className='font-medium'>
                              Accessibility Policy
                            </h5>
                            <p className='text-muted-foreground text-sm'>
                              Current accessibility policy document
                            </p>
                            <a
                              href={client.accessibilityPolicyUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-xs text-blue-600 hover:underline'
                            >
                              {client.accessibilityPolicyUrl}
                            </a>
                          </div>
                        </div>
                        <Button size='sm' variant='outline'>
                          View Policy
                        </Button>
                      </div>
                    </div>
                  )}

                {/* Previous Audit Results */}
                {client.existingAudits && client.previousAuditResults && (
                  <div className='rounded-lg border p-4'>
                    <div className='flex items-start gap-3'>
                      <IconFileText className='mt-0.5 h-5 w-5 text-blue-500' />
                      <div>
                        <h5 className='font-medium'>Previous Audit Results</h5>
                        <p className='text-muted-foreground mt-1 text-sm'>
                          {client.previousAuditResults}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compliance Documents */}
                {client.complianceDocuments &&
                  client.complianceDocuments.length > 0 && (
                    <div className='rounded-lg border p-4'>
                      <div className='flex items-start gap-3'>
                        <IconKey className='mt-0.5 h-5 w-5 text-purple-500' />
                        <div>
                          <h5 className='font-medium'>
                            Required Compliance Documents
                          </h5>
                          <div className='mt-2 flex flex-wrap gap-2'>
                            {client.complianceDocuments.map((doc, index) => (
                              <Badge
                                key={index}
                                variant='outline'
                                className='text-xs'
                              >
                                {doc.replace('-', ' ').toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Project Documents */}
                {documents.length > 0 && (
                  <div>
                    <h4 className='mb-3 font-medium'>Project Documents</h4>
                    <div className='space-y-3'>
                      {documents.map((document) => (
                        <div
                          key={document.id}
                          className='rounded-lg border p-4'
                        >
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-3'>
                              <IconFileText className='mt-0.5 h-5 w-5 text-blue-500' />
                              <div>
                                <h5 className='font-medium'>{document.name}</h5>
                                <p className='text-muted-foreground text-sm capitalize'>
                                  {document.type.replace('_', ' ')} • Version{' '}
                                  {document.version}
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                  Uploaded {formatDate(document.uploadedAt)} by{' '}
                                  {document.uploadedBy}
                                </p>
                              </div>
                            </div>
                            <Button size='sm' variant='outline'>
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {documents.length === 0 &&
                  !client.hasAccessibilityPolicy &&
                  !client.existingAudits && (
                    <div className='text-muted-foreground py-12 text-center'>
                      <IconFileText className='mx-auto mb-4 h-16 w-16 opacity-50' />
                      <h3 className='mb-2 text-lg font-medium'>No Documents</h3>
                      <p className='text-sm'>
                        No documents have been uploaded for this client yet.
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
