'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AccessibilityIssue } from '@/types/accessibility';
import { Separator } from '@/components/ui/separator';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconEye,
  IconBug,
  IconClock,
  IconCheck,
  IconExternalLink,
  IconCalendar,
  IconUser,
  IconAlertTriangle
} from '@tabler/icons-react';
import Link from 'next/link';
import { AccessibilityIssueWithRelations } from '@/types/accessibility';

interface IssuesListingProps {
  issues: AccessibilityIssueWithRelations[];
}

interface IssueWithProject extends AccessibilityIssue {
  project?: {
    id: string;
    name: string;
    clientId: string;
  };
  testUrl?: {
    url: string;
    category: string;
  };
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

export default function IssuesListing({ issues }: IssuesListingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedDevStatuses, setSelectedDevStatuses] = useState<string[]>([]);
  const [selectedQaStatuses, setSelectedQaStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'updatedAt' | 'severity' | 'title'
  >('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues.filter((issue) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          issue.issueTitle.toLowerCase().includes(searchLower) ||
          issue.issueDescription?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Issue type filter
      if (
        selectedIssueTypes.length > 0 &&
        !selectedIssueTypes.includes(issue.issueType)
      ) {
        return false;
      }

      // Severity filter
      if (
        selectedSeverities.length > 0 &&
        !selectedSeverities.includes(issue.severity)
      ) {
        return false;
      }

      // Dev status filter
      if (
        selectedDevStatuses.length > 0 &&
        !selectedDevStatuses.includes(issue.devStatus)
      ) {
        return false;
      }

      // QA status filter
      if (
        selectedQaStatuses.length > 0 &&
        !selectedQaStatuses.includes(issue.qaStatus)
      ) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'severity':
          aValue = parseInt(a.severity.charAt(0));
          bValue = parseInt(b.severity.charAt(0));
          break;
        case 'title':
          aValue = a.issueTitle.toLowerCase();
          bValue = b.issueTitle.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    issues,
    searchTerm,
    selectedIssueTypes,
    selectedSeverities,
    selectedDevStatuses,
    selectedQaStatuses,
    sortBy,
    sortOrder
  ]);

  const handleIssueTypeChange = (issueType: string, checked: boolean) => {
    if (checked) {
      setSelectedIssueTypes([...selectedIssueTypes, issueType]);
    } else {
      setSelectedIssueTypes(selectedIssueTypes.filter((t) => t !== issueType));
    }
  };

  const handleSeverityChange = (severity: string, checked: boolean) => {
    if (checked) {
      setSelectedSeverities([...selectedSeverities, severity]);
    } else {
      setSelectedSeverities(selectedSeverities.filter((s) => s !== severity));
    }
  };

