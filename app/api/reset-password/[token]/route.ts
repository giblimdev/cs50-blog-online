//@/app/api/reset-password/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> } // ✅ Fixed: params is now a Promise
) {
  try {
    // ✅ Await params before using
    const { token } = await params;
    const body = await request.json();
    const { password, confirmPassword } = body;

    // Input validation
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Invalid or missing reset token" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must contain at least one lowercase, one uppercase, and one number",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Use existing Verification model to retrieve the token
    const resetToken = await prisma.verification.findFirst({
      where: {
        value: token,
        identifier: {
          startsWith: "password_reset:",
        },
        expiresAt: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Extract userId from identifier "password_reset:userId"
    const userId = resetToken.identifier.replace("password_reset:", "");

    if (!userId) {
      return NextResponse.json(
        { message: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Find existing credentials account
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        providerId: "credentials",
      },
    });

    if (existingAccount) {
      // Update existing password
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new credentials account
      await prisma.account.create({
        data: {
          accountId: userId,
          providerId: "credentials",
          userId: userId,
          password: hashedPassword,
        },
      });
    }

    // Delete the reset token
    await prisma.verification.delete({
      where: {
        id: resetToken.id,
      },
    });

    // Delete all other reset tokens for this user
    await prisma.verification.deleteMany({
      where: {
        identifier: `password_reset:${userId}`,
      },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
