'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { notify } from '@/lib/notifications';
import { Project } from '@/types/project';
import { AccessibilityIssue } from '@/types/accessibility';
import {
  ReportType,
  SystemPromptConfig,
  EmailConfig,
  AIReportResponse
} from '@/types/reports';
import ProjectSelector from './project-selector';
import IssueSelector from './issue-selector';
import SystemPromptConfigComponent from './system-prompt-config';
import ReportPreview from './report-preview';
import EmailEditor from './email-editor';
import {
  IconFileText,
  IconAlertTriangle,
  IconRobot,
  IconMail,
  IconCheck
} from '@tabler/icons-react';

interface ReportGeneratorStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: ReportGeneratorStep[] = [
  {
    id: 'project',
    title: 'Select Project',
    description: 'Choose the project for your report',
    icon: IconFileText
  },
  {
    id: 'issues',
    title: 'Select Issues',
    description: 'Choose accessibility issues to include',
    icon: IconAlertTriangle
  },
  {
    id: 'generate',
    title: 'Generate Report',
    description: 'Add custom instructions and generate',
    icon: IconRobot
  },
  {
    id: 'email',
    title: 'Configure & Send Email',
    description: 'Edit content and send the report',
    icon: IconMail
  }
];

export default function EnhancedReportGenerator() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<AccessibilityIssue[]>(
    []
  );
  const [reportType, setReportType] = useState<ReportType>('monthly_progress');
  const [reportTitle, setReportTitle] = useState('');
  const [systemPromptConfig, setSystemPromptConfig] =
    useState<SystemPromptConfig>({
      tone: 'professional',
      focus: 'compliance',
      includeRecommendations: true,
      includePriority: true,
      includeTimeline: false
    });
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [generatedReport, setGeneratedReport] =
    useState<AIReportResponse | null>(null);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    recipients: [],
    ccRecipients: [],
    bccRecipients: [],
    subject: '',
    senderName: '',
    companyName: '',
    emailBody: '' // Will be populated with AI content
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  // Auto-generate report title and fetch client email when project changes
  useEffect(() => {
    if (selectedProject && reportType) {
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      setReportTitle(
        `Accessibility Report - ${selectedProject.name} - ${date}`
      );
      setEmailConfig((prev) => ({
        ...prev,
        subject: `Accessibility Report: ${selectedProject.name} - ${date}`
      }));

      // Fetch client data to auto-fill email
      const fetchClientData = async () => {
        try {
          const response = await fetch(
            `/api/clients/${selectedProject.clientId}`
          );
          if (response.ok) {
            const clientData = await response.json();
            if (clientData.success && clientData.data?.email) {
              setEmailConfig((prev) => ({
                ...prev,
                recipients: [clientData.data.email],
                companyName: clientData.data.company || selectedProject.name
              }));
            }
          }
        } catch (error) {}
      };

      fetchClientData();
    }
  }, [selectedProject, reportType]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 0: // Project selection
        return !!selectedProject;
      case 1: // Issues selection
        return selectedIssues.length > 0 && !!reportTitle.trim();
      case 2: // Generate report (will auto-advance after generation)
        return !!(editedContent || aiGeneratedContent);
      case 3: // Email
        return (
          emailConfig.recipients.length > 0 && !!emailConfig.subject.trim()
        );
      default:
        return false;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'ArrowRight':
            event.preventDefault();
            if (canProceedToNext()) {
              handleNext();
            }
            break;
          case 'ArrowLeft':
            event.preventDefault();
            if (currentStep > 0) {
              handlePrevious();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

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

  const generateSystemPrompt = (config: SystemPromptConfig): string => {
    let prompt = `Generate a ${config.tone} accessibility report with a focus on ${config.focus.replace('_', ' ')}.`;

    if (config.includeRecommendations) {
      prompt += ' Include specific, actionable recommendations for each issue.';
    }

    if (config.includePriority) {
      prompt += ' Prioritize issues by severity and business impact.';
    }

    if (config.includeTimeline) {
      prompt +=
        ' Include suggested timelines for remediation based on issue complexity.';
    }

    if (config.customInstructions) {
      prompt += ` Additional instructions: ${config.customInstructions}`;
    }

    return prompt;
  };

  const handleGenerateReport = async () => {
    if (!selectedProject || selectedIssues.length === 0) {
      notify.error('Please select a project and issues first');
      return;
    }

    setIsGenerating(true);
    setGeneratingStatus('Analyzing accessibility issues...');

    try {
      // Generate the AI content (no database save yet)
      const systemPrompt = generateSystemPrompt(systemPromptConfig);
      setGeneratingStatus('Generating AI report content...');

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          issueIds: selectedIssues.map((issue) => issue.id),
          reportType,
          systemPrompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI report');
      }

      setGeneratingStatus('Processing AI response...');
      const result = await response.json(); // Debug log

      setGeneratingStatus('Finalizing report...');
      // Handle the actual API response structure
      if (result.success && result.data) {
        const aiContent = result.data.content || '';
        const aiSummary = result.data.summary || '';
        const aiRecommendations = result.data.recommendations || [];

        // Validate that we have actual content
        if (!aiContent.trim()) {
          throw new Error('AI generated empty content. Please try again.');
        }

        setAiGeneratedContent(aiContent);
        setEditedContent(aiContent);

        // Store the full AI response for the preview component with safe defaults
        setGeneratedReport({
          content: aiContent,
          summary: aiSummary,
          recommendations: aiRecommendations,
          estimatedReadingTime:
            result.data.estimatedReadingTime ||
            Math.ceil(aiContent.split(/\s+/).length / 200),
          technicalDetails: result.data.technicalDetails,
          businessImpact: result.data.businessImpact
        });

        notify.report.generated(reportTitle || 'Report');
        // Auto-advance to email step
        setTimeout(() => setCurrentStep(3), 1000);
      } else {
        throw new Error(
          result.error || 'Invalid response format from AI service'
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      notify.error(`Failed to generate report: ${errorMessage}`, {
        action: {
          label: 'Retry',
          onClick: () => handleGenerateReport()
        }
      });
    } finally {
      setIsGenerating(false);
      setGeneratingStatus('');
    }
  };

  const _handleSaveReport = async (
    status: 'draft' | 'generated' | 'sent' = 'draft'
  ) => {
    const reportContent = editedContent || aiGeneratedContent;
    if (!selectedProject || !reportTitle.trim() || !reportContent.trim()) {
      notify.error('Missing required report data');
      return;
    }

    try {
      const reportData = {
        projectId: selectedProject.id,
        title: reportTitle,
        reportType: reportType,
        aiGeneratedContent: aiGeneratedContent,
        editedContent: reportContent,
        status: status,
        createdBy: 'current-user-id', // TODO: Replace with actual user ID
        issueIds: selectedIssues.map((issue) => issue.id)
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save report');
      }

      const result = await response.json();
      setReportId(result.data.id);

      if (status === 'sent') {
        // Update issues to mark them as sent
        await updateIssuesSentStatus(
          selectedIssues.map((issue) => issue.id),
          result.data.id
        );
      }

      return result.data.id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      notify.report.error('save', errorMessage);
      throw error;
    }
  };

  const updateIssuesSentStatus = async (
    issueIds: string[],
    reportId: string
  ) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      await fetch('/api/issues/update-sent-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueIds,
          reportId,
          sentDate: currentDate.toISOString(),
          sentMonth: currentMonth
        })
      });
    } catch (error) {}
  };

  const handleSendEmail = async (config: EmailConfig) => {
    const reportContent = editedContent || aiGeneratedContent;
    if (!selectedProject || !reportContent || !reportTitle.trim()) {
      notify.error('Missing report data for email');
      return;
    }

    setIsSending(true);
    try {
      // First, create the report record in the database
      const finalContent = editedContent || aiGeneratedContent;
      const createReportResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          title: reportTitle,
          reportType,
          aiGeneratedContent: aiGeneratedContent,
          editedContent: finalContent,
          status: editedContent !== aiGeneratedContent ? 'edited' : 'generated',
          issueIds: selectedIssues.map((issue) => issue.id),
          createdBy: user?.id || 'system'
        })
      });

      if (!createReportResponse.ok) {
        const errorData = await createReportResponse.json();
        throw new Error(errorData.error || 'Failed to create report');
      }

      const reportResult = await createReportResponse.json();
      const newReportId = reportResult.data.id;
      setReportId(newReportId);

      // Send email via API endpoint
      const emailResponse = await fetch('/api/reports/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: config.recipients,
          subject: config.subject,
          reportTitle,
          reportContent: reportContent,
          projectName: selectedProject.name,
          issueCount: selectedIssues.length,
          reportDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          companyName: config.companyName,
          senderName: config.senderName
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const _emailResult = await emailResponse.json();

      // Update report status to sent
      await fetch(`/api/reports/${newReportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'sent',
          sentAt: new Date().toISOString(),
          sentTo: config.recipients,
          ccRecipients: config.ccRecipients,
          bccRecipients: config.bccRecipients,
          emailSubject: config.subject
        })
      });

      // Update issues sent status
      await updateIssuesSentStatus(
        selectedIssues.map((issue) => issue.id),
        newReportId
      );

      const totalRecipients =
        config.recipients.length +
        (config.ccRecipients?.length || 0) +
        (config.bccRecipients?.length || 0);
      notify.report.sent(totalRecipients);
      router.push('/dashboard/reports');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      notify.report.error('send', errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <IconFileText className='text-primary h-5 w-5' />
                <CardTitle>Step 1: Select Project</CardTitle>
              </div>
              <CardDescription>
                Choose the project you want to create a report for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectSelector
                selectedProject={selectedProject}
                onProjectSelect={(project) => {
                  setSelectedProject(project);
                  if (project) {
                    // Auto-advance after project selection
                    setTimeout(() => handleNext(), 500);
                  }
                }}
              />
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <IssueSelector
            projectId={selectedProject?.id || ''}
            selectedIssues={selectedIssues}
            onSelectIssues={setSelectedIssues}
            reportType={reportType}
            onSelectReportType={setReportType}
            reportTitle={reportTitle}
            onReportTitleChange={setReportTitle}
            onBack={handlePrevious}
            onGenerate={handleNext}
            isGenerating={false}
          />
        );
      case 2:
        return (
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <IconRobot className='text-primary h-5 w-5' />
                  <CardTitle>Step 3: Generate Report</CardTitle>
                </div>
                <CardDescription>
                  Add any custom instructions for the AI, then generate your
                  report.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {/* Custom Instructions */}
                  <div className='space-y-3'>
                    <label className='text-sm font-medium'>
                      Custom Instructions (Optional)
                    </label>
                    <textarea
                      className='border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      placeholder='Add any specific instructions for the AI report generation... (e.g., "Focus on critical issues first", "Include code examples", "Use simple language")'
                      value={systemPromptConfig.customInstructions || ''}
                      onChange={(e) =>
                        setSystemPromptConfig({
                          ...systemPromptConfig,
                          customInstructions: e.target.value
                        })
                      }
                    />
                  </div>

                  {/* Generation Status or Button */}
                  <div className='py-8 text-center'>
                    {isGenerating ? (
                      <div className='space-y-4'>
                        <div className='flex items-center justify-center gap-3'>
                          <IconRobot className='text-primary h-8 w-8 animate-pulse' />
                          <div className='text-lg font-medium'>
                            Generating AI Report
                          </div>
                        </div>
                        <div className='text-muted-foreground text-sm'>
                          {generatingStatus || 'Processing...'}
                        </div>
                        <div className='mx-auto h-2 w-64 rounded-full bg-gray-200'>
                          <div
                            className='bg-primary h-2 animate-pulse rounded-full'
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                        <p className='text-muted-foreground text-xs'>
                          This may take 30-60 seconds. Please wait...
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        <Button
                          onClick={handleGenerateReport}
                          disabled={isGenerating}
                          size='lg'
                        >
                          <IconRobot className='mr-2 h-5 w-5' />
                          Generate Report with AI
                        </Button>
                        <div className='flex justify-between pt-4'>
                          <Button variant='outline' onClick={handlePrevious}>
                            Previous Step
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 3:
        return (
          <EmailEditor
            config={emailConfig}
            onConfigChange={setEmailConfig}
            reportTitle={reportTitle}
            reportContent={editedContent || aiGeneratedContent}
            projectName={selectedProject?.name || ''}
            issueCount={selectedIssues.length}
            onBack={handlePrevious}
            onSend={handleSendEmail}
            isSending={isSending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Generate Accessibility Report</CardTitle>
        <CardDescription>
          Create and send AI-powered accessibility reports with custom
          configuration.
        </CardDescription>
        <div className='space-y-2'>
          <div className='text-muted-foreground flex justify-between text-sm'>
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>
        <div className='mt-4 flex items-center gap-2'>
          {steps.map((step, _index) => (
            <div key={step.id} className='flex items-center gap-2'>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  _index <= currentStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground text-muted-foreground'
                }`}
              >
                {_index < currentStep ? (
                  <IconCheck className='h-4 w-4' />
                ) : (
                  <step.icon className='h-4 w-4' />
                )}
              </div>
              {_index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 ${
                    _index < currentStep
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>{renderCurrentStep()}</CardContent>
    </Card>
  );
}
