'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmailConfig } from '@/types/reports';
import {
  IconMail,
  IconPlus,
  IconX,
  IconChevronLeft,
  IconSend,
  IconLoader2,
  IconEye
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface EmailEditorProps {
  config: EmailConfig;
  onConfigChange: (config: EmailConfig) => void;
  reportTitle: string;
  reportContent: string;
  projectName: string;
  issueCount: number;
  onBack: () => void;
  onSend: (config: EmailConfig) => Promise<void>;
  isSending?: boolean;
}

export default function EmailEditor({
  config,
  onConfigChange,
  reportTitle,
  reportContent,
  projectName,
  issueCount,
  onBack,
  onSend,
  isSending = false
}: EmailEditorProps) {
  const [newRecipient, setNewRecipient] = useState('');
  const [newCcRecipient, setNewCcRecipient] = useState('');
  const [newBccRecipient, setNewBccRecipient] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Initialize email body with AI content if not already set
  React.useEffect(() => {
    if (reportContent && !config.emailBody) {
      updateConfig({ emailBody: reportContent });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportContent]);

  // Keyboard shortcut for sending
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (
          !isSending &&
          config.recipients.length > 0 &&
          config.subject.trim()
        ) {
          handleSend();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSending, config.recipients.length, config.subject]);

  const updateConfig = (updates: Partial<EmailConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const addRecipient = () => {
    if (newRecipient.trim() && isValidEmail(newRecipient.trim())) {
      const email = newRecipient.trim().toLowerCase();
      if (!config.recipients.includes(email)) {
        updateConfig({
          recipients: [...config.recipients, email]
        });
        setNewRecipient('');
      } else {
        toast.error('This email is already in the recipient list');
      }
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const removeRecipient = (email: string) => {
    updateConfig({
      recipients: config.recipients.filter((r) => r !== email)
    });
  };

  const addCcRecipient = () => {
    if (newCcRecipient.trim() && isValidEmail(newCcRecipient.trim())) {
      const email = newCcRecipient.trim().toLowerCase();
      const ccRecipients = config.ccRecipients || [];
      if (!ccRecipients.includes(email) && !config.recipients.includes(email)) {
        updateConfig({
          ccRecipients: [...ccRecipients, email]
        });
        setNewCcRecipient('');
      } else {
        toast.error('This email is already in the recipient or CC list');
      }
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const removeCcRecipient = (email: string) => {
    updateConfig({
      ccRecipients: (config.ccRecipients || []).filter((r) => r !== email)
    });
  };

  const addBccRecipient = () => {
    if (newBccRecipient.trim() && isValidEmail(newBccRecipient.trim())) {
      const email = newBccRecipient.trim().toLowerCase();
      const bccRecipients = config.bccRecipients || [];
      if (
        !bccRecipients.includes(email) &&
        !config.recipients.includes(email) &&
        !(config.ccRecipients || []).includes(email)
      ) {
        updateConfig({
          bccRecipients: [...bccRecipients, email]
        });
        setNewBccRecipient('');
      } else {
        toast.error('This email is already in the recipient, CC, or BCC list');
      }
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const removeBccRecipient = (email: string) => {
    updateConfig({
      bccRecipients: (config.bccRecipients || []).filter((r) => r !== email)
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleSend = async () => {
    // Validation
    if (config.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }
    if (!config.subject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }
    if (!reportContent || !reportContent.trim()) {
      toast.error(
        'No report content available to send. Please generate the report first.'
      );
      return;
    }

    const totalRecipients =
      config.recipients.length +
      (config.ccRecipients?.length || 0) +
      (config.bccRecipients?.length || 0);

    if (totalRecipients > 50) {
      toast.error('Too many recipients. Please limit to 50 total recipients.');
      return;
    }

    await onSend(config);
  };

  const generateDefaultMessage = () => {
    return `Hi,

I hope this email finds you well. Please find the latest accessibility report for ${projectName}.

This comprehensive report includes ${issueCount} accessibility issues that have been identified and thoroughly analyzed. Our team has conducted a detailed assessment to ensure your digital platform meets accessibility standards and provides an inclusive user experience.

Key highlights from this report:
• Comprehensive analysis of accessibility issues with detailed descriptions
• WCAG 2.1 compliance assessment and gap analysis
• Prioritized recommendations for remediation with implementation timelines
• Technical implementation guidance with code examples where applicable
• Business impact assessment and compliance risk evaluation
• Quality assurance procedures and testing methodologies

The report provides actionable insights to help improve your platform's accessibility and ensure compliance with relevant accessibility standards. Each issue includes detailed information about the problem, its impact on users, and specific steps for resolution.

Please review the report and let me know if you have any questions or need clarification on any of the findings. Our team is available to discuss implementation strategies and provide ongoing support throughout the remediation process.

Best regards,
${config.senderName || 'A3S Accessibility Team'}`;
  };

  const emailPreview = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${config.subject}</title>
    <meta name="color-scheme" content="light dark">
    <style>
        @media (prefers-color-scheme: dark) {
            body { background-color: #1a1a1a !important; color: #e5e5e5 !important; }
            .header { background-color: #2a2a2a !important; }
            .content-preview { background-color: #2a2a2a !important; border-left-color: #3b82f6 !important; }
            .footer { border-top-color: #404040 !important; color: #a1a1aa !important; }
            h1 { color: #60a5fa !important; }
            h3 { color: #e5e5e5 !important; }
            .project-info { color: #a1a1aa !important; }
            .preview-text { color: #d1d5db !important; }
        }
    </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
    <div class="header" style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
        <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">${reportTitle}</h1>
        <p class="project-info" style="margin: 0; color: #6b7280; font-size: 14px;">Project: ${projectName} | Issues: ${issueCount}</p>
    </div>
    
    <div style="white-space: pre-line; margin-bottom: 20px; color: #374151; font-size: 16px;">
        ${config.customMessage || generateDefaultMessage()}
    </div>
    
    <div class="content-preview" style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Report Content Preview</h3>
        <div class="preview-text" style="max-height: 250px; overflow-y: auto; font-size: 14px; color: #4b5563; line-height: 1.5;">
            ${
              config.emailBody
                ? // Since AI now generates HTML, we can use it directly with some styling adjustments
                  config.emailBody
                    .replace(
                      /<h1>/g,
                      '<h1 style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #1f2937;">'
                    )
                    .replace(
                      /<h2>/g,
                      '<h2 style="font-size: 16px; font-weight: bold; margin: 8px 0; color: #374151;">'
                    )
                    .replace(
                      /<h3>/g,
                      '<h3 style="font-size: 14px; font-weight: bold; margin: 6px 0; color: #4b5563;">'
                    )
                    .replace(
                      /<p>/g,
                      '<p style="margin: 8px 0; line-height: 1.4;">'
                    )
                    .replace(
                      /<ul>/g,
                      '<ul style="margin: 8px 0; padding-left: 20px;">'
                    )
                    .replace(
                      /<ol>/g,
                      '<ol style="margin: 8px 0; padding-left: 20px;">'
                    )
                    .replace(/<li>/g, '<li style="margin: 2px 0;">')
                    .substring(0, 1200)
                : 'AI report content will appear here after generation...'
            }${config.emailBody && config.emailBody.length > 1200 ? '...' : ''}
        </div>
    </div>
    
    <div class="footer" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p style="margin: 5px 0;">This report was generated by A3S Accessibility Solutions</p>
        ${config.senderName ? `<p style="margin: 5px 0;">Sent by: ${config.senderName}</p>` : ''}
    </div>
</body>
</html>
  `;

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <IconMail className='text-primary h-5 w-5' />
          <CardTitle>Step 4: Send Report via Email</CardTitle>
        </div>
        <CardDescription>
          Configure and send the generated report to your recipients via email.
          <br />
          <span className='text-muted-foreground mt-1 block text-xs'>
            💡 Tip: Use Ctrl/Cmd + Enter to send the email quickly
          </span>
        </CardDescription>
        {!reportContent && (
          <div className='mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
            <p className='text-sm text-yellow-800'>
              ⚠️ No report content available. Please go back and generate the
              report first.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Recipients */}
        <div className='space-y-3'>
          <Label className='text-base font-medium'>Recipients</Label>
          <div className='flex gap-2'>
            <Input
              placeholder='Enter email address'
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              onKeyPress={handleKeyPress}
              className='flex-1'
            />
            <Button onClick={addRecipient} size='sm'>
              <IconPlus className='h-4 w-4' />
            </Button>
          </div>
          {config.recipients.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {config.recipients.map((email) => (
                <Badge
                  key={email}
                  variant='secondary'
                  className='flex items-center gap-1'
                >
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    className='hover:bg-destructive/20 ml-1 rounded-full p-0.5'
                  >
                    <IconX className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* CC Recipients */}
        <div className='space-y-3'>
          <Label className='text-base font-medium'>
            CC Recipients (Optional)
          </Label>
          <div className='flex gap-2'>
            <Input
              placeholder='Enter CC email address'
              value={newCcRecipient}
              onChange={(e) => setNewCcRecipient(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCcRecipient();
                }
              }}
              className='flex-1'
            />
            <Button onClick={addCcRecipient} size='sm' variant='outline'>
              <IconPlus className='h-4 w-4' />
            </Button>
          </div>
          {config.ccRecipients && config.ccRecipients.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {config.ccRecipients.map((email) => (
                <Badge
                  key={email}
                  variant='outline'
                  className='flex items-center gap-1'
                >
                  CC: {email}
                  <button
                    onClick={() => removeCcRecipient(email)}
                    className='hover:bg-destructive/20 ml-1 rounded-full p-0.5'
                  >
                    <IconX className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* BCC Recipients */}
        <div className='space-y-3'>
          <Label className='text-base font-medium'>
            BCC Recipients (Optional)
          </Label>
          <div className='flex gap-2'>
            <Input
              placeholder='Enter BCC email address'
              value={newBccRecipient}
              onChange={(e) => setNewBccRecipient(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addBccRecipient();
                }
              }}
              className='flex-1'
            />
            <Button onClick={addBccRecipient} size='sm' variant='outline'>
              <IconPlus className='h-4 w-4' />
            </Button>
          </div>
          {config.bccRecipients && config.bccRecipients.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {config.bccRecipients.map((email) => (
                <Badge
                  key={email}
                  variant='secondary'
                  className='flex items-center gap-1'
                >
                  BCC: {email}
                  <button
                    onClick={() => removeBccRecipient(email)}
                    className='hover:bg-destructive/20 ml-1 rounded-full p-0.5'
                  >
                    <IconX className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Email Subject */}
        <div className='space-y-3'>
          <Label htmlFor='email-subject' className='text-base font-medium'>
            Email Subject
          </Label>
          <Input
            id='email-subject'
            placeholder='e.g., Accessibility Report - Monthly Update'
            value={config.subject}
            onChange={(e) => updateConfig({ subject: e.target.value })}
          />
        </div>

        {/* Sender Information */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='sender-name'>Sender Name (Optional)</Label>
            <Input
              id='sender-name'
              placeholder='Your name'
              value={config.senderName || ''}
              onChange={(e) => updateConfig({ senderName: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='company-name'>Company Name (Optional)</Label>
            <Input
              id='company-name'
              placeholder='Your company'
              value={config.companyName || ''}
              onChange={(e) => updateConfig({ companyName: e.target.value })}
            />
          </div>
        </div>

        {/* Custom Message */}
        <div className='space-y-3'>
          <Label htmlFor='custom-message' className='text-base font-medium'>
            Custom Message (Optional)
          </Label>
          <Textarea
            id='custom-message'
            placeholder='Add a custom message to include in the email...'
            value={config.customMessage || ''}
            onChange={(e) => updateConfig({ customMessage: e.target.value })}
            rows={4}
            className='resize-none'
          />
          <p className='text-muted-foreground text-xs'>
            If left empty, a default professional message will be generated.
          </p>
        </div>

        {/* Email Body - AI Generated Content (Editable) */}
        <div className='space-y-3'>
          <Label htmlFor='email-body' className='text-base font-medium'>
            Report Content (Editable)
          </Label>
          <Textarea
            id='email-body'
            placeholder='AI-generated report content will appear here...'
            value={config.emailBody || ''}
            onChange={(e) => updateConfig({ emailBody: e.target.value })}
            rows={15}
            className='resize-y font-mono text-sm'
          />
          <p className='text-muted-foreground text-xs'>
            Edit the AI-generated report content as needed before sending.
          </p>
        </div>

        {/* Email Preview */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-base font-medium'>Email Preview</Label>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowPreview(!showPreview)}
            >
              <IconEye className='mr-2 h-4 w-4' />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
          {showPreview && (
            <div className='bg-muted/50 max-h-96 overflow-y-auto rounded-md border p-4'>
              <div dangerouslySetInnerHTML={{ __html: emailPreview }} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='flex justify-between pt-4'>
          <Button variant='outline' onClick={onBack}>
            <IconChevronLeft className='mr-2 h-4 w-4' />
            Back to Report
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || config.recipients.length === 0}
          >
            {isSending ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <IconSend className='mr-2 h-4 w-4' />
                Send Report ({config.recipients.length})
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
