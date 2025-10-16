'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { AccessibilityIssue } from '@/types/accessibility';
import { ReportType } from '@/types/reports';
import {
  IconSearch,
  IconChevronLeft,
  IconLoader2,
  IconFileText,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconX,
  IconBug
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface IssueSelectorProps {
  projectId: string;
  selectedIssues: AccessibilityIssue[];
  onSelectIssues: (issues: AccessibilityIssue[]) => void;
  reportType: ReportType;
  onSelectReportType: (type: ReportType) => void;
  reportTitle: string;
  onReportTitleChange: (title: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const severityConfig = {
  '1_critical': {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: IconAlertTriangle
  },
  '2_high': {
    label: 'High',
    color:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: IconAlertTriangle
  },
  '3_medium': {
    label: 'Medium',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: IconClock
  },
  '4_low': {
    label: 'Low',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: IconClock
  }
};

const statusConfig = {
  not_started: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    icon: IconClock
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: IconClock
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: IconCircleCheck
  },
  blocked: {
    label: 'Blocked',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: IconX
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: IconCircleCheck
  }
};

export default function IssueSelector({
  projectId,
  selectedIssues,
  onSelectIssues,
  reportType,
  onSelectReportType,
  reportTitle,
  onReportTitleChange,
  onBack,
  onGenerate,
  isGenerating
}: IssueSelectorProps) {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/issues?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }
      const result = await response.json();
      // The issues API returns data directly as an array, not wrapped in a data object
      const issuesData = Array.isArray(result) ? result : result.data || [];
      setIssues(Array.isArray(issuesData) ? issuesData : []);
    } catch (error) {
      setIssues([]); // Ensure we have an empty array on error
      toast.error('Failed to load issues. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIssues = useMemo(() => {
    if (!Array.isArray(issues)) return [];

    return issues.filter((issue) => {
      const matchesSearch =
        !searchTerm ||
        issue.issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.issueDescription
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        issue.failedWcagCriteria?.some((criteria) =>
          criteria.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSeverity =
        severityFilter === 'all' || issue.severity === severityFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        issue.devStatus === statusFilter ||
        issue.qaStatus === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [issues, searchTerm, severityFilter, statusFilter]);

  const handleToggleIssue = (issue: AccessibilityIssue) => {
    const isSelected = selectedIssues.some((i) => i.id === issue.id);
    if (isSelected) {
      onSelectIssues(selectedIssues.filter((i) => i.id !== issue.id));
    } else {
      onSelectIssues([...selectedIssues, issue]);
    }
  };

  const handleSelectAll = () => {
    if (
      selectedIssues.length === filteredIssues.length &&
      filteredIssues.length > 0
    ) {
      onSelectIssues([]);
    } else {
      onSelectIssues(filteredIssues);
    }
  };

  const isIssueSelected = (issueId: string) => {
    return selectedIssues.some((issue) => issue.id === issueId);
  };

  const getStatusDisplay = (issue: AccessibilityIssue) => {
    // Prioritize QA status if it exists and is not 'not_started'
    if (issue.qaStatus && issue.qaStatus !== 'not_started') {
      return issue.qaStatus;
    }
    // Otherwise use dev status
    return issue.devStatus || 'not_started';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Select Issues & Report Type</CardTitle>
          <CardDescription>
            Loading accessibility issues for this project...
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <IconLoader2 className='text-primary h-8 w-8 animate-spin' />
          <p className='text-muted-foreground mt-2'>Loading issues...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Select Issues & Report Type</CardTitle>
        <CardDescription>
          Choose the accessibility issues to include in the report and configure
          report settings.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Report Configuration */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <Label htmlFor='report-title'>Report Title</Label>
            <Input
              id='report-title'
              placeholder='e.g., Monthly Accessibility Audit Summary'
              value={reportTitle}
              onChange={(e) => onReportTitleChange(e.target.value)}
              className='mt-1'
            />
          </div>
          <div>
            <Label htmlFor='report-type'>Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value: ReportType) => onSelectReportType(value)}
            >
              <SelectTrigger id='report-type' className='mt-1'>
                <SelectValue placeholder='Select report type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='monthly_progress'>
                  Monthly Progress
                </SelectItem>
                <SelectItem value='executive_summary'>
                  Executive Summary
                </SelectItem>
                <SelectItem value='technical_report'>
                  Technical Report
                </SelectItem>
                <SelectItem value='compliance_report'>
                  Compliance Report
                </SelectItem>
                <SelectItem value='custom'>Custom Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='relative flex-1'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search issues by title, description, or WCAG criteria...'
              className='pl-9'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className='w-full sm:w-[180px]'>
              <SelectValue placeholder='All Severities' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Severities</SelectItem>
              <SelectItem value='1_critical'>Critical</SelectItem>
              <SelectItem value='2_high'>High</SelectItem>
              <SelectItem value='3_medium'>Medium</SelectItem>
              <SelectItem value='4_low'>Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-full sm:w-[180px]'>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='not_started'>Not Started</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='done'>Done</SelectItem>
              <SelectItem value='blocked'>Blocked</SelectItem>
              <SelectItem value='verified'>Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selection Summary */}
        <div className='bg-muted/50 flex items-center justify-between rounded-lg p-4'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='select-all'
              checked={
                selectedIssues.length === filteredIssues.length &&
                filteredIssues.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor='select-all' className='font-medium'>
              Select All ({selectedIssues.length} of {filteredIssues.length}{' '}
              selected)
            </Label>
          </div>
          <Badge variant='secondary'>
            {filteredIssues.length} issue
            {filteredIssues.length !== 1 ? 's' : ''} found
          </Badge>
        </div>

        {/* Issues Table */}
        {!Array.isArray(filteredIssues) || filteredIssues.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <IconBug className='text-muted-foreground mb-4 h-16 w-16' />
              <h3 className='mb-2 text-lg font-medium'>No issues found</h3>
              <p className='text-muted-foreground text-center'>
                {searchTerm ||
                severityFilter !== 'all' ||
                statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No accessibility issues found for this project.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>
                    <span className='sr-only'>Select</span>
                  </TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>WCAG</TableHead>
                  <TableHead>Page</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(filteredIssues) &&
                  filteredIssues.map((issue) => {
                    const isSelected = isIssueSelected(issue.id);
                    const severity =
                      severityConfig[
                        issue.severity as keyof typeof severityConfig
                      ];
                    const status =
                      statusConfig[
                        getStatusDisplay(issue) as keyof typeof statusConfig
                      ];

                    return (
                      <TableRow
                        key={issue.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/5 border-primary/20'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleToggleIssue(issue)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleIssue(issue)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className='max-w-md'>
                          <div className='space-y-1'>
                            <p className='text-sm leading-tight font-medium'>
                              {issue.issueTitle}
                            </p>
                            {issue.issueDescription && (
                              <p className='text-muted-foreground line-clamp-2 text-xs'>
                                {issue.issueDescription}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              severity?.color || 'bg-gray-100 text-gray-800'
                            }
                          >
                            {severity?.label || issue.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              status?.color || 'bg-gray-100 text-gray-800'
                            }
                          >
                            {status?.label || getStatusDisplay(issue)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            {issue.failedWcagCriteria
                              ?.slice(0, 2)
                              .map((criteria, _index) => (
                                <Badge
                                  key={_index}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {criteria}
                                </Badge>
                              ))}
                            {issue.failedWcagCriteria &&
                              issue.failedWcagCriteria.length > 2 && (
                                <Badge variant='outline' className='text-xs'>
                                  +{issue.failedWcagCriteria.length - 2}
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className='max-w-xs'>
                          <p className='text-muted-foreground truncate text-xs'>
                            {issue.pageUrl || 'N/A'}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Actions */}
        <div className='flex justify-between pt-4'>
          <Button variant='outline' onClick={onBack}>
            <IconChevronLeft className='mr-2 h-4 w-4' /> Previous
          </Button>
          <Button
            onClick={onGenerate}
            disabled={
              selectedIssues.length === 0 || isGenerating || !reportTitle.trim()
            }
          >
            {isGenerating ? (
              <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <IconFileText className='mr-2 h-4 w-4' />
            )}
            Generate Report ({selectedIssues.length} issue
            {selectedIssues.length !== 1 ? 's' : ''})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
