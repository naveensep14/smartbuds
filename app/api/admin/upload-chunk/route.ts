import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('📦 [CHUNK LOG] Starting chunk upload...');
    
    const formData = await request.formData();
    const chunk = formData.get('chunk') as File;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const fileName = formData.get('fileName') as string;
    const uploadId = formData.get('uploadId') as string;

    console.log('📦 [CHUNK LOG] Chunk details:', {
      chunkIndex,
      totalChunks,
      fileName,
      uploadId,
      chunkSize: chunk?.size || 0
    });

    if (!chunk || chunkIndex === undefined || totalChunks === undefined || !fileName || !uploadId) {
      console.error('❌ [CHUNK LOG] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'tmp', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save chunk to temporary file
    const chunkFileName = `${uploadId}_chunk_${chunkIndex}`;
    const chunkPath = join(uploadsDir, chunkFileName);
    
    console.log('📦 [CHUNK LOG] Saving chunk to:', chunkPath);
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, chunkBuffer);

    console.log('✅ [CHUNK LOG] Chunk saved successfully');

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`
    });

  } catch (error) {
    console.error('🚨 [CHUNK LOG] Chunk upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload chunk' },
      { status: 500 }
    );
  }
}
