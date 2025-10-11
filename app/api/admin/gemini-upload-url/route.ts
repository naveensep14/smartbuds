import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 [GEMINI URL LOG] Generating Gemini File API upload URL...');
    
    const { fileName, fileSize } = await request.json();

    console.log('🔗 [GEMINI URL LOG] Request details:', {
      fileName,
      fileSize
    });

    if (!fileName || !fileSize) {
      console.error('❌ [GEMINI URL LOG] Missing required fields');
      return NextResponse.json({ error: 'Missing fileName or fileSize' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ [GEMINI URL LOG] Gemini API key not configured');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Generate a unique file name for Gemini
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const geminiFileName = `upload_${timestamp}_${randomId}_${fileName}`;

    console.log('🔗 [GEMINI URL LOG] Generated Gemini file name:', geminiFileName);

    // Return the Gemini File API upload URL and metadata
    const uploadUrl = `https://generativelanguage.googleapis.com/v1beta/files?key=${process.env.GEMINI_API_KEY}`;
    
    console.log('✅ [GEMINI URL LOG] Generated upload URL successfully');

    return NextResponse.json({
      success: true,
      uploadUrl,
      geminiFileName,
      apiKey: process.env.GEMINI_API_KEY,
      message: 'Upload URL generated successfully'
    });

  } catch (error) {
    console.error('🚨 [GEMINI URL LOG] Error generating upload URL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