  const handleDevStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedDevStatuses([...selectedDevStatuses, status]);
    } else {
      setSelectedDevStatuses(selectedDevStatuses.filter((s) => s !== status));
    }
  };

  const handleQaStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedQaStatuses([...selectedQaStatuses, status]);
    } else {
      setSelectedQaStatuses(selectedQaStatuses.filter((s) => s !== status));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedIssueTypes([]);
    setSelectedSeverities([]);
    setSelectedDevStatuses([]);
    setSelectedQaStatuses([]);
  };

  const activeFiltersCount =
    selectedIssueTypes.length +
    selectedSeverities.length +
    selectedDevStatuses.length +
    selectedQaStatuses.length;

  return (
    <div className='space-y-6'>
      {/* Header with Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Total Issues
                </p>
                <p className='text-2xl font-bold'>{issues.length}</p>
              </div>
              <IconBug className='text-muted-foreground h-8 w-8' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Critical
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {issues.filter((i) => i.severity === '1_critical').length}
                </p>
              </div>
              <IconAlertTriangle className='h-8 w-8 text-red-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  In Progress
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {issues.filter((i) => i.devStatus === 'in_progress').length}
                </p>
              </div>
              <IconClock className='h-8 w-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Completed
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {
                    issues.filter(
                      (i) => i.devStatus === 'done' && i.qaStatus === 'verified'
                    ).length
                  }
                </p>
              </div>
              <IconCheck className='h-8 w-8 text-green-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-4 lg:flex-row'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                <Input
                  placeholder='Search issues by title, description, element, or WCAG criteria...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Sort */}
            <div className='flex gap-2'>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='updatedAt'>Last Updated</SelectItem>
                  <SelectItem value='createdAt'>Created Date</SelectItem>
                  <SelectItem value='severity'>Severity</SelectItem>
                  <SelectItem value='title'>Title</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant='outline'
                size='icon'
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {sortOrder === 'asc' ? (
                  <IconSortAscending className='h-4 w-4' />
                ) : (
                  <IconSortDescending className='h-4 w-4' />
                )}
              </Button>

              <Button
                variant='outline'
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center gap-2'
              >
                <IconFilter className='h-4 w-4' />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant='secondary' className='ml-1'>
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <>
              <Separator className='my-4' />
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {/* Issue Type Filter */}
                <div>
                  <Label className='mb-3 block text-sm font-medium'>
                    Issue Type
                  </Label>
                  <div className='space-y-2'>
                    {Object.entries(issueTypeLabels).map(([value, label]) => (
                      <div key={value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`type-${value}`}
                          checked={selectedIssueTypes.includes(value)}
                          onCheckedChange={(checked) =>
                            handleIssueTypeChange(value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`type-${value}`} className='text-sm'>
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Filter */}
                <div>
                  <Label className='mb-3 block text-sm font-medium'>
                    Severity
                  </Label>
                  <div className='space-y-2'>
                    {Object.entries(severityLabels).map(([value, label]) => (
                      <div key={value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`severity-${value}`}
                          checked={selectedSeverities.includes(value)}
                          onCheckedChange={(checked) =>
                            handleSeverityChange(value, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`severity-${value}`}
                          className='text-sm'
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dev Status Filter */}
                <div>
                  <Label className='mb-3 block text-sm font-medium'>
                    Dev Status
                  </Label>
                  <div className='space-y-2'>
                    {Object.entries(devStatusLabels).map(([value, label]) => (
                      <div key={value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`dev-${value}`}
                          checked={selectedDevStatuses.includes(value)}
                          onCheckedChange={(checked) =>
                            handleDevStatusChange(value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`dev-${value}`} className='text-sm'>
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QA Status Filter */}
                <div>
                  <Label className='mb-3 block text-sm font-medium'>
                    QA Status
                  </Label>
                  <div className='space-y-2'>
                    {Object.entries(qaStatusLabels).map(([value, label]) => (
                      <div key={value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`qa-${value}`}
                          checked={selectedQaStatuses.includes(value)}
                          onCheckedChange={(checked) =>
                            handleQaStatusChange(value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`qa-${value}`} className='text-sm'>
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className='mt-4 flex justify-end'>
                  <Button variant='outline' onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>
          Showing {filteredAndSortedIssues.length} of {issues.length} issues
        </p>
      </div>

      {/* Issues List */}
      <div className='space-y-4'>
        {filteredAndSortedIssues.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <IconBug className='text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50' />
              <h3 className='mb-2 text-lg font-medium'>No Issues Found</h3>
              <p className='text-muted-foreground'>
                {searchTerm || activeFiltersCount > 0
                  ? 'Try adjusting your search or filters to find issues.'
                  : 'No accessibility issues have been identified yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedIssues.map((issue) => (
            <Card key={issue.id} className='transition-shadow hover:shadow-md'>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <h3 className='text-lg font-semibold'>
                        {issue.issueTitle}
                      </h3>
                      <Badge className={severityColors[issue.severity]}>
                        {severityLabels[issue.severity]}
                      </Badge>
                      <Badge variant='outline'>
                        {issueTypeLabels[issue.issueType]}
                      </Badge>
                    </div>

                    {issue.issueDescription && (
                      <p className='text-muted-foreground mb-3 line-clamp-2'>
                        {issue.issueDescription}
                      </p>
                    )}

                    <div className='text-muted-foreground mb-3 flex flex-wrap gap-4 text-sm'>
                      <div className='flex items-center gap-1'>
                        <IconCalendar className='h-4 w-4' />
                        <span>
                          Updated:{' '}
                          {new Date(issue.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Badge className={devStatusColors[issue.devStatus]}>
                        Dev: {devStatusLabels[issue.devStatus]}
                      </Badge>
                      <Badge className={qaStatusColors[issue.qaStatus]}>
                        QA: {qaStatusLabels[issue.qaStatus]}
                      </Badge>
                      {issue.conformanceLevel && (
                        <Badge variant='outline'>
                          WCAG {issue.conformanceLevel}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className='ml-4 flex items-center gap-2'>
                    <Link href={`/dashboard/issues/${issue.id}`}>
                      <Button variant='outline' size='sm'>
                        <IconEye className='mr-1 h-4 w-4' />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Additional Info */}
                <div className='flex items-center justify-between border-t pt-3'>
                  <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                    {(issue as IssueWithProject).project && (
                      <span>
                        Project: {(issue as IssueWithProject).project!.name}
                      </span>
                    )}
                    {(issue as IssueWithProject).testUrl && (
                      <div className='flex items-center gap-1'>
                        <IconExternalLink className='h-4 w-4' />
                        <span>
                          URL: {(issue as IssueWithProject).testUrl!.url}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <IconUser className='h-4 w-4' />
                    <span>ID: {issue.id.slice(-8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
