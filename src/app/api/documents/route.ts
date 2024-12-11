import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import cloudinary from '@/lib/cloudinary';
import {prisma} from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// GET: Fetch user's documents
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch documents', 
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}

// POST: Upload a new document
// POST: Upload a new document
// POST: Upload a new document
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileType = file.type; // MIME type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    // Determine the resource type for Cloudinary
    let resourceType: 'raw' | 'image' | 'auto' = 'auto';
    if (fileType.startsWith('image/')) {
      resourceType = 'image';
    } else if (
      ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)
    ) {
      resourceType = 'raw';
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'student-documents',
          public_id: `document-${uuidv4()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    if (!uploadResult) {
      throw new Error('File upload failed to Cloudinary');
    }

    // Save document metadata to the database
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        url: uploadResult.secure_url,
        userId: session.user.id,
        fileType: uploadResult.resource_type,
        fileSize: uploadResult.bytes,
      },
    });

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        document,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during file upload:', error);
    return NextResponse.json(
      {
        error: 'File upload failed',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
