'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  IconEye,
  IconEdit,
  IconDownload,
  IconMail,
  IconClock,
  IconCheck,
  IconDeviceFloppy
} from '@tabler/icons-react';
import { AIReportResponse } from '@/types/reports';
import { toast } from 'sonner';

interface ReportPreviewProps {
  report: AIReportResponse;
  reportTitle: string;
  projectName: string;
  onSave: () => void;
  onContentChange?: (content: string) => void;
  reportId?: string | null;
}

export default function ReportPreview({
  report,
  reportTitle,
  projectName,
  onSave,
  onContentChange,
  reportId
}: ReportPreviewProps) {
  // Safely initialize content with fallback
  const safeContent = report?.content || '';
  const [editedContent, setEditedContent] = useState(safeContent);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update content when report changes
  React.useEffect(() => {
    if (report?.content && report.content !== editedContent) {
      setEditedContent(report.content);
      setHasChanges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.content]);

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== report.content);
    // Notify parent component of content changes
    if (onContentChange) {
      onContentChange(value);
    }
  };

  const handleSaveChanges = async () => {
    if (!reportId) {
      toast.error('No report ID available for saving');
      return;
    }

    if (!editedContent.trim()) {
      toast.error('Cannot save empty content');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          editedContent: editedContent,
          status: 'edited'
        })
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Save operation failed');
      }

      setIsEditing(false);
      setHasChanges(false);
      toast.success('Changes saved successfully!');
    } catch (error) {
      toast.error(
        `Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Create a simple HTML export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            .meta { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .recommendation { background: #e7f3ff; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <div class="meta">
            <strong>Project:</strong> ${projectName}<br>
            <strong>Generated:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Reading Time:</strong> ${report.estimatedReadingTime} minutes
          </div>
          ${editedContent}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <CardTitle className='text-xl'>{reportTitle}</CardTitle>
              <CardDescription>
                Generated for {projectName} • {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary' className='flex items-center gap-1'>
                <IconClock className='h-3 w-3' />
                {report.estimatedReadingTime} min read
              </Badge>
              <Badge variant='outline' className='bg-green-50 text-green-700'>
                <IconCheck className='mr-1 h-3 w-3' />
                AI Generated
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      <Tabs defaultValue='preview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='preview' className='flex items-center gap-2'>
            <IconEye className='h-4 w-4' />
            Preview
          </TabsTrigger>
          <TabsTrigger value='edit' className='flex items-center gap-2'>
            <IconEdit className='h-4 w-4' />
            Edit Content
          </TabsTrigger>
          <TabsTrigger value='summary' className='flex items-center gap-2'>
            <IconCheck className='h-4 w-4' />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value='preview'>
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Review the AI-generated report content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editedContent ? (
                <div className='space-y-4'>
                  <div
                    className='prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-white p-6 dark:bg-gray-900'
                    dangerouslySetInnerHTML={{ __html: editedContent }}
                  />
                  <div className='text-muted-foreground text-xs'>
                    Word count:{' '}
                    {editedContent.replace(/<[^>]*>/g, '').split(/\s+/).length}{' '}
                    words
                  </div>
                </div>
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  <p>No content available to preview.</p>
                  <p className='text-sm'>
                    Generate a report first or switch to the Edit tab to add
                    content.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value='edit'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Edit Report Content</CardTitle>
                  <CardDescription>
                    Customize the AI-generated content to match your needs
                  </CardDescription>
                </div>
                {hasChanges && (
                  <Button
                    onClick={handleSaveChanges}
                    size='sm'
                    disabled={isLoading}
                  >
                    <IconDeviceFloppy className='mr-2 h-4 w-4' />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {isLoading && (
                  <div className='text-muted-foreground py-4 text-center'>
                    <p>Saving changes...</p>
                  </div>
                )}
                <Textarea
                  value={editedContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder='Edit your report content here...'
                  className='min-h-[500px] font-mono text-sm'
                  disabled={isLoading}
                />

                {hasChanges && (
                  <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950'>
                    <div className='flex items-center gap-2 text-yellow-800 dark:text-yellow-200'>
                      <IconEdit className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        Unsaved Changes
                      </span>
                    </div>
                    <p className='mt-1 text-xs text-yellow-700 dark:text-yellow-300'>
                      You have made changes to the report content. Don&apos;t
                      forget to save them.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value='summary'>
          <div className='space-y-4'>
            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm leading-relaxed'>
                  {report.summary ||
                    'No summary available. The AI report may still be generating or there was an issue with content generation.'}
                </p>
              </CardContent>
            </Card>

            {/* Key Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {report.recommendations && report.recommendations.length > 0 ? (
                  <div className='space-y-3'>
                    {report.recommendations.map((recommendation, _index) => (
                      <div
                        key={_index}
                        className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950'
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white'>
                            {_index + 1}
                          </div>
                          <p className='text-sm text-blue-900 dark:text-blue-100'>
                            {recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No recommendations available. The AI may still be processing
                    or there was an issue generating recommendations.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Report Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium'>Generated:</span>
                    <div className='text-muted-foreground'>
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className='font-medium'>Reading Time:</span>
                    <div className='text-muted-foreground'>
                      {report.estimatedReadingTime} minutes
                    </div>
                  </div>
                  <div>
                    <span className='font-medium'>Word Count:</span>
                    <div className='text-muted-foreground'>
                      {editedContent.split(/\s+/).length} words
                    </div>
                  </div>
                  <div>
                    <span className='font-medium'>Status:</span>
                    <div className='text-muted-foreground'>
                      {hasChanges ? 'Modified' : 'Generated'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleExport}>
            <IconDownload className='mr-2 h-4 w-4' />
            Export HTML
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' onClick={onSave}>
            <IconDeviceFloppy className='mr-2 h-4 w-4' />
            Save Draft
          </Button>
          <Button onClick={onSave}>
            <IconMail className='mr-2 h-4 w-4' />
            Send Report
          </Button>
        </div>
      </div>
    </div>
  );
}
