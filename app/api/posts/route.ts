// /api/posts/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // your Prisma client import

export async function GET() {
  try {
    // Retrieve published posts with categories, tags, and images
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        published: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { message: "Error while retrieving posts." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      published,
      order,
      categoryIds,
      tagIds,
      images,
      authorId,
    } = data;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { message: "Title is required." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { message: "Content is required." },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Slug is required." },
        { status: 400 }
      );
    }

    if (!authorId || typeof authorId !== "string") {
      return NextResponse.json(
        { message: "Author ID is required." },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { message: "This slug is already in use." },
        { status: 409 }
      );
    }

    // Validate author existence
    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      return NextResponse.json(
        { message: "Author not found." },
        { status: 404 }
      );
    }

    // Optional: validate categories
    if (categoryIds && categoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (existingCategories.length !== categoryIds.length) {
        return NextResponse.json(
          { message: "One or more categories do not exist." },
          { status: 400 }
        );
      }
    }

    // Optional: validate tags
    if (tagIds && tagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });

      if (existingTags.length !== tagIds.length) {
        return NextResponse.json(
          { message: "One or more tags do not exist." },
          { status: 400 }
        );
      }
    }

    // Create the post in a transaction for consistency
    const newPost = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt?.trim() || null,
          content: content.trim(),
          published: Boolean(published),
          order: order || 10,
          authorId: authorId,
          categories:
            categoryIds && categoryIds.length > 0
              ? {
                  connect: categoryIds.map((id: string) => ({ id })),
                }
              : undefined,
          tags:
            tagIds && tagIds.length > 0
              ? {
                  connect: tagIds.map((id: string) => ({ id })),
                }
              : undefined,
        },
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create related images if provided
      if (images && images.length > 0) {
        await tx.image.createMany({
          data: images.map((image: any, index: number) => ({
            url: image.url,
            alt: image.alt || null,
            order: image.order || index + 1,
            postId: post.id,
          })),
        });

        // Fetch the post with images
        const postWithImages = await tx.post.findUnique({
          where: { id: post.id },
          include: {
            categories: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            tags: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
                alt: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return postWithImages;
      }

      return post;
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/posts error:", error);

    // Prisma specific error handling
    const isPrismaError = (
      err: unknown
    ): err is { code: string; message?: string } => {
      return typeof err === "object" && err !== null && "code" in err;
    };

    if (isPrismaError(error)) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "A unique constraint was violated." },
          { status: 409 }
        );
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Invalid reference to a related entity." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Error while creating the post." },
      { status: 500 }
    );
  }
}
