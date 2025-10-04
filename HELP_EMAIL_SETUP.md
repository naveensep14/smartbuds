# Help & Support Email Setup with Supabase

This document explains how to configure email sending for the Help & Support feature using Supabase Edge Functions.

## Current Implementation

The help/feedback page is located at `/help` and allows users to send messages that will be emailed to `niveditha.2587@gmail.com` using Supabase Edge Functions.

## Development Mode

In development mode, emails are logged to the console instead of being sent. This allows you to test the functionality without setting up email services.

## Production Setup with Supabase

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### Step 4: Set Up Resend (Recommended Email Service)

1. **Create a Resend account** at [resend.com](https://resend.com)
2. **Get your API key** from the Resend dashboard
3. **Add the API key to Supabase secrets**:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Step 5: Deploy the Edge Function

```bash
supabase functions deploy send-help-email
```

### Step 6: Test the Function

```bash
supabase functions serve send-help-email
```

## Alternative Email Services

### Option 1: SendGrid Integration

1. Install SendGrid in your Edge Function:
```bash
# In your Edge Function directory
npm install @sendgrid/mail
```

2. Update the Edge Function to use SendGrid:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY')!);

await sgMail.send({
  to: 'niveditha.2587@gmail.com',
  from: 'noreply@successbuds.com',
  subject: `[SuccessBuds Support] ${subject}`,
  text: textContent,
  html: htmlContent,
});
```

3. Set the API key:
```bash
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key
```

### Option 2: Mailgun Integration

1. Update the Edge Function to use Mailgun:
```typescript
const mailgun = require('mailgun-js')({
  apiKey: Deno.env.get('MAILGUN_API_KEY')!,
  domain: Deno.env.get('MAILGUN_DOMAIN')!
});

await mailgun.messages().send({
  from: 'SuccessBuds Support <noreply@successbuds.com>',
  to: 'niveditha.2587@gmail.com',
  subject: `[SuccessBuds Support] ${subject}`,
  text: textContent,
  html: htmlContent,
});
```

2. Set the API keys:
```bash
supabase secrets set MAILGUN_API_KEY=your_mailgun_api_key
supabase secrets set MAILGUN_DOMAIN=your_mailgun_domain
```

### Option 3: Custom SMTP Integration

1. Update the Edge Function to use nodemailer:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: Deno.env.get('SMTP_HOST'),
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  secure: false,
  auth: {
    user: Deno.env.get('SMTP_USER'),
    pass: Deno.env.get('SMTP_PASS'),
  },
});

await transporter.sendMail({
  from: 'SuccessBuds Support <noreply@successbuds.com>',
  to: 'niveditha.2587@gmail.com',
  subject: `[SuccessBuds Support] ${subject}`,
  text: textContent,
  html: htmlContent,
});
```

2. Set the SMTP credentials:
```bash
supabase secrets set SMTP_HOST=your_smtp_host
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your_smtp_username
supabase secrets set SMTP_PASS=your_smtp_password
```

## File Structure

- `app/help/page.tsx` - The help page component
- `app/api/contact/route.ts` - API endpoint for handling form submissions
- `lib/email-service.ts` - Supabase email service utility
- `supabase/functions/send-help-email/index.ts` - Supabase Edge Function for sending emails
- `supabase/functions/send-help-email/deno.json` - Deno configuration
- `supabase/functions/send-help-email/import_map.json` - Import map for dependencies

## Features

- **Supabase Integration**: Uses Supabase Edge Functions for serverless email sending
- **User-friendly form**: Clean, responsive design with proper validation
- **Message categorization**: Users can select the type of message (General, Bug Report, Feature Request, etc.)
- **Rich email formatting**: Both text and HTML versions of emails are sent
- **Error handling**: Proper error messages and validation
- **Mobile responsive**: Works on all device sizes
- **Development mode**: Logs emails to console for testing

## Testing

1. **Local Development**:
   ```bash
   npm run dev
   ```
   Navigate to `/help` and submit the form. Check the console for logged email content.

2. **Edge Function Testing**:
   ```bash
   supabase functions serve send-help-email
   ```
   Test the function directly with curl:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/send-help-email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "subject": "Test Message",
       "message": "This is a test message",
       "category": "general"
     }'
   ```

3. **Production Testing**:
   Deploy the function and test through your live application.

## Security Considerations

- **Environment Variables**: All sensitive data (API keys) are stored as Supabase secrets
- **CORS Handling**: Edge Function includes proper CORS headers
- **Input Validation**: Form validation on both client and server side
- **Rate Limiting**: Consider implementing rate limiting for production use
- **CAPTCHA**: Consider adding CAPTCHA for additional spam protection

## Customization

You can easily customize:
- **Email recipient**: Change `niveditha.2587@gmail.com` in the Edge Function
- **Email templates**: Modify the HTML template in the Edge Function
- **Form fields**: Update the form in `app/help/page.tsx`
- **Styling**: Modify the CSS classes
- **Categories**: Add or modify categories in the form

## Troubleshooting

### Common Issues

1. **Function not deploying**: Ensure you're logged in to Supabase CLI and have the correct project linked
2. **Email not sending**: Check that your API key is correctly set as a secret
3. **CORS errors**: Verify CORS headers are properly set in the Edge Function
4. **Environment variables**: Make sure all required environment variables are set

### Debugging

1. **Check function logs**:
   ```bash
   supabase functions logs send-help-email
   ```

2. **Test function locally**:
   ```bash
   supabase functions serve send-help-email --debug
   ```

3. **Check Supabase dashboard**: Monitor function invocations and logs in the Supabase dashboard
