'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  IconCurrencyDollar,
  IconCheck,
  IconStar,
  IconWorldWww,
  IconClock,
  IconShield,
  IconTrendingUp,
  IconAlertCircle,
  IconCalculator
} from '@tabler/icons-react';

interface A3SBillingPlan {
  id: string;
  name: string;
  price: number;
  maxPages: number;
  features: string[];
  recommended?: boolean;
  description: string;
}

interface A3SBillingAssessmentProps {
  pageCount?: number;
  onPlanSelected?: (plan: A3SBillingPlan, monthlyTotal: number) => void;
  projectType?: string;
  clientType?: string;
}

const A3S_PLANS: A3SBillingPlan[] = [
  {
    id: 'starter',
    name: 'A3S Starter',
    price: 499,
    maxPages: 30,
    description: 'Perfect for small websites and landing pages',
    features: [
      'Up to 30 pages tested',
      'WCAG 2.2 AA compliance',
      'Monthly accessibility testing',
      'Basic remediation guidance',
      'Email support',
      'Compliance certificate',
      'Monthly progress reports'
    ]
  },
  {
    id: 'professional',
    name: 'A3S Professional',
    price: 1499,
    maxPages: 200,
    recommended: true,
    description: 'Ideal for medium to large websites and web applications',
    features: [
      'Up to 200 pages tested',
      'WCAG 2.2 AA compliance',
      'Monthly accessibility testing',
      'Detailed remediation guidance',
      'Priority email & phone support',
      'Compliance certificate',
      'Monthly progress reports',
      'Custom testing schedule',
      'Developer training sessions',
      'API access for automation'
    ]
  }
];

