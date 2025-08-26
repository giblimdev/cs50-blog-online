// @/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

// GET : récupérer les posts publiés
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "9")));
    const skip = (page - 1) * limit;

    // Filtres optionnels
    const categorySlug = searchParams.get("category");
    const tagSlug = searchParams.get("tag");

    const whereCondition: any = { published: true };

    if (categorySlug) {
      whereCondition.categories = { some: { slug: categorySlug } };
    }
    if (tagSlug) {
      whereCondition.tags = { some: { slug: tagSlug } };
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereCondition,
        orderBy: { order: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          published: true,
          order: true,
          createdAt: true,
          updatedAt: true,
          categories: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
          images: {
            select: { id: true, url: true, alt: true, order: true },
            orderBy: { order: "asc" },
          },
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.post.count({ where: whereCondition }),
    ]);

    // Ajout du console.log pour voir le nombre de posts envoyés
    console.log(`GET /api/posts: Envoi de ${posts.length} posts (total: ${totalCount}, page: ${page}, limite: ${limit})`);

    return NextResponse.json({
      posts,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
      filters: { category: categorySlug, tag: tagSlug },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ message: "Error while retrieving posts." }, { status: 500 });
  }
}

// POST : créer un post
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const data = await request.json();
    const { title, slug, excerpt, content, published, order, categoryIds, tagIds, images } = data;
    const authorId = session.user.id;

    if (!title?.trim()) return NextResponse.json({ message: "Title is required." }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ message: "Content is required." }, { status: 400 });
    if (!slug?.trim()) return NextResponse.json({ message: "Slug is required." }, { status: 400 });

    if (images && Array.isArray(images)) {
      for (const image of images) {
        if (!image.url || typeof image.url !== "string") {
          return NextResponse.json({ message: "Each image must have a valid URL." }, { status: 400 });
        }
      }
    }

    const existingPost = await prisma.post.findUnique({ where: { slug: slug.trim() } });
    if (existingPost) {
      return NextResponse.json({ message: "This slug is already in use." }, { status: 409 });
    }

    if (categoryIds?.length > 0) {
      const existingCategories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
      if (existingCategories.length !== categoryIds.length) {
        return NextResponse.json({ message: "One or more categories do not exist." }, { status: 400 });
      }
    }

    if (tagIds?.length > 0) {
      const existingTags = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
      if (existingTags.length !== tagIds.length) {
        return NextResponse.json({ message: "One or more tags do not exist." }, { status: 400 });
      }
    }

    const newPost = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt?.trim() || null,
          content: content.trim(),
          published: Boolean(published),
          order: Number(order) || 10,
          authorId,
          categories: categoryIds?.length
            ? { connect: categoryIds.map((id: string) => ({ id })) }
            : undefined,
          tags: tagIds?.length
            ? { connect: tagIds.map((id: string) => ({ id })) }
            : undefined,
        },
        include: {
          categories: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
      });

      if (images?.length > 0) {
        await tx.image.createMany({
          data: images.map((image: any, index: number) => ({
            url: image.url,
            alt: image.alt || null,
            order: Number(image.order) || index + 1,
            postId: post.id,
          })),
        });

        return tx.post.findUnique({
          where: { id: post.id },
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
      }

      return post;
    });

    try {
      revalidatePath("/public/blog");
      revalidatePath("/api/posts");
      if (newPost?.published) {
        revalidatePath(`/public/blog/${newPost.slug}`);
      }
    } catch (e) {
      console.warn("Cache revalidation failed:", e);
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/posts error:", error);

    if (error.code === "P2002") {
      return NextResponse.json({ message: "A unique constraint was violated." }, { status: 409 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ message: "Invalid reference to a related entity." }, { status: 400 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Record not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Error while creating the post." }, { status: 500 });
  }
} 