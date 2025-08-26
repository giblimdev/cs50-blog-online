import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET handler for /api/profile/[userId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Profile: true,
        Post: { where: { published: true }, select: { id: true } },
        Comment: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const response = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      profile: user.Profile.length > 0 ? user.Profile[0] : null,
      stats: {
        postsCount: user.Post.length,
        commentsCount: user.Comment.length,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("GET /api/profile/[userId] error:", error);
    return NextResponse.json(
      { message: "Error fetching profile" },
      { status: 500 }
    );
  }
}

// PUT handler for /api/profile/[userId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const data = await request.json();
    const { name, firstName, bio, image } = data;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { name: name.trim(), image: image || null },
      });

      const existingProfile = await tx.profile.findUnique({ where: { userId } });

      let updatedProfile;
      if (existingProfile) {
        updatedProfile = await tx.profile.update({
          where: { userId },
          data: {
            firstName: firstName?.trim() || existingProfile.firstName,
            bio: bio?.trim() || existingProfile.bio,
          },
        });
      } else if (firstName && firstName.trim()) {
        updatedProfile = await tx.profile.create({
          data: {
            userId,
            firstName: firstName.trim(),
            bio: bio?.trim() || null,
          },
        });
      } else {
        updatedProfile = null;
      }

      return { user: updatedUser, profile: updatedProfile };
    });

    const updatedUserWithStats = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Profile: true,
        Post: { where: { published: true }, select: { id: true } },
        Comment: { select: { id: true } },
      },
    });

    const response = {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        image: result.user.image,
        createdAt: result.user.createdAt.toISOString(),
        emailVerified: result.user.emailVerified,
        twoFactorEnabled: result.user.twoFactorEnabled,
      },
      profile: updatedUserWithStats?.Profile[0] || null,
      stats: {
        postsCount: updatedUserWithStats?.Post.length || 0,
        commentsCount: updatedUserWithStats?.Comment.length || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("PUT /api/profile/[userId] error:", error);

    const isPrismaError = (err: unknown): err is { code: string; message?: string } =>
      typeof err === "object" && err !== null && "code" in err;

    if (isPrismaError(error)) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "A unique constraint was violated" },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Record not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 }
    );
  }
}