import { Resend } from 'resend';

// Initialize Resend client (server-side only)
let resend: Resend;

function getResendClient() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailTemplate {
  reportTitle: string;
  reportContent: string;
  projectName: string;
  issueCount: number;
  reportDate: string;
  companyName?: string;
  senderName?: string;
}

export async function sendReportEmail(
  emailData: EmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resendClient = getResendClient();
    const response = await resendClient.emails.send({
      from: emailData.from || 'A3S Reports <reports@a3s.app>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      replyTo: emailData.replyTo
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message || 'Email sending failed'
      };
    }

    return {
      success: true,
      messageId: response.data?.id
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function generateReportEmailTemplate(template: EmailTemplate): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>${template.reportTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .container {
            background: #ffffff;
            border-radius: 8px;
            padding: 25px;
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 8px 0;
            font-size: 22px;
            font-weight: 600;
        }
        .header p {
            margin: 0;
            opacity: 0.95;
            font-size: 14px;
        }
        .summary {
            background: #f9fafb;
            padding: 18px;
            border-radius: 8px;
            margin-bottom: 18px;
            border-left: 4px solid #3b82f6;
            border: 1px solid #e5e7eb;
        }
        .summary h2 {
            color: #1f2937;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .summary p {
            margin: 0;
            color: #4b5563;
            font-size: 14px;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            background: #ffffff;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid #e5e7eb;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 18px;
            font-weight: 600;
            color: #3b82f6;
            display: block;
        }
        .stat-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
        }
        .report-preview {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .report-preview h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 14px;
            font-weight: 600;
        }
        .report-content {
            max-height: 200px;
            overflow-y: auto;
            font-size: 13px;
            line-height: 1.5;
            color: #4b5563;
            background: #f8fafc;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
        }
        .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
        }
        
        @media (prefers-color-scheme: dark) {
            body { 
                background-color: #1a1a1a !important; 
                color: #e5e5e5 !important; 
            }
            .container { 
                background-color: #2a2a2a !important; 
                border-color: #404040 !important;
            }
            .summary { 
                background-color: #2a2a2a !important; 
                border-color: #404040 !important;
                border-left-color: #60a5fa !important;
            }
            .summary h2 { color: #f3f4f6 !important; }
            .summary p { color: #d1d5db !important; }
            .stats { 
                background-color: #2a2a2a !important; 
                border-color: #404040 !important;
            }
            .stat-number { color: #60a5fa !important; }
            .stat-label { color: #9ca3af !important; }
            .report-preview { 
                background-color: #2a2a2a !important; 
                border-color: #404040 !important;
            }
            .report-preview h3 { color: #f3f4f6 !important; }
            .report-content { 
                background-color: #1f2937 !important; 
                color: #d1d5db !important;
                border-left-color: #60a5fa !important;
            }
            .footer { 
                border-top-color: #404040 !important; 
                color: #9ca3af !important; 
            }
        }
        
        @media only screen and (max-width: 600px) {
            body { padding: 10px; }
            .container { padding: 18px; }
            .header { padding: 16px; }
            .header h1 { font-size: 18px; }
            .stats { flex-direction: column; gap: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${template.reportTitle}</h1>
            <p>${template.projectName} • ${template.reportDate}</p>
        </div>

        <div class="summary">
            <h2>Summary</h2>
            <p>Accessibility analysis completed for <strong>${template.projectName}</strong> with ${template.issueCount} findings identified.</p>
            
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-number">${template.issueCount}</span>
                    <span class="stat-label">Issues</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${template.reportDate}</span>
                    <span class="stat-label">Date</span>
                </div>
            </div>
        </div>

        <div class="report-preview">
            <h3>Report Preview</h3>
            <div class="report-content">
                ${template.reportContent.substring(0, 600)}${template.reportContent.length > 600 ? '...' : ''}
            </div>
        </div>

        <div class="footer">
            <p><strong>A3S Accessibility Solutions</strong></p>
            ${template.senderName ? `<p>By: ${template.senderName}</p>` : ''}
        </div>
    </div>
</body>
</html>
  `.trim();
}

export { getResendClient };
