import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Helper function to extract document ID from the route
const getDocumentId = (req: NextRequest) => {
  const pathSegments = req.nextUrl.pathname.split('/');
  return pathSegments[pathSegments.length - 1];
};

// Helper function for MIME type mapping
const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    json: 'application/json',
    html: 'text/html',
    default: 'application/octet-stream',
  };
  return mimeTypes[extension.toLowerCase()] || mimeTypes.default;
};

// Updated GET Handler
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = getDocumentId(req);

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Extract file extension and determine MIME type
    const urlParts = document.url.split('?')[0]; // Remove query parameters
    const fileType = urlParts.split('.').pop(); // Get the file extension
    const mimeType = fileType ? getMimeType(fileType) : 'application/octet-stream';

    // Force download and set the appropriate filename
    const response = await fetch(document.url); // Fetch the file from Cloudinary
    const fileBuffer = await response.arrayBuffer();

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${document.filename}"`,
        'Content-Type': mimeType,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({
      error: 'Failed to fetch document',
      details: error instanceof Error ? error.message : error,
    }, { status: 500 });
  }
}

// PUT: Update document metadata
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = getDocumentId(req);
    const body = await req.json();

    const { filename } = body;

    if (!filename || typeof filename !== 'string' || filename.trim() === '') {
      return NextResponse.json({ error: 'Valid filename is required' }, { status: 400 });
    }

    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId,
        userId: session.user.id,
      },
      data: {
        filename: filename.trim(),
      },
    });

    return NextResponse.json({
      message: 'Document updated successfully',
      document: updatedDocument,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({
      error: 'Failed to update document',
      details: error instanceof Error ? error.message : error,
    }, { status: 500 });
  }
}

// DELETE: Remove a document
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = getDocumentId(req);

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Extract Cloudinary public ID
    const publicId = document.url.split('/').slice(-1)[0].split('.')[0];

    // Delete from Cloudinary if publicId exists
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete from database
    await prisma.document.delete({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: 'Document deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({
      error: 'Failed to delete document',
      details: error instanceof Error ? error.message : error,
    }, { status: 500 });
  }
}
