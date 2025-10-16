'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SystemPromptConfig } from '@/types/reports';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
  IconBulb,
  IconTarget,
  IconClock
} from '@tabler/icons-react';

interface SystemPromptConfigProps {
  config: SystemPromptConfig;
  onConfigChange: (config: SystemPromptConfig) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function SystemPromptConfigComponent({
  config,
  onConfigChange,
  onBack,
  onNext
}: SystemPromptConfigProps) {
  const updateConfig = (updates: Partial<SystemPromptConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const toneOptions = [
    {
      value: 'professional',
      label: 'Professional',
      description: 'Formal and business-appropriate tone'
    },
    {
      value: 'friendly',
      label: 'Friendly',
      description: 'Approachable and conversational tone'
    },
    {
      value: 'technical',
      label: 'Technical',
      description: 'Detailed and technical language'
    },
    {
      value: 'executive',
      label: 'Executive',
      description: 'High-level summary for executives'
    }
  ];

  const focusOptions = [
    {
      value: 'compliance',
      label: 'Compliance',
      description: 'Focus on WCAG compliance and legal requirements'
    },
    {
      value: 'user_experience',
      label: 'User Experience',
      description: 'Emphasize impact on user experience'
    },
    {
      value: 'technical_details',
      label: 'Technical Details',
      description: 'Highlight technical implementation details'
    },
    {
      value: 'business_impact',
      label: 'Business Impact',
      description: 'Focus on business and financial implications'
    }
  ];

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <IconSettings className='text-primary h-5 w-5' />
          <CardTitle>Step 3: Customize AI Report Generation</CardTitle>
        </div>
        <CardDescription>
          Configure how the AI should generate your report content. These
          settings will influence the tone, focus, and structure of the
          generated report.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Tone Selection */}
        <div className='space-y-3'>
          <Label htmlFor='tone-select' className='text-base font-medium'>
            Report Tone
          </Label>
          <Select
            value={config.tone}
            onValueChange={(value: SystemPromptConfig['tone']) =>
              updateConfig({ tone: value })
            }
          >
            <SelectTrigger id='tone-select'>
              <SelectValue placeholder='Select report tone' />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className='font-medium'>{option.label}</div>
                    <div className='text-muted-foreground text-xs'>
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Focus Selection */}
        <div className='space-y-3'>
          <Label htmlFor='focus-select' className='text-base font-medium'>
            Report Focus
          </Label>
          <Select
            value={config.focus}
            onValueChange={(value: SystemPromptConfig['focus']) =>
              updateConfig({ focus: value })
            }
          >
            <SelectTrigger id='focus-select'>
              <SelectValue placeholder='Select report focus' />
            </SelectTrigger>
            <SelectContent>
              {focusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className='font-medium'>{option.label}</div>
                    <div className='text-muted-foreground text-xs'>
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content Options */}
        <div className='space-y-4'>
          <Label className='text-base font-medium'>Content Options</Label>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='include-recommendations'
                checked={config.includeRecommendations}
                onCheckedChange={(checked) =>
                  updateConfig({ includeRecommendations: checked as boolean })
                }
              />
              <div className='grid gap-1.5 leading-none'>
                <Label
                  htmlFor='include-recommendations'
                  className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  <div className='flex items-center gap-1'>
                    <IconBulb className='h-4 w-4' />
                    Include Recommendations
                  </div>
                </Label>
                <p className='text-muted-foreground text-xs'>
                  Add specific recommendations for fixing issues
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='include-priority'
                checked={config.includePriority}
                onCheckedChange={(checked) =>
                  updateConfig({ includePriority: checked as boolean })
                }
              />
              <div className='grid gap-1.5 leading-none'>
                <Label
                  htmlFor='include-priority'
                  className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  <div className='flex items-center gap-1'>
                    <IconTarget className='h-4 w-4' />
                    Include Priority Levels
                  </div>
                </Label>
                <p className='text-muted-foreground text-xs'>
                  Prioritize issues by severity and impact
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='include-timeline'
                checked={config.includeTimeline}
                onCheckedChange={(checked) =>
                  updateConfig({ includeTimeline: checked as boolean })
                }
              />
              <div className='grid gap-1.5 leading-none'>
                <Label
                  htmlFor='include-timeline'
                  className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  <div className='flex items-center gap-1'>
                    <IconClock className='h-4 w-4' />
                    Include Timeline
                  </div>
                </Label>
                <p className='text-muted-foreground text-xs'>
                  Add suggested timeline for remediation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className='space-y-3'>
          <Label
            htmlFor='custom-instructions'
            className='text-base font-medium'
          >
            Custom Instructions (Optional)
          </Label>
          <Textarea
            id='custom-instructions'
            placeholder='Add any specific instructions for the AI to follow when generating the report...'
            value={config.customInstructions || ''}
            onChange={(e) =>
              updateConfig({ customInstructions: e.target.value })
            }
            rows={4}
            className='resize-none'
          />
          <p className='text-muted-foreground text-xs'>
            These instructions will be added to the AI prompt to customize the
            report generation.
          </p>
        </div>

        {/* Preview of Generated Prompt */}
        <div className='space-y-3'>
          <Label className='text-base font-medium'>
            Generated Prompt Preview
          </Label>
          <div className='bg-muted/50 rounded-md border p-4 text-sm'>
            <p className='mb-2 font-medium'>System Prompt:</p>
            <p className='text-muted-foreground'>
              Generate a {config.tone} accessibility report with a focus on{' '}
              {config.focus.replace('_', ' ')}.
              {config.includeRecommendations &&
                ' Include specific recommendations for each issue.'}
              {config.includePriority &&
                ' Prioritize issues by severity and impact.'}
              {config.includeTimeline &&
                ' Include suggested timelines for remediation.'}
              {config.customInstructions &&
                ` Additional instructions: ${config.customInstructions}`}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className='flex justify-between pt-4'>
          <Button variant='outline' onClick={onBack}>
            <IconChevronLeft className='mr-2 h-4 w-4' />
            Back to Issues
          </Button>
          <Button onClick={onNext}>
            Generate Report
            <IconChevronRight className='ml-2 h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
