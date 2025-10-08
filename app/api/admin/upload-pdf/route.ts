import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Save uploaded file temporarily
    const tempFilePath = join('/tmp', `upload_${Date.now()}.pdf`);
    const arrayBuffer = await file.arrayBuffer();
    writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    try {
              // Call Python script to process PDF (using free Gemini AI)
              const pythonScriptPath = join(process.cwd(), 'pdf_processor_gemini.py');
              const command = `GEMINI_API_KEY=AIzaSyAbDKdsJ_eRFUWh5c2p3y0_F0Owrvmh-KY python3 "${pythonScriptPath}" "${tempFilePath}" "${subject}" "${grade}" "${board}"`;
      
      console.log('🤖 Starting AI-powered test generation...');
      console.log('📁 PDF uploaded successfully, processing...');
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.log('AI Generation Log:', stderr);
      }

      console.log('✅ AI generation completed successfully');
      
      const result = JSON.parse(stdout);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process PDF');
      }

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

    } finally {
      // Clean up temporary file
      try {
        unlinkSync(tempFilePath);
      } catch (error) {
        console.error('Error deleting temp file:', error);
      }
    }

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
