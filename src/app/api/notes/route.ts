import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Create a new note
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const json = await req.json();
    const {
      title,
      content,
      category,
      semester,
      subject,
      tags,
      pinned = false, // Default pinned to false
    } = json;

    // Create the note
    const note = await prisma.note.create({
      data: {
        title,
        content,
        category,
        userId: user.id,
        semester,
        subject,
        tags: tags || [], // Default to an empty array if no tags provided
        pinned,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Fetch user's notes
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Optional query parameters (e.g., category, semester)
    const { searchParams } = new URL(req.url);
    const categoryFilter = searchParams.get('category');
    const semesterFilter = searchParams.get('semester');
    const subjectFilter = searchParams.get('subject');
    const pinnedFilter = searchParams.get('pinned') === 'true';

    // Fetch notes based on filters
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        ...(categoryFilter && { category: categoryFilter }),
        ...(semesterFilter && { semester: semesterFilter }),
        ...(subjectFilter && { subject: subjectFilter }),
        ...(pinnedFilter && { pinned: true }),
      },
      orderBy: {
        createdAt: 'desc', // Order notes by creation date
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Update an existing note
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const json = await req.json();
    const {
      id,
      title,
      content,
      category,
      semester,
      subject,
      tags,
      pinned,
    } = json;

    if (!id) {
      return new NextResponse('Note ID required', { status: 400 });
    }

    // Verify the note belongs to the user
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note || note.userId !== user.id) {
      return new NextResponse('Note not found or unauthorized', { status: 404 });
    }

    // Update the note
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        category,
        semester,
        subject,
        tags: tags || [],
        pinned,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('PATCH /api/notes error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Delete a note
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return new NextResponse('Note ID required', { status: 400 });
    }

    // Verify note belongs to user
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.userId !== user.id) {
      return new NextResponse('Note not found', { status: 404 });
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    return new NextResponse('Note deleted', { status: 200 });
  } catch (error) {
    console.error('DELETE /api/notes error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
