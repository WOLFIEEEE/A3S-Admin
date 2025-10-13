'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  IconBug,
  IconCode,
  IconExternalLink,
  IconCalendar,
  IconEdit,
  IconLink,
  IconFileText,
  IconSettings,
  IconSend,
  IconMessageCircle
} from '@tabler/icons-react';
import Link from 'next/link';
import { AccessibilityIssueWithRelations } from '@/types/accessibility';
import { toast } from 'sonner';

interface IssueDetailViewProps {
  issue: AccessibilityIssueWithRelations;
}

const severityColors = {
  '1_critical':
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
  '2_high':
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200',
  '3_medium':
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
  '4_low':
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200'
};

const devStatusColors = {
  not_started:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200',
  in_progress:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
  done: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
  blocked:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
  '3rd_party':
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200',
  wont_fix:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200'
};

const qaStatusColors = {
  not_started:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200',
  in_progress:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
  fixed:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
  verified:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200',
  failed:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
  '3rd_party':
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200'
};

const issueTypeLabels = {
  automated_tools: 'Automated Tools',
  screen_reader: 'Screen Reader',
  keyboard_navigation: 'Keyboard Navigation',
  color_contrast: 'Color Contrast',
  text_spacing: 'Text Spacing',
  browser_zoom: 'Browser Zoom',
  other: 'Other'
};

const severityLabels = {
  '1_critical': 'Critical',
  '2_high': 'High',
  '3_medium': 'Medium',
  '4_low': 'Low'
};

const devStatusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
  '3rd_party': '3rd Party',
  wont_fix: "Won't Fix"
};

const qaStatusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  fixed: 'Fixed',
  verified: 'Verified',
  failed: 'Failed',
  '3rd_party': '3rd Party'
};

const commentTypeLabels = {
  general: 'General',
  dev_update: 'Development Update',
  qa_feedback: 'QA Feedback',
  technical_note: 'Technical Note',
  resolution: 'Resolution'
};

const authorRoleLabels = {
  developer: 'Developer',
  qa_tester: 'QA Tester',
  accessibility_expert: 'Accessibility Expert',
  project_manager: 'Project Manager',
  client: 'Client'
};

