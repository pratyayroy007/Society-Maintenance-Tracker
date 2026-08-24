import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 5MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = path.extname(file.name) || '.jpg';
    const randomHash = crypto.randomBytes(8).toString('hex');
    const filename = `complaint_${Date.now()}_${randomHash}${ext}`;

    // Try saving to public/uploads directory (Local Environment)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        message: 'Photo uploaded successfully',
        url: `/uploads/${filename}`,
        filename,
      });
    } catch (fsErr) {
      // Fallback for Vercel Serverless Read-Only Filesystem:
      // Convert image buffer to Data URL (works 100% on Vercel without S3 credentials)
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64Data}`;

      return NextResponse.json({
        message: 'Photo uploaded successfully',
        url: dataUrl,
        filename,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
  }
}
