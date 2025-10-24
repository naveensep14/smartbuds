import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export class EmailService {
  /**
   * Send email using Resend
   */
  static async sendEmail(data: EmailData) {
    try {
      const result = await resend.emails.send({
        from: 'support@successbuds.com',
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        replyTo: data.replyTo || 'support@successbuds.com',
      });

      console.log('✅ Email sent successfully:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send support request notification to admin
   */
  static async sendSupportRequestNotification(
    userEmail: string,
    userName: string,
    subject: string,
    message: string,
    userGrade?: string,
    userBoard?: string
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Support Request</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Request Details</h3>
          <p><strong>From:</strong> ${userName} (${userEmail})</p>
          ${userGrade && userBoard ? `<p><strong>Student Info:</strong> ${userGrade} ${userBoard}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>💡 Tip:</strong> Reply to this email to respond directly to the user.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://successbuds.com/admin" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: 'support@successbuds.com',
      subject: `Support Request: ${subject}`,
      html,
      replyTo: userEmail, // This allows replying directly to the user
    });
  }

  /**
   * Send reply to user from admin
   */
  static async sendReplyToUser(
    userEmail: string,
    userName: string,
    subject: string,
    message: string,
    adminName: string = 'SuccessBuds Support'
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Reply from SuccessBuds Support</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>To:</strong> ${userName} (${userEmail})</p>
          <p><strong>From:</strong> ${adminName} (support@successbuds.com)</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent from SuccessBuds Support. If you have any questions, please reply to this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Re: ${subject}`,
      html,
    });
  }

  /**
   * Send help email (legacy function for contact form)
   */
  static async sendHelpEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category: string;
  }) {
    return this.sendSupportRequestNotification(
      data.email,
      data.name,
      data.subject,
      data.message
    );
  }
}

// Legacy function for backward compatibility
export async function sendHelpEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}) {
  const result = await EmailService.sendHelpEmail(data);
  return result.success;
}