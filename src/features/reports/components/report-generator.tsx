'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TabsTrigger } from '@/components/ui/tabs';
import {
  IconRobot,
  IconFileText,
  IconMail,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconCheck,
  IconAlertTriangle
} from '@tabler/icons-react';
import { toast } from 'sonner';
import ProjectSelector from './project-selector';
import IssueSelector from './issue-selector';
import ReportPreview from './report-preview';
import {
  ReportType,
  CreateReportInput,
  AIReportResponse
} from '@/types/reports';
import { Project } from '@/types/project';
import { AccessibilityIssue } from '@/types/accessibility';

interface ReportGeneratorStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isRequired: boolean;
}

const steps: ReportGeneratorStep[] = [
  {
    id: 'project',
    title: 'Select Project',
    description: 'Choose the project for your report',
    icon: IconFileText,
    isRequired: true
  },
  {
    id: 'issues',
    title: 'Select Issues',
    description: 'Choose which issues to include',
    icon: IconAlertTriangle,
    isRequired: true
  },
  {
    id: 'generate',
    title: 'Generate Report',
    description: 'AI-powered content generation',
    icon: IconRobot,
    isRequired: true
  },
  {
    id: 'review',
    title: 'Review & Edit',
    description: 'Review and customize the report',
    icon: IconCheck,
    isRequired: false
  }
];

const reportTypes: { value: ReportType; label: string; description: string }[] =
  [
    {
      value: 'monthly_progress',
      label: 'Monthly Progress',
      description:
        'Regular progress updates for ongoing accessibility improvements'
    },
    {
      value: 'executive_summary',
      label: 'Executive Summary',
      description: 'High-level overview for stakeholders and decision makers'
    },
    {
      value: 'technical_report',
      label: 'Technical Report',
      description: 'Detailed technical analysis for developers and QA teams'
    },
    {
      value: 'compliance_report',
      label: 'Compliance Report',
      description: 'WCAG compliance assessment for legal and regulatory review'
    }
  ];

