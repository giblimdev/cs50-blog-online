// @/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

// Next.js 15+ avec params Promise 
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error(`GET /api/posts/[id] error:`, error);
    return NextResponse.json(
      { message: "Error while retrieving post." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authentification avec Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Vérifier que le post existe et appartient à l'utilisateur
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        slug: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { message: "Post not found." },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only edit your own posts." },
        { status: 403 }
      );
    }

    // 3. Parse et validation des données
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
    } = data;

    // 4. Validation des champs requis
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

    // 5. Vérifier l'unicité du slug (si changé)
    if (slug && slug.trim() !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: slug.trim() },
      });

      if (slugExists) {
        return NextResponse.json(
          { message: "This slug is already in use." },
          { status: 409 }
        );
      }
    }

    // 6. Validation des catégories si fournies
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

    // 7. Validation des tags si fournis
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

    // 8. Mise à jour avec transaction
    const updatedPost = await prisma.$transaction(async (tx) => {
      // Mise à jour du post
      const post = await tx.post.update({
        where: { id },
        data: {
          title: title.trim(),
          slug: slug ? slug.trim() : existingPost.slug,
          excerpt: excerpt?.trim() || null,
          content: content.trim(),
          published: Boolean(published),
          order: Number(order) || 10,
          // Remplacer les relations existantes
          categories: categoryIds?.length > 0
            ? { set: categoryIds.map((catId: string) => ({ id: catId })) }
            : { set: [] },
          tags: tagIds?.length > 0
            ? { set: tagIds.map((tagId: string) => ({ id: tagId })) }
            : { set: [] },
        },
        include: {
          categories: {
            select: { id: true, name: true, slug: true },
          },
          tags: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, name: true },
          },
        },
      });

      // 9. Gestion des images si fournies
      if (images && Array.isArray(images)) {
        // Supprimer toutes les anciennes images
        await tx.image.deleteMany({
          where: { postId: id },
        });

        // Créer les nouvelles images si nécessaire
        if (images.length > 0) {
          await tx.image.createMany({
            data: images.map((image: any, index: number) => ({
              url: image.url,
              alt: image.alt || null,
              order: Number(image.order) || index + 1,
              postId: id,
            })),
          });
        }

        // Récupérer le post avec les nouvelles images
        return await tx.post.findUnique({
          where: { id },
          include: {
            categories: {
              select: { id: true, name: true, slug: true },
            },
            tags: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              select: { id: true, url: true, alt: true, order: true },
              orderBy: { order: "asc" },
            },
            author: {
              select: { id: true, name: true },
            },
          },
        });
      }

      return post;
    });

    // 10. Revalidation du cache
    try {
      revalidatePath('/public/blog');
      revalidatePath('/api/posts');
      revalidatePath(`/api/posts/${id}`);
      if (updatedPost?.slug) {
        revalidatePath(`/public/blog/${updatedPost.slug}`);
      }
    } catch (revalidateError) {
      console.warn('Cache revalidation failed:', revalidateError);
    }

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error(`PUT /api/posts/[id] error:`, error);

    // Gestion des erreurs Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { message: "A unique constraint was violated." },
          { status: 409 }
        );
      }
      
      if (prismaError.code === "P2025") {
        return NextResponse.json(
          { message: "Record not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "Error while updating post." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Vérifier que le post existe et appartient à l'utilisateur
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        slug: true,
        title: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { message: "Post not found." },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only delete your own posts." },
        { status: 403 }
      );
    }

    // 3. Suppression avec cascade (les images seront supprimées automatiquement)
    await prisma.post.delete({
      where: { id },
    });

    // 4. Revalidation du cache
    try {
      revalidatePath('/public/blog');
      revalidatePath('/api/posts');
      revalidatePath(`/public/blog/${existingPost.slug}`);
    } catch (revalidateError) {
      console.warn('Cache revalidation failed:', revalidateError);
    }

    return NextResponse.json(
      { 
        message: "Post deleted successfully",
        deletedPost: {
          id: existingPost.id,
          title: existingPost.title,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(`DELETE /api/posts/ error:`, error);
    return NextResponse.json(
      { message: "Error while deleting post." },
      { status: 500 }
    );
  }
}
