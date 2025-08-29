// @/app/api/posts/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { revalidatePath, revalidateTag } from "next/cache";

// Optional: force dynamic behavior
export const dynamic = "force-dynamic";

// GET: retrieve a post by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId: id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
        images: {
          select: { id: true, url: true, alt: true, order: true },
          orderBy: { order: "asc" },
        },
        author: { select: { id: true, name: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(`GET /api/posts/[postId] error:`, error);
    return NextResponse.json(
      { message: "Error while retrieving post." },
      { status: 500 }
    );
  }
}

// PUT: edit a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId: id } = await params;

    // Session via Better Auth with request headers
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    // Check post existence + ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, slug: true },
    });

    if (!existingPost) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }
    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only edit your own posts." },
        { status: 403 }
      );
    }

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
    } = data ?? {};

    // Minimal validations
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ message: "Title is required." }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ message: "Content is required." }, { status: 400 });
    }

    // Unique slug if changed
    const nextSlug = (slug?.trim() || existingPost.slug).trim();
    if (nextSlug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({ where: { slug: nextSlug } });
      if (slugExists) {
        return NextResponse.json({ message: "This slug is already in use." }, { status: 409 });
      }
    }

    // Check for existence of categories/tags if provided
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      });
      if (existingCategories.length !== categoryIds.length) {
        return NextResponse.json(
          { message: "One or more categories do not exist." },
          { status: 400 }
        );
      }
    }

    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: tagIds } },
        select: { id: true },
      });
      if (existingTags.length !== tagIds.length) {
        return NextResponse.json(
          { message: "One or more tags do not exist." },
          { status: 400 }
        );
      }
    }

    const updatedPost = await prisma.$transaction(
      async (tx) => {
        // A single update for base fields + M:N relations via set
        await tx.post.update({
          where: { id },
          data: {
            title: title.trim(),
            slug: nextSlug,
            excerpt: excerpt?.trim() || null,
            content: content.trim(),
            published: Boolean(published),
            order: Number.isFinite(Number(order)) ? Number(order) : 10,
            ...(Array.isArray(categoryIds)
              ? { categories: { set: categoryIds.map((catId: string) => ({ id: catId })) } }
              : {}),
            ...(Array.isArray(tagIds)
              ? { tags: { set: tagIds.map((tagId: string) => ({ id: tagId })) } }
              : {}),
          },
        });

        // Complete replacement of images (Base64 accepted as is)
        if (Array.isArray(images)) {
          await tx.image.deleteMany({ where: { postId: id } });
          if (images.length > 0) {
            await tx.image.createMany({
              data: images.map((image: any, index: number) => ({
                url: String(image.url),
                alt: image.alt ? String(image.alt) : null,
                order: Number.isFinite(Number(image.order)) ? Number(image.order) : index + 1,
                postId: id,
              })),
            });
          }
        }

        // Final read with relations and sorted images
        return tx.post.findUnique({
          where: { id },
          include: {
            categories: { select: { id: true, name: true, slug: true } },
            tags: { select: { id: true, name: true, slug: true } },
            images: {
              select: { id: true, url: true, alt: true, order: true },
              orderBy: { order: "asc" },
            },
            author: { select: { id: true, name: true } },
          },
        });
      },
      // Extend timeout to prevent premature closure
      { timeout: 15_000, maxWait: 5_000 }
    );

    // Cache invalidation: lists and detail page (old and new if slug changed)
    revalidateTag("posts");
    revalidatePath("/public/blog");
    revalidatePath("/user/my-posts");
    revalidatePath("/api/posts");
    if (existingPost.slug) revalidatePath(`/public/blog/${existingPost.slug}`);
    if (updatedPost?.slug && updatedPost.slug !== existingPost.slug) {
      revalidatePath(`/public/blog/${updatedPost.slug}`);
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error(`PUT /api/posts/[postId] error:`, error);
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "A unique constraint was violated." }, { status: 409 });
    }
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Error while updating post." }, { status: 500 });
  }
}

// DELETE: delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId: id } = await params;

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, slug: true, title: true },
    });

    if (!existingPost) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }
    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only delete your own posts." },
        { status: 403 }
      );
    }

    await prisma.post.delete({ where: { id } });

    // Cache invalidation: lists and deleted detail page
    revalidateTag("posts");
    revalidatePath("/public/blog");
    revalidatePath("/user/my-posts");
    revalidatePath("/api/posts");
    if (existingPost.slug) revalidatePath(`/public/blog/${existingPost.slug}`);

    return NextResponse.json(
      {
        message: "Post deleted successfully",
        deletedPost: { id: existingPost.id, title: existingPost.title },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/posts/[postId] error:`, error);
    return NextResponse.json({ message: "Error while deleting post." }, { status: 500 });
  }
}