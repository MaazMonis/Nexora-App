import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/Images
    const path = join(process.cwd(), 'public', 'Images');
    
    // Ensure directory exists
    try {
      await mkdir(path, { recursive: true });
    } catch (err) {
      // Ignore if directory already exists
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = join(path, filename);
    
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ url: `/Images/${filename}` });
  } catch (err) {
    console.error('Error uploading file:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
