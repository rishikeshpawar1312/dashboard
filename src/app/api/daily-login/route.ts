import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// Helper functions remain the same
function getMidnightDate(date: Date): Date {
  const midnight = new Date(date);
  midnight.setUTCHours(0, 0, 0, 0);
  return midnight;
}

function getDateDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      take: 5,
    });

    return NextResponse.json({ streak, recentLogins });
  } catch (error) {
    console.error('Error:', error);
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
    const yesterdayMidnight = new Date(todayMidnight);
    yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);

    // Get the most recent login
    const lastLogin = await prisma.dailyLogin.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        loginDate: 'desc',
      },
    });

    // Check for an existing login today
    const todayLogin = await prisma.dailyLogin.findFirst({
      where: {
        userId: user.id,
        loginDate: {
          gte: todayMidnight,
        },
      },
    });

    if (todayLogin) {
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

    const shouldIncrementStreak = lastLogin && 
      getMidnightDate(new Date(lastLogin.loginDate)) >= yesterdayMidnight;

    if (streak) {
      if (shouldIncrementStreak) {
        // User logged in consecutively, increment streak
        streak = await prisma.loginStreak.update({
          where: { userId: user.id },
          data: {
            currentStreak: streak.currentStreak + 1,
            longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
            lastLoginDate: now,
          },
        });
      } else {
        // User missed a day or this is their first login of the day
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