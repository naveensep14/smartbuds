import { NextRequest, NextResponse } from 'next/server';
import PDFProcessor from '@/lib/pdf-processor';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [VERCEL LOG] API Route: Starting PDF upload processing...');
    console.log('🚀 [VERCEL LOG] Environment:', process.env.NODE_ENV || 'development');
    console.log('🚀 [VERCEL LOG] API Key present:', !!process.env.GEMINI_API_KEY);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subject = formData.get('subject') as string;
    const grade = formData.get('grade') as string;
    const board = formData.get('board') as string;
    const duration = parseInt(formData.get('duration') as string);
    const customPrompt = formData.get('customPrompt') as string;
    const chapter = parseInt(formData.get('chapter') as string);

    console.log('📋 [VERCEL LOG] Form data received:');
    console.log('📋 [VERCEL LOG] File name:', file?.name || 'No file');
    console.log('📋 [VERCEL LOG] File size:', file?.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'No file');
    console.log('📋 [VERCEL LOG] Subject:', subject);
    console.log('📋 [VERCEL LOG] Grade:', grade);
    console.log('📋 [VERCEL LOG] Board:', board);
    console.log('📋 [VERCEL LOG] Chapter:', chapter);
    console.log('📋 [VERCEL LOG] Custom Prompt:', customPrompt ? customPrompt.substring(0, 50) + '...' : 'None');

    if (!file) {
      console.error('❌ [VERCEL LOG] No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ [VERCEL LOG] Gemini API key not configured');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    console.log('🤖 [VERCEL LOG] Starting AI-powered test generation...');
    console.log('📁 [VERCEL LOG] PDF uploaded successfully, processing...');

    // Convert file to buffer
    console.log('🔄 [VERCEL LOG] Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    console.log('✅ [VERCEL LOG] File converted to buffer, size:', pdfBuffer.length, 'bytes');

    // Process PDF using Node.js processor
    console.log('🔧 [VERCEL LOG] Initializing PDF processor...');
    const processor = new PDFProcessor();
    console.log('🔧 [VERCEL LOG] PDF processor initialized, calling processPDF...');
    
    const result = await processor.processPDF(pdfBuffer, subject, grade, board, customPrompt, chapter);
    console.log('🔧 [VERCEL LOG] processPDF completed, result.success:', result.success);

    if (!result.success) {
      console.error('❌ [VERCEL LOG] PDF processing failed:', result.error);
      throw new Error(result.error || 'Failed to process PDF');
    }

    console.log('✅ [VERCEL LOG] AI generation completed successfully');
    console.log('✅ [VERCEL LOG] Tests generated:', result.tests?.length || 0);
    console.log('✅ [VERCEL LOG] Concepts identified:', result.concepts?.length || 0);

    // Update duration for all tests
    if (result.tests && Array.isArray(result.tests)) {
      console.log('⏱️ [VERCEL LOG] Updating duration for all tests...');
      result.tests.forEach((test: any) => {
        test.duration = duration;
        test.timelimit = duration;
      });
    }

    console.log('🎉 [VERCEL LOG] Returning successful response');
    return NextResponse.json({
      success: true,
      tests: result.tests || [],
      extractedText: result.extractedText || '',
      concepts: result.concepts || [],
    });

  } catch (error) {
    console.error('🚨 [VERCEL LOG] API Route Error:');
    console.error('🚨 [VERCEL LOG] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🚨 [VERCEL LOG] Error type:', error instanceof Error ? error.name : 'Unknown');
    console.error('🚨 [VERCEL LOG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('🚨 [VERCEL LOG] Environment:', process.env.NODE_ENV || 'development');
    console.error('🚨 [VERCEL LOG] API Key present:', !!process.env.GEMINI_API_KEY);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