export default function A3SBillingAssessment({
  pageCount = 0,
  onPlanSelected,
  projectType = '',
  clientType = ''
}: A3SBillingAssessmentProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showCalculation, setShowCalculation] = useState(false);

  // Auto-select appropriate plan based on page count
  useEffect(() => {
    if (pageCount > 0) {
      const appropriatePlan = pageCount <= 30 ? 'starter' : 'professional';
      setSelectedPlan(appropriatePlan);
      setShowCalculation(true);
    }
  }, [pageCount]);

  const getRecommendedPlan = (): A3SBillingPlan | null => {
    if (pageCount <= 30) return A3S_PLANS[0];
    if (pageCount <= 200) return A3S_PLANS[1];
    return null;
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    const plan = A3S_PLANS.find((p) => p.id === planId);
    if (plan && onPlanSelected) {
      onPlanSelected(plan, plan.price);
    }
  };

  const isA3SProject = projectType === 'a3s_program';
  const recommendedPlan = getRecommendedPlan();

  if (!isA3SProject) {
    return (
      <Alert>
        <IconAlertCircle className='h-4 w-4' />
        <AlertDescription>
          A3S billing assessment is only available for A3S Program projects.
          Other project types use custom pricing based on scope and
          requirements.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconCurrencyDollar className='h-5 w-5' />
            A3S Billing Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
              <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
                A3S Program Pricing
              </h4>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                Our A3S (Accessibility as a Service) program offers monthly
                subscription plans based on the number of pages that need
                accessibility testing and compliance monitoring.
              </p>
            </div>

            {pageCount > 0 && (
              <div className='flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950'>
                <IconCalculator className='h-4 w-4 text-green-600' />
                <span className='text-sm font-medium text-green-900 dark:text-green-100'>
                  Detected {pageCount} pages -{' '}
                  {recommendedPlan
                    ? `${recommendedPlan.name} plan recommended`
                    : 'Custom pricing required'}
                </span>
              </div>
            )}

            {pageCount > 200 && (
              <Alert>
                <IconAlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Your website has {pageCount} pages, which exceeds our standard
                  plans. Please contact us for custom enterprise pricing
                  tailored to your needs.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection */}
      {pageCount <= 200 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your A3S Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPlan}
              onValueChange={handlePlanSelection}
            >
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {A3S_PLANS.map((plan) => {
                  const isRecommended = plan.id === recommendedPlan?.id;
                  const isSelected = selectedPlan === plan.id;
                  const isOverLimit = pageCount > plan.maxPages;

                  return (
                    <div key={plan.id} className='relative'>
                      <Label
                        htmlFor={plan.id}
                        className={`block cursor-pointer transition-all duration-200 ${
                          isOverLimit ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        <Card
                          className={`relative transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-500'
                              : isOverLimit
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-gray-200 hover:shadow-md'
                          }`}
                        >
                          {isRecommended && !isOverLimit && (
                            <div className='absolute -top-3 left-1/2 -translate-x-1/2 transform'>
                              <Badge className='bg-green-500 text-white'>
                                <IconStar className='mr-1 h-3 w-3' />
                                Recommended
                              </Badge>
                            </div>
                          )}

                          <CardHeader className='pb-4'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <CardTitle className='text-lg'>
                                  {plan.name}
                                </CardTitle>
                                <p className='text-muted-foreground mt-1 text-sm'>
                                  {plan.description}
                                </p>
                              </div>
                              <RadioGroupItem
                                value={plan.id}
                                id={plan.id}
                                disabled={isOverLimit}
                                className='shrink-0'
                              />
                            </div>

                            <div className='flex items-baseline gap-1'>
                              <span className='text-3xl font-bold'>
                                ${plan.price}
                              </span>
                              <span className='text-muted-foreground'>
                                /month
                              </span>
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <IconWorldWww className='text-muted-foreground h-4 w-4' />
                              <span>Up to {plan.maxPages} pages</span>
                              {pageCount > 0 && pageCount <= plan.maxPages && (
                                <Badge variant='outline' className='text-xs'>
                                  {plan.maxPages - pageCount} pages remaining
                                </Badge>
                              )}
                            </div>

                            {isOverLimit && (
                              <div className='flex items-center gap-2 text-sm text-red-600'>
                                <IconAlertCircle className='h-4 w-4' />
                                <span>Exceeds {plan.maxPages} page limit</span>
                              </div>
                            )}
                          </CardHeader>

                          <CardContent className='pt-0'>
                            <ul className='space-y-2'>
                              {plan.features.map((feature, index) => (
                                <li
                                  key={index}
                                  className='flex items-start gap-2 text-sm'
                                >
                                  <IconCheck className='mt-0.5 h-4 w-4 shrink-0 text-green-500' />
                                  <span
                                    className={
                                      isOverLimit ? 'text-muted-foreground' : ''
                                    }
                                  >
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Billing Summary */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconTrendingUp className='h-5 w-5' />
              Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const plan = A3S_PLANS.find((p) => p.id === selectedPlan);
              if (!plan) return null;

              return (
                <div className='space-y-4'>
                  <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-900'>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='font-medium'>{plan.name}</span>
                      <span className='font-bold'>${plan.price}/month</span>
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Monthly subscription • Up to {plan.maxPages} pages
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-4 text-center md:grid-cols-3'>
                    <div className='flex items-center justify-center gap-2'>
                      <IconClock className='h-4 w-4 text-blue-500' />
                      <div>
                        <div className='font-medium'>Monthly Billing</div>
                        <div className='text-muted-foreground text-xs'>
                          Recurring subscription
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-center gap-2'>
                      <IconShield className='h-4 w-4 text-green-500' />
                      <div>
                        <div className='font-medium'>WCAG 2.2 AA</div>
                        <div className='text-muted-foreground text-xs'>
                          Compliance standard
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-center gap-2'>
                      <IconWorldWww className='h-4 w-4 text-purple-500' />
                      <div>
                        <div className='font-medium'>
                          {pageCount || plan.maxPages} Pages
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          Testing coverage
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <IconCheck className='h-4 w-4' />
                    <AlertDescription>
                      <strong>Monthly Commitment:</strong> A3S plans are billed
                      monthly and can be cancelled anytime. Your first month
                      includes initial accessibility audit and setup.
                    </AlertDescription>
                  </Alert>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
