import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
// import { reports, reportIssues } from '@/lib/db/schema/reports';
import { accessibilityIssues } from '@/lib/db/schema/accessibility';
import { projects } from '@/lib/db/schema/projects';
import { eq, inArray, and } from 'drizzle-orm';
import { OpenRouterClient } from '@/lib/ai/openrouter-client';
import {
  getReportTemplate,
  buildPromptFromTemplate,
  formatIssuesForPrompt
} from '@/lib/ai/report-prompts';
import { ReportGenerationRequest } from '@/types/reports';

export async function POST(request: NextRequest) {
  try {
    const body: ReportGenerationRequest = await request.json();

    const {
      projectId,
      issueIds,
      reportType,
      customPrompt,
      systemPrompt,
      includeRecommendations = true,
      includeTechnicalDetails = true,
      includeBusinessImpact = true
    } = body;

    // Validate required fields
    if (!projectId || !issueIds || issueIds.length === 0 || !reportType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch project details
    const project = await db
      .select({
        id: projects.id,
        name: projects.name,
        techStack: projects.techStack,
        projectPlatform: projects.projectPlatform,
        wcagLevel: projects.wcagLevel
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const projectData = project[0];

    // Fetch issues with full details
    const issues = await db
      .select()
      .from(accessibilityIssues)
      .where(
        and(
          eq(accessibilityIssues.projectId, projectId),
          inArray(accessibilityIssues.id, issueIds)
        )
      );

    if (issues.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No issues found' },
        { status: 404 }
      );
    }

    // Initialize OpenRouter client
    const openRouterClient = new OpenRouterClient();

    let generatedContent: string;
    let summary: string;
    let recommendations: string[] = [];

    if (customPrompt) {
      // Use custom prompt
      generatedContent = await openRouterClient.generateCompletion(
        customPrompt,
        {
          maxTokens: 6000,
          temperature: 0.4
        }
      );

      // Generate summary for custom reports
      summary = await openRouterClient.generateCompletion(
        `Create a brief summary (2-3 sentences) of this report:\n\n${generatedContent}`,
        {
          maxTokens: 200,
          temperature: 0.3
        }
      );
    } else {
      // Use predefined template
      const template = getReportTemplate(reportType);

      // Calculate statistics
      const totalIssues = issues.length;
      const criticalIssues = issues.filter(
        (i) => i.severity === '1_critical'
      ).length;
      const highIssues = issues.filter((i) => i.severity === '2_high').length;
      const mediumIssues = issues.filter(
        (i) => i.severity === '3_medium'
      ).length;
      const lowIssues = issues.filter((i) => i.severity === '4_low').length;

      // Calculate compliance percentage (simplified)
      const totalCriteria = 50; // Approximate WCAG 2.1 AA criteria count
      const failingCriteria = criticalIssues + highIssues;
      const passingCriteria = totalCriteria - failingCriteria;
      const compliancePercentage = Math.max(
        0,
        Math.round((passingCriteria / totalCriteria) * 100)
      );

      // Format issues for different report types
      const formattedIssues = formatIssuesForPrompt(issues);

      // Build prompt variables
      const promptVariables = {
        projectName: projectData.name,
        totalIssues,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        techStack: projectData.techStack || 'Not specified',
        platform: projectData.projectPlatform || 'Website',
        wcagLevel: projectData.wcagLevel || 'AA',
        complianceStatus: `${compliancePercentage}% compliant`,
        compliancePercentage,
        totalCriteria,
        passingCriteria,
        failingCriteria,
        resolvedIssues: 0, // This would come from historical data
        inProgressIssues: issues.filter((i) => i.devStatus === 'in_progress')
          .length,
        newIssues: issues.filter((i) => i.devStatus === 'not_started').length,
        progressPercentage: 0, // This would be calculated from historical data
        progressComparison: 'No previous data available',
        customRequirements: 'Standard accessibility assessment',
        projectContext: `${projectData.name} - ${projectData.techStack} project`,
        ...formattedIssues
      };

      // Generate the report content
      const prompt = buildPromptFromTemplate(template, promptVariables);

      generatedContent = await openRouterClient.generateCompletion(prompt, {
        systemPrompt: systemPrompt || template.systemPrompt,
        maxTokens: template.maxTokens,
        temperature: template.temperature
      });

      // Generate summary
      summary = await openRouterClient.generateCompletion(
        `Create a brief executive summary (2-3 sentences) of this ${template.name.toLowerCase()}:\n\n${generatedContent}`,
        {
          systemPrompt:
            'Create concise executive summaries focusing on key findings and recommendations.',
          maxTokens: 200,
          temperature: 0.3
        }
      );
    }

    // Generate recommendations if requested
    if (includeRecommendations) {
      const recommendationsText = await openRouterClient.generateCompletion(
        `Extract the top 5 most important actionable recommendations from this accessibility report:\n\n${generatedContent}`,
        {
          systemPrompt:
            'Extract key recommendations as a numbered list. Each item should be one clear, actionable sentence.',
          maxTokens: 500,
          temperature: 0.3
        }
      );

      recommendations = recommendationsText
        .split('\n')
        .filter((line) => line.trim().match(/^\d+\./))
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((rec) => rec.length > 0)
        .slice(0, 5);
    }

    // Calculate estimated reading time (average 200 words per minute)
    const wordCount = generatedContent.split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200);

    const response = {
      content: generatedContent,
      summary,
      recommendations,
      technicalDetails: includeTechnicalDetails
        ? 'Included in main content'
        : undefined,
      businessImpact: includeBusinessImpact
        ? 'Included in main content'
        : undefined,
      estimatedReadingTime,
      metadata: {
        projectName: projectData.name,
        reportType,
        issueCount: issues.length,
        generatedAt: new Date().toISOString(),
        wordCount
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    // Handle specific OpenRouter errors
    if (error instanceof Error && error.message.includes('OpenRouter API')) {
      return NextResponse.json(
        { success: false, error: `AI service error: ${error.message}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
