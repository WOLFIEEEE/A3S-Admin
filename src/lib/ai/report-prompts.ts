import { ReportType } from '@/types/reports';

export interface ReportPromptTemplate {
  type: ReportType;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  maxTokens: number;
  temperature: number;
}

export const REPORT_TEMPLATES: Record<ReportType, ReportPromptTemplate> = {
  executive_summary: {
    type: 'executive_summary',
    name: 'Executive Summary',
    description: 'High-level overview for stakeholders and decision makers',
    systemPrompt: `You are an accessibility consultant creating detailed executive summaries for business leaders. 
    Focus on key findings, business impact, compliance risks, and actionable recommendations. 
    Use professional language suitable for executives. Provide sufficient detail while maintaining clarity and focus.
    
    IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`,
    userPromptTemplate: `Create an executive summary accessibility report for "{projectName}".

PROJECT OVERVIEW:
- Total Issues Identified: {totalIssues}
- Critical Issues: {criticalIssues}
- High Priority Issues: {highIssues}
- Medium Priority Issues: {mediumIssues}
- Low Priority Issues: {lowIssues}
- WCAG Compliance Status: {complianceStatus}
- Technology Stack: {techStack}
- Platform: {platform}

DETAILED ISSUES ANALYSIS:
{detailedIssues}

VIOLATIONS BY WCAG PRINCIPLE:
{violationsByPrinciple}

COMPLIANCE ASSESSMENT:
{complianceIssues}

Please create a comprehensive executive summary that:
1. Provides a detailed executive overview referencing specific issues by name
2. Analyzes business impact of each critical and high-priority issue
3. Assesses compliance risks with specific WCAG criteria violations
4. Provides prioritized recommendations based on the actual issues found
5. Estimates implementation timeline based on issue complexity
6. Outlines next steps with specific issue references

Focus on the actual issues found and provide specific, actionable insights for business stakeholders.`,
    maxTokens: 2800,
    temperature: 0.3
  },

  technical_report: {
    type: 'technical_report',
    name: 'Technical Report',
    description: 'Detailed technical analysis for developers and QA teams',
    systemPrompt: `You are a technical accessibility expert creating comprehensive reports for development teams.
    Include detailed WCAG criteria explanations, step-by-step implementation guidance, relevant code examples, and practical solutions.
    Use technical language appropriate for developers. Provide thorough analysis with sufficient detail for implementation while maintaining practical focus.
    Provide actionable, specific solutions with code snippets where helpful.
    
    IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), code blocks (pre, code), and emphasis (strong, em) tags. Do not use markdown formatting.`,
    userPromptTemplate: `Create a comprehensive technical accessibility report for "{projectName}".

TECHNICAL CONTEXT:
- Technology Stack: {techStack}
- Platform: {platform}
- WCAG Level Target: {wcagLevel}
- Total Issues: {totalIssues} (Critical: {criticalIssues}, High: {highIssues}, Medium: {mediumIssues}, Low: {lowIssues})

DETAILED ISSUES ANALYSIS:
{detailedIssues}

VIOLATIONS BY WCAG PRINCIPLE:
{violationsByPrinciple}

COMPLIANCE ISSUES BREAKDOWN:
{complianceIssues}

Please create a technical report that includes:
1. Technical Overview and Assessment Summary
2. Issue-by-Issue Analysis with:
   - Specific code examples and technical explanations
   - WCAG criteria violations for each issue
   - Step-by-step remediation instructions
   - Testing procedures for verification
3. Implementation Priority Matrix based on severity and technical complexity
4. Code snippets and technical solutions for each issue
5. Quality Assurance checklist for each remediated issue
6. Technical recommendations and best practices

For each issue, provide specific technical guidance including code examples, testing methods, and implementation steps.`,
    maxTokens: 4000,
    temperature: 0.2
  },

  compliance_report: {
    type: 'compliance_report',
    name: 'Compliance Report',
    description: 'WCAG compliance assessment for legal and regulatory review',
    systemPrompt: `You are a compliance specialist creating accessibility reports for legal and regulatory purposes.
    Focus on WCAG 2.1 standards, legal requirements, and compliance percentages.
    Use formal language suitable for legal review and regulatory submission.
    Include specific criteria references and compliance metrics.
    
    IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`,
    userPromptTemplate: `Create a WCAG 2.1 AA compliance report for "{projectName}".

Compliance Analysis:
- Target Standard: WCAG 2.1 Level AA
- Total Criteria Evaluated: {totalCriteria}
- Passing Criteria: {passingCriteria}
- Failing Criteria: {failingCriteria}
- Compliance Percentage: {compliancePercentage}%

Violations by Principle:
{violationsByPrinciple}

Detailed Findings:
{complianceIssues}

Please include:
1. Compliance Executive Summary
2. WCAG 2.1 Criteria Assessment
3. Violation Details by Principle
4. Legal Risk Analysis
5. Remediation Roadmap
6. Compliance Timeline
7. Certification Recommendations

Focus on regulatory compliance and legal defensibility.`,
    maxTokens: 3200,
    temperature: 0.1
  },

  monthly_progress: {
    type: 'monthly_progress',
    name: 'Monthly Progress Report',
    description:
      'Regular progress updates for ongoing accessibility improvements',
    systemPrompt: `You are creating monthly progress reports for accessibility improvement projects.
    Focus on progress made, issues resolved, current status, and upcoming priorities.
    Use a positive, progress-oriented tone while being honest about challenges.
    Structure the report to show clear progress and next steps.
    
    IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`,
    userPromptTemplate: `Create a monthly progress report for "{projectName}" accessibility improvements.

PROJECT STATUS OVERVIEW:
- Total Issues Being Tracked: {totalIssues}
- Issues Resolved This Period: {resolvedIssues}
- Issues Currently In Progress: {inProgressIssues}
- New Issues Identified: {newIssues}
- Critical Issues: {criticalIssues}
- High Priority Issues: {highIssues}
- Overall Compliance: {complianceStatus}

DETAILED CURRENT ISSUES STATUS:
{detailedIssues}

VIOLATIONS BY WCAG PRINCIPLE:
{violationsByPrinciple}

COMPLIANCE TRACKING:
{complianceIssues}

Please create a comprehensive monthly progress report that includes:
1. Executive Summary of monthly progress with specific issue references
2. Detailed status update for each issue being tracked
3. Key achievements with specific issue resolutions
4. Current work in progress with issue-specific details
5. Challenges and blockers for specific issues
6. Priority recommendations based on current issue status
7. Next month's goals with specific issue targets
8. Timeline updates for issue remediation

For each section, reference specific issues by name and provide detailed status updates. Focus on measurable progress and concrete next steps.`,
    maxTokens: 2800,
    temperature: 0.4
  },

  custom: {
    type: 'custom',
    name: 'Custom Report',
    description: 'Flexible report format based on specific requirements',
    systemPrompt: `You are an accessibility consultant creating a custom report based on specific client requirements.
    Adapt your writing style and focus areas based on the provided instructions.
    Ensure the report is professional, comprehensive, and meets the stated objectives.
    
    IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`,
    userPromptTemplate: `Create a custom accessibility report for "{projectName}".

Custom Requirements:
{customRequirements}

Issues to Address:
{issuesData}

Project Context:
{projectContext}

Please create a report that addresses the specific requirements while maintaining professional standards and providing actionable insights.`,
    maxTokens: 3500,
    temperature: 0.5
  }
};

