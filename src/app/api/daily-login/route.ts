import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// Helper function to reset time to midnight
function getMidnightDate(date: Date): Date {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  return midnight;
}

// Helper function to calculate date difference in days
function getDateDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const streak = await prisma.loginStreak.findUnique({
      where: { userId: user.id },
    });

    const recentLogins = await prisma.dailyLogin.findMany({
      where: { userId: user.id },
      orderBy: { loginDate: 'desc' },
      take: 5, // Adjust based on how many logins you want to display
    });

    return NextResponse.json({ streak, recentLogins });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const todayMidnight = getMidnightDate(now);

    // Check for an existing login today
    const existingLogin = await prisma.dailyLogin.findFirst({
      where: {
        userId: user.id,
        loginDate: {
          gte: todayMidnight, // Greater than or equal to midnight today
        },
      },
    });

    if (existingLogin) {
      const streak = await prisma.loginStreak.findUnique({
        where: { userId: user.id },
      });
      return NextResponse.json({ 
        streak, 
        message: 'You have already logged in today.' 
      });
    }

    // Log today's login
    await prisma.dailyLogin.create({
      data: {
        userId: user.id,
        loginDate: now,
      },
    });

    let streak = await prisma.loginStreak.findUnique({
      where: { userId: user.id },
    });

    if (streak) {
      const lastLoginDateMidnight = getMidnightDate(new Date(streak.lastLoginDate));
      const dateDiff = getDateDifference(lastLoginDateMidnight, todayMidnight);

      if (dateDiff === 1) {
        // User logged in consecutively, increment streak
        streak = await prisma.loginStreak.update({
          where: { userId: user.id },
          data: {
            currentStreak: streak.currentStreak + 1,
            longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
            lastLoginDate: now,
          },
        });
      } else if (dateDiff > 1) {
        // User missed a day, reset streak
        streak = await prisma.loginStreak.update({
          where: { userId: user.id },
          data: {
            currentStreak: 1,
            lastLoginDate: now,
          },
        });
      }
    } else {
      // No existing streak, initialize new streak
      streak = await prisma.loginStreak.create({
        data: {
          userId: user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: now,
        },
      });
    }

    return NextResponse.json({ 
      streak, 
      message: 'Daily login recorded successfully.' 
    });
  } catch (error) {
    console.error('Error recording daily login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
