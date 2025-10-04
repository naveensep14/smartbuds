import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

const handler = async (request: Request): Promise<Response> => {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: EmailRequest = await request.json();
    const { name, email, subject, message, category } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">SuccessBuds Support</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">New ${category} message</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Message Details</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>From:</strong> ${name} (${email})</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Category:</strong> ${category}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Message</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316;">
              <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              This message was sent from the SuccessBuds Help & Support page.
            </p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
New ${category} message from SuccessBuds Help & Support

From: ${name} (${email})
Subject: ${subject}
Category: ${category}

Message:
${message}

---
This message was sent from the SuccessBuds Help & Support page.
Timestamp: ${new Date().toISOString()}
    `.trim();

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'SuccessBuds Support <noreply@successbuds.com>',
        to: ['niveditha.2587@gmail.com'],
        subject: `[SuccessBuds Support] ${subject}`,
        html: htmlContent,
        text: textContent,
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to send email',
        details: errorData 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailData = await emailResponse.json();
    console.log('Email sent successfully:', emailData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      emailId: emailData.id,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in email handler:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
