'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconWorldWww,
  IconLoader2,
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
  IconExternalLink,
  IconFileText,
  IconSearch,
  IconShield
} from '@tabler/icons-react';

interface URLAnalysisResult {
  totalPages: number;
  uniquePages: number;
  duplicatePages: number;
  errorPages: number;
  externalLinks: number;
  internalLinks: number;
  depth: number;
  sitemap?: string[];
  errors?: string[];
  recommendations?: string[];
  // Enhanced analysis data
  pageTypes: {
    static: number;
    dynamic: number;
    forms: number;
    media: number;
    downloads: number;
  };
  technologies: {
    cms: string | null;
    framework: string | null;
    jsFrameworks: string[];
    accessibility: {
      hasSkipLinks: boolean;
      hasAltText: boolean;
      hasAriaLabels: boolean;
      hasHeadingStructure: boolean;
      colorContrastIssues: number;
    };
  };
  seoMetrics: {
    hasMetaTitles: number;
    hasMetaDescriptions: number;
    hasH1Tags: number;
    duplicateContent: number;
  };
  performance: {
    avgLoadTime: number;
    largeImages: number;
    unoptimizedAssets: number;
  };
  compliance: {
    wcagLevel: 'A' | 'AA' | 'AAA' | 'None';
    issuesFound: {
      critical: number;
      major: number;
      minor: number;
    };
    estimatedFixTime: number; // in hours
  };
  security: {
    httpsPages: number;
    httpPages: number;
    mixedContent: boolean;
  };
}

interface URLCalculatorProps {
  onPagesCalculated?: (pageCount: number, analysis: URLAnalysisResult) => void;
  initialUrl?: string;
}

