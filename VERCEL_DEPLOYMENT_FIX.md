# 🔧 Vercel Deployment Fix for Gemini API

## Issue: JSON Parsing Error on Vercel

The error `"Unexpected token 'R', "Request En"... is not valid JSON"` occurs because the `GEMINI_API_KEY` environment variable is not set in Vercel deployment.

## Solution: Add Environment Variables to Vercel

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in and select your SuccessBuds project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Environment Variables
Add these environment variables to Vercel:

```
GEMINI_API_KEY=AIzaSyAbDKdsJ_eRFUWh5c2p3y0_F0Owrvmh-KY
NEXT_PUBLIC_SUPABASE_URL=https://mewkuspabjwrzkbbyxrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ld2t1c3BhYmp3cnprYmJ5eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDI0MjQsImV4cCI6MjA3MjQxODQyNH0.SdC8jlZRZe5aEu8aEaanlA3-BaFrGTmxp3kcJTht3wM
SUPABASE_SERVICE_ROLE_KEY=sb_secret_8ItqvYd7vBBenk7neMcx5A_7WNDxleK
RESEND_API_KEY=re_i75cUwuJ_Er494VBgvs3JHHokgf4UoXyZ
```

### Step 3: Set Environment Scope
- **Production**: ✅ Checked
- **Preview**: ✅ Checked  
- **Development**: ✅ Checked

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

## Alternative: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add GEMINI_API_KEY
# Enter: AIzaSyAbDKdsJ_eRFUWh5c2p3y0_F0Owrvmh-KY

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://mewkuspabjwrzkbbyxrw.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ld2t1c3BhYmp3cnprYmJ5eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDI0MjQsImV4cCI6MjA3MjQxODQyNH0.SdC8jlZRZe5aEu8aEaanlA3-BaFrGTmxp3kcJTht3wM

# Deploy
vercel --prod
```

## Verification

After adding environment variables and redeploying:

1. **Test PDF Upload**: Go to `https://your-app.vercel.app/admin/pdf-upload`
2. **Upload a PDF**: Try uploading a small PDF file
3. **Check Logs**: Go to Vercel Dashboard → Functions → View logs

## Common Issues

### Issue 1: Environment Variables Not Loading
- **Solution**: Make sure variables are set for all environments (Production, Preview, Development)
- **Check**: Vercel Dashboard → Settings → Environment Variables

### Issue 2: API Key Invalid
- **Solution**: Verify the Gemini API key is correct and active
- **Check**: Go to [Google AI Studio](https://makersuite.google.com/app/apikey)

### Issue 3: Quota Exceeded
- **Solution**: Check your Gemini API usage and billing
- **Check**: Google Cloud Console → APIs & Services → Quotas

## Debugging

### Check Environment Variables in Production
Add this temporary endpoint to debug:

```typescript
// app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10),
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
```

Visit: `https://your-app.vercel.app/api/debug-env`

## Success Indicators

✅ **PDF upload works without JSON errors**
✅ **AI generates questions successfully**  
✅ **Tests are created and saved**
✅ **No "Request En..." errors in logs**

## Need Help?

If you're still experiencing issues:
1. Check Vercel Function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a smaller PDF file first
4. Check Gemini API quota and billing status
