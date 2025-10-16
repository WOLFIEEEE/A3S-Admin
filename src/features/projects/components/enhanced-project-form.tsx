'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreateProjectInput, Client } from '@/types';
import { getPlatformCredentials } from '@/lib/platform-credentials';
import { toast } from 'sonner';
import {
  IconBuilding,
  IconTarget,
  IconLoader2,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFolder,
  IconUpload,
  IconFile,
  IconX,
  IconTag,
  IconKey,
  IconShield
} from '@tabler/icons-react';

// Enhanced schema for multi-step form
const enhancedProjectSchema = z
  .object({
    // Step 1: Project Type
    isA3SProject: z.boolean(),

    // Step 2: Basic Info
    clientId: z.string().min(1, 'Please select a client'),
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    description: z.string().optional(),
    websiteUrl: z
      .string()
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),

    // Step 2B: Project Type Details (only for regular projects)
    projectType: z
      .enum([
        'audit',
        'remediation',
        'monitoring',
        'training',
        'consultation',
        'full_compliance'
      ])
      .optional(),
    customProjectType: z.string().optional(),

    // Step 2: Tech Stack
    techStack: z.enum([
      'wordpress',
      'shopify',
      'drupal',
      'wix',
      'squarespace',
      'webflow',
      'tylertech',
      'other'
    ]),
    customTechStack: z.string().optional(),

    // Step 2: Basic Settings
    wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

    // Step 3: Documents (handled separately)

    // Step 4: Platform Credentials (dynamic based on tech stack)
    credentials: z.record(z.string(), z.string()).optional(),

    // Optional
    notes: z.string().optional()
  })
  .refine(
    (data) => {
      // If tech stack is 'other', require custom description
      if (data.techStack === 'other') {
        return data.customTechStack && data.customTechStack.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Custom tech stack description is required',
      path: ['customTechStack']
    }
  );

type EnhancedProjectFormData = z.infer<typeof enhancedProjectSchema>;

interface ProjectDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  tags: string[];
  uploadedAt: Date;
}

interface EnhancedProjectFormProps {
  onSubmit: (
    data: CreateProjectInput,
    documents: ProjectDocument[]
  ) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateProjectInput>;
}

// Platform-specific credential configurations
// Platform-specific credential configurations are now imported from lib/platform-credentials.ts
// This provides comprehensive, real-world credential requirements for each platform

const PROJECT_TYPES = [
  {
    value: 'audit',
    label: 'Audit Project',
    description: 'One-time accessibility assessment'
  },
  {
    value: 'remediation',
    label: 'Remediation Project',
    description: 'Fix existing accessibility issues'
  },
  {
    value: 'monitoring',
    label: 'Monitoring Project',
    description: 'Ongoing compliance tracking'
  },
  {
    value: 'training',
    label: 'Training Project',
    description: 'Accessibility training and education'
  },
  {
    value: 'consultation',
    label: 'Consultation Project',
    description: 'Advisory and strategic guidance'
  },
  {
    value: 'full_compliance',
    label: 'Full Compliance Project',
    description: 'Complete accessibility compliance solution'
  }
];

const DOCUMENT_TAGS = [
  'accessibility-policy',
  'previous-audit',
  'wcag-guidelines',
  'design-system',
  'user-research',
  'compliance-requirements',
  'technical-specs',
  'brand-guidelines',
  'other'
];

