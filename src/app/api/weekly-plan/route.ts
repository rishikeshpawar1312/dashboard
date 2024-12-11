import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// Create Weekly Plan
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { startDate, endDate, goals, subjects } = body;

    const weeklyPlan = await prisma.weeklyPlan.create({
      data: {
        userId: session.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        goals,
        subjects
      }
    });

    return NextResponse.json(weeklyPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create weekly plan' }, { status: 500 });
  }
}

// Get Weekly Plans
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const weeklyPlans = await prisma.weeklyPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json(weeklyPlans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weekly plans' }, { status: 500 });
  }
}

// Delete Weekly Plan
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    await prisma.weeklyPlan.delete({
      where: { 
        id,
        userId: session.user.id 
      }
    });

    return NextResponse.json({ message: 'Plan deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete weekly plan' }, { status: 500 });
  }
}