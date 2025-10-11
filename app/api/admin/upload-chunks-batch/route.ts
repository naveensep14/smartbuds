import { NextRequest, NextResponse } from 'next/server';
import PDFProcessor from '@/lib/pdf-processor';

export async function POST(request: NextRequest) {
  try {
    console.log('📦 [BATCH LOG] Starting batch chunk upload...');
    
    const formData = await request.formData();
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const fileName = formData.get('fileName') as string;
    const subject = formData.get('subject') as string;
    const grade = formData.get('grade') as string;
    const board = formData.get('board') as string;
    const duration = parseInt(formData.get('duration') as string);
    const customPrompt = formData.get('customPrompt') as string;
    const chapter = parseInt(formData.get('chapter') as string);

    console.log('📦 [BATCH LOG] Batch upload details:', {
      totalChunks,
      fileName,
      subject,
      grade,
      board,
      chapter
    });

    if (!totalChunks || !fileName) {
      console.error('❌ [BATCH LOG] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract all chunks from FormData
    console.log('📦 [BATCH LOG] Extracting chunks from FormData...');
    const chunks: Buffer[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const chunk = formData.get(`chunk_${i}`) as File;
      if (!chunk) {
        console.error('❌ [BATCH LOG] Missing chunk:', i);
        return NextResponse.json({ error: `Missing chunk ${i}` }, { status: 400 });
      }
      
      const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
      chunks.push(chunkBuffer);
      
      console.log(`📦 [BATCH LOG] Extracted chunk ${i + 1}/${totalChunks}, size: ${chunkBuffer.length} bytes`);
    }

    // Combine chunks into single buffer
    console.log('🔧 [BATCH LOG] Combining chunks...');
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    console.log('🔧 [BATCH LOG] Total file size:', totalSize, 'bytes');
    
    const combinedBuffer = Buffer.concat(chunks);
    console.log('✅ [BATCH LOG] File reassembled successfully in memory');

    // Process the PDF
    console.log('🔧 [BATCH LOG] Starting PDF processing...');
    const processor = new PDFProcessor();
    const result = await processor.processPDF(combinedBuffer, subject, grade, board, customPrompt, chapter);

    if (!result.success) {
      console.error('❌ [BATCH LOG] PDF processing failed:', result.error);
      throw new Error(result.error || 'Failed to process PDF');
    }

    console.log('✅ [BATCH LOG] PDF processing completed successfully');

    // Update duration for all tests
    if (result.tests && Array.isArray(result.tests)) {
      result.tests.forEach((test: any) => {
        test.duration = duration;
        test.timelimit = duration;
      });
    }

    console.log('🎉 [BATCH LOG] Batch chunk upload and processing completed successfully');
    return NextResponse.json({
      success: true,
      tests: result.tests || [],
      extractedText: result.extractedText || '',
      concepts: result.concepts || [],
    });

  } catch (error) {
    console.error('🚨 [BATCH LOG] Batch upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process batch upload' },
      { status: 500 }
    );
  }
}