export default function ReportGenerator() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<AccessibilityIssue[]>(
    []
  );
  const [reportType, setReportType] = useState<ReportType>('monthly_progress');
  const [reportTitle, setReportTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] =
    useState<AIReportResponse | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  // Auto-generate report title when project or type changes
  useEffect(() => {
    if (selectedProject && reportType) {
      const typeLabel =
        reportTypes.find((t) => t.value === reportType)?.label || 'Report';
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      setReportTitle(`${typeLabel} - ${selectedProject.name} - ${date}`);
    }
  }, [selectedProject, reportType]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 0: // Project selection
        return !!selectedProject;
      case 1: // Issue selection
        return selectedIssues.length > 0;
      case 2: // Generate report
        return !!generatedReport;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedProject || selectedIssues.length === 0) {
      toast.error('Please select a project and issues first');
      return;
    }

    setIsGenerating(true);

    try {
      // First, create the report record
      const createReportResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          title: reportTitle,
          reportType,
          issueIds: selectedIssues.map((issue) => issue.id),
          createdBy: 'current-user' // This should come from auth
        } as CreateReportInput)
      });

      if (!createReportResponse.ok) {
        throw new Error('Failed to create report record');
      }

      const reportResult = await createReportResponse.json();
      setReportId(reportResult.data.id);

      // Then generate the AI content
      const generateResponse = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          issueIds: selectedIssues.map((issue) => issue.id),
          reportType,
          includeRecommendations: true,
          includeTechnicalDetails: true,
          includeBusinessImpact: true
        })
      });

      if (!generateResponse.ok) {
        const error = await generateResponse.json();
        throw new Error(error.error || 'Failed to generate report content');
      }

      const aiResult = await generateResponse.json();
      setGeneratedReport(aiResult.data);

      // Update the report with AI-generated content
      await fetch(`/api/reports/${reportResult.data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aiGeneratedContent: aiResult.data.content,
          status: 'generated'
        })
      });

      toast.success('Report generated successfully!');
      handleNext();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate report'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndExit = () => {
    if (reportId) {
      router.push(`/dashboard/reports/${reportId}`);
    } else {
      router.push('/dashboard/reports');
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='space-y-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Generate New Report
          </h1>
          <p className='text-muted-foreground'>
            Create AI-powered accessibility reports for your projects
          </p>
        </div>

        {/* Progress */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Steps indicator */}
        <div className='flex justify-between'>
          {steps.map((step, _index) => {
            const Icon = step.icon;
            const isActive = _index === currentStep;
            const isCompleted = _index < currentStep;
            const isAccessible = _index <= currentStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  isAccessible ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : isActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-muted bg-background'
                  }`}
                >
                  {isCompleted ? (
                    <IconCheck className='h-5 w-5' />
                  ) : (
                    <Icon className='h-5 w-5' />
                  )}
                </div>
                <div className='text-center'>
                  <div
                    className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}
                  >
                    {step.title}
                  </div>
                  <div className='text-muted-foreground max-w-24 text-xs'>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {React.createElement(steps[currentStep].icon, {
              className: 'h-5 w-5'
            })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Step 0: Project Selection */}
          {currentStep === 0 && (
            <div className='space-y-4'>
              <ProjectSelector
                selectedProject={selectedProject}
                onProjectSelect={setSelectedProject}
              />

              {selectedProject && (
                <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
                  <div className='flex items-center gap-2'>
                    <IconCheck className='h-4 w-4 text-green-600 dark:text-green-400' />
                    <span className='font-medium text-green-900 dark:text-green-100'>
                      Project Selected: {selectedProject.name}
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-green-700 dark:text-green-300'>
                    {selectedProject.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Issue Selection */}
          {currentStep === 1 && selectedProject && (
            <div className='space-y-4'>
              <IssueSelector
                projectId={selectedProject.id}
                selectedIssues={selectedIssues}
                onSelectIssues={setSelectedIssues}
                reportType={reportType}
                onSelectReportType={setReportType}
                reportTitle={reportTitle}
                onReportTitleChange={setReportTitle}
                onBack={() => setCurrentStep(currentStep - 1)}
                onGenerate={handleGenerateReport}
                isGenerating={isGenerating}
              />

              {selectedIssues.length > 0 && (
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                  <div className='flex items-center gap-2'>
                    <IconCheck className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    <span className='font-medium text-blue-900 dark:text-blue-100'>
                      {selectedIssues.length} Issues Selected
                    </span>
                  </div>
                  <div className='mt-2 flex flex-wrap gap-1'>
                    {['1_critical', '2_high', '3_medium', '4_low'].map(
                      (severity) => {
                        const count = selectedIssues.filter(
                          (issue) => issue.severity === severity
                        ).length;
                        if (count === 0) return null;
                        return (
                          <Badge
                            key={severity}
                            variant='secondary'
                            className='text-xs'
                          >
                            {severity.replace('_', ' ')}: {count}
                          </Badge>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Generate Report */}
          {currentStep === 2 && (
            <div className='space-y-6'>
              {/* Report Type Selection */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Report Type</h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {reportTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-colors ${
                        reportType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setReportType(type.value)}
                    >
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>{type.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground text-xs'>
                          {type.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Report Title */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Report Title</label>
                <input
                  type='text'
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                  placeholder='Enter report title'
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || !reportTitle.trim()}
                className='w-full'
                size='lg'
              >
                {isGenerating ? (
                  <>
                    <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <IconRobot className='mr-2 h-4 w-4' />
                    Generate AI Report
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
                  <div className='flex items-center gap-2'>
                    <IconLoader2 className='h-4 w-4 animate-spin text-blue-600 dark:text-blue-400' />
                    <span className='font-medium text-blue-900 dark:text-blue-100'>
                      AI is analyzing your issues and generating the report...
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-blue-700 dark:text-blue-300'>
                    This may take a few moments depending on the number of
                    issues.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Edit */}
          {currentStep === 3 && generatedReport && (
            <ReportPreview
              report={generatedReport}
              reportTitle={reportTitle}
              projectName={selectedProject?.name || ''}
              onSave={handleSaveAndExit}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex justify-between'>
        <Button
          variant='outline'
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <IconChevronLeft className='mr-2 h-4 w-4' />
          Previous
        </Button>

        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleSaveAndExit}>
            Save & Exit
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceedToNext()}>
              Next
              <IconChevronRight className='ml-2 h-4 w-4' />
            </Button>
          ) : (
            <Button onClick={handleSaveAndExit}>
              <IconMail className='mr-2 h-4 w-4' />
              Send Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