export default function IssueDetailView({ issue }: IssueDetailViewProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [devStatus, setDevStatus] = useState(issue.devStatus);
  const [qaStatus, setQaStatus] = useState(issue.qaStatus);
  const [devNotes, setDevNotes] = useState(issue.devComments || '');
  const [qaNotes, setQaNotes] = useState(issue.qaComments || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<string>('general');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/issues/${issue.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          devStatus,
          qaStatus,
          devNotes,
          qaNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Issue status updated successfully');
      setIsEditingStatus(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update issue status');
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commentText: newComment,
          commentType,
          authorId: 'current-user', // Replace with actual user ID
          authorName: 'Current User', // Replace with actual user name
          authorRole: 'developer', // Replace with actual user role
          isInternal: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      toast.success('Comment added successfully');
      setNewComment('');
      setCommentType('general');
      // Refresh the page to show new comment
      window.location.reload();
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-2 flex items-center gap-3'>
            <IconBug className='text-muted-foreground h-6 w-6' />
            <h1 className='text-2xl font-bold'>{issue.issueTitle}</h1>
          </div>
          <div className='mb-4 flex items-center gap-2'>
            <Badge className={severityColors[issue.severity]}>
              {severityLabels[issue.severity]}
            </Badge>
            <Badge variant='outline'>{issueTypeLabels[issue.issueType]}</Badge>
            {issue.conformanceLevel && (
              <Badge variant='outline'>WCAG {issue.conformanceLevel}</Badge>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={isEditingStatus ? 'default' : 'outline'}
            onClick={() => setIsEditingStatus(!isEditingStatus)}
          >
            <IconEdit className='mr-2 h-4 w-4' />
            {isEditingStatus ? 'Cancel Edit' : 'Edit Status'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Content */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFileText className='h-5 w-5' />
                Issue Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issue.issueDescription ? (
                <p className='text-muted-foreground whitespace-pre-wrap'>
                  {issue.issueDescription}
                </p>
              ) : (
                <p className='text-muted-foreground italic'>
                  No description provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCode className='h-5 w-5' />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {issue.failedWcagCriteria &&
                  issue.failedWcagCriteria.length > 0 && (
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        WCAG Criteria
                      </label>
                      <p className='bg-muted mt-1 rounded p-2 font-mono text-sm'>
                        {issue.failedWcagCriteria.join(', ')}
                      </p>
                    </div>
                  )}
              </div>

              {issue.testUrl && (
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Test URL
                  </label>
                  <div className='mt-1 flex items-center gap-2'>
                    <p className='bg-muted flex-1 rounded p-2 font-mono text-sm'>
                      {issue.testUrl.url}
                    </p>
                    <Button variant='outline' size='sm' asChild>
                      <a
                        href={issue.testUrl.url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <IconExternalLink className='h-4 w-4' />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {issue.expectedBehavior && (
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Expected Behavior
                  </label>
                  <p className='bg-muted mt-1 rounded p-3 text-sm whitespace-pre-wrap'>
                    {issue.expectedBehavior}
                  </p>
                </div>
              )}

              {issue.actualBehavior && (
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Actual Behavior
                  </label>
                  <p className='bg-muted mt-1 rounded p-3 text-sm whitespace-pre-wrap'>
                    {issue.actualBehavior}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Updates */}
          {isEditingStatus && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconSettings className='h-5 w-5' />
                  Update Status
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <label className='mb-2 block text-sm font-medium'>
                      Development Status
                    </label>
                    <Select
                      value={devStatus}
                      onValueChange={(value) =>
                        setDevStatus(value as typeof devStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(devStatusLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='mb-2 block text-sm font-medium'>
                      QA Status
                    </label>
                    <Select
                      value={qaStatus}
                      onValueChange={(value) =>
                        setQaStatus(value as typeof qaStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(qaStatusLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium'>
                    Development Notes
                  </label>
                  <Textarea
                    value={devNotes}
                    onChange={(e) => setDevNotes(e.target.value)}
                    placeholder='Add development notes, progress updates, or technical details...'
                    rows={3}
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium'>
                    QA Notes
                  </label>
                  <Textarea
                    value={qaNotes}
                    onChange={(e) => setQaNotes(e.target.value)}
                    placeholder='Add QA notes, testing results, or verification details...'
                    rows={3}
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsEditingStatus(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconMessageCircle className='h-5 w-5' />
                Comments ({issue.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Add Comment */}
              <div className='bg-muted/50 space-y-3 rounded-lg p-4'>
                <div className='flex items-center gap-2'>
                  <Select value={commentType} onValueChange={setCommentType}>
                    <SelectTrigger className='w-48'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(commentTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder='Add a comment...'
                  rows={3}
                />
                <div className='flex justify-end'>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    size='sm'
                  >
                    <IconSend className='mr-2 h-4 w-4' />
                    {isAddingComment ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              {issue.comments && issue.comments.length > 0 ? (
                <div className='space-y-4'>
                  {issue.comments.map((comment) => (
                    <div key={comment.id} className='rounded-lg border p-4'>
                      <div className='mb-2 flex items-start justify-between'>
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback>
                              <AvatarFallback>
                                {comment.authorName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='text-sm font-medium'>
                              {comment.authorName}
                            </p>
                            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                              <Badge variant='outline' className='text-xs'>
                                {
                                  authorRoleLabels[
                                    comment.authorRole as keyof typeof authorRoleLabels
                                  ]
                                }
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {
                                  commentTypeLabels[
                                    comment.commentType as keyof typeof commentTypeLabels
                                  ]
                                }
                              </Badge>
                              <span>
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className='text-sm whitespace-pre-wrap'>
                        {comment.commentText}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground py-8 text-center'>
                  No comments yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconSettings className='h-5 w-5' />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-muted-foreground text-sm font-medium'>
                  Development
                </label>
                <Badge
                  className={`${devStatusColors[issue.devStatus]} mt-1 block w-fit`}
                >
                  {devStatusLabels[issue.devStatus]}
                </Badge>
                {issue.devComments && (
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {issue.devComments}
                  </p>
                )}
              </div>

              <div>
                <label className='text-muted-foreground text-sm font-medium'>
                  Quality Assurance
                </label>
                <Badge
                  className={`${qaStatusColors[issue.qaStatus]} mt-1 block w-fit`}
                >
                  {qaStatusLabels[issue.qaStatus]}
                </Badge>
                {issue.qaComments && (
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {issue.qaComments}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          {issue.project && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconLink className='h-5 w-5' />
                  Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/clients/${issue.project.clientId}/projects/${issue.project.id}`}
                  className='font-medium text-blue-600 hover:text-blue-800'
                >
                  {issue.project.name}
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconCalendar className='h-5 w-5' />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div>
                <label className='text-muted-foreground'>Issue ID</label>
                <p className='font-mono'>{issue.id}</p>
              </div>
              <div>
                <label className='text-muted-foreground'>Created</label>
                <p>{new Date(issue.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className='text-muted-foreground'>Last Updated</label>
                <p>{new Date(issue.updatedAt).toLocaleString()}</p>
              </div>
              {issue.testingMonth && (
                <div>
                  <label className='text-muted-foreground'>
                    Testing Period
                  </label>
                  <p>
                    {issue.testingMonth} {issue.testingYear}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Issues */}
          {(issue.duplicateOf ||
            (issue.duplicates && issue.duplicates.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconLink className='h-5 w-5' />
                  Related Issues
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {issue.duplicateOf && (
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      Duplicate of
                    </label>
                    <Link
                      href={`/dashboard/issues/${issue.duplicateOf.id}`}
                      className='mt-1 block text-sm text-blue-600 hover:text-blue-800'
                    >
                      {issue.duplicateOf.issueTitle}
                    </Link>
                  </div>
                )}

                {issue.duplicates && issue.duplicates.length > 0 && (
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      Duplicates ({issue.duplicates.length})
                    </label>
                    <div className='mt-1 space-y-1'>
                      {issue.duplicates.map((duplicate) => (
                        <Link
                          key={duplicate.id}
                          href={`/dashboard/issues/${duplicate.id}`}
                          className='block text-sm text-blue-600 hover:text-blue-800'
                        >
                          {duplicate.issueTitle}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
