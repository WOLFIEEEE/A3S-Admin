import { NextResponse } from 'next/server';
import {
  sendReportEmail,
  generateReportEmailTemplate
} from '@/lib/email/resend-client';

export async function POST(req: Request) {
  try {
    const {
      recipients,
      subject,
      reportTitle,
      reportContent,
      projectName,
      issueCount,
      reportDate,
      companyName,
      senderName
    } = await req.json();

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients are required' },
        { status: 400 }
      );
    }

    if (!subject || !reportTitle || !reportContent || !projectName) {
      return NextResponse.json(
        { success: false, error: 'Missing required email data' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const emailHtml = generateReportEmailTemplate({
      reportTitle,
      reportContent,
      projectName,
      issueCount: issueCount || 0,
      reportDate:
        reportDate ||
        new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      companyName,
      senderName
    });

    // Send email via Resend
    const emailResult = await sendReportEmail({
      to: recipients,
      subject: subject,
      html: emailHtml,
      replyTo: 'reports@a3s.app'
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: emailResult.messageId,
        recipients: recipients.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