export function getReportTemplate(
  reportType: ReportType
): ReportPromptTemplate {
  return REPORT_TEMPLATES[reportType];
}

export function buildPromptFromTemplate(
  template: ReportPromptTemplate,
  variables: Record<string, any>
): string {
  let prompt = template.userPromptTemplate;

  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return prompt;
}

export function formatIssuesForPrompt(issues: any[]): {
  issuesSummary: string;
  detailedIssues: string;
  violationsByPrinciple: string;
  complianceIssues: string;
} {
  const issuesSummary = issues
    .map(
      (issue, index) =>
        `${index + 1}. ${issue.issueTitle} (${issue.severity}) - ${issue.pageUrl || 'Multiple pages'}`
    )
    .join('\n');

  const detailedIssues = issues
    .map(
      (issue, index) => `
${index + 1}. ISSUE: ${issue.issueTitle}
   • Severity Level: ${issue.severity}
   • Issue Type: ${issue.issueType || 'Not specified'}
   • Affected Page(s): ${issue.pageUrl || 'Multiple pages'}
   • WCAG Conformance Level: ${issue.conformanceLevel || 'Not specified'}
   • Failed WCAG Criteria: ${issue.failedWcagCriteria?.join(', ') || 'Not specified'}
   • Current Dev Status: ${issue.devStatus || 'Not started'}
   • Current QA Status: ${issue.qaStatus || 'Not tested'}
   
   DESCRIPTION:
   ${issue.issueDescription || 'No detailed description provided'}
   
   ACTUAL BEHAVIOR:
   ${issue.actualBehavior || 'Not documented'}
   
   EXPECTED BEHAVIOR:
   ${issue.expectedBehavior || 'Not documented'}
   
   RECOMMENDED FIX:
   ${issue.recommendedFix || 'Remediation strategy needed'}
   
   BUSINESS IMPACT:
   ${issue.businessImpact || 'Impact assessment required'}
   
   ELEMENT DETAILS:
   ${issue.elementSelector || 'Element not specified'}
   
   ---`
    )
    .join('\n');

  // Group violations by WCAG principle
  const principleGroups: Record<string, any[]> = {
    Perceivable: [],
    Operable: [],
    Understandable: [],
    Robust: []
  };

  issues.forEach((issue) => {
    if (issue.failedWcagCriteria) {
      issue.failedWcagCriteria.forEach((criteria: string) => {
        // Simple mapping based on WCAG criteria numbers
        if (criteria.startsWith('1.')) principleGroups.Perceivable.push(issue);
        else if (criteria.startsWith('2.'))
          principleGroups.Operable.push(issue);
        else if (criteria.startsWith('3.'))
          principleGroups.Understandable.push(issue);
        else if (criteria.startsWith('4.')) principleGroups.Robust.push(issue);
      });
    }
  });

  const violationsByPrinciple = Object.entries(principleGroups)
    .map(([principle, issues]) => `${principle}: ${issues.length} violations`)
    .join('\n');

  const complianceIssues = issues
    .map(
      (issue, index) => `
${index + 1}. COMPLIANCE VIOLATION: ${issue.issueTitle}
   • WCAG Criteria Failed: ${issue.failedWcagCriteria?.join(', ') || 'Not specified'}
   • Conformance Level: ${issue.conformanceLevel || 'Not specified'}
   • Severity: ${issue.severity}
   • Page Location: ${issue.pageUrl || 'Multiple pages'}
   • Business Impact: ${issue.businessImpact || 'Assessment needed'}
   • Remediation Status: Dev: ${issue.devStatus || 'Not started'} | QA: ${issue.qaStatus || 'Not tested'}
   • Description: ${issue.issueDescription || 'No description'}
   `
    )
    .join('\n');

  return {
    issuesSummary,
    detailedIssues,
    violationsByPrinciple,
    complianceIssues
  };
}
