// Email service utility for handling help/feedback emails

export interface HelpMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

export class EmailService {
  private static instance: EmailService;
  
  constructor() {}
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendHelpMessage(data: HelpMessageData): Promise<boolean> {
    try {
      // For development, log the email instead of sending
      if (process.env.NODE_ENV === 'development') {
        console.log('=== EMAIL TO SEND (Development Mode) ===');
        console.log('To: niveditha.2587@gmail.com');
        console.log('From:', data.name, `(${data.email})`);
        console.log('Subject:', data.subject);
        console.log('Category:', data.category);
        console.log('Message:', data.message);
        console.log('=====================================');
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }

      // For production, use Resend API directly
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        console.error('RESEND_API_KEY environment variable is not set');
        return false;
      }

      const htmlContent = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #e65100;">New Message from SuccessBuds Help Page</h2>
          <p><strong>Type:</strong> ${data.category}</p>
          <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, '<br>')}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #777;">This message was sent from the SuccessBuds help page at ${new Date().toLocaleString()}.</p>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'SuccessBuds Support <onboarding@resend.dev>', // Replace with your verified Resend domain email
          to: 'niveditha.2587@gmail.com',
          subject: `[SuccessBuds Help] ${data.subject} (${data.category})`,
          html: htmlContent,
          text: `Type: ${data.category}\nFrom: ${data.name} <${data.email}>\nSubject: ${data.subject}\nMessage: ${data.message}`
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Resend API error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully via Resend:', result);
      return true;

    } catch (error) {
      console.error('Error sending help email:', error);
      return false;
    }
  }
}

// Export a simple function for easy use
export async function sendHelpEmail(data: HelpMessageData): Promise<boolean> {
  const emailService = EmailService.getInstance();
  return await emailService.sendHelpMessage(data);
}
