import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envStatus = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'NOT_SET',
      geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      geminiKeyValid: false,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    };

    // Check if Gemini API key is valid format
    if (process.env.GEMINI_API_KEY) {
      envStatus.geminiKeyValid = process.env.GEMINI_API_KEY.startsWith('AIza');
    }

    return NextResponse.json({
      success: true,
      environment: envStatus,
      message: 'Environment variables debug info'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
