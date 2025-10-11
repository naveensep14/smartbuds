import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import PDFProcessor from '@/lib/pdf-processor';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [REASSEMBLE LOG] Starting chunk reassembly...');
    
    const { uploadId, fileName, totalChunks, subject, grade, board, duration, customPrompt, chapter } = await request.json();

    console.log('🔧 [REASSEMBLE LOG] Reassembly details:', {
      uploadId,
      fileName,
      totalChunks,
      subject,
      grade,
      board,
      chapter
    });

    if (!uploadId || !fileName || !totalChunks) {
      console.error('❌ [REASSEMBLE LOG] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), 'tmp', 'uploads');
    const chunksDir = uploadsDir;

    // Check if all chunks exist
    console.log('🔧 [REASSEMBLE LOG] Checking for all chunks...');
    const missingChunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = join(chunksDir, `${uploadId}_chunk_${i}`);
      if (!existsSync(chunkPath)) {
        missingChunks.push(i);
      }
    }

    if (missingChunks.length > 0) {
      console.error('❌ [REASSEMBLE LOG] Missing chunks:', missingChunks);
      return NextResponse.json({ error: `Missing chunks: ${missingChunks.join(', ')}` }, { status: 400 });
    }

    // Read and combine all chunks
    console.log('🔧 [REASSEMBLE LOG] Reading and combining chunks...');
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = join(chunksDir, `${uploadId}_chunk_${i}`);
      const chunkData = await readFile(chunkPath);
      chunks.push(chunkData);
      console.log(`🔧 [REASSEMBLE LOG] Read chunk ${i + 1}/${totalChunks}, size: ${chunkData.length} bytes`);
    }

    // Combine chunks into single buffer
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    console.log('🔧 [REASSEMBLE LOG] Total file size:', totalSize, 'bytes');
    
    const combinedBuffer = Buffer.concat(chunks);
    
    // Save reassembled file
    const reassembledPath = join(uploadsDir, `${uploadId}_${fileName}`);
    await writeFile(reassembledPath, combinedBuffer);
    console.log('✅ [REASSEMBLE LOG] File reassembled successfully:', reassembledPath);

    // Process the PDF
    console.log('🔧 [REASSEMBLE LOG] Starting PDF processing...');
    const processor = new PDFProcessor();
    const result = await processor.processPDF(combinedBuffer, subject, grade, board, customPrompt, chapter);

    if (!result.success) {
      console.error('❌ [REASSEMBLE LOG] PDF processing failed:', result.error);
      throw new Error(result.error || 'Failed to process PDF');
    }

    console.log('✅ [REASSEMBLE LOG] PDF processing completed successfully');

    // Clean up chunks and reassembled file
    console.log('🧹 [REASSEMBLE LOG] Cleaning up temporary files...');
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = join(chunksDir, `${uploadId}_chunk_${i}`);
      try {
        await unlink(chunkPath);
      } catch (error) {
        console.warn('⚠️ [REASSEMBLE LOG] Could not delete chunk:', chunkPath);
      }
    }
    
    try {
      await unlink(reassembledPath);
    } catch (error) {
      console.warn('⚠️ [REASSEMBLE LOG] Could not delete reassembled file:', reassembledPath);
    }

    // Update duration for all tests
    if (result.tests && Array.isArray(result.tests)) {
      result.tests.forEach((test: any) => {
        test.duration = duration;
        test.timelimit = duration;
      });
    }

    console.log('🎉 [REASSEMBLE LOG] Chunk upload and processing completed successfully');
    return NextResponse.json({
      success: true,
      tests: result.tests || [],
      extractedText: result.extractedText || '',
      concepts: result.concepts || [],
    });

  } catch (error) {
    console.error('🚨 [REASSEMBLE LOG] Reassembly error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reassemble chunks' },
      { status: 500 }
    );
  }
}