export default function EnhancedProjectForm({
  onSubmit,
  onCancel,
  initialData
}: EnhancedProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<EnhancedProjectFormData>({
    resolver: zodResolver(enhancedProjectSchema),
    defaultValues: {
      isA3SProject: initialData?.projectType === 'a3s_program' || false,
      clientId: initialData?.clientId || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      websiteUrl: initialData?.websiteUrl || '',
      projectType: (initialData as any)?.projectType || undefined,
      techStack: (initialData?.techStack as any) || 'wordpress',
      wcagLevel: initialData?.wcagLevel || 'AA',
      priority: initialData?.priority || 'medium',
      credentials: {},
      notes: initialData?.notes || ''
    }
  });

  const watchedValues = form.watch();
  const isA3SProject = watchedValues.isA3SProject;
  const selectedTechStack = watchedValues.techStack;
  const _selectedProjectType = watchedValues.projectType;

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoadingClients(true);
      const response = await fetch('/api/clients');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // The API returns { clients: [...], total, page, limit, totalPages }
          const clientsData = result.data?.clients || [];
          setClients(Array.isArray(clientsData) ? clientsData : []);
        } else {
          setClients([]);
        }
      } else {
        setClients([]);
      }
    } catch (error) {
      setClients([]);
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (
    step: number
  ): (keyof EnhancedProjectFormData)[] => {
    switch (step) {
      case 1:
        return ['isA3SProject'];
      case 2:
        const baseFields: (keyof EnhancedProjectFormData)[] = [
          'clientId',
          'name',
          'techStack'
        ];
        if (!isA3SProject) {
          baseFields.push('projectType');
        }
        if (selectedTechStack === 'other') {
          baseFields.push('customTechStack');
        }
        return baseFields;
      case 3:
        return []; // Documents are optional
      case 4:
        return []; // Credentials validation handled separately
      default:
        return [];
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const fileId = `${Date.now()}-${file.name}`;
      setUploadingFiles((prev) => [...prev, fileId]);

      try {
        // Simulate file upload - replace with actual upload logic
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newDocument: ProjectDocument = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          tags: [],
          uploadedAt: new Date()
        };

        setDocuments((prev) => [...prev, newDocument]);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingFiles((prev) => prev.filter((id) => id !== fileId));
      }
    }
  };

  const addTagToDocument = (documentId: string, tag: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId && !doc.tags.includes(tag)
          ? { ...doc, tags: [...doc.tags, tag] }
          : doc
      )
    );
  };

  const removeTagFromDocument = (documentId: string, tag: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, tags: doc.tags.filter((t) => t !== tag) }
          : doc
      )
    );
  };

  const removeDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const handleFormSubmit = async (data: EnhancedProjectFormData) => {
    try {
      setIsSubmitting(true);

      // Transform form data to CreateProjectInput
      const projectData: CreateProjectInput = {
        clientId: data.clientId,
        name: data.name,
        description: data.description || undefined,
        status: 'planning',
        priority: data.priority,
        wcagLevel: data.wcagLevel,
        projectType: isA3SProject ? 'a3s_program' : data.projectType || 'audit',
        projectPlatform: 'website',
        techStack:
          data.techStack === 'other'
            ? data.customTechStack || 'other'
            : data.techStack,
        websiteUrl: data.websiteUrl || undefined,
        notes: data.notes || undefined,
        billingType: 'fixed',
        complianceRequirements: [],
        testingMethodology: [],
        deliverables: [],
        acceptanceCriteria: [],
        tags: [],
        createdBy: 'current-user',
        lastModifiedBy: 'current-user',
        // Add credentials if provided
        ...(data.credentials &&
          Object.keys(data.credentials).length > 0 && {
            stagingCredentials: data.credentials
          })
      };

      await onSubmit(projectData, documents);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderProjectTypeStep();
      case 2:
        return renderBasicInfoStep();
      case 3:
        return renderDocumentsStep();
      case 4:
        return renderCredentialsStep();
      default:
        return null;
    }
  };

  const renderProjectTypeStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconTarget className='h-5 w-5' />
          Step 1: Project Type
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <FormField
          control={form.control}
          name='isA3SProject'
          render={({ field }) => (
            <FormItem>
              <FormLabel>What type of project is this?</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value ? 'a3s' : 'regular'}
                  onValueChange={(value) => field.onChange(value === 'a3s')}
                  className='space-y-4'
                >
                  <div className='hover:bg-muted/50 flex items-start space-x-3 rounded-lg border p-4'>
                    <RadioGroupItem value='a3s' id='a3s' className='mt-1' />
                    <div className='space-y-1'>
                      <Label htmlFor='a3s' className='font-medium'>
                        A3S Project
                      </Label>
                      <p className='text-muted-foreground text-sm'>
                        Monthly monitoring and remediation project. We handle
                        all ongoing accessibility improvements on a subscription
                        basis.
                      </p>
                    </div>
                  </div>
                  <div className='hover:bg-muted/50 flex items-start space-x-3 rounded-lg border p-4'>
                    <RadioGroupItem
                      value='regular'
                      id='regular'
                      className='mt-1'
                    />
                    <div className='space-y-1'>
                      <Label htmlFor='regular' className='font-medium'>
                        Regular Project
                      </Label>
                      <p className='text-muted-foreground text-sm'>
                        Custom project with specific requirements (audit,
                        remediation, monitoring, or combination).
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderBasicInfoStep = () => (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconBuilding className='h-5 w-5' />
            Step 2: Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Client Selection */}
          <FormField
            control={form.control}
            name='clientId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a client' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingClients ? (
                      <SelectItem value='loading' disabled>
                        Loading clients...
                      </SelectItem>
                    ) : !Array.isArray(clients) || clients.length === 0 ? (
                      <SelectItem value='no-clients' disabled>
                        No clients found
                      </SelectItem>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Project Name */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name *</FormLabel>
                <FormControl>
                  <Input placeholder='Enter project name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Project Type (only for regular projects) */}
          {!isA3SProject && (
            <FormField
              control={form.control}
              name='projectType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className='space-y-3'
                    >
                      {PROJECT_TYPES.map((type) => (
                        <div
                          key={type.value}
                          className='hover:bg-muted/50 flex items-start space-x-3 rounded-lg border p-3'
                        >
                          <RadioGroupItem
                            value={type.value}
                            id={type.value}
                            className='mt-1'
                          />
                          <div className='space-y-1'>
                            <Label htmlFor={type.value} className='font-medium'>
                              {type.label}
                            </Label>
                            <p className='text-muted-foreground text-sm'>
                              {type.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Tech Stack */}
          <FormField
            control={form.control}
            name='techStack'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technology Stack *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select technology stack' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='wordpress'>WordPress</SelectItem>
                    <SelectItem value='shopify'>Shopify</SelectItem>
                    <SelectItem value='drupal'>Drupal</SelectItem>
                    <SelectItem value='wix'>Wix</SelectItem>
                    <SelectItem value='squarespace'>Squarespace</SelectItem>
                    <SelectItem value='webflow'>Webflow</SelectItem>
                    <SelectItem value='tylertech'>
                      TylerTech (GovCMS)
                    </SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custom Tech Stack */}
          {selectedTechStack === 'other' && (
            <FormField
              control={form.control}
              name='customTechStack'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Technology Stack *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., React, Node.js, MongoDB'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Website URL */}
          <FormField
            control={form.control}
            name='websiteUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input
                    type='url'
                    placeholder='https://example.com'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Describe the project goals and requirements...'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            {/* WCAG Level */}
            <FormField
              control={form.control}
              name='wcagLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WCAG Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='A'>Level A</SelectItem>
                      <SelectItem value='AA'>Level AA</SelectItem>
                      <SelectItem value='AAA'>Level AAA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                      <SelectItem value='urgent'>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconFolder className='h-5 w-5' />
          Step 3: Project Documents
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='text-muted-foreground text-sm'>
          Upload any relevant documents such as accessibility policies, previous
          audits, design guidelines, etc.
        </div>

        {/* File Upload Area */}
        <div className='border-muted-foreground/25 rounded-lg border-2 border-dashed p-8 text-center'>
          <input
            type='file'
            multiple
            accept='.pdf,.doc,.docx,.txt,.md'
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className='hidden'
            id='file-upload'
          />
          <label htmlFor='file-upload' className='cursor-pointer'>
            <IconUpload className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <p className='text-lg font-medium'>Upload Documents</p>
            <p className='text-muted-foreground text-sm'>
              Click to select files or drag and drop
            </p>
            <p className='text-muted-foreground mt-2 text-xs'>
              Supported: PDF, DOC, DOCX, TXT, MD
            </p>
          </label>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className='space-y-4'>
            <h4 className='font-medium'>Uploaded Documents</h4>
            {documents.map((doc) => (
              <div key={doc.id} className='space-y-3 rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IconFile className='h-4 w-4' />
                    <span className='font-medium'>{doc.name}</span>
                    <span className='text-muted-foreground text-sm'>
                      ({(doc.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeDocument(doc.id)}
                  >
                    <IconX className='h-4 w-4' />
                  </Button>
                </div>

                {/* Tags */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <IconTag className='h-4 w-4' />
                    <span>Tags:</span>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {doc.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='cursor-pointer'
                        onClick={() => removeTagFromDocument(doc.id, tag)}
                      >
                        {tag}
                        <IconX className='ml-1 h-3 w-3' />
                      </Badge>
                    ))}
                  </div>
                  <Select
                    onValueChange={(tag) => addTagToDocument(doc.id, tag)}
                  >
                    <SelectTrigger className='w-48'>
                      <SelectValue placeholder='Add tag...' />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TAGS.filter(
                        (tag) => !doc.tags.includes(tag)
                      ).map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag
                            .replace('-', ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className='space-y-2'>
            <h4 className='font-medium'>Uploading...</h4>
            {uploadingFiles.map((fileId) => (
              <div key={fileId} className='flex items-center gap-2'>
                <IconLoader2 className='h-4 w-4 animate-spin' />
                <span className='text-sm'>Uploading file...</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCredentialsStep = () => {
    const platformConfig = getPlatformCredentials(selectedTechStack);

    if (!platformConfig) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconKey className='h-5 w-5' />
              Step 4: Platform Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='py-8 text-center'>
              <p className='text-muted-foreground'>
                No specific credentials required for this platform.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconKey className='h-5 w-5' />
            Step 4: {platformConfig.label} Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='text-muted-foreground text-sm'>
            Provide access credentials for {platformConfig.label}. This
            information is securely encrypted and used only for accessibility
            monitoring and testing.
          </div>

          <div className='space-y-4'>
            {platformConfig.credentials.map((cred) => (
              <div key={cred.id} className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <IconKey className='h-4 w-4' />
                  {cred.label}
                  {cred.required && <span className='text-red-500'>*</span>}
                </Label>

                {cred.description && (
                  <p className='text-muted-foreground text-xs'>
                    {cred.description}
                  </p>
                )}

                {cred.type === 'checkbox' ? (
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id={cred.id}
                      onCheckedChange={(checked) => {
                        const currentCreds =
                          form.getValues('credentials') || {};
                        form.setValue('credentials', {
                          ...currentCreds,
                          [cred.id]: checked ? 'true' : 'false'
                        });
                      }}
                    />
                    <Label htmlFor={cred.id} className='text-sm font-normal'>
                      {cred.description || cred.label}
                    </Label>
                  </div>
                ) : cred.type === 'textarea' ? (
                  <Textarea
                    placeholder={
                      cred.placeholder || `Enter ${cred.label.toLowerCase()}`
                    }
                    onChange={(e) => {
                      const currentCreds = form.getValues('credentials') || {};
                      form.setValue('credentials', {
                        ...currentCreds,
                        [cred.id]: e.target.value
                      });
                    }}
                  />
                ) : (
                  <Input
                    type={cred.type}
                    placeholder={
                      cred.placeholder || `Enter ${cred.label.toLowerCase()}`
                    }
                    onChange={(e) => {
                      const currentCreds = form.getValues('credentials') || {};
                      form.setValue('credentials', {
                        ...currentCreds,
                        [cred.id]: e.target.value
                      });
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Any additional information or special requirements...'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      {/* Progress Bar */}
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className='space-y-6'
        >
          {renderStepContent()}

          {/* Navigation Buttons */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex justify-between'>
                <div>
                  {currentStep > 1 && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handlePrevious}
                    >
                      <IconChevronLeft className='mr-2 h-4 w-4' />
                      Previous
                    </Button>
                  )}
                </div>

                <div className='flex gap-2'>
                  <Button type='button' variant='outline' onClick={onCancel}>
                    Cancel
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button type='button' onClick={handleNext}>
                      Next
                      <IconChevronRight className='ml-2 h-4 w-4' />
                    </Button>
                  ) : (
                    <Button type='submit' disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <IconCheck className='mr-2 h-4 w-4' />
                          Create Project
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
