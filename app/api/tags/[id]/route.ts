//@/app/api/tags/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tags/[id] - Get a specific tag
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const tag = await prisma.tag.findUnique({
      where: {
        id: id,
      },
      include: {
        posts: {
          where: {
            published: true,
          },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            posts: {
              where: {
                published: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Update a specific tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { name, order, slug } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check for unique constraints (excluding current tag)
    const duplicateByName = await prisma.tag.findFirst({
      where: {
        AND: [{ name }, { NOT: { id } }],
      },
    });

    const duplicateBySlug = await prisma.tag.findFirst({
      where: {
        AND: [{ slug }, { NOT: { id } }],
      },
    });

    if (duplicateByName) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 409 }
      );
    }

    if (duplicateBySlug) {
      return NextResponse.json(
        { error: "Tag slug already exists" },
        { status: 409 }
      );
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
        order: order || 10,
      },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Delete a specific tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if tag has associated posts
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tag with associated posts",
          postsCount: existingTag._count.posts,
        },
        { status: 409 }
      );
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Tag deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/tags/[id]/move - Move tag up or down
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { direction } = body;

    if (!direction || !["up", "down"].includes(direction)) {
      return NextResponse.json(
        { error: "Direction invalide. Utilisez 'up' ou 'down'" },
        { status: 400 }
      );
    }

    // Récupérer le tag actuel
    const currentTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!currentTag) {
      return NextResponse.json({ error: "Tag introuvable" }, { status: 404 });
    }

    // Trouver tous les tags triés
    const allTags = await prisma.tag.findMany({
      orderBy: { order: "asc" },
    });

    // Trouver l'index actuel
    const currentIndex = allTags.findIndex((tag) => tag.id === id);

    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Tag non trouvé dans la liste" },
        { status: 404 }
      );
    }

    // Calculer le nouvel index
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Vérifier les limites
    if (newIndex < 0 || newIndex >= allTags.length) {
      return NextResponse.json(
        { error: "Impossible de déplacer plus loin" },
        { status: 400 }
      );
    }

    // Tag à échanger
    const targetTag = allTags[newIndex];

    // Échanger les ordres dans une transaction
    await prisma.$transaction([
      prisma.tag.update({
        where: { id: currentTag.id },
        data: { order: targetTag.order },
      }),
      prisma.tag.update({
        where: { id: targetTag.id },
        data: { order: currentTag.order },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Tag déplacé avec succès",
    });
  } catch (error) {
    console.error("❌ Move error:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// Handler pour les requêtes OPTIONS (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
