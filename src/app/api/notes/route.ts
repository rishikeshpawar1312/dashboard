// app/api/notes/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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
      pinned = false 
    } = json;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        category,
        userId: user.id,
        semester,
        subject,
        tags: tags || [],
        pinned
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

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

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

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
      pinned 
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

    // Update the note with all new fields
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
