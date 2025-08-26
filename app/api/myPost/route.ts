// @/app/api/myPost/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // ⚡ Récupère la session depuis les headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        categories: true,
        tags: true,
        images: true,
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching my posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
