// Email service utility for handling help/feedback emails using Supabase Edge Functions

export interface HelpMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

export class SupabaseEmailService {
  private static instance: SupabaseEmailService;
  private supabaseUrl: string;
  
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  
  static getInstance(): SupabaseEmailService {
    if (!SupabaseEmailService.instance) {
      SupabaseEmailService.instance = new SupabaseEmailService();
    }
    return SupabaseEmailService.instance;
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

      // For production, use Supabase Edge Function
      const response = await fetch(`${this.supabaseUrl}/functions/v1/send-help-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Supabase Edge Function error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully via Supabase:', result);
      return result.success === true;

    } catch (error) {
      console.error('Error sending help email:', error);
      return false;
    }
  }
}

// Export a simple function for easy use
export async function sendHelpEmail(data: HelpMessageData): Promise<boolean> {
  const emailService = SupabaseEmailService.getInstance();
  return await emailService.sendHelpMessage(data);
}
