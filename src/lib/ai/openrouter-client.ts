interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'x-ai/grok-4-fast';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
  }

  async generateCompletion(
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const {
      model = this.defaultModel,
      maxTokens = 3000,
      temperature = 0.6,
      systemPrompt
    } = options;

    const messages = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'A3S Admin - Accessibility Report Generator'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData: OpenRouterError = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error.message}`);
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from OpenRouter API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Unknown error occurred');
    }
  }

  async generateReportContent(
    issues: any[],
    reportType: string,
    projectName: string,
    customPrompt?: string
  ): Promise<{
    content: string;
    summary: string;
    recommendations: string[];
  }> {
    const systemPrompt = `You are an expert accessibility consultant creating professional reports for clients. 
    Generate comprehensive, well-structured reports that are clear, actionable, and professional.
    Always include specific recommendations and prioritize issues by severity.
    Format the response as valid HTML with proper headings, lists, and paragraphs.`;

    const prompt =
      customPrompt || this.buildReportPrompt(issues, reportType, projectName);

    const content = await this.generateCompletion(prompt, {
      systemPrompt,
      maxTokens: 6000,
      temperature: 0.3
    });

    // Extract summary and recommendations from the generated content
    const summary = await this.generateCompletion(
      `Create a brief executive summary (2-3 sentences) of this accessibility report:\n\n${content}`,
      {
        systemPrompt:
          'You are creating executive summaries for accessibility reports. Be concise and focus on key findings.',
        maxTokens: 200,
        temperature: 0.3
      }
    );

    const recommendationsText = await this.generateCompletion(
      `Extract the top 5 most important recommendations from this accessibility report as a simple list:\n\n${content}`,
      {
        systemPrompt:
          'Extract key recommendations as a numbered list. Each item should be one clear, actionable sentence.',
        maxTokens: 500,
        temperature: 0.3
      }
    );

    const recommendations = recommendationsText
      .split('\n')
      .filter((line) => line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((rec) => rec.length > 0);

    return {
      content,
      summary,
      recommendations
    };
  }

  private buildReportPrompt(
    issues: any[],
    reportType: string,
    projectName: string
  ): string {
    const issuesSummary = issues.map((issue) => ({
      title: issue.issueTitle,
      severity: issue.severity,
      type: issue.issueType,
      description: issue.issueDescription,
      pageUrl: issue.pageUrl,
      wcagCriteria: issue.failedWcagCriteria,
      recommendedFix: issue.recommendedFix,
      businessImpact: issue.businessImpact
    }));

    const severityCounts = {
      critical: issues.filter((i) => i.severity === '1_critical').length,
      high: issues.filter((i) => i.severity === '2_high').length,
      medium: issues.filter((i) => i.severity === '3_medium').length,
      low: issues.filter((i) => i.severity === '4_low').length
    };

    let promptTemplate = '';

    switch (reportType) {
      case 'executive_summary':
        promptTemplate = `Create an executive summary accessibility report for "${projectName}".
        
        Issues Overview:
        - Critical: ${severityCounts.critical}
        - High: ${severityCounts.high}
        - Medium: ${severityCounts.medium}
        - Low: ${severityCounts.low}
        
        Focus on:
        - High-level overview of accessibility status
        - Business impact and legal compliance risks
        - Priority recommendations for leadership
        - Timeline and resource requirements
        
        Keep it concise and business-focused.
        
        IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`;
        break;

      case 'technical_report':
        promptTemplate = `Create a detailed technical accessibility report for "${projectName}".
        
        Include specific technical details for each issue:
        ${JSON.stringify(issuesSummary, null, 2)}
        
        Focus on:
        - Detailed technical analysis of each issue
        - Specific code examples and fixes
        - WCAG criteria violations
        - Implementation guidance
        - Testing procedures
        
        Make it comprehensive for developers and QA teams.
        
        IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), code blocks (pre, code), and emphasis (strong, em) tags. Do not use markdown formatting.`;
        break;

      case 'compliance_report':
        promptTemplate = `Create a WCAG compliance report for "${projectName}".
        
        Issues by WCAG criteria:
        ${JSON.stringify(issuesSummary, null, 2)}
        
        Focus on:
        - WCAG 2.1 AA compliance status
        - Specific criteria violations
        - Compliance percentage and gaps
        - Legal and regulatory considerations
        - Remediation roadmap
        
        Structure it for compliance and legal review.
        
        IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`;
        break;

      case 'monthly_progress':
        promptTemplate = `Create a monthly progress report for "${projectName}".
        
        Current issues status:
        ${JSON.stringify(issuesSummary, null, 2)}
        
        Focus on:
        - Progress since last report
        - Issues resolved and remaining
        - Upcoming priorities
        - Timeline updates
        - Next month's goals
        
        Make it suitable for regular client updates.
        
        IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`;
        break;

      default:
        promptTemplate = `Create a comprehensive accessibility report for "${projectName}".
        
        Issues to address:
        ${JSON.stringify(issuesSummary, null, 2)}
        
        Include overview, detailed findings, recommendations, and next steps.
        
        IMPORTANT: Format your response using clean HTML markup with proper headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags. Do not use markdown formatting.`;
    }

    return promptTemplate;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateCompletion('Test connection. Respond with "OK".', {
        maxTokens: 10,
        temperature: 0
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
