// app/api/dev/cleanup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This route is only available in development" },
      { status: 403 }
    );
  }

  try {
    // Delete in the correct order to respect relationships
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.verificationToken.deleteMany({});

    return NextResponse.json(
      { message: "Database cleaned successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to clean database" },
      { status: 500 }
    );
  }
}