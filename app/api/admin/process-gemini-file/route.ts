import { NextRequest, NextResponse } from 'next/server';
import PDFProcessor from '@/lib/pdf-processor';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 [GEMINI PROCESS LOG] Starting Gemini file processing...');
    
    const { geminiFileName, subject, grade, board, duration, customPrompt, chapter } = await request.json();

    console.log('🤖 [GEMINI PROCESS LOG] Processing details:', {
      geminiFileName,
      subject,
      grade,
      board,
      chapter
    });

    if (!geminiFileName || !subject || !grade || !chapter) {
      console.error('❌ [GEMINI PROCESS LOG] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ [GEMINI PROCESS LOG] Gemini API key not configured');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Get file info from Gemini
    console.log('🔍 [GEMINI PROCESS LOG] Getting file info from Gemini...');
    const fileInfoResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${geminiFileName}?key=${process.env.GEMINI_API_KEY}`);
    
    if (!fileInfoResponse.ok) {
      const errorText = await fileInfoResponse.text();
      console.error('❌ [GEMINI PROCESS LOG] Failed to get file info:', errorText);
      throw new Error(`Failed to get file info: ${fileInfoResponse.statusText}`);
    }

    const fileInfo = await fileInfoResponse.json();
    console.log('✅ [GEMINI PROCESS LOG] File info retrieved:', fileInfo);

    // Process the PDF using the Gemini file URI
    console.log('🔧 [GEMINI PROCESS LOG] Starting PDF processing with Gemini File API...');
    const processor = new PDFProcessor();
    
    // Use a dummy buffer since we'll use the file URI
    const dummyBuffer = Buffer.from('dummy');
    const result = await processor.processPDFWithFileURI(dummyBuffer, subject, grade, board, customPrompt, chapter, geminiFileName);

    if (!result.success) {
      console.error('❌ [GEMINI PROCESS LOG] PDF processing failed:', result.error);
      throw new Error(result.error || 'Failed to process PDF');
    }

    console.log('✅ [GEMINI PROCESS LOG] PDF processing completed successfully');

    // Update duration for all tests
    if (result.tests && Array.isArray(result.tests)) {
      result.tests.forEach((test: any) => {
        test.duration = duration;
        test.timelimit = duration;
      });
    }

    // Clean up the file from Gemini
    console.log('🧹 [GEMINI PROCESS LOG] Cleaning up Gemini file...');
    try {
      const deleteResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${geminiFileName}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log('✅ [GEMINI PROCESS LOG] Gemini file deleted successfully');
      } else {
        console.warn('⚠️ [GEMINI PROCESS LOG] Could not delete Gemini file:', deleteResponse.statusText);
      }
    } catch (deleteError) {
      console.warn('⚠️ [GEMINI PROCESS LOG] Error deleting Gemini file:', deleteError);
    }

    console.log('🎉 [GEMINI PROCESS LOG] Gemini file processing completed successfully');
    return NextResponse.json({
      success: true,
      tests: result.tests || [],
      extractedText: result.extractedText || '',
      concepts: result.concepts || [],
    });

  } catch (error) {
    console.error('🚨 [GEMINI PROCESS LOG] Processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Gemini file' },
      { status: 500 }
    );
  }
}