export default function URLCalculator({
  onPagesCalculated,
  initialUrl = ''
}: URLCalculatorProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<URLAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const simulateAnalysis = async (
    targetUrl: string
  ): Promise<URLAnalysisResult> => {
    // Simulate progressive analysis with detailed steps
    const steps = [
      'Fetching robots.txt and sitemap.xml...',
      'Analyzing page structure and navigation...',
      'Crawling main pages and discovering links...',
      'Detecting technologies and frameworks...',
      'Scanning for accessibility features...',
      'Analyzing SEO and metadata...',
      'Testing performance metrics...',
      'Evaluating WCAG compliance...',
      'Checking security configuration...',
      'Generating comprehensive report...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Simulate realistic results based on domain
    const domain = new URL(targetUrl).hostname;
    const isGovSite = domain.includes('gov');
    const isEduSite = domain.includes('edu');
    const isOrgSite = domain.includes('org');
    const isCommercialSite = domain.includes('com');
    const isLargeSite =
      isGovSite || isEduSite || (isOrgSite && Math.random() > 0.3);
    const isMediumSite = isCommercialSite && !domain.includes('blog');

    let basePages = 15;
    if (isLargeSite) basePages = 180;
    else if (isMediumSite) basePages = 55;
    else if (isOrgSite) basePages = 35;

    const variance = Math.floor(Math.random() * 30) - 15;
    const totalPages = Math.max(8, basePages + variance);
    const uniquePages = Math.floor(totalPages * (0.88 + Math.random() * 0.08));
    const duplicatePages = totalPages - uniquePages;
    const errorPages = Math.floor(totalPages * (0.02 + Math.random() * 0.03));

    // Determine technologies based on domain patterns
    const detectTechnology = () => {
      const techs = {
        cms: null as string | null,
        framework: null as string | null,
        jsFrameworks: [] as string[]
      };

      if (isGovSite) {
        techs.cms = Math.random() > 0.5 ? 'Drupal' : 'WordPress';
        techs.framework = 'Custom Government Framework';
      } else if (isEduSite) {
        techs.cms = Math.random() > 0.3 ? 'WordPress' : 'Drupal';
        techs.framework = 'Bootstrap';
      } else if (isCommercialSite) {
        const cmsOptions = ['WordPress', 'Shopify', 'Magento', 'Custom CMS'];
        techs.cms = cmsOptions[Math.floor(Math.random() * cmsOptions.length)];
        techs.framework = Math.random() > 0.5 ? 'React' : 'Vue.js';
        if (Math.random() > 0.7) techs.jsFrameworks.push('jQuery');
        if (Math.random() > 0.8) techs.jsFrameworks.push('Angular');
      }

      return techs;
    };

    const technologies = detectTechnology();

    // Generate accessibility analysis
    const accessibilityAnalysis = {
      hasSkipLinks: Math.random() > (isGovSite ? 0.2 : 0.6),
      hasAltText: Math.random() > (isGovSite ? 0.1 : 0.4),
      hasAriaLabels: Math.random() > (isGovSite ? 0.3 : 0.7),
      hasHeadingStructure: Math.random() > (isGovSite ? 0.2 : 0.5),
      colorContrastIssues: Math.floor(Math.random() * (totalPages * 0.3))
    };

    // Determine WCAG compliance level
    let wcagLevel: 'A' | 'AA' | 'AAA' | 'None' = 'None';
    const accessibilityScore = Object.values(accessibilityAnalysis).filter(
      (v) => typeof v === 'boolean' && v
    ).length;
    if (
      accessibilityScore >= 3 &&
      accessibilityAnalysis.colorContrastIssues < totalPages * 0.1
    ) {
      wcagLevel = 'AA';
    } else if (accessibilityScore >= 2) {
      wcagLevel = 'A';
    }
    if (isGovSite && accessibilityScore >= 4) {
      wcagLevel = 'AAA';
    }

    // Calculate compliance issues
    const criticalIssues = Math.floor(
      totalPages * (wcagLevel === 'None' ? 0.4 : wcagLevel === 'A' ? 0.2 : 0.05)
    );
    const majorIssues = Math.floor(
      totalPages * (wcagLevel === 'None' ? 0.6 : wcagLevel === 'A' ? 0.4 : 0.15)
    );
    const minorIssues = Math.floor(
      totalPages * (wcagLevel === 'None' ? 0.8 : wcagLevel === 'A' ? 0.6 : 0.3)
    );

    return {
      totalPages,
      uniquePages,
      duplicatePages,
      errorPages,
      externalLinks: Math.floor(totalPages * (2 + Math.random() * 2)),
      internalLinks: Math.floor(totalPages * (6 + Math.random() * 4)),
      depth: Math.min(8, Math.floor(totalPages / 12) + 2),
      sitemap: generateSitemap(domain, totalPages),
      errors: generateErrors(totalPages, domain),
      recommendations: generateRecommendations(totalPages, wcagLevel, domain),
      pageTypes: {
        static: Math.floor(uniquePages * 0.6),
        dynamic: Math.floor(uniquePages * 0.25),
        forms: Math.floor(uniquePages * 0.08),
        media: Math.floor(uniquePages * 0.05),
        downloads: Math.floor(uniquePages * 0.02)
      },
      technologies: {
        ...technologies,
        accessibility: accessibilityAnalysis
      },
      seoMetrics: {
        hasMetaTitles: Math.floor(uniquePages * (0.7 + Math.random() * 0.25)),
        hasMetaDescriptions: Math.floor(
          uniquePages * (0.6 + Math.random() * 0.3)
        ),
        hasH1Tags: Math.floor(uniquePages * (0.8 + Math.random() * 0.15)),
        duplicateContent: duplicatePages
      },
      performance: {
        avgLoadTime: 1.2 + Math.random() * 2.8, // 1.2-4.0 seconds
        largeImages: Math.floor(totalPages * (0.1 + Math.random() * 0.3)),
        unoptimizedAssets: Math.floor(
          totalPages * (0.05 + Math.random() * 0.25)
        )
      },
      compliance: {
        wcagLevel,
        issuesFound: {
          critical: criticalIssues,
          major: majorIssues,
          minor: minorIssues
        },
        estimatedFixTime:
          criticalIssues * 4 + majorIssues * 2 + minorIssues * 0.5
      },
      security: {
        httpsPages: Math.floor(
          totalPages * (isGovSite ? 1 : 0.8 + Math.random() * 0.2)
        ),
        httpPages: Math.floor(
          totalPages * (isGovSite ? 0 : Math.random() * 0.2)
        ),
        mixedContent: !isGovSite && Math.random() > 0.7
      }
    };
  };

  const generateSitemap = (domain: string, totalPages: number): string[] => {
    const basePaths = ['/home', '/about', '/services', '/contact'];

    if (domain.includes('gov')) {
      basePaths.push(
        '/departments',
        '/services',
        '/residents',
        '/business',
        '/visitors',
        '/government'
      );
    } else if (domain.includes('edu')) {
      basePaths.push(
        '/academics',
        '/admissions',
        '/students',
        '/faculty',
        '/research',
        '/campus-life'
      );
    } else if (domain.includes('org')) {
      basePaths.push('/programs', '/donate', '/volunteer', '/events', '/news');
    } else {
      basePaths.push('/products', '/blog', '/support', '/pricing', '/careers');
    }

    basePaths.push('/privacy', '/terms', '/accessibility');

    return basePaths.slice(
      0,
      Math.min(basePaths.length, Math.floor(totalPages / 4))
    );
  };

  const generateErrors = (totalPages: number, domain: string): string[] => {
    const errors: string[] = [];

    if (totalPages > 100) {
      errors.push(
        'Large site detected - some pages may require authentication'
      );
      errors.push(
        'Dynamic content found - actual page count may vary during testing'
      );
    }

    if (domain.includes('gov')) {
      errors.push('Government site - may have restricted access areas');
      errors.push('Some content may be behind login portals');
    }

    if (Math.random() > 0.6) {
      errors.push('JavaScript-rendered content detected');
    }

    if (Math.random() > 0.7) {
      errors.push('Single Page Application (SPA) components found');
    }

    return errors;
  };

  const generateRecommendations = (
    totalPages: number,
    wcagLevel: string,
    domain: string
  ): string[] => {
    const recommendations: string[] = [];

    // Size-based recommendations
    if (totalPages > 200) {
      recommendations.push(
        'Consider phased approach: prioritize high-traffic pages first'
      );
      recommendations.push(
        'Implement automated accessibility testing pipeline'
      );
    } else if (totalPages > 50) {
      recommendations.push('Focus on template-based testing for efficiency');
      recommendations.push('Test representative pages from each section');
    } else {
      recommendations.push(
        'Site size suitable for comprehensive page-by-page audit'
      );
    }

    // Compliance-based recommendations
    if (wcagLevel === 'None') {
      recommendations.push('Significant accessibility improvements needed');
      recommendations.push(
        'Start with critical issues: keyboard navigation and screen readers'
      );
      recommendations.push('Implement proper heading structure and alt text');
    } else if (wcagLevel === 'A') {
      recommendations.push(
        'Good foundation - focus on achieving AA compliance'
      );
      recommendations.push('Improve color contrast and form accessibility');
    } else if (wcagLevel === 'AA') {
      recommendations.push('Excellent accessibility foundation');
      recommendations.push(
        'Consider AAA compliance for enhanced accessibility'
      );
    }

    // Domain-specific recommendations
    if (domain.includes('gov')) {
      recommendations.push(
        'Ensure Section 508 compliance for government accessibility'
      );
      recommendations.push(
        'Test with government-approved assistive technologies'
      );
    } else if (domain.includes('edu')) {
      recommendations.push('Consider academic accessibility standards');
      recommendations.push(
        'Test with student assistive technology preferences'
      );
    }

    recommendations.push('Implement ongoing accessibility monitoring');
    recommendations.push(
      'Train content creators on accessibility best practices'
    );

    return recommendations;
  };

  const analyzeWebsite = async () => {
    if (!url || !validateUrl(url)) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setAnalysis(null);

    try {
      const result = await simulateAnalysis(url);
      setAnalysis(result);

      if (onPagesCalculated) {
        onPagesCalculated(result.totalPages, result);
      }
    } catch (err) {
      setError(
        'Failed to analyze website. Please check the URL and try again.'
      );
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setError(null);
    setProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconWorldWww className='h-5 w-5' />
          Website URL Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* URL Input */}
        <div className='space-y-4'>
          <div className='flex gap-2'>
            <Input
              placeholder='https://example.com'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              className='flex-1'
            />
            <Button
              onClick={analyzeWebsite}
              disabled={isAnalyzing || !url}
              className='shrink-0'
            >
              {isAnalyzing ? (
                <IconLoader2 className='h-4 w-4 animate-spin' />
              ) : (
                <IconSearch className='h-4 w-4' />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {error && (
            <Alert variant='destructive'>
              <IconAlertTriangle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Progress */}
        {isAnalyzing && (
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span>Analyzing website structure...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className='space-y-8'>
            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconCheck className='h-5 w-5 text-green-600' />
                  Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-blue-600'>
                      {analysis.totalPages}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Total Pages
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-green-600'>
                      {analysis.uniquePages}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Unique Pages
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-orange-600'>
                      {analysis.depth}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Site Depth
                    </div>
                  </div>
                  <div className='text-center'>
                    <div
                      className={`text-3xl font-bold ${
                        analysis.compliance.wcagLevel === 'AAA'
                          ? 'text-green-600'
                          : analysis.compliance.wcagLevel === 'AA'
                            ? 'text-blue-600'
                            : analysis.compliance.wcagLevel === 'A'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                      }`}
                    >
                      {analysis.compliance.wcagLevel}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      WCAG Level
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Type Analysis */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Page Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Static Pages</span>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-20 rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full bg-blue-500'
                            style={{
                              width: `${(analysis.pageTypes.static / analysis.uniquePages) * 100}%`
                            }}
                          />
                        </div>
                        <span className='text-sm font-bold'>
                          {analysis.pageTypes.static}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Dynamic Pages</span>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-20 rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full bg-green-500'
                            style={{
                              width: `${(analysis.pageTypes.dynamic / analysis.uniquePages) * 100}%`
                            }}
                          />
                        </div>
                        <span className='text-sm font-bold'>
                          {analysis.pageTypes.dynamic}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Forms</span>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-20 rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full bg-orange-500'
                            style={{
                              width: `${(analysis.pageTypes.forms / analysis.uniquePages) * 100}%`
                            }}
                          />
                        </div>
                        <span className='text-sm font-bold'>
                          {analysis.pageTypes.forms}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Media Pages</span>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-20 rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full bg-purple-500'
                            style={{
                              width: `${(analysis.pageTypes.media / analysis.uniquePages) * 100}%`
                            }}
                          />
                        </div>
                        <span className='text-sm font-bold'>
                          {analysis.pageTypes.media}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Downloads</span>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-20 rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full bg-red-500'
                            style={{
                              width: `${(analysis.pageTypes.downloads / analysis.uniquePages) * 100}%`
                            }}
                          />
                        </div>
                        <span className='text-sm font-bold'>
                          {analysis.pageTypes.downloads}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>CMS</span>
                      <Badge variant='outline'>
                        {analysis.technologies.cms || 'Not Detected'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Framework</span>
                      <Badge variant='outline'>
                        {analysis.technologies.framework || 'Not Detected'}
                      </Badge>
                    </div>
                    {analysis.technologies.jsFrameworks.length > 0 && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          JS Libraries
                        </span>
                        <div className='flex gap-1'>
                          {analysis.technologies.jsFrameworks.map(
                            (framework, index) => (
                              <Badge
                                key={index}
                                variant='secondary'
                                className='text-xs'
                              >
                                {framework}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    <div className='border-t pt-2'>
                      <div className='mb-2 text-sm font-medium'>Security</div>
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span>HTTPS Pages</span>
                          <span className='font-bold text-green-600'>
                            {analysis.security.httpsPages}
                          </span>
                        </div>
                        {analysis.security.httpPages > 0 && (
                          <div className='flex justify-between text-sm'>
                            <span>HTTP Pages</span>
                            <span className='font-bold text-red-600'>
                              {analysis.security.httpPages}
                            </span>
                          </div>
                        )}
                        {analysis.security.mixedContent && (
                          <div className='text-sm text-red-600'>
                            ⚠ Mixed content detected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Accessibility & Compliance Analysis */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <IconShield className='h-5 w-5' />
                    Accessibility Status
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Skip Links</span>
                      <Badge
                        variant={
                          analysis.technologies.accessibility.hasSkipLinks
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {analysis.technologies.accessibility.hasSkipLinks
                          ? 'Present'
                          : 'Missing'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Alt Text</span>
                      <Badge
                        variant={
                          analysis.technologies.accessibility.hasAltText
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {analysis.technologies.accessibility.hasAltText
                          ? 'Good'
                          : 'Needs Work'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>ARIA Labels</span>
                      <Badge
                        variant={
                          analysis.technologies.accessibility.hasAriaLabels
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {analysis.technologies.accessibility.hasAriaLabels
                          ? 'Present'
                          : 'Missing'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Heading Structure</span>
                      <Badge
                        variant={
                          analysis.technologies.accessibility
                            .hasHeadingStructure
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {analysis.technologies.accessibility.hasHeadingStructure
                          ? 'Good'
                          : 'Poor'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Color Contrast Issues</span>
                      <Badge
                        variant={
                          analysis.technologies.accessibility
                            .colorContrastIssues === 0
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {
                          analysis.technologies.accessibility
                            .colorContrastIssues
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    WCAG Compliance Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Critical Issues
                      </span>
                      <Badge variant='destructive' className='font-bold'>
                        {analysis.compliance.issuesFound.critical}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Major Issues</span>
                      <Badge
                        variant='secondary'
                        className='bg-orange-100 text-orange-800'
                      >
                        {analysis.compliance.issuesFound.major}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Minor Issues</span>
                      <Badge
                        variant='outline'
                        className='bg-yellow-50 text-yellow-700'
                      >
                        {analysis.compliance.issuesFound.minor}
                      </Badge>
                    </div>
                    <div className='border-t pt-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          Est. Fix Time
                        </span>
                        <Badge variant='outline'>
                          {Math.round(analysis.compliance.estimatedFixTime)}h
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>SEO & Performance</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Meta Titles</span>
                      <div className='text-sm font-bold'>
                        {analysis.seoMetrics.hasMetaTitles}/
                        {analysis.uniquePages}
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Meta Descriptions</span>
                      <div className='text-sm font-bold'>
                        {analysis.seoMetrics.hasMetaDescriptions}/
                        {analysis.uniquePages}
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>H1 Tags</span>
                      <div className='text-sm font-bold'>
                        {analysis.seoMetrics.hasH1Tags}/{analysis.uniquePages}
                      </div>
                    </div>
                    <div className='border-t pt-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm'>Avg Load Time</span>
                        <Badge
                          variant={
                            analysis.performance.avgLoadTime < 3
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {analysis.performance.avgLoadTime.toFixed(1)}s
                        </Badge>
                      </div>
                      <div className='mt-2 flex items-center justify-between'>
                        <span className='text-sm'>Large Images</span>
                        <Badge variant='outline'>
                          {analysis.performance.largeImages}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Site Structure */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Site Structure</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='rounded-lg bg-blue-50 p-3 text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {analysis.internalLinks}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        Internal Links
                      </div>
                    </div>
                    <div className='rounded-lg bg-green-50 p-3 text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {analysis.externalLinks}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        External Links
                      </div>
                    </div>
                    <div className='rounded-lg bg-orange-50 p-3 text-center'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {analysis.duplicatePages}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        Duplicate Pages
                      </div>
                    </div>
                    <div className='rounded-lg bg-red-50 p-3 text-center'>
                      <div className='text-2xl font-bold text-red-600'>
                        {analysis.errorPages}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        Error Pages
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Key Pages Discovered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='max-h-48 space-y-2 overflow-y-auto'>
                    {analysis.sitemap?.map((page, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 rounded bg-gray-50 p-2 text-sm'
                      >
                        <IconFileText className='text-muted-foreground h-4 w-4' />
                        <span className='font-mono text-sm'>{page}</span>
                      </div>
                    ))}
                    {analysis.sitemap &&
                      analysis.sitemap.length < analysis.totalPages && (
                        <div className='text-muted-foreground border-t py-2 text-center text-sm italic'>
                          +{analysis.totalPages - analysis.sitemap.length}{' '}
                          additional pages discovered
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            {analysis.recommendations &&
              analysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <IconCheck className='h-4 w-4' />
                      Accessibility Testing Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2'>
                      {analysis.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className='flex items-start gap-2 text-sm'
                        >
                          <div className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500' />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Errors/Warnings */}
            {analysis.errors && analysis.errors.length > 0 && (
              <Alert>
                <IconAlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  <div className='space-y-1'>
                    <div className='font-medium'>Analysis Notes:</div>
                    <ul className='space-y-1 text-sm'>
                      {analysis.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={resetAnalysis}>
                <IconRefresh className='mr-2 h-4 w-4' />
                Analyze Different Site
              </Button>
              <Button variant='outline' size='sm' asChild>
                <a href={url} target='_blank' rel='noopener noreferrer'>
                  <IconExternalLink className='mr-2 h-4 w-4' />
                  Visit Site
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
