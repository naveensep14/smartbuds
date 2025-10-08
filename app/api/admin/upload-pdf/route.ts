import { NextRequest, NextResponse } from 'next/server';
import PDFProcessor from '@/lib/pdf-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subject = formData.get('subject') as string;
    const grade = formData.get('grade') as string;
    const board = formData.get('board') as string;
    const duration = parseInt(formData.get('duration') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    console.log('🤖 Starting AI-powered test generation...');
    console.log('📁 PDF uploaded successfully, processing...');

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Process PDF using Node.js processor
    const processor = new PDFProcessor();
    const result = await processor.processPDF(pdfBuffer, subject, grade, board);

    if (!result.success) {
      throw new Error(result.error || 'Failed to process PDF');
    }

    console.log('✅ AI generation completed successfully');

    // Update duration for all tests
    result.tests.forEach((test: any) => {
      test.duration = duration;
      test.timelimit = duration;
    });

    return NextResponse.json({
      success: true,
      tests: result.tests,
      extractedText: result.extractedText,
      concepts: result.concepts,
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
