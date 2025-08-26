import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tags - Fetch all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Error fetching tags" },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if the category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "The specified category does not exist" },
        { status: 404 }
      );
    }

    // Generate slug from the name
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check if the name or slug already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { slug }
        ]
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "A tag with this name already exists" },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        categoryId,
        order: body.order || 10
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Error creating tag" },
      { status: 500 }
    );
  }
}

// PUT /api/tags - Update a tag
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, categoryId, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    // Check if the tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    // If categoryId is provided, check that the category exists
    if (categoryId && categoryId !== existingTag.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!categoryExists) {
        return NextResponse.json(
          { error: "The specified category does not exist" },
          { status: 404 }
        );
      }
    }

    // Generate the new slug
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check if the name or slug is already used by another tag
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { name: name.trim() },
              { slug }
            ]
          }
        ]
      }
    });

    if (duplicateTag) {
      return NextResponse.json(
        { error: "Another tag with this name already exists" },
        { status: 409 }
      );
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        ...(categoryId && { categoryId }),
        ...(order !== undefined && { order })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Error updating tag" },
      { status: 500 }
    );
  }
}

// DELETE /api/tags - Delete a tag
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      );
    }

    // Check if the tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    // Check if the tag has associated posts
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        { error: "Cannot delete a tag that is used by posts" },
        { status: 409 }
      );
    }

    await prisma.tag.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Tag deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Error deleting tag" },
      { status: 500 }
    );
  }
}